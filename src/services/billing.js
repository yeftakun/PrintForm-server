const { useDb, PAYMENT_MANUAL_INSTRUCTIONS, PAYMENT_ORDER_TTL_HOURS } = require("../config");
const { query, withTransaction } = require("../db");
const { createOpaqueId } = require("./auth");

const ORDER_STATUSES = new Set([
  "pending_payment",
  "waiting_verification",
  "paid",
  "rejected",
  "cancelled",
  "expired"
]);

const CREDIT_SOURCE_PRIORITY = new Map([
  ["subscription", 1],
  ["topup", 2],
  ["free", 3],
  ["bonus", 4],
  ["refund", 5]
]);
const PLAN_TYPES = new Set(["free", "subscription", "credit_pack"]);
const COUPON_DISCOUNT_TYPES = new Set(["fixed_amount", "percent", "free"]);

function ensureDbBilling() {
  if (!useDb) {
    const err = new Error("Billing requires database mode");
    err.statusCode = 503;
    err.code = "BILLING_DB_REQUIRED";
    throw err;
  }
}

function normalizePositiveInteger(value, fallback = 1, max = 99) {
  const number = Number.parseInt(value, 10);
  if (!Number.isInteger(number) || number < 1) {
    return fallback;
  }
  return Math.min(number, max);
}

function normalizeCouponCode(value) {
  const code = String(value || "").trim().toUpperCase();
  return code || null;
}

function toInt(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.round(number)) : 0;
}

function toIso(value) {
  return value?.toISOString?.() || value || null;
}

function createClientError(message, statusCode = 400, code = "BILLING_INVALID_INPUT") {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) return true;
    if (["0", "false", "no", "off"].includes(normalized)) return false;
  }
  return fallback;
}

function normalizeRequiredText(value, fieldName, maxLength) {
  const text = String(value || "").trim();
  if (!text) {
    throw createClientError(`${fieldName} wajib diisi.`);
  }
  return text.slice(0, maxLength);
}

function normalizeOptionalText(value, maxLength) {
  const text = String(value || "").trim();
  return text ? text.slice(0, maxLength) : null;
}

function normalizeNonNegativeInteger(value, fallback = 0) {
  const number = Number.parseInt(value, 10);
  if (!Number.isInteger(number) || number < 0) {
    return fallback;
  }
  return number;
}

function normalizePositiveLimit(value) {
  if (value === null || value === undefined || String(value).trim() === "") {
    return null;
  }
  const number = Number.parseInt(value, 10);
  if (!Number.isInteger(number) || number < 1) {
    throw createClientError("Limit penggunaan harus minimal 1 atau dikosongkan.");
  }
  return number;
}

function normalizePlanCode(value) {
  const code = normalizeRequiredText(value, "Kode plan", 50).toLowerCase();
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(code)) {
    throw createClientError("Kode plan hanya boleh berisi huruf kecil, angka, underscore, dan dash.");
  }
  return code;
}

function normalizeCouponCodeForAdmin(value) {
  const code = normalizeRequiredText(value, "Kode kupon", 64).toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9_-]*$/.test(code)) {
    throw createClientError("Kode kupon hanya boleh berisi huruf, angka, underscore, dan dash.");
  }
  return code;
}

function normalizeDateTime(value, { endOfDay = false } = {}) {
  if (value === null || value === undefined || String(value).trim() === "") {
    return null;
  }
  const text = String(value).trim();
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(text)
    ? `${text}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`
    : text;
  const date = new Date(normalized);
  if (!Number.isFinite(date.getTime())) {
    throw createClientError("Format tanggal kupon tidak valid.");
  }
  return date;
}

function addMonths(date, months) {
  const result = new Date(date.getTime());
  result.setMonth(result.getMonth() + months);
  return result;
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function getPaymentExpiresAt() {
  const hours = Math.max(1, Number(PAYMENT_ORDER_TTL_HOURS) || 24);
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

function getCreditExpiresAt(plan, startDate = new Date()) {
  const months = Number(plan?.duration_months);
  if (Number.isFinite(months) && months > 0) {
    return addMonths(startDate, Math.round(months));
  }
  if (String(plan?.plan_type || "").toLowerCase() === "free") {
    return addDays(startDate, 7);
  }
  return addMonths(startDate, 1);
}

function getCreditSourceType(plan) {
  const type = String(plan?.plan_type || "").toLowerCase();
  if (type === "free") return "free";
  if (type === "subscription") return "subscription";
  if (type === "credit_pack" || type === "topup" || type === "buy_credit") return "topup";
  return "topup";
}

function mapPlan(row) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    planType: row.plan_type,
    priceIdr: toInt(row.price_idr),
    creditsPerUnit: toInt(row.credits_per_unit),
    durationMonths: Number(row.duration_months || 0),
    description: row.description || "",
    isActive: Boolean(row.is_active),
    sortOrder: Number(row.sort_order || 0),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at)
  };
}

function mapCoupon(row) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    name: row.name || "",
    discountType: row.discount_type,
    discountValue: toInt(row.discount_value),
    maxDiscountIdr: row.max_discount_idr === null || row.max_discount_idr === undefined ? null : toInt(row.max_discount_idr),
    minOrderAmountIdr: toInt(row.min_order_amount_idr),
    appliesToPlanId: row.applies_to_plan_id || null,
    usageLimit: row.usage_limit === null || row.usage_limit === undefined ? null : Number(row.usage_limit),
    usageLimitPerUser: row.usage_limit_per_user === null || row.usage_limit_per_user === undefined ? null : Number(row.usage_limit_per_user),
    startsAt: toIso(row.starts_at),
    expiresAt: toIso(row.expires_at),
    isActive: Boolean(row.is_active),
    used: Number(row.used_count || 0),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at)
  };
}

function mapOrder(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    quantity: Number(row.quantity || 1),
    subtotalIdr: toInt(row.subtotal_idr),
    discountIdr: toInt(row.discount_idr),
    totalIdr: toInt(row.total_idr),
    couponId: row.coupon_id || null,
    couponCode: row.coupon_code || null,
    status: row.status,
    paymentInstruction: row.payment_instruction || null,
    paymentExpiresAt: toIso(row.payment_expires_at),
    activatedAt: toIso(row.activated_at),
    rejectedAt: toIso(row.rejected_at),
    rejectedReason: row.rejected_reason || null,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
    plan: row.plan_name ? {
      id: row.plan_id,
      code: row.plan_code || null,
      name: row.plan_name,
      planType: row.plan_type || null,
      priceIdr: toInt(row.plan_price_idr),
      creditsPerUnit: toInt(row.plan_credits_per_unit),
      durationMonths: Number(row.plan_duration_months || 0),
      description: row.plan_description || ""
    } : null,
    paymentProof: row.proof_id ? {
      id: row.proof_id,
      originalName: row.proof_original_name,
      mimeType: row.proof_mime_type,
      sizeBytes: Number(row.proof_size_bytes || 0),
      status: row.proof_status || null,
      submittedAt: toIso(row.proof_submitted_at),
      previewUrl: row.proof_id ? `/api/billing/admin/orders/${encodeURIComponent(row.id)}/payment-proof/preview` : null,
      downloadUrl: row.proof_id ? `/api/billing/admin/orders/${encodeURIComponent(row.id)}/payment-proof/download` : null
    } : null,
    user: row.username || row.email || row.kode_toko || row.store_name ? {
      id: row.user_id,
      username: row.username || null,
      email: row.email || null,
      kodeToko: row.kode_toko || null,
      storeName: row.store_name || null,
      alamat: row.alamat || null
    } : null
  };
}

function mapPaymentProof(row) {
  if (!row) return null;
  return {
    id: row.id,
    orderId: row.order_id,
    userId: row.user_id,
    originalName: row.original_name,
    storedPath: row.stored_path,
    mimeType: row.mime_type,
    sizeBytes: Number(row.size_bytes || 0),
    status: row.status,
    userNote: row.user_note || null,
    submittedAt: toIso(row.submitted_at)
  };
}

function normalizePlanQuantity(plan, quantity) {
  const type = String(plan?.plan_type || "").toLowerCase();
  if (type === "free") {
    return 1;
  }
  return normalizePositiveInteger(quantity, 1, 99);
}

async function userHasActiveCredits(userId, client = null) {
  const executor = client || { query };
  const res = await executor.query(
    `SELECT EXISTS (
      SELECT 1
      FROM credits
      WHERE user_id = $1
        AND status = 'active'
        AND starts_at <= now()
        AND expires_at > now()
    ) AS exists`,
    [userId]
  );
  return Boolean(res.rows[0]?.exists);
}

async function listActivePlans() {
  ensureDbBilling();
  const res = await query(
    `SELECT id, code, name, plan_type, price_idr, credits_per_unit, duration_months,
            description, is_active, sort_order, created_at, updated_at
     FROM plans
     WHERE is_active = true
     ORDER BY sort_order ASC, price_idr ASC, name ASC`
  );
  return res.rows.map(mapPlan);
}

async function listPlansForAdmin() {
  ensureDbBilling();
  const res = await query(
    `SELECT id, code, name, plan_type, price_idr, credits_per_unit, duration_months,
            description, is_active, sort_order, created_at, updated_at
       FROM plans
      ORDER BY sort_order ASC, is_active DESC, price_idr ASC, name ASC`
  );
  return res.rows.map(mapPlan);
}

async function getPlanByIdForAdmin(planId, client = null) {
  ensureDbBilling();
  const executor = client || { query };
  const res = await executor.query(
    `SELECT id, code, name, plan_type, price_idr, credits_per_unit, duration_months,
            description, is_active, sort_order, created_at, updated_at
       FROM plans
      WHERE id = $1
      LIMIT 1`,
    [planId]
  );
  return mapPlan(res.rows[0]);
}

async function assertPlanCodeAvailable(code, excludeId = null, client = null) {
  const executor = client || { query };
  const res = await executor.query(
    `SELECT id
       FROM plans
      WHERE lower(code) = lower($1)
        AND ($2::text IS NULL OR id <> $2)
      LIMIT 1`,
    [code, excludeId]
  );
  if (res.rows[0]) {
    throw createClientError("Kode plan sudah digunakan.", 409, "PLAN_CODE_EXISTS");
  }
}

function normalizePlanAdminPayload(payload = {}) {
  const planType = String(payload.planType || payload.plan_type || "credit_pack").trim().toLowerCase();
  if (!PLAN_TYPES.has(planType)) {
    throw createClientError("Tipe plan tidak valid.");
  }

  return {
    code: normalizePlanCode(payload.code),
    name: normalizeRequiredText(payload.name, "Nama plan", 100),
    planType,
    priceIdr: normalizeNonNegativeInteger(payload.priceIdr ?? payload.price_idr ?? payload.price, 0),
    creditsPerUnit: normalizeNonNegativeInteger(payload.creditsPerUnit ?? payload.credits_per_unit ?? payload.credits, 0),
    durationMonths: normalizeNonNegativeInteger(payload.durationMonths ?? payload.duration_months ?? payload.validMonths, planType === "free" ? 0 : 1),
    description: normalizeOptionalText(payload.description, 2000),
    isActive: normalizeBoolean(payload.isActive ?? payload.is_active ?? payload.active, true),
    sortOrder: normalizeNonNegativeInteger(payload.sortOrder ?? payload.sort_order, 0)
  };
}

async function createPlanForAdmin(payload = {}) {
  ensureDbBilling();
  const next = normalizePlanAdminPayload(payload);
  return withTransaction(async client => {
    await assertPlanCodeAvailable(next.code, null, client);
    const id = createOpaqueId("plan");
    const res = await client.query(
      `INSERT INTO plans (
        id, code, name, plan_type, price_idr, credits_per_unit,
        duration_months, description, is_active, sort_order
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, code, name, plan_type, price_idr, credits_per_unit, duration_months,
                description, is_active, sort_order, created_at, updated_at`,
      [
        id,
        next.code,
        next.name,
        next.planType,
        next.priceIdr,
        next.creditsPerUnit,
        next.durationMonths,
        next.description,
        next.isActive,
        next.sortOrder
      ]
    );
    return mapPlan(res.rows[0]);
  });
}

async function updatePlanForAdmin(planId, payload = {}) {
  ensureDbBilling();
  const next = normalizePlanAdminPayload(payload);
  return withTransaction(async client => {
    const existing = await getPlanByIdForAdmin(planId, client);
    if (!existing) {
      throw createClientError("Plan tidak ditemukan.", 404, "PLAN_NOT_FOUND");
    }
    await assertPlanCodeAvailable(next.code, planId, client);
    const res = await client.query(
      `UPDATE plans
          SET code = $2,
              name = $3,
              plan_type = $4,
              price_idr = $5,
              credits_per_unit = $6,
              duration_months = $7,
              description = $8,
              is_active = $9,
              sort_order = $10,
              updated_at = now()
        WHERE id = $1
      RETURNING id, code, name, plan_type, price_idr, credits_per_unit, duration_months,
                description, is_active, sort_order, created_at, updated_at`,
      [
        planId,
        next.code,
        next.name,
        next.planType,
        next.priceIdr,
        next.creditsPerUnit,
        next.durationMonths,
        next.description,
        next.isActive,
        next.sortOrder
      ]
    );
    return mapPlan(res.rows[0]);
  });
}

async function setPlanActiveForAdmin(planId, isActive) {
  ensureDbBilling();
  const res = await query(
    `UPDATE plans
        SET is_active = $2,
            updated_at = now()
      WHERE id = $1
    RETURNING id, code, name, plan_type, price_idr, credits_per_unit, duration_months,
              description, is_active, sort_order, created_at, updated_at`,
    [planId, normalizeBoolean(isActive, true)]
  );
  if (!res.rows[0]) {
    throw createClientError("Plan tidak ditemukan.", 404, "PLAN_NOT_FOUND");
  }
  return mapPlan(res.rows[0]);
}

async function getActivePlanByIdOrCode(planIdOrCode, client = null) {
  ensureDbBilling();
  const executor = client || { query };
  const value = String(planIdOrCode || "").trim();
  if (!value) {
    return null;
  }
  const res = await executor.query(
    `SELECT id, code, name, plan_type, price_idr, credits_per_unit, duration_months,
            description, is_active, sort_order, created_at, updated_at
     FROM plans
     WHERE is_active = true
       AND (id = $1 OR lower(code) = lower($1))
     LIMIT 1`,
    [value]
  );
  return res.rows[0] || null;
}

async function getCouponForValidation(couponCode, client = null) {
  const executor = client || { query };
  const code = normalizeCouponCode(couponCode);
  if (!code) return null;
  const res = await executor.query(
    `SELECT id, code, name, discount_type, discount_value, max_discount_idr,
            min_order_amount_idr, applies_to_plan_id, usage_limit,
            usage_limit_per_user, starts_at, expires_at, is_active
     FROM coupons
     WHERE lower(code) = lower($1)
     LIMIT 1`,
    [code]
  );
  return res.rows[0] || null;
}

async function getCouponUsageCounts(couponId, userId, client = null) {
  const executor = client || { query };
  const globalRes = await executor.query(
    "SELECT COUNT(*)::int AS count FROM coupon_usages WHERE coupon_id = $1",
    [couponId]
  );
  const userRes = await executor.query(
    "SELECT COUNT(*)::int AS count FROM coupon_usages WHERE coupon_id = $1 AND user_id = $2",
    [couponId, userId]
  );
  return {
    global: Number(globalRes.rows[0]?.count || 0),
    user: Number(userRes.rows[0]?.count || 0)
  };
}

async function listCouponsForAdmin() {
  ensureDbBilling();
  const res = await query(
    `SELECT c.id, c.code, c.name, c.discount_type, c.discount_value, c.max_discount_idr,
            c.min_order_amount_idr, c.applies_to_plan_id, c.usage_limit,
            c.usage_limit_per_user, c.starts_at, c.expires_at, c.is_active,
            c.created_at, c.updated_at, COALESCE(u.used_count, 0)::int AS used_count
       FROM coupons c
       LEFT JOIN (
         SELECT coupon_id, COUNT(*)::int AS used_count
           FROM coupon_usages
          GROUP BY coupon_id
       ) u ON u.coupon_id = c.id
      ORDER BY c.is_active DESC, c.updated_at DESC, c.code ASC`
  );
  return res.rows.map(mapCoupon);
}

async function getCouponByIdForAdmin(couponId, client = null) {
  ensureDbBilling();
  const executor = client || { query };
  const res = await executor.query(
    `SELECT c.id, c.code, c.name, c.discount_type, c.discount_value, c.max_discount_idr,
            c.min_order_amount_idr, c.applies_to_plan_id, c.usage_limit,
            c.usage_limit_per_user, c.starts_at, c.expires_at, c.is_active,
            c.created_at, c.updated_at, COALESCE(u.used_count, 0)::int AS used_count
       FROM coupons c
       LEFT JOIN (
         SELECT coupon_id, COUNT(*)::int AS used_count
           FROM coupon_usages
          GROUP BY coupon_id
       ) u ON u.coupon_id = c.id
      WHERE c.id = $1
      LIMIT 1`,
    [couponId]
  );
  return mapCoupon(res.rows[0]);
}

async function assertCouponCodeAvailable(code, excludeId = null, client = null) {
  const executor = client || { query };
  const res = await executor.query(
    `SELECT id
       FROM coupons
      WHERE lower(code) = lower($1)
        AND ($2::text IS NULL OR id <> $2)
      LIMIT 1`,
    [code, excludeId]
  );
  if (res.rows[0]) {
    throw createClientError("Kode kupon sudah digunakan.", 409, "COUPON_CODE_EXISTS");
  }
}

async function assertCouponPlanTargetExists(planId, client = null) {
  if (!planId) return;
  const plan = await getPlanByIdForAdmin(planId, client);
  if (!plan) {
    throw createClientError("Plan tujuan kupon tidak ditemukan.", 404, "COUPON_PLAN_NOT_FOUND");
  }
}

function normalizeCouponAdminPayload(payload = {}) {
  const rawDiscountType = String(payload.discountType || payload.discount_type || payload.type || "percent").trim().toLowerCase();
  const discountType = rawDiscountType === "amount" ? "fixed_amount" : rawDiscountType;
  if (!COUPON_DISCOUNT_TYPES.has(discountType)) {
    throw createClientError("Tipe diskon kupon tidak valid.");
  }

  const startsAt = normalizeDateTime(payload.startsAt ?? payload.starts_at, { endOfDay: false });
  const expiresAt = normalizeDateTime(payload.expiresAt ?? payload.expires_at ?? payload.endsAt, { endOfDay: true });
  if (startsAt && expiresAt && startsAt.getTime() > expiresAt.getTime()) {
    throw createClientError("Tanggal mulai kupon tidak boleh melewati tanggal berakhir.");
  }

  const maxDiscountIdr = payload.maxDiscountIdr ?? payload.max_discount_idr;
  const appliesToPlanId = String(payload.appliesToPlanId ?? payload.applies_to_plan_id ?? "").trim() || null;

  return {
    code: normalizeCouponCodeForAdmin(payload.code),
    name: normalizeOptionalText(payload.name, 120),
    discountType,
    discountValue: discountType === "free"
      ? 0
      : normalizeNonNegativeInteger(payload.discountValue ?? payload.discount_value ?? payload.value, 0),
    maxDiscountIdr: maxDiscountIdr === null || maxDiscountIdr === undefined || String(maxDiscountIdr).trim() === ""
      ? null
      : normalizeNonNegativeInteger(maxDiscountIdr, 0),
    minOrderAmountIdr: normalizeNonNegativeInteger(payload.minOrderAmountIdr ?? payload.min_order_amount_idr ?? payload.minOrder, 0),
    appliesToPlanId,
    usageLimit: normalizePositiveLimit(payload.usageLimit ?? payload.usage_limit),
    usageLimitPerUser: normalizePositiveLimit(payload.usageLimitPerUser ?? payload.usage_limit_per_user),
    startsAt,
    expiresAt,
    isActive: normalizeBoolean(payload.isActive ?? payload.is_active ?? payload.active, true)
  };
}

async function createCouponForAdmin(payload = {}) {
  ensureDbBilling();
  const next = normalizeCouponAdminPayload(payload);
  return withTransaction(async client => {
    await assertCouponCodeAvailable(next.code, null, client);
    await assertCouponPlanTargetExists(next.appliesToPlanId, client);
    const id = createOpaqueId("coupon");
    const res = await client.query(
      `INSERT INTO coupons (
        id, code, name, discount_type, discount_value, max_discount_idr,
        min_order_amount_idr, applies_to_plan_id, usage_limit,
        usage_limit_per_user, starts_at, expires_at, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, code, name, discount_type, discount_value, max_discount_idr,
                min_order_amount_idr, applies_to_plan_id, usage_limit,
                usage_limit_per_user, starts_at, expires_at, is_active,
                created_at, updated_at, 0::int AS used_count`,
      [
        id,
        next.code,
        next.name,
        next.discountType,
        next.discountValue,
        next.maxDiscountIdr,
        next.minOrderAmountIdr,
        next.appliesToPlanId,
        next.usageLimit,
        next.usageLimitPerUser,
        next.startsAt,
        next.expiresAt,
        next.isActive
      ]
    );
    return mapCoupon(res.rows[0]);
  });
}

async function updateCouponForAdmin(couponId, payload = {}) {
  ensureDbBilling();
  const next = normalizeCouponAdminPayload(payload);
  return withTransaction(async client => {
    const existing = await getCouponByIdForAdmin(couponId, client);
    if (!existing) {
      throw createClientError("Kupon tidak ditemukan.", 404, "COUPON_NOT_FOUND");
    }
    await assertCouponCodeAvailable(next.code, couponId, client);
    await assertCouponPlanTargetExists(next.appliesToPlanId, client);
    const res = await client.query(
      `UPDATE coupons
          SET code = $2,
              name = $3,
              discount_type = $4,
              discount_value = $5,
              max_discount_idr = $6,
              min_order_amount_idr = $7,
              applies_to_plan_id = $8,
              usage_limit = $9,
              usage_limit_per_user = $10,
              starts_at = $11,
              expires_at = $12,
              is_active = $13,
              updated_at = now()
        WHERE id = $1
      RETURNING id, code, name, discount_type, discount_value, max_discount_idr,
                min_order_amount_idr, applies_to_plan_id, usage_limit,
                usage_limit_per_user, starts_at, expires_at, is_active,
                created_at, updated_at,
                (SELECT COUNT(*)::int FROM coupon_usages WHERE coupon_id = coupons.id) AS used_count`,
      [
        couponId,
        next.code,
        next.name,
        next.discountType,
        next.discountValue,
        next.maxDiscountIdr,
        next.minOrderAmountIdr,
        next.appliesToPlanId,
        next.usageLimit,
        next.usageLimitPerUser,
        next.startsAt,
        next.expiresAt,
        next.isActive
      ]
    );
    return mapCoupon(res.rows[0]);
  });
}

async function setCouponActiveForAdmin(couponId, isActive) {
  ensureDbBilling();
  const res = await query(
    `UPDATE coupons
        SET is_active = $2,
            updated_at = now()
      WHERE id = $1
    RETURNING id, code, name, discount_type, discount_value, max_discount_idr,
              min_order_amount_idr, applies_to_plan_id, usage_limit,
              usage_limit_per_user, starts_at, expires_at, is_active,
              created_at, updated_at,
              (SELECT COUNT(*)::int FROM coupon_usages WHERE coupon_id = coupons.id) AS used_count`,
    [couponId, normalizeBoolean(isActive, true)]
  );
  if (!res.rows[0]) {
    throw createClientError("Kupon tidak ditemukan.", 404, "COUPON_NOT_FOUND");
  }
  return mapCoupon(res.rows[0]);
}

function calculateDiscount(coupon, subtotal) {
  const type = String(coupon.discount_type || "").toLowerCase();
  if (type === "free") {
    return subtotal;
  }
  if (type === "percent") {
    const percent = Math.max(0, Number(coupon.discount_value || 0));
    let discount = Math.floor(subtotal * percent / 100);
    if (coupon.max_discount_idr !== null && coupon.max_discount_idr !== undefined) {
      discount = Math.min(discount, toInt(coupon.max_discount_idr));
    }
    return Math.min(subtotal, discount);
  }
  if (type === "fixed_amount") {
    return Math.min(subtotal, toInt(coupon.discount_value));
  }
  return 0;
}

async function calculateOrderPricing({ userId, planId, quantity = 1, couponCode = null }, client = null) {
  ensureDbBilling();
  const plan = await getActivePlanByIdOrCode(planId, client);
  if (!plan) {
    const err = new Error("Plan tidak ditemukan atau tidak aktif.");
    err.statusCode = 404;
    err.code = "PLAN_NOT_FOUND";
    throw err;
  }

  const safeQuantity = normalizePlanQuantity(plan, quantity);
  const subtotalIdr = toInt(plan.price_idr) * safeQuantity;
  const totalCredits = toInt(plan.credits_per_unit) * safeQuantity;
  let coupon = null;
  let discountIdr = 0;
  const normalizedCouponCode = normalizeCouponCode(couponCode);

  if (normalizedCouponCode) {
    coupon = await getCouponForValidation(normalizedCouponCode, client);
    const now = new Date();
    if (!coupon || !coupon.is_active) {
      const err = new Error("Kupon tidak aktif atau tidak ditemukan.");
      err.statusCode = 400;
      err.code = "COUPON_INVALID";
      throw err;
    }
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      const err = new Error("Kupon belum berlaku.");
      err.statusCode = 400;
      err.code = "COUPON_NOT_STARTED";
      throw err;
    }
    if (coupon.expires_at && new Date(coupon.expires_at) <= now) {
      const err = new Error("Kupon sudah kedaluwarsa.");
      err.statusCode = 400;
      err.code = "COUPON_EXPIRED";
      throw err;
    }
    if (coupon.applies_to_plan_id && coupon.applies_to_plan_id !== plan.id) {
      const err = new Error("Kupon tidak berlaku untuk plan ini.");
      err.statusCode = 400;
      err.code = "COUPON_PLAN_MISMATCH";
      throw err;
    }
    if (subtotalIdr < toInt(coupon.min_order_amount_idr)) {
      const err = new Error("Subtotal belum memenuhi minimum penggunaan kupon.");
      err.statusCode = 400;
      err.code = "COUPON_MIN_ORDER";
      throw err;
    }

    const counts = await getCouponUsageCounts(coupon.id, userId, client);
    if (coupon.usage_limit !== null && coupon.usage_limit !== undefined && counts.global >= Number(coupon.usage_limit)) {
      const err = new Error("Kupon sudah mencapai batas penggunaan.");
      err.statusCode = 400;
      err.code = "COUPON_USAGE_LIMIT";
      throw err;
    }
    if (
      coupon.usage_limit_per_user !== null
      && coupon.usage_limit_per_user !== undefined
      && counts.user >= Number(coupon.usage_limit_per_user)
    ) {
      const err = new Error("Kupon sudah mencapai batas penggunaan untuk akun ini.");
      err.statusCode = 400;
      err.code = "COUPON_USER_USAGE_LIMIT";
      throw err;
    }

    discountIdr = calculateDiscount(coupon, subtotalIdr);
  }

  const totalIdr = Math.max(0, subtotalIdr - discountIdr);
  return {
    plan: mapPlan(plan),
    quantity: safeQuantity,
    subtotalIdr,
    discountIdr,
    totalIdr,
    totalCredits,
    coupon: coupon ? {
      id: coupon.id,
      code: coupon.code,
      name: coupon.name || null,
      discountType: coupon.discount_type,
      discountValue: toInt(coupon.discount_value)
    } : null
  };
}

async function createCreditBatchForOrder({ client, orderId, userId, plan, quantity }) {
  const credits = toInt(plan.credits_per_unit) * quantity;
  if (credits <= 0) {
    return null;
  }

  const now = new Date();
  const id = createOpaqueId("cr");
  const sourceType = getCreditSourceType(plan);
  if (sourceType !== "free") {
    await client.query(
      `UPDATE credits
       SET status = 'expired',
           expires_at = LEAST(expires_at, $2)
       WHERE user_id = $1
         AND source_type = 'free'
         AND status = 'active'
         AND starts_at <= $2
         AND expires_at > $2`,
      [userId, now]
    );
  }
  const res = await client.query(
    `INSERT INTO credits (
      id, user_id, plan_id, order_id, source_type,
      total_credits, used_credits, starts_at, expires_at, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, 0, $7, $8, 'active')
    RETURNING id, user_id, plan_id, order_id, source_type, total_credits, used_credits, starts_at, expires_at, status, created_at`,
    [
      id,
      userId,
      plan.id,
      orderId,
      sourceType,
      credits,
      now,
      getCreditExpiresAt(plan, now)
    ]
  );
  return res.rows[0];
}

async function createOrder({ userId, planId, quantity = 1, couponCode = null }) {
  ensureDbBilling();
  return withTransaction(async client => {
    const pricing = await calculateOrderPricing({ userId, planId, quantity, couponCode }, client);
    if (String(pricing.plan.planType || "").toLowerCase() === "free" && await userHasActiveCredits(userId, client)) {
      const err = new Error("Plan Free hanya bisa dipilih saat tidak ada plan atau kredit aktif.");
      err.statusCode = 409;
      err.code = "FREE_PLAN_ALREADY_ACTIVE";
      throw err;
    }
    const orderId = createOpaqueId("ord");
    const isPaidImmediately = pricing.totalIdr === 0;
    const status = isPaidImmediately ? "paid" : "pending_payment";
    const paymentInstruction = isPaidImmediately ? null : PAYMENT_MANUAL_INSTRUCTIONS;
    const paymentExpiresAt = isPaidImmediately ? null : getPaymentExpiresAt();
    const activatedAt = isPaidImmediately ? new Date() : null;

    const orderRes = await client.query(
      `INSERT INTO orders (
        id, user_id, plan_id, quantity, subtotal_idr, discount_idr, total_idr,
        coupon_id, coupon_code, status, payment_instruction, payment_expires_at, activated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        orderId,
        userId,
        pricing.plan.id,
        pricing.quantity,
        pricing.subtotalIdr,
        pricing.discountIdr,
        pricing.totalIdr,
        pricing.coupon?.id || null,
        pricing.coupon?.code || null,
        status,
        paymentInstruction,
        paymentExpiresAt,
        activatedAt
      ]
    );

    let credit = null;
    if (isPaidImmediately) {
      credit = await createCreditBatchForOrder({
        client,
        orderId,
        userId,
        plan: {
          id: pricing.plan.id,
          plan_type: pricing.plan.planType,
          credits_per_unit: pricing.plan.creditsPerUnit,
          duration_months: pricing.plan.durationMonths
        },
        quantity: pricing.quantity
      });

      if (pricing.coupon) {
        await client.query(
          `INSERT INTO coupon_usages (coupon_id, order_id, user_id, plan_id, discount_idr)
           VALUES ($1, $2, $3, $4, $5)`,
          [pricing.coupon.id, orderId, userId, pricing.plan.id, pricing.discountIdr]
        );
      }
    }

    return {
      order: await getOrderByIdForUser(orderRes.rows[0].id, userId, client),
      pricing,
      credit: credit ? {
        id: credit.id,
        totalCredits: Number(credit.total_credits || 0),
        sourceType: credit.source_type,
        expiresAt: toIso(credit.expires_at)
      } : null
    };
  });
}

async function cancelOrderForUser(orderId, userId) {
  ensureDbBilling();
  return withTransaction(async client => {
    const res = await client.query(
      "SELECT id, status FROM orders WHERE id = $1 AND user_id = $2 FOR UPDATE",
      [orderId, userId]
    );
    const order = res.rows[0];
    if (!order) {
      const err = new Error("Order tidak ditemukan.");
      err.statusCode = 404;
      err.code = "ORDER_NOT_FOUND";
      throw err;
    }
    if (order.status !== "pending_payment") {
      const err = new Error("Hanya order pending payment yang dapat dibatalkan.");
      err.statusCode = 409;
      err.code = "ORDER_NOT_CANCELABLE";
      throw err;
    }

    await client.query(
      "UPDATE orders SET status = 'cancelled', updated_at = now() WHERE id = $1 AND user_id = $2",
      [orderId, userId]
    );
    return getOrderByIdForUser(orderId, userId, client);
  });
}

async function listOrdersForUser(userId) {
  ensureDbBilling();
  const res = await query(
    `SELECT o.*,
            p.code AS plan_code, p.name AS plan_name, p.plan_type, p.price_idr AS plan_price_idr,
            p.credits_per_unit AS plan_credits_per_unit, p.duration_months AS plan_duration_months,
            p.description AS plan_description,
            pp.id AS proof_id, pp.original_name AS proof_original_name,
            pp.mime_type AS proof_mime_type, pp.size_bytes AS proof_size_bytes,
            pp.status AS proof_status, pp.submitted_at AS proof_submitted_at
     FROM orders o
     JOIN plans p ON p.id = o.plan_id
     LEFT JOIN LATERAL (
       SELECT id, original_name, mime_type, size_bytes, status, submitted_at
       FROM payment_proofs
       WHERE order_id = o.id
       ORDER BY submitted_at DESC
       LIMIT 1
     ) pp ON true
     WHERE o.user_id = $1
     ORDER BY o.created_at DESC`,
    [userId]
  );
  return res.rows.map(mapOrder);
}

async function getOrderByIdForUser(orderId, userId, client = null) {
  ensureDbBilling();
  const executor = client || { query };
  const res = await executor.query(
    `SELECT o.*,
            p.code AS plan_code, p.name AS plan_name, p.plan_type, p.price_idr AS plan_price_idr,
            p.credits_per_unit AS plan_credits_per_unit, p.duration_months AS plan_duration_months,
            p.description AS plan_description,
            pp.id AS proof_id, pp.original_name AS proof_original_name,
            pp.mime_type AS proof_mime_type, pp.size_bytes AS proof_size_bytes,
            pp.status AS proof_status, pp.submitted_at AS proof_submitted_at
     FROM orders o
     JOIN plans p ON p.id = o.plan_id
     LEFT JOIN LATERAL (
       SELECT id, original_name, mime_type, size_bytes, status, submitted_at
       FROM payment_proofs
       WHERE order_id = o.id
       ORDER BY submitted_at DESC
       LIMIT 1
     ) pp ON true
     WHERE o.id = $1 AND o.user_id = $2
     LIMIT 1`,
    [orderId, userId]
  );
  return mapOrder(res.rows[0]);
}

function getAdminOrderSelectSql() {
  return `SELECT o.*,
            p.code AS plan_code, p.name AS plan_name, p.plan_type, p.price_idr AS plan_price_idr,
            p.credits_per_unit AS plan_credits_per_unit, p.duration_months AS plan_duration_months,
            p.description AS plan_description,
            u.username, u.email,
            mp.kode_toko, mp.alamat, mp.konfigurasi_toko->>'namaToko' AS store_name,
            pp.id AS proof_id, pp.original_name AS proof_original_name,
            pp.mime_type AS proof_mime_type, pp.size_bytes AS proof_size_bytes,
            pp.status AS proof_status, pp.submitted_at AS proof_submitted_at`;
}

function getAdminOrderFromSql() {
  return `FROM orders o
     JOIN plans p ON p.id = o.plan_id
     JOIN users u ON u.id = o.user_id
     LEFT JOIN mitra_profiles mp ON mp.user_id = u.id
     LEFT JOIN LATERAL (
       SELECT id, original_name, mime_type, size_bytes, status, submitted_at
       FROM payment_proofs
       WHERE order_id = o.id
       ORDER BY submitted_at DESC
       LIMIT 1
     ) pp ON true`;
}

async function listOrdersForAdmin() {
  ensureDbBilling();
  const res = await query(
    `${getAdminOrderSelectSql()}
     ${getAdminOrderFromSql()}
     ORDER BY
       CASE o.status
         WHEN 'waiting_verification' THEN 1
         WHEN 'pending_payment' THEN 2
         WHEN 'paid' THEN 3
         WHEN 'rejected' THEN 4
         WHEN 'cancelled' THEN 5
         WHEN 'expired' THEN 6
         ELSE 9
       END ASC,
       o.created_at DESC`
  );
  return res.rows.map(mapOrder);
}

async function getOrderByIdForAdmin(orderId, client = null) {
  ensureDbBilling();
  const executor = client || { query };
  const res = await executor.query(
    `${getAdminOrderSelectSql()}
     ${getAdminOrderFromSql()}
     WHERE o.id = $1
     LIMIT 1`,
    [orderId]
  );
  return mapOrder(res.rows[0]);
}

async function getPaymentProofForAdmin(orderId) {
  ensureDbBilling();
  const res = await query(
    `SELECT pp.*
     FROM payment_proofs pp
     JOIN orders o ON o.id = pp.order_id
     WHERE pp.order_id = $1
     ORDER BY pp.submitted_at DESC
     LIMIT 1`,
    [orderId]
  );
  return mapPaymentProof(res.rows[0]);
}

async function reviewOrderPaymentByAdmin({ orderId, action, rejectedReason = null }) {
  ensureDbBilling();
  const normalizedAction = String(action || "").trim().toLowerCase();
  if (!["approve", "reject"].includes(normalizedAction)) {
    const err = new Error("Aksi review tidak valid.");
    err.statusCode = 400;
    err.code = "INVALID_REVIEW_ACTION";
    throw err;
  }

  return withTransaction(async client => {
    const orderRes = await client.query(
      `SELECT o.*, p.plan_type, p.credits_per_unit, p.duration_months
       FROM orders o
       JOIN plans p ON p.id = o.plan_id
       WHERE o.id = $1
       FOR UPDATE`,
      [orderId]
    );
    const order = orderRes.rows[0];
    if (!order) {
      const err = new Error("Order tidak ditemukan.");
      err.statusCode = 404;
      err.code = "ORDER_NOT_FOUND";
      throw err;
    }
    if (order.status !== "waiting_verification") {
      const err = new Error("Hanya order menunggu verifikasi yang dapat direview.");
      err.statusCode = 409;
      err.code = "ORDER_NOT_REVIEWABLE";
      throw err;
    }

    if (normalizedAction === "reject") {
      const reason = String(rejectedReason || "").trim().slice(0, 500) || "Pembayaran ditolak.";
      await client.query(
        `UPDATE orders
         SET status = 'rejected',
             rejected_at = now(),
             rejected_reason = $2,
             updated_at = now()
         WHERE id = $1`,
        [orderId, reason]
      );
      await client.query(
        "UPDATE payment_proofs SET status = 'rejected' WHERE order_id = $1",
        [orderId]
      );
      return {
        order: await getOrderByIdForAdmin(orderId, client),
        credit: null
      };
    }

    const existingCredit = await client.query(
      "SELECT id, total_credits, source_type, expires_at FROM credits WHERE order_id = $1 LIMIT 1",
      [orderId]
    );
    let credit = existingCredit.rows[0] || null;
    if (!credit) {
      credit = await createCreditBatchForOrder({
        client,
        orderId,
        userId: order.user_id,
        plan: {
          id: order.plan_id,
          plan_type: order.plan_type,
          credits_per_unit: order.credits_per_unit,
          duration_months: order.duration_months
        },
        quantity: Number(order.quantity || 1)
      });
    }

    if (order.coupon_id) {
      const existingCouponUsage = await client.query(
        "SELECT id FROM coupon_usages WHERE order_id = $1 LIMIT 1",
        [orderId]
      );
      if (!existingCouponUsage.rows[0]) {
        await client.query(
          `INSERT INTO coupon_usages (coupon_id, order_id, user_id, plan_id, discount_idr)
           VALUES ($1, $2, $3, $4, $5)`,
          [order.coupon_id, orderId, order.user_id, order.plan_id, toInt(order.discount_idr)]
        );
      }
    }

    await client.query(
      `UPDATE orders
       SET status = 'paid',
           activated_at = COALESCE(activated_at, now()),
           updated_at = now()
       WHERE id = $1`,
      [orderId]
    );
    await client.query(
      "UPDATE payment_proofs SET status = 'approved' WHERE order_id = $1",
      [orderId]
    );

    return {
      order: await getOrderByIdForAdmin(orderId, client),
      credit: credit ? {
        id: credit.id,
        totalCredits: Number(credit.total_credits || 0),
        sourceType: credit.source_type,
        expiresAt: toIso(credit.expires_at)
      } : null
    };
  });
}

async function attachPaymentProof({ orderId, userId, file, userNote = null }) {
  ensureDbBilling();
  return withTransaction(async client => {
    const orderRes = await client.query(
      "SELECT * FROM orders WHERE id = $1 AND user_id = $2 FOR UPDATE",
      [orderId, userId]
    );
    const order = orderRes.rows[0];
    if (!order) {
      const err = new Error("Order tidak ditemukan.");
      err.statusCode = 404;
      err.code = "ORDER_NOT_FOUND";
      throw err;
    }
    if (order.status !== "pending_payment") {
      const err = new Error("Bukti pembayaran hanya dapat diupload untuk order pending payment.");
      err.statusCode = 409;
      err.code = "ORDER_NOT_PENDING_PAYMENT";
      throw err;
    }

    const proofCount = await client.query(
      "SELECT COUNT(*)::int AS count FROM payment_proofs WHERE order_id = $1",
      [orderId]
    );
    if (Number(proofCount.rows[0]?.count || 0) > 0) {
      const err = new Error("Order ini sudah memiliki bukti pembayaran.");
      err.statusCode = 409;
      err.code = "PAYMENT_PROOF_EXISTS";
      throw err;
    }

    const proofId = createOpaqueId("proof");
    const proofRes = await client.query(
      `INSERT INTO payment_proofs (
        id, order_id, user_id, original_name, stored_path,
        mime_type, size_bytes, status, user_note
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'submitted', $8)
      RETURNING *`,
      [
        proofId,
        orderId,
        userId,
        file.originalname,
        file.path,
        file.mimetype,
        file.size,
        userNote || null
      ]
    );

    await client.query(
      `UPDATE orders
       SET status = 'waiting_verification', updated_at = now()
       WHERE id = $1 AND user_id = $2`,
      [orderId, userId]
    );

    return {
      order: await getOrderByIdForUser(orderId, userId, client),
      proof: mapPaymentProof(proofRes.rows[0])
    };
  });
}

async function getCreditBalance(userId) {
  ensureDbBilling();
  const activeRes = await query(
    `SELECT source_type,
            SUM(total_credits)::int AS total_credits,
            SUM(used_credits)::int AS used_credits,
            SUM(GREATEST(total_credits - used_credits, 0))::int AS remaining_credits,
            MIN(expires_at) FILTER (WHERE total_credits > used_credits) AS nearest_expires_at
     FROM credits
     WHERE user_id = $1
       AND status = 'active'
       AND starts_at <= now()
       AND expires_at > now()
     GROUP BY source_type
     ORDER BY source_type ASC`,
    [userId]
  );
  const nearestRes = await query(
    `SELECT expires_at,
            SUM(GREATEST(total_credits - used_credits, 0))::int AS remaining_credits
     FROM credits
     WHERE user_id = $1
       AND status = 'active'
       AND starts_at <= now()
       AND expires_at > now()
       AND total_credits > used_credits
     GROUP BY expires_at
     ORDER BY expires_at ASC
     LIMIT 1`,
    [userId]
  );

  const breakdown = {};
  let totalCredits = 0;
  let usedCredits = 0;
  let remainingCredits = 0;

  for (const row of activeRes.rows) {
    const source = row.source_type || "unknown";
    const item = {
      sourceType: source,
      totalCredits: toInt(row.total_credits),
      usedCredits: toInt(row.used_credits),
      remainingCredits: toInt(row.remaining_credits),
      nearestExpiresAt: toIso(row.nearest_expires_at)
    };
    breakdown[source] = item;
    totalCredits += item.totalCredits;
    usedCredits += item.usedCredits;
    remainingCredits += item.remainingCredits;
  }

  const nearestRow = nearestRes.rows[0] || null;

  return {
    totalCredits,
    usedCredits,
    remainingCredits,
    breakdown,
    nearestExpiration: toIso(nearestRow?.expires_at),
    nearestExpirationCredits: toInt(nearestRow?.remaining_credits)
  };
}

function buildJobSnapshot(job) {
  return {
    id: job?.id || null,
    sessionId: job?.sessionId || null,
    originalName: job?.originalName || null,
    status: job?.status || null,
    ownerUserId: job?.ownerUserId || null,
    printConfig: job?.printConfig || {}
  };
}

async function deductCreditForJobPrint(job) {
  ensureDbBilling();
  const jobId = String(job?.id || "").trim();
  const userId = String(job?.ownerUserId || "").trim();
  if (!jobId) {
    const err = new Error("Job ID diperlukan untuk pemotongan kredit.");
    err.statusCode = 400;
    err.code = "JOB_ID_REQUIRED";
    throw err;
  }
  if (!userId) {
    const err = new Error("Owner job tidak ditemukan untuk pemotongan kredit.");
    err.statusCode = 400;
    err.code = "JOB_OWNER_REQUIRED";
    throw err;
  }

  return withTransaction(async client => {
    const lockedJob = await client.query(
      "SELECT id, owner_user_id, status FROM jobs WHERE id = $1 FOR UPDATE",
      [jobId]
    );
    if (!lockedJob.rows[0]) {
      const err = new Error("Job tidak ditemukan untuk pemotongan kredit.");
      err.statusCode = 404;
      err.code = "JOB_NOT_FOUND";
      throw err;
    }
    if (lockedJob.rows[0].owner_user_id !== userId) {
      const err = new Error("Owner job tidak cocok untuk pemotongan kredit.");
      err.statusCode = 409;
      err.code = "JOB_OWNER_MISMATCH";
      throw err;
    }

    const existingUsage = await client.query(
      "SELECT id FROM credit_usages WHERE job_id = $1 AND usage_type = 'job_print' LIMIT 1",
      [jobId]
    );
    if (existingUsage.rows[0]) {
      return {
        alreadyDeducted: true,
        usageId: existingUsage.rows[0].id,
        remainingCredits: null
      };
    }

    const creditsRes = await client.query(
      `SELECT id, source_type, total_credits, used_credits, expires_at
       FROM credits
       WHERE user_id = $1
         AND status = 'active'
         AND starts_at <= now()
         AND expires_at > now()
         AND total_credits > used_credits
         AND source_type = ANY($2::text[])
       ORDER BY
         CASE source_type
           WHEN 'subscription' THEN 1
           WHEN 'topup' THEN 2
           WHEN 'free' THEN 3
           ELSE 9
         END ASC,
         expires_at ASC,
         created_at ASC
       FOR UPDATE`,
      [userId, ["subscription", "topup", "free"]]
    );
    const credit = creditsRes.rows[0];
    if (!credit) {
      const err = new Error("Kredit tidak cukup untuk mencetak tugas ini.");
      err.statusCode = 402;
      err.code = "INSUFFICIENT_CREDIT";
      throw err;
    }

    await client.query(
      "UPDATE credits SET used_credits = used_credits + 1 WHERE id = $1",
      [credit.id]
    );
    const usageRes = await client.query(
      `INSERT INTO credit_usages (user_id, credit_id, job_id, amount, usage_type, job_snapshot)
       VALUES ($1, $2, $3, 1, 'job_print', $4::jsonb)
       RETURNING id, created_at`,
      [userId, credit.id, jobId, JSON.stringify(buildJobSnapshot(job))]
    );

    return {
      alreadyDeducted: false,
      usageId: usageRes.rows[0]?.id || null,
      creditId: credit.id,
      sourceType: credit.source_type
    };
  });
}

module.exports = {
  ORDER_STATUSES,
  CREDIT_SOURCE_PRIORITY,
  listActivePlans,
  listPlansForAdmin,
  createPlanForAdmin,
  updatePlanForAdmin,
  setPlanActiveForAdmin,
  listCouponsForAdmin,
  createCouponForAdmin,
  updateCouponForAdmin,
  setCouponActiveForAdmin,
  calculateOrderPricing,
  createOrder,
  cancelOrderForUser,
  listOrdersForUser,
  getOrderByIdForUser,
  listOrdersForAdmin,
  getOrderByIdForAdmin,
  getPaymentProofForAdmin,
  reviewOrderPaymentByAdmin,
  attachPaymentProof,
  getCreditBalance,
  deductCreditForJobPrint
};

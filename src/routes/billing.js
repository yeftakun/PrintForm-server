const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const {
  paymentProofsDir,
  PAYMENT_PROOF_MAX_BYTES,
  PAYMENT_MANUAL_INSTRUCTIONS
} = require("../config");
const { requireAuth } = require("../middleware/auth");
const { rejectSuspendedMitra } = require("../middleware/suspension");
const { asyncHandler } = require("../utils/asyncHandler");
const { writeAuditLogSafe, getActorFromRequest } = require("../services/audit");
const {
  listActivePlans,
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
  getCreditBalance
} = require("../services/billing");

const router = express.Router();

fs.mkdirSync(paymentProofsDir, { recursive: true });

const ALLOWED_PAYMENT_PROOF_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp"
]);

const ALLOWED_PAYMENT_PROOF_EXTENSIONS = new Set([
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp"
]);

const uploadPaymentProof = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, paymentProofsDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase();
      const safeExt = ALLOWED_PAYMENT_PROOF_EXTENSIONS.has(ext) ? ext : "";
      cb(null, `payment-proof-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExt}`);
    }
  }),
  limits: {
    fileSize: PAYMENT_PROOF_MAX_BYTES
  },
  fileFilter: (req, file, cb) => {
    const mime = String(file.mimetype || "").toLowerCase();
    const ext = path.extname(file.originalname || "").toLowerCase();
    if (ALLOWED_PAYMENT_PROOF_MIME_TYPES.has(mime) && ALLOWED_PAYMENT_PROOF_EXTENSIONS.has(ext)) {
      cb(null, true);
      return;
    }
    cb(new Error("Bukti pembayaran harus berupa gambar atau PDF."));
  }
}).single("proof");

function uploadProofMiddleware(req, res, next) {
  uploadPaymentProof(req, res, err => {
    if (!err) {
      next();
      return;
    }
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    res.status(status).json({ error: err.message || "Upload bukti pembayaran gagal." });
  });
}

function normalizeQuantity(value) {
  const quantity = Number.parseInt(value, 10);
  return Number.isInteger(quantity) && quantity > 0 ? quantity : 1;
}

function normalizeOptionalText(value, maxLength = 500) {
  const text = String(value || "").trim();
  return text ? text.slice(0, maxLength) : "";
}

function requireAdminUser(req, res) {
  if (String(req.user?.role || "").toLowerCase() === "admin") {
    return true;
  }
  res.status(403).json({ error: "Akses admin diperlukan." });
  return false;
}

router.use(requireAuth);
router.use(rejectSuspendedMitra);

router.get("/admin/orders", asyncHandler(async (req, res) => {
  if (!requireAdminUser(req, res)) return;
  const orders = await listOrdersForAdmin();
  res.json({ orders });
}));

router.get("/admin/orders/:id", asyncHandler(async (req, res) => {
  if (!requireAdminUser(req, res)) return;
  const order = await getOrderByIdForAdmin(req.params.id);
  if (!order) {
    res.status(404).json({ error: "Order tidak ditemukan." });
    return;
  }
  res.json({ order });
}));

router.get("/admin/orders/:id/payment-proof/preview", asyncHandler(async (req, res) => {
  if (!requireAdminUser(req, res)) return;
  const proof = await getPaymentProofForAdmin(req.params.id);
  if (!proof?.storedPath) {
    res.status(404).json({ error: "Bukti pembayaran tidak ditemukan." });
    return;
  }
  try {
    await fs.promises.access(proof.storedPath, fs.constants.F_OK);
  } catch {
    res.status(404).json({ error: "File bukti pembayaran tidak tersedia." });
    return;
  }
  res.setHeader("Content-Type", proof.mimeType || "application/octet-stream");
  res.setHeader("Content-Disposition", `inline; filename="${path.basename(proof.originalName || "payment-proof")}"`);
  res.sendFile(path.resolve(proof.storedPath));
}));

router.get("/admin/orders/:id/payment-proof/download", asyncHandler(async (req, res) => {
  if (!requireAdminUser(req, res)) return;
  const proof = await getPaymentProofForAdmin(req.params.id);
  if (!proof?.storedPath) {
    res.status(404).json({ error: "Bukti pembayaran tidak ditemukan." });
    return;
  }
  try {
    await fs.promises.access(proof.storedPath, fs.constants.F_OK);
  } catch {
    res.status(404).json({ error: "File bukti pembayaran tidak tersedia." });
    return;
  }
  res.download(proof.storedPath, proof.originalName || "payment-proof");
}));

router.post("/admin/orders/:id/review", asyncHandler(async (req, res) => {
  if (!requireAdminUser(req, res)) return;
  const result = await reviewOrderPaymentByAdmin({
    orderId: req.params.id,
    action: req.body?.action,
    rejectedReason: normalizeOptionalText(req.body?.rejectedReason, 500)
  });
  const actor = getActorFromRequest(req);
  await writeAuditLogSafe({
    actorType: actor.actorType,
    actorId: actor.actorId,
    action: result.order?.status === "paid" ? "billing.order.approved" : "billing.order.rejected",
    targetType: "order",
    targetId: result.order?.id || req.params.id,
    detail: {
      status: result.order?.status || null,
      totalIdr: result.order?.totalIdr || 0,
      creditId: result.credit?.id || null,
      rejectedReason: result.order?.rejectedReason || null
    }
  });
  res.json(result);
}));

router.get("/plans", asyncHandler(async (req, res) => {
  const plans = await listActivePlans();
  res.json({ plans });
}));

router.post("/coupons/validate", asyncHandler(async (req, res) => {
  const pricing = await calculateOrderPricing({
    userId: req.user.id,
    planId: req.body?.planId || req.body?.planCode,
    quantity: normalizeQuantity(req.body?.quantity),
    couponCode: req.body?.couponCode
  });

  res.json({ pricing });
}));

router.post("/orders", asyncHandler(async (req, res) => {
  const result = await createOrder({
    userId: req.user.id,
    planId: req.body?.planId || req.body?.planCode,
    quantity: normalizeQuantity(req.body?.quantity),
    couponCode: req.body?.couponCode
  });

  const actor = getActorFromRequest(req);
  await writeAuditLogSafe({
    actorType: actor.actorType,
    actorId: actor.actorId,
    action: "billing.order.created",
    targetType: "order",
    targetId: result.order?.id || null,
    detail: {
      status: result.order?.status || null,
      planId: result.order?.planId || null,
      quantity: result.order?.quantity || null,
      totalIdr: result.order?.totalIdr || 0,
      couponCode: result.order?.couponCode || null,
      creditId: result.credit?.id || null
    }
  });

  res.status(201).json(result);
}));

router.get("/orders", asyncHandler(async (req, res) => {
  const orders = await listOrdersForUser(req.user.id);
  res.json({ orders });
}));

router.get("/orders/:id", asyncHandler(async (req, res) => {
  const order = await getOrderByIdForUser(req.params.id, req.user.id);
  if (!order) {
    res.status(404).json({ error: "Order tidak ditemukan." });
    return;
  }
  res.json({ order });
}));

router.post("/orders/:id/cancel", asyncHandler(async (req, res) => {
  const order = await cancelOrderForUser(req.params.id, req.user.id);
  const actor = getActorFromRequest(req);
  await writeAuditLogSafe({
    actorType: actor.actorType,
    actorId: actor.actorId,
    action: "billing.order.cancelled",
    targetType: "order",
    targetId: order.id,
    detail: {
      planId: order.planId,
      totalIdr: order.totalIdr
    }
  });
  res.json({ order });
}));

router.post("/orders/:id/payment-proof", uploadProofMiddleware, asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "File bukti pembayaran wajib diupload." });
    return;
  }

  try {
    const result = await attachPaymentProof({
      orderId: req.params.id,
      userId: req.user.id,
      file: req.file,
      userNote: normalizeOptionalText(req.body?.userNote)
    });

    const actor = getActorFromRequest(req);
    await writeAuditLogSafe({
      actorType: actor.actorType,
      actorId: actor.actorId,
      action: "billing.payment_proof.uploaded",
      targetType: "order",
      targetId: result.order?.id || req.params.id,
      detail: {
        proofId: result.proof?.id || null,
        fileName: result.proof?.originalName || null,
        sizeBytes: result.proof?.sizeBytes || 0
      }
    });

    res.status(201).json(result);
  } catch (err) {
    fs.promises.unlink(req.file.path).catch(() => {});
    throw err;
  }
}));

router.get("/credits/balance", asyncHandler(async (req, res) => {
  const balance = await getCreditBalance(req.user.id);
  res.json({ balance });
}));

router.get("/payment-instructions", asyncHandler(async (req, res) => {
  res.json({ paymentInstruction: PAYMENT_MANUAL_INSTRUCTIONS });
}));

module.exports = router;

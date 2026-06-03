const { useDb } = require("../config");
const { query } = require("../db");

function mapAuditLogRow(row) {
  return {
    id: row.id,
    actorType: row.actor_type || null,
    actorId: row.actor_id || null,
    action: row.action,
    targetType: row.target_type || null,
    targetId: row.target_id || null,
    detail: row.detail || {},
    createdAt: row.created_at?.toISOString?.() || row.created_at
  };
}

async function createAuditLog({
  actorType,
  actorId,
  action,
  targetType,
  targetId,
  detail
} = {}) {
  if (!useDb) {
    return null;
  }

  if (!action || typeof action !== "string") {
    return null;
  }

  const safeDetail = detail && typeof detail === "object" ? detail : {};
  const res = await query(
    `INSERT INTO audit_logs (
      actor_type,
      actor_id,
      action,
      target_type,
      target_id,
      detail
    )
    VALUES ($1, $2, $3, $4, $5, $6::jsonb)
    RETURNING id, created_at`,
    [
      actorType || null,
      actorId || null,
      action,
      targetType || null,
      targetId || null,
      JSON.stringify(safeDetail)
    ]
  );

  const row = res.rows[0];
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    createdAt: row.created_at?.toISOString?.() || row.created_at
  };
}

function normalizeAuditDate(value) {
  const text = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return null;
  }
  const date = new Date(`${text}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime())) {
    return null;
  }
  return text;
}

function buildAuditFilters({ search = "", date = "" } = {}) {
  const clauses = [];
  const values = [];
  const normalizedSearch = String(search || "").trim().toLowerCase();
  if (normalizedSearch) {
    values.push(`%${normalizedSearch}%`);
    clauses.push(`(
      lower(COALESCE(actor_type, '')) LIKE $${values.length}
      OR lower(COALESCE(actor_id, '')) LIKE $${values.length}
      OR lower(COALESCE(action, '')) LIKE $${values.length}
      OR lower(COALESCE(target_type, '')) LIKE $${values.length}
      OR lower(COALESCE(target_id, '')) LIKE $${values.length}
      OR lower(COALESCE(detail::text, '')) LIKE $${values.length}
    )`);
  }

  const normalizedDate = normalizeAuditDate(date);
  if (normalizedDate) {
    values.push(normalizedDate);
    clauses.push(`created_at >= $${values.length}::date`);
    clauses.push(`created_at < ($${values.length}::date + interval '1 day')`);
  }

  return {
    whereSql: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    values
  };
}

async function listAuditLogs({
  page = 1,
  perPage = 20,
  search = "",
  date = ""
} = {}) {
  if (!useDb) {
    return {
      logs: [],
      total: 0,
      page: 1,
      perPage,
      totalPages: 1,
      all: perPage === "all"
    };
  }

  const all = String(perPage || "").toLowerCase() === "all";
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safePerPage = all ? "all" : Math.min(Math.max(Number.parseInt(perPage, 10) || 20, 1), 100);
  const { whereSql, values } = buildAuditFilters({ search, date });

  const countRes = await query(
    `SELECT COUNT(*)::int AS total FROM audit_logs ${whereSql}`,
    values
  );
  const total = Number(countRes.rows[0]?.total || 0);
  const totalPages = all ? 1 : Math.max(1, Math.ceil(total / safePerPage));
  const currentPage = all ? 1 : Math.min(safePage, totalPages);
  const rowValues = [...values];
  let limitSql = "";

  if (!all) {
    rowValues.push(safePerPage);
    const limitIndex = rowValues.length;
    rowValues.push((currentPage - 1) * safePerPage);
    const offsetIndex = rowValues.length;
    limitSql = `LIMIT $${limitIndex} OFFSET $${offsetIndex}`;
  }

  const rowsRes = await query(
    `SELECT id, actor_type, actor_id, action, target_type, target_id, detail, created_at
       FROM audit_logs
       ${whereSql}
      ORDER BY created_at DESC
      ${limitSql}`,
    rowValues
  );

  return {
    logs: rowsRes.rows.map(mapAuditLogRow),
    total,
    page: currentPage,
    perPage: safePerPage,
    totalPages,
    all
  };
}

async function listRecentAuditLogs(limit = 8) {
  if (!useDb) {
    return [];
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 8, 1), 50);
  const res = await query(
    `SELECT id, actor_type, actor_id, action, target_type, target_id, detail, created_at
       FROM audit_logs
      ORDER BY created_at DESC
      LIMIT $1`,
    [safeLimit]
  );

  return res.rows.map(mapAuditLogRow);
}

module.exports = {
  createAuditLog,
  listAuditLogs,
  listRecentAuditLogs
};

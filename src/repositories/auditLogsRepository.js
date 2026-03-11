const { useDb } = require("../config");
const { query } = require("../db");

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

module.exports = {
  createAuditLog
};

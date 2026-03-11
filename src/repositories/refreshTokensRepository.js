const { useDb } = require("../config");
const { query } = require("../db");

function ensureDbEnabled() {
  if (useDb) {
    return;
  }

  const err = new Error("Refresh token storage requires USE_DB=true");
  err.statusCode = 501;
  throw err;
}

function mapRefreshTokenRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    userAgent: row.user_agent || null,
    ipAddress: row.ip_address || null,
    createdAt: row.created_at?.toISOString?.() || row.created_at,
    expiresAt: row.expires_at?.toISOString?.() || row.expires_at,
    revokedAt: row.revoked_at?.toISOString?.() || row.revoked_at,
    replacedByTokenId: row.replaced_by_token_id || null
  };
}

async function createRefreshTokenRecord({
  id,
  userId,
  tokenHash,
  userAgent,
  ipAddress,
  expiresAt
}) {
  ensureDbEnabled();

  const res = await query(
    `INSERT INTO refresh_tokens (
      id,
      user_id,
      token_hash,
      user_agent,
      ip_address,
      expires_at
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, user_id, token_hash, user_agent, ip_address, created_at, expires_at, revoked_at, replaced_by_token_id`,
    [
      id,
      userId,
      tokenHash,
      userAgent || null,
      ipAddress || null,
      new Date(expiresAt)
    ]
  );

  return mapRefreshTokenRow(res.rows[0]);
}

async function getActiveRefreshTokenByHash(tokenHash) {
  ensureDbEnabled();
  if (!tokenHash) {
    return null;
  }

  const res = await query(
    `SELECT id, user_id, token_hash, user_agent, ip_address, created_at, expires_at, revoked_at, replaced_by_token_id
       FROM refresh_tokens
      WHERE token_hash = $1
        AND revoked_at IS NULL
        AND expires_at > now()
      LIMIT 1`,
    [tokenHash]
  );

  return mapRefreshTokenRow(res.rows[0]);
}

async function revokeRefreshTokenById(id, { replacedByTokenId } = {}) {
  ensureDbEnabled();
  if (!id) {
    return null;
  }

  const res = await query(
    `UPDATE refresh_tokens
        SET revoked_at = COALESCE(revoked_at, now()),
            replaced_by_token_id = COALESCE($2, replaced_by_token_id)
      WHERE id = $1
      RETURNING id, user_id, token_hash, user_agent, ip_address, created_at, expires_at, revoked_at, replaced_by_token_id`,
    [id, replacedByTokenId || null]
  );

  return mapRefreshTokenRow(res.rows[0]);
}

async function revokeRefreshTokenByHash(tokenHash) {
  ensureDbEnabled();
  if (!tokenHash) {
    return 0;
  }

  const res = await query(
    `UPDATE refresh_tokens
        SET revoked_at = COALESCE(revoked_at, now())
      WHERE token_hash = $1`,
    [tokenHash]
  );

  return Number(res.rowCount || 0);
}

async function revokeAllUserRefreshTokens(userId) {
  ensureDbEnabled();
  if (!userId) {
    return 0;
  }

  const res = await query(
    `UPDATE refresh_tokens
        SET revoked_at = COALESCE(revoked_at, now())
      WHERE user_id = $1`,
    [userId]
  );

  return Number(res.rowCount || 0);
}

module.exports = {
  createRefreshTokenRecord,
  getActiveRefreshTokenByHash,
  revokeRefreshTokenById,
  revokeRefreshTokenByHash,
  revokeAllUserRefreshTokens
};

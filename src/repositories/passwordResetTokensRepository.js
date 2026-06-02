const { useDb } = require("../config");
const { query, withTransaction } = require("../db");

function ensureDbEnabled() {
  if (useDb) {
    return;
  }

  const err = new Error("Password reset token storage requires USE_DB=true");
  err.statusCode = 501;
  throw err;
}

function mapPasswordResetTokenRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    expiresAt: row.expires_at?.toISOString?.() || row.expires_at,
    usedAt: row.used_at?.toISOString?.() || row.used_at,
    createdAt: row.created_at?.toISOString?.() || row.created_at
  };
}

async function createPasswordResetToken({
  id,
  userId,
  tokenHash,
  expiresAt
}) {
  ensureDbEnabled();

  const res = await query(
    `INSERT INTO password_reset_tokens (
      id,
      user_id,
      token_hash,
      expires_at
    )
    VALUES ($1, $2, $3, $4)
    RETURNING id, user_id, token_hash, expires_at, used_at, created_at`,
    [
      id,
      userId,
      tokenHash,
      new Date(expiresAt)
    ]
  );

  return mapPasswordResetTokenRow(res.rows[0]);
}

async function getActivePasswordResetTokenByHash(tokenHash) {
  ensureDbEnabled();
  if (!tokenHash) {
    return null;
  }

  const res = await query(
    `SELECT id, user_id, token_hash, expires_at, used_at, created_at
       FROM password_reset_tokens
      WHERE token_hash = $1
        AND used_at IS NULL
        AND expires_at > now()
      LIMIT 1`,
    [tokenHash]
  );

  return mapPasswordResetTokenRow(res.rows[0]);
}

async function invalidateActivePasswordResetTokensForUser(userId) {
  ensureDbEnabled();
  if (!userId) {
    return 0;
  }

  const res = await query(
    `UPDATE password_reset_tokens
        SET used_at = COALESCE(used_at, now())
      WHERE user_id = $1
        AND used_at IS NULL
        AND expires_at > now()`,
    [userId]
  );

  return Number(res.rowCount || 0);
}

async function resetPasswordWithToken({ tokenHash, passwordHash }) {
  ensureDbEnabled();
  if (!tokenHash || !passwordHash) {
    return null;
  }

  return withTransaction(async client => {
    const tokenRes = await client.query(
      `SELECT id, user_id, token_hash, expires_at, used_at, created_at
         FROM password_reset_tokens
        WHERE token_hash = $1
          AND used_at IS NULL
          AND expires_at > now()
        FOR UPDATE`,
      [tokenHash]
    );

    const resetToken = mapPasswordResetTokenRow(tokenRes.rows[0]);
    if (!resetToken) {
      return null;
    }

    const userRes = await client.query(
      `UPDATE users
          SET password_hash = $2
        WHERE id = $1
        RETURNING id`,
      [resetToken.userId, passwordHash]
    );

    if (userRes.rowCount === 0) {
      return null;
    }

    const invalidatedRes = await client.query(
      `UPDATE password_reset_tokens
          SET used_at = COALESCE(used_at, now())
        WHERE user_id = $1
          AND used_at IS NULL
          AND expires_at > now()`,
      [resetToken.userId]
    );

    return {
      userId: resetToken.userId,
      tokenId: resetToken.id,
      invalidatedCount: Number(invalidatedRes.rowCount || 0)
    };
  });
}

module.exports = {
  createPasswordResetToken,
  getActivePasswordResetTokenByHash,
  invalidateActivePasswordResetTokensForUser,
  resetPasswordWithToken
};

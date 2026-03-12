const { useDb } = require("../config");
const { query } = require("../db");

let hasPinHashColumnCache = null;

function ensureDbEnabled() {
  if (useDb) {
    return;
  }

  const err = new Error("Auth requires USE_DB=true");
  err.statusCode = 501;
  throw err;
}

async function hasPinHashColumn() {
  ensureDbEnabled();
  if (hasPinHashColumnCache === true) {
    return hasPinHashColumnCache;
  }

  const res = await query(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'pin_hash'
    ) AS exists`
  );

  const exists = Boolean(res.rows[0]?.exists);
  if (exists) {
    hasPinHashColumnCache = true;
  }

  return exists;
}

async function getUserSelectColumnsSql() {
  if (await hasPinHashColumn()) {
    return "id, username, email, password_hash, pin_hash, role, created_at";
  }
  return "id, username, email, password_hash, NULL::text AS pin_hash, role, created_at";
}

function mapUserRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    username: row.username || null,
    email: row.email || null,
    passwordHash: row.password_hash || null,
    pinHash: row.pin_hash || null,
    role: row.role || "user",
    createdAt: row.created_at?.toISOString?.() || row.created_at
  };
}

async function countUsers() {
  ensureDbEnabled();
  const res = await query("SELECT COUNT(*)::int AS count FROM users");
  return Number(res.rows[0]?.count || 0);
}

async function getUserById(userId) {
  ensureDbEnabled();
  if (!userId) {
    return null;
  }

  const selectColumns = await getUserSelectColumnsSql();
  const res = await query(
    `SELECT ${selectColumns}
       FROM users
      WHERE id = $1
      LIMIT 1`,
    [userId]
  );

  return mapUserRow(res.rows[0]);
}

async function getUserByUsername(username) {
  ensureDbEnabled();
  if (!username) {
    return null;
  }

  const selectColumns = await getUserSelectColumnsSql();
  const res = await query(
    `SELECT ${selectColumns}
       FROM users
      WHERE lower(username) = lower($1)
      LIMIT 1`,
    [username]
  );

  return mapUserRow(res.rows[0]);
}

async function getUserByEmail(email) {
  ensureDbEnabled();
  if (!email) {
    return null;
  }

  const selectColumns = await getUserSelectColumnsSql();
  const res = await query(
    `SELECT ${selectColumns}
       FROM users
      WHERE lower(email) = lower($1)
      LIMIT 1`,
    [email]
  );

  return mapUserRow(res.rows[0]);
}

async function getUserByIdentifier(identifier) {
  ensureDbEnabled();
  if (!identifier) {
    return null;
  }

  const selectColumns = await getUserSelectColumnsSql();
  const res = await query(
    `SELECT ${selectColumns}
       FROM users
      WHERE lower(username) = lower($1)
         OR lower(email) = lower($1)
      LIMIT 1`,
    [identifier]
  );

  return mapUserRow(res.rows[0]);
}

async function createUser({ id, username, email, passwordHash, role }) {
  ensureDbEnabled();

  const hasPinColumn = await hasPinHashColumn();
  const returningColumns = await getUserSelectColumnsSql();

  const res = hasPinColumn
    ? await query(
      `INSERT INTO users (id, username, email, password_hash, pin_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${returningColumns}`,
      [
        id,
        username || null,
        email || null,
        passwordHash,
        null,
        role || "user"
      ]
    )
    : await query(
      `INSERT INTO users (id, username, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${returningColumns}`,
      [
        id,
        username || null,
        email || null,
        passwordHash,
        role || "user"
      ]
    );

  return mapUserRow(res.rows[0]);
}

async function updateUserProfile(userId, {
  username,
  email,
  updateUsername = false,
  updateEmail = false
} = {}) {
  ensureDbEnabled();
  if (!userId) {
    return null;
  }

  const setClauses = [];
  const values = [userId];

  if (updateUsername) {
    values.push(username || null);
    setClauses.push(`username = $${values.length}`);
  }

  if (updateEmail) {
    values.push(email || null);
    setClauses.push(`email = $${values.length}`);
  }

  if (setClauses.length === 0) {
    return getUserById(userId);
  }

  const returningColumns = await getUserSelectColumnsSql();
  const res = await query(
    `UPDATE users
        SET ${setClauses.join(", ")}
      WHERE id = $1
      RETURNING ${returningColumns}`,
    values
  );

  return mapUserRow(res.rows[0]);
}

async function updateUserPasswordHash(userId, passwordHash) {
  ensureDbEnabled();
  if (!userId || !passwordHash) {
    return null;
  }

  const returningColumns = await getUserSelectColumnsSql();
  const res = await query(
    `UPDATE users
        SET password_hash = $2
      WHERE id = $1
      RETURNING ${returningColumns}`,
    [userId, passwordHash]
  );

  return mapUserRow(res.rows[0]);
}

async function updateUserPinHash(userId, pinHash) {
  ensureDbEnabled();
  if (!userId || !pinHash) {
    return null;
  }

  if (!await hasPinHashColumn()) {
    const err = new Error("PIN feature is not ready: run migration 20260312_step8_account_pin.sql");
    err.statusCode = 409;
    throw err;
  }

  const returningColumns = await getUserSelectColumnsSql();

  const res = await query(
    `UPDATE users
        SET pin_hash = $2
      WHERE id = $1
      RETURNING ${returningColumns}`,
    [userId, pinHash]
  );

  return mapUserRow(res.rows[0]);
}

module.exports = {
  countUsers,
  getUserById,
  getUserByUsername,
  getUserByEmail,
  getUserByIdentifier,
  createUser,
  updateUserProfile,
  updateUserPasswordHash,
  updateUserPinHash
};

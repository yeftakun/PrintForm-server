const { useDb } = require("../config");
const { query } = require("../db");

function ensureDbEnabled() {
  if (useDb) {
    return;
  }

  const err = new Error("Auth requires USE_DB=true");
  err.statusCode = 501;
  throw err;
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

  const res = await query(
    `SELECT id, username, email, password_hash, role, created_at
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

  const res = await query(
    `SELECT id, username, email, password_hash, role, created_at
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

  const res = await query(
    `SELECT id, username, email, password_hash, role, created_at
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

  const res = await query(
    `SELECT id, username, email, password_hash, role, created_at
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

  const res = await query(
    `INSERT INTO users (id, username, email, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, username, email, password_hash, role, created_at`,
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

module.exports = {
  countUsers,
  getUserById,
  getUserByUsername,
  getUserByEmail,
  getUserByIdentifier,
  createUser
};

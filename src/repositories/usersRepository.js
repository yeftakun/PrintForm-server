const { useDb } = require("../config");
const { query } = require("../db");

const columnExistsCache = new Map();
const tableExistsCache = new Map();

function ensureDbEnabled() {
  if (useDb) {
    return;
  }

  const err = new Error("Auth requires USE_DB=true");
  err.statusCode = 501;
  throw err;
}

async function hasUserColumn(columnName) {
  ensureDbEnabled();
  if (columnExistsCache.has(columnName)) {
    return columnExistsCache.get(columnName);
  }

  const res = await query(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = $1
    ) AS exists`,
    [columnName]
  );

  const exists = Boolean(res.rows[0]?.exists);
  columnExistsCache.set(columnName, exists);
  return exists;
}

async function hasPinHashColumn() {
  if (await hasMitraProfilesTable()) {
    return true;
  }
  return hasUserColumn("pin_hash");
}

async function hasTable(tableName) {
  ensureDbEnabled();
  if (tableExistsCache.has(tableName)) {
    return tableExistsCache.get(tableName);
  }

  const res = await query(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = $1
    ) AS exists`,
    [tableName]
  );

  const exists = Boolean(res.rows[0]?.exists);
  tableExistsCache.set(tableName, exists);
  return exists;
}

async function hasMitraProfilesTable() {
  return hasTable("mitra_profiles");
}

async function getUserSelectColumnsSql() {
  const hasMitraProfiles = await hasMitraProfilesTable();
  const [
    hasUserPinColumn,
    hasUserAlamatColumn,
    hasUserKonfigurasiTokoColumn,
    hasUserKodeTokoColumn
  ] = hasMitraProfiles
    ? [false, false, false, false]
    : await Promise.all([
      hasUserColumn("pin_hash"),
      hasUserColumn("alamat"),
      hasUserColumn("konfigurasi_toko"),
      hasUserColumn("kode_toko")
    ]);

  return [
    "u.id",
    "u.username",
    "u.email",
    "u.password_hash",
    hasMitraProfiles ? "mp.pin_hash" : hasUserPinColumn ? "u.pin_hash" : "NULL::text AS pin_hash",
    "u.role",
    "u.created_at",
    hasMitraProfiles ? "mp.alamat" : hasUserAlamatColumn ? "u.alamat" : "NULL::text AS alamat",
    hasMitraProfiles ? "COALESCE(mp.konfigurasi_toko, '{}'::jsonb) AS konfigurasi_toko" : hasUserKonfigurasiTokoColumn ? "COALESCE(u.konfigurasi_toko, '{}'::jsonb) AS konfigurasi_toko" : "'{}'::jsonb AS konfigurasi_toko",
    hasMitraProfiles ? "mp.kode_toko" : hasUserKodeTokoColumn ? "u.kode_toko" : "NULL::text AS kode_toko"
  ].join(", ");
}

async function getUserFromSql(whereSql, values) {
  const hasMitraProfiles = await hasMitraProfilesTable();
  const selectColumns = await getUserSelectColumnsSql();
  const res = await query(
    `SELECT ${selectColumns}
       FROM users u
       ${hasMitraProfiles ? "LEFT JOIN mitra_profiles mp ON mp.user_id = u.id" : ""}
      WHERE ${whereSql}
      LIMIT 1`,
    values
  );

  return mapUserRow(res.rows[0]);
}

async function ensureMitraProfile(userId) {
  ensureDbEnabled();
  if (!userId || !await hasMitraProfilesTable()) {
    return;
  }

  await query(
    `INSERT INTO mitra_profiles (user_id, konfigurasi_toko)
     VALUES ($1, '{}'::jsonb)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );
}

function mapUserRow(row) {
  if (!row) {
    return null;
  }

  const role = String(row.role || "").trim().toLowerCase();

  return {
    id: row.id,
    username: row.username || null,
    email: row.email || null,
    passwordHash: row.password_hash || null,
    pinHash: row.pin_hash || null,
    role: role === "admin" ? "admin" : "mitra",
    createdAt: row.created_at?.toISOString?.() || row.created_at,
    alamat: row.alamat || null,
    konfigurasiToko: row.konfigurasi_toko || {},
    kodeToko: row.kode_toko || null
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

  return getUserFromSql("u.id = $1", [userId]);
}

async function getUserByUsername(username) {
  ensureDbEnabled();
  if (!username) {
    return null;
  }

  return getUserFromSql("lower(u.username) = lower($1)", [username]);
}

async function getUserByEmail(email) {
  ensureDbEnabled();
  if (!email) {
    return null;
  }

  return getUserFromSql("lower(u.email) = lower($1)", [email]);
}

async function getUserByIdentifier(identifier) {
  ensureDbEnabled();
  if (!identifier) {
    return null;
  }

  return getUserFromSql("(lower(u.username) = lower($1) OR lower(u.email) = lower($1))", [identifier]);
}

async function getUserByStoreCode(kodeToko) {
  ensureDbEnabled();
  const normalizedKodeToko = String(kodeToko || "").trim();
  if (!normalizedKodeToko) {
    return null;
  }

  if (await hasMitraProfilesTable()) {
    return getUserFromSql("lower(mp.kode_toko) = lower($1)", [normalizedKodeToko]);
  }

  if (!await hasUserColumn("kode_toko")) {
    return null;
  }

  return getUserFromSql("lower(u.kode_toko) = lower($1)", [normalizedKodeToko]);
}

async function createUser({ id, username, email, passwordHash, role }) {
  ensureDbEnabled();

  const hasLegacyPinColumn = !await hasMitraProfilesTable() && await hasUserColumn("pin_hash");
  const resolvedRole = role || "mitra";

  const res = hasLegacyPinColumn
    ? await query(
      `INSERT INTO users (id, username, email, password_hash, pin_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        id,
        username || null,
        email || null,
        passwordHash,
        null,
        resolvedRole
      ]
    )
    : await query(
      `INSERT INTO users (id, username, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        id,
        username || null,
        email || null,
        passwordHash,
        resolvedRole
      ]
    );

  if (resolvedRole !== "admin") {
    await ensureMitraProfile(res.rows[0]?.id);
  }

  return getUserById(res.rows[0]?.id);
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

  const res = await query(
    `UPDATE users
        SET ${setClauses.join(", ")}
      WHERE id = $1
      RETURNING id`,
    values
  );

  return getUserById(res.rows[0]?.id);
}

async function updateUserStoreSettings(userId, {
  alamat,
  kodeToko,
  konfigurasiToko
} = {}) {
  ensureDbEnabled();
  if (!userId) {
    return null;
  }

  if (await hasMitraProfilesTable()) {
    await query(
      `INSERT INTO mitra_profiles (user_id, alamat, kode_toko, konfigurasi_toko)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE
         SET alamat = EXCLUDED.alamat,
             kode_toko = EXCLUDED.kode_toko,
             konfigurasi_toko = EXCLUDED.konfigurasi_toko`,
      [
        userId,
        alamat || null,
        kodeToko || null,
        konfigurasiToko || {}
      ]
    );

    return getUserById(userId);
  }

  const [
    hasAlamatColumn,
    hasKonfigurasiTokoColumn,
    hasKodeTokoColumn
  ] = await Promise.all([
    hasUserColumn("alamat"),
    hasUserColumn("konfigurasi_toko"),
    hasUserColumn("kode_toko")
  ]);

  if (!hasAlamatColumn || !hasKonfigurasiTokoColumn || !hasKodeTokoColumn) {
    const err = new Error("Store settings columns are not ready: create mitra_profiles or run the legacy account/store migration first");
    err.statusCode = 409;
    throw err;
  }

  const res = await query(
    `UPDATE users
        SET alamat = $2,
            kode_toko = $3,
            konfigurasi_toko = $4
      WHERE id = $1
      RETURNING id`,
    [userId, alamat || null, kodeToko || null, konfigurasiToko || {}]
  );

  return getUserById(res.rows[0]?.id);
}

async function updateUserPasswordHash(userId, passwordHash) {
  ensureDbEnabled();
  if (!userId || !passwordHash) {
    return null;
  }

  const res = await query(
    `UPDATE users
        SET password_hash = $2
      WHERE id = $1
      RETURNING id`,
    [userId, passwordHash]
  );

  return getUserById(res.rows[0]?.id);
}

async function updateUserPinHash(userId, pinHash) {
  ensureDbEnabled();
  if (!userId || !pinHash) {
    return null;
  }

  if (!await hasPinHashColumn()) {
    const err = new Error("PIN feature is not ready: create mitra_profiles or run the legacy PIN migration first");
    err.statusCode = 409;
    throw err;
  }

  if (await hasMitraProfilesTable()) {
    await query(
      `INSERT INTO mitra_profiles (user_id, pin_hash, konfigurasi_toko)
       VALUES ($1, $2, '{}'::jsonb)
       ON CONFLICT (user_id) DO UPDATE
         SET pin_hash = EXCLUDED.pin_hash`,
      [userId, pinHash]
    );

    return getUserById(userId);
  }

  const res = await query(
    `UPDATE users
        SET pin_hash = $2
      WHERE id = $1
      RETURNING id`,
    [userId, pinHash]
  );

  return getUserById(res.rows[0]?.id);
}

module.exports = {
  countUsers,
  getUserById,
  getUserByUsername,
  getUserByEmail,
  getUserByIdentifier,
  getUserByStoreCode,
  createUser,
  updateUserProfile,
  updateUserStoreSettings,
  updateUserPasswordHash,
  updateUserPinHash
};

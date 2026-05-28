const { useDb } = require("../config");
const { readSessions, writeSessions } = require("../storage/jsonStore");
const { query, withTransaction } = require("../db");

let hasSessionOwnerUserIdColumnCache = null;
let hasSessionClientIdColumnCache = null;

async function hasSessionClientIdColumn() {
  if (!useDb) {
    return false;
  }

  if (hasSessionClientIdColumnCache === true) {
    return true;
  }

  const res = await query(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'sessions'
        AND column_name = 'client_id'
    ) AS exists`
  );

  const exists = Boolean(res.rows[0]?.exists);
  if (exists) {
    hasSessionClientIdColumnCache = true;
  }

  return exists;
}

async function hasSessionOwnerUserIdColumn() {
  if (!useDb) {
    return false;
  }

  if (hasSessionOwnerUserIdColumnCache === true) {
    return true;
  }

  const res = await query(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'sessions'
        AND column_name = 'owner_user_id'
    ) AS exists`
  );

  const exists = Boolean(res.rows[0]?.exists);
  if (exists) {
    hasSessionOwnerUserIdColumnCache = true;
  }

  return exists;
}

async function getSessions() {
  if (!useDb) {
    return readSessions();
  }

  const hasClientIdColumn = await hasSessionClientIdColumn();
  const hasOwnerUserIdColumn = await hasSessionOwnerUserIdColumn();
  const clientIdSelect = hasClientIdColumn
    ? "s.client_id"
    : "NULL::text AS client_id";
  const clientNameSelect = hasClientIdColumn
    ? "c.name as client_name"
    : "NULL::text AS client_name";
  const clientJoin = hasClientIdColumn
    ? "left join clients c on c.id = s.client_id"
    : "";
  const ownerUserIdSelect = hasOwnerUserIdColumn
    ? "s.owner_user_id"
    : "NULL::text AS owner_user_id";

  const res = await query(
    `select s.id, ${clientIdSelect}, ${ownerUserIdSelect}, s.alias, s.created_at, s.last_seen_at, s.status, ${clientNameSelect}
     from sessions s
     ${clientJoin}
     order by s.created_at desc`
  );
  return res.rows.map(row => ({
    id: row.id,
    clientId: row.client_id,
    ownerUserId: row.owner_user_id || null,
    clientName: row.client_name || null,
    alias: row.alias || null,
    createdAt: row.created_at?.toISOString?.() || row.created_at,
    lastSeen: row.last_seen_at?.toISOString?.() || row.last_seen_at,
    status: row.status || "active"
  }));
}

async function saveSessions(sessions) {
  if (!useDb) {
    return writeSessions(sessions);
  }

  const hasClientIdColumn = await hasSessionClientIdColumn();
  const hasOwnerUserIdColumn = await hasSessionOwnerUserIdColumn();
  return withTransaction(async client => {
    for (const s of sessions) {
      if (hasClientIdColumn && hasOwnerUserIdColumn) {
        await client.query(
          `INSERT INTO sessions (id, client_id, owner_user_id, alias, created_at, last_seen_at, status)
           VALUES ($1,$2,$3,$4,COALESCE($5, now()),$6,$7)
           ON CONFLICT (id) DO UPDATE SET
             client_id = EXCLUDED.client_id,
             owner_user_id = COALESCE(EXCLUDED.owner_user_id, sessions.owner_user_id),
             alias = EXCLUDED.alias,
             created_at = LEAST(sessions.created_at, EXCLUDED.created_at),
             last_seen_at = EXCLUDED.last_seen_at,
             status = EXCLUDED.status`,
          [
            s.id,
            s.clientId,
            s.ownerUserId || null,
            s.alias || null,
            s.createdAt ? new Date(s.createdAt) : null,
            s.lastSeen ? new Date(s.lastSeen) : new Date(),
            s.status || "active"
          ]
        );
      } else if (hasClientIdColumn) {
        await client.query(
          `INSERT INTO sessions (id, client_id, alias, created_at, last_seen_at, status)
           VALUES ($1,$2,$3,COALESCE($4, now()),$5,$6)
           ON CONFLICT (id) DO UPDATE SET
             client_id = EXCLUDED.client_id,
             alias = EXCLUDED.alias,
             created_at = LEAST(sessions.created_at, EXCLUDED.created_at),
             last_seen_at = EXCLUDED.last_seen_at,
             status = EXCLUDED.status`,
          [
            s.id,
            s.clientId,
            s.alias || null,
            s.createdAt ? new Date(s.createdAt) : null,
            s.lastSeen ? new Date(s.lastSeen) : new Date(),
            s.status || "active"
          ]
        );
      } else if (hasOwnerUserIdColumn) {
        await client.query(
          `INSERT INTO sessions (id, owner_user_id, alias, created_at, last_seen_at, status)
           VALUES ($1,$2,$3,COALESCE($4, now()),$5,$6)
           ON CONFLICT (id) DO UPDATE SET
             owner_user_id = COALESCE(EXCLUDED.owner_user_id, sessions.owner_user_id),
             alias = EXCLUDED.alias,
             created_at = LEAST(sessions.created_at, EXCLUDED.created_at),
             last_seen_at = EXCLUDED.last_seen_at,
             status = EXCLUDED.status`,
          [
            s.id,
            s.ownerUserId || null,
            s.alias || null,
            s.createdAt ? new Date(s.createdAt) : null,
            s.lastSeen ? new Date(s.lastSeen) : new Date(),
            s.status || "active"
          ]
        );
      } else {
        await client.query(
          `INSERT INTO sessions (id, alias, created_at, last_seen_at, status)
           VALUES ($1,$2,COALESCE($3, now()),$4,$5)
           ON CONFLICT (id) DO UPDATE SET
             alias = EXCLUDED.alias,
             created_at = LEAST(sessions.created_at, EXCLUDED.created_at),
             last_seen_at = EXCLUDED.last_seen_at,
             status = EXCLUDED.status`,
          [
            s.id,
            s.alias || null,
            s.createdAt ? new Date(s.createdAt) : null,
            s.lastSeen ? new Date(s.lastSeen) : new Date(),
            s.status || "active"
          ]
        );
      }
    }
  });
}

module.exports = {
  getSessions,
  saveSessions
};

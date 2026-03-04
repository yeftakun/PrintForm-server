const { useDb } = require("../config");
const { readSessions, writeSessions } = require("../storage/jsonStore");
const { query, withTransaction } = require("../db");

async function getSessions() {
  if (!useDb) {
    return readSessions();
  }
  const res = await query(
    `select s.id, s.client_id, s.alias, s.created_at, s.last_seen_at, s.status, c.name as client_name
     from sessions s
     left join clients c on c.id = s.client_id
     order by s.created_at desc`
  );
  return res.rows.map(row => ({
    id: row.id,
    clientId: row.client_id,
    clientName: row.client_name || null,
    alias: row.alias || null,
    createdAt: row.created_at?.toISOString?.() || row.created_at,
    lastSeen: row.last_seen_at?.toISOString?.() || row.last_seen_at,
    status: row.status || "active"
  }));
}

async function saveSessions(    sessions) {
  if (!useDb) {
    return writeSessions(sessions);
  }
  const ids = sessions.map(s => s.id);
  return withTransaction(async client => {
    if (ids.length > 0) {
      await client.query("DELETE FROM sessions WHERE id <> ALL($1)", [ids]);
    } else {
      await client.query("DELETE FROM sessions");
    }

    for (const s of sessions) {
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
    }
  });
}

module.exports = {
  getSessions,
  saveSessions
};

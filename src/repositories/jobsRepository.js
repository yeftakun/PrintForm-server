const { useDb } = require("../config");
const { readJobs, writeJobs } = require("../storage/jsonStore");
const { query, withTransaction } = require("../db");

let hasJobOwnerUserIdColumnCache = null;

async function hasJobOwnerUserIdColumn() {
  if (!useDb) {
    return false;
  }

  if (hasJobOwnerUserIdColumnCache === true) {
    return true;
  }

  const res = await query(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'jobs'
        AND column_name = 'owner_user_id'
    ) AS exists`
  );

  const exists = Boolean(res.rows[0]?.exists);
  if (exists) {
    hasJobOwnerUserIdColumnCache = true;
  }

  return exists;
}

async function getJobs() {
  if (!useDb) {
    return readJobs();
  }

  const hasOwnerUserIdColumn = await hasJobOwnerUserIdColumn();
  const ownerUserIdSelect = hasOwnerUserIdColumn
    ? "owner_user_id"
    : "NULL::text AS owner_user_id";

  const res = await query(
    `select id, session_id, target_client_id, target_client_name, original_name, stored_path, size_bytes,
            status, alias, paper_size, copies, ${ownerUserIdSelect}, created_at, updated_at
       from jobs
       order by created_at desc`
  );
  return res.rows.map(row => ({
    id: row.id,
    sessionId: row.session_id,
    ownerUserId: row.owner_user_id || null,
    targetClientId: row.target_client_id,
    targetClientName: row.target_client_name,
    originalName: row.original_name,
    storedPath: row.stored_path,
    size: Number(row.size_bytes),
    createdAt: row.created_at?.toISOString?.() || row.created_at,
    status: row.status,
    alias: row.alias || null,
    printConfig: {
      paperSize: row.paper_size,
      copies: row.copies
    }
  }));
}

async function saveJobs(jobs) {
  if (!useDb) {
    return writeJobs(jobs);
  }

  const hasOwnerUserIdColumn = await hasJobOwnerUserIdColumn();
  const ids = jobs.map(j => j.id);
  return withTransaction(async client => {
    if (ids.length > 0) {
      await client.query("DELETE FROM jobs WHERE id <> ALL($1)", [ids]);
    } else {
      await client.query("DELETE FROM jobs");
    }

    for (const j of jobs) {
      if (hasOwnerUserIdColumn) {
        await client.query(
          `INSERT INTO jobs (
             id, session_id, target_client_id, target_client_name, original_name, stored_path, size_bytes,
             status, alias, paper_size, copies, owner_user_id, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,COALESCE($13, now()), COALESCE($14, now()))
           ON CONFLICT (id) DO UPDATE SET
             session_id = EXCLUDED.session_id,
             target_client_id = EXCLUDED.target_client_id,
             target_client_name = EXCLUDED.target_client_name,
             original_name = EXCLUDED.original_name,
             stored_path = EXCLUDED.stored_path,
             size_bytes = EXCLUDED.size_bytes,
             status = EXCLUDED.status,
             alias = EXCLUDED.alias,
             paper_size = EXCLUDED.paper_size,
             copies = EXCLUDED.copies,
             owner_user_id = COALESCE(EXCLUDED.owner_user_id, jobs.owner_user_id),
             updated_at = EXCLUDED.updated_at`,
          [
            j.id,
            j.sessionId,
            j.targetClientId || null,
            j.targetClientName || null,
            j.originalName,
            j.storedPath,
            j.size,
            j.status,
            j.alias || null,
            j.printConfig?.paperSize,
            j.printConfig?.copies,
            j.ownerUserId || null,
            j.createdAt ? new Date(j.createdAt) : null,
            new Date()
          ]
        );
      } else {
        await client.query(
          `INSERT INTO jobs (
             id, session_id, target_client_id, target_client_name, original_name, stored_path, size_bytes,
             status, alias, paper_size, copies, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,COALESCE($12, now()), COALESCE($13, now()))
           ON CONFLICT (id) DO UPDATE SET
             session_id = EXCLUDED.session_id,
             target_client_id = EXCLUDED.target_client_id,
             target_client_name = EXCLUDED.target_client_name,
             original_name = EXCLUDED.original_name,
             stored_path = EXCLUDED.stored_path,
             size_bytes = EXCLUDED.size_bytes,
             status = EXCLUDED.status,
             alias = EXCLUDED.alias,
             paper_size = EXCLUDED.paper_size,
             copies = EXCLUDED.copies,
             updated_at = EXCLUDED.updated_at`,
          [
            j.id,
            j.sessionId,
            j.targetClientId || null,
            j.targetClientName || null,
            j.originalName,
            j.storedPath,
            j.size,
            j.status,
            j.alias || null,
            j.printConfig?.paperSize,
            j.printConfig?.copies,
            j.createdAt ? new Date(j.createdAt) : null,
            new Date()
          ]
        );
      }
    }
  });
}

module.exports = {
  getJobs,
  saveJobs
};

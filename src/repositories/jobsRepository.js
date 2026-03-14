const { useDb } = require("../config");
const { readJobs, writeJobs } = require("../storage/jsonStore");
const { query, withTransaction } = require("../db");

let hasJobOwnerUserIdColumnCache = null;
let hasJobClaimedByClientIdColumnCache = null;
let hasJobClaimedAtColumnCache = null;

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

async function hasJobClaimedByClientIdColumn() {
  if (!useDb) {
    return false;
  }

  if (hasJobClaimedByClientIdColumnCache === true) {
    return true;
  }

  const res = await query(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'jobs'
        AND column_name = 'claimed_by_client_id'
    ) AS exists`
  );

  const exists = Boolean(res.rows[0]?.exists);
  if (exists) {
    hasJobClaimedByClientIdColumnCache = true;
  }

  return exists;
}

async function hasJobClaimedAtColumn() {
  if (!useDb) {
    return false;
  }

  if (hasJobClaimedAtColumnCache === true) {
    return true;
  }

  const res = await query(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'jobs'
        AND column_name = 'claimed_at'
    ) AS exists`
  );

  const exists = Boolean(res.rows[0]?.exists);
  if (exists) {
    hasJobClaimedAtColumnCache = true;
  }

  return exists;
}

async function getJobs() {
  if (!useDb) {
    return readJobs();
  }

  const hasOwnerUserIdColumn = await hasJobOwnerUserIdColumn();
  const hasClaimedByClientIdColumn = await hasJobClaimedByClientIdColumn();
  const hasClaimedAtColumn = await hasJobClaimedAtColumn();
  const ownerUserIdSelect = hasOwnerUserIdColumn
    ? "owner_user_id"
    : "NULL::text AS owner_user_id";
  const claimedByClientIdSelect = hasClaimedByClientIdColumn
    ? "claimed_by_client_id"
    : "NULL::text AS claimed_by_client_id";
  const claimedAtSelect = hasClaimedAtColumn
    ? "claimed_at"
    : "NULL::timestamptz AS claimed_at";

  const res = await query(
    `select id, session_id, target_client_id, target_client_name, original_name, stored_path, size_bytes,
            status, alias, paper_size, copies, ${ownerUserIdSelect}, ${claimedByClientIdSelect}, ${claimedAtSelect}, created_at, updated_at
       from jobs
       order by created_at desc`
  );
  return res.rows.map(row => ({
    id: row.id,
    sessionId: row.session_id,
    ownerUserId: row.owner_user_id || null,
    claimedByClientId: row.claimed_by_client_id || null,
    claimedAt: row.claimed_at?.toISOString?.() || row.claimed_at || null,
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
  const hasClaimedByClientIdColumn = await hasJobClaimedByClientIdColumn();
  const hasClaimedAtColumn = await hasJobClaimedAtColumn();
  const ids = jobs.map(j => j.id);
  return withTransaction(async client => {
    if (ids.length > 0) {
      await client.query("DELETE FROM jobs WHERE id <> ALL($1)", [ids]);
    } else {
      await client.query("DELETE FROM jobs");
    }

    for (const j of jobs) {
      const insertColumns = [
        "id",
        "session_id",
        "target_client_id",
        "target_client_name",
        "original_name",
        "stored_path",
        "size_bytes",
        "status",
        "alias",
        "paper_size",
        "copies"
      ];
      const values = [
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
        j.printConfig?.copies
      ];

      if (hasOwnerUserIdColumn) {
        insertColumns.push("owner_user_id");
        values.push(j.ownerUserId || null);
      }

      if (hasClaimedByClientIdColumn) {
        insertColumns.push("claimed_by_client_id");
        values.push(j.claimedByClientId || null);
      }

      if (hasClaimedAtColumn) {
        insertColumns.push("claimed_at");
        values.push(j.claimedAt ? new Date(j.claimedAt) : null);
      }

      insertColumns.push("created_at", "updated_at");
      values.push(
        j.createdAt ? new Date(j.createdAt) : null,
        new Date()
      );

      const createdAtIndex = values.length - 1;
      const updatedAtIndex = values.length;
      const valuePlaceholders = values.map((_, index) => {
        const placeholder = `$${index + 1}`;
        if (index + 1 === createdAtIndex || index + 1 === updatedAtIndex) {
          return `COALESCE(${placeholder}, now())`;
        }
        return placeholder;
      });

      const updateSetClauses = [
        "session_id = EXCLUDED.session_id",
        "target_client_id = EXCLUDED.target_client_id",
        "target_client_name = EXCLUDED.target_client_name",
        "original_name = EXCLUDED.original_name",
        "stored_path = EXCLUDED.stored_path",
        "size_bytes = EXCLUDED.size_bytes",
        "status = EXCLUDED.status",
        "alias = EXCLUDED.alias",
        "paper_size = EXCLUDED.paper_size",
        "copies = EXCLUDED.copies"
      ];

      if (hasOwnerUserIdColumn) {
        updateSetClauses.push("owner_user_id = COALESCE(EXCLUDED.owner_user_id, jobs.owner_user_id)");
      }

      if (hasClaimedByClientIdColumn) {
        updateSetClauses.push("claimed_by_client_id = EXCLUDED.claimed_by_client_id");
      }

      if (hasClaimedAtColumn) {
        updateSetClauses.push("claimed_at = EXCLUDED.claimed_at");
      }

      updateSetClauses.push("updated_at = EXCLUDED.updated_at");

      await client.query(
        `INSERT INTO jobs (${insertColumns.join(", ")})
         VALUES (${valuePlaceholders.join(",")})
         ON CONFLICT (id) DO UPDATE SET
           ${updateSetClauses.join(",\n           ")}`,
        values
      );
    }
  });
}

module.exports = {
  getJobs,
  saveJobs
};

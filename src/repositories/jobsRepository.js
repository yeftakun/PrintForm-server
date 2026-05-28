const { useDb } = require("../config");
const { readJobs, writeJobs } = require("../storage/jsonStore");
const { query, withTransaction } = require("../db");

let hasJobOwnerUserIdColumnCache = null;
let hasJobClaimedByClientIdColumnCache = null;
let hasJobClaimedAtColumnCache = null;
let hasJobColorModeColumnCache = null;
let hasJobOrientationColumnCache = null;
let hasJobPageRangeColumnCache = null;
let hasJobContentScaleColumnCache = null;
let hasJobNotesColumnCache = null;
let hasJobEstimatedPriceColumnCache = null;

async function hasColumn(columnName, cacheVar, setCacheVar) {
  if (!useDb) {
    return false;
  }

  if (cacheVar === true) {
    return true;
  }

  const res = await query(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'jobs'
        AND column_name = $1
    ) AS exists`,
    [columnName]
  );

  const exists = Boolean(res.rows[0]?.exists);
  if (exists) {
    setCacheVar(true);
  }

  return exists;
}

async function hasJobOwnerUserIdColumn() {
  return hasColumn("owner_user_id", hasJobOwnerUserIdColumnCache, (val) => { hasJobOwnerUserIdColumnCache = val; });
}

async function hasJobClaimedByClientIdColumn() {
  return hasColumn("claimed_by_client_id", hasJobClaimedByClientIdColumnCache, (val) => { hasJobClaimedByClientIdColumnCache = val; });
}

async function hasJobClaimedAtColumn() {
  return hasColumn("claimed_at", hasJobClaimedAtColumnCache, (val) => { hasJobClaimedAtColumnCache = val; });
}

async function hasJobColorModeColumn() {
  return hasColumn("color_mode", hasJobColorModeColumnCache, (val) => { hasJobColorModeColumnCache = val; });
}

async function hasJobOrientationColumn() {
  return hasColumn("orientation", hasJobOrientationColumnCache, (val) => { hasJobOrientationColumnCache = val; });
}

async function hasJobPageRangeColumn() {
  return hasColumn("page_range", hasJobPageRangeColumnCache, (val) => { hasJobPageRangeColumnCache = val; });
}

async function hasJobContentScaleColumn() {
  return hasColumn("content_scale", hasJobContentScaleColumnCache, (val) => { hasJobContentScaleColumnCache = val; });
}

async function hasJobNotesColumn() {
  return hasColumn("notes", hasJobNotesColumnCache, (val) => { hasJobNotesColumnCache = val; });
}

async function hasJobEstimatedPriceColumn() {
  return hasColumn("estimated_price", hasJobEstimatedPriceColumnCache, (val) => { hasJobEstimatedPriceColumnCache = val; });
}

async function getJobs() {
  if (!useDb) {
    return readJobs();
  }

  const hasOwnerUserId = await hasJobOwnerUserIdColumn();
  const hasClaimedByClientId = await hasJobClaimedByClientIdColumn();
  const hasClaimedAt = await hasJobClaimedAtColumn();
  const hasColorMode = await hasJobColorModeColumn();
  const hasOrientation = await hasJobOrientationColumn();
  const hasPageRange = await hasJobPageRangeColumn();
  const hasContentScale = await hasJobContentScaleColumn();
  const hasNotes = await hasJobNotesColumn();
  const hasEstimatedPrice = await hasJobEstimatedPriceColumn();

  const selectColumns = [
    "id", "session_id", "original_name", "stored_path", "size_bytes",
    "status", "alias", "paper_size", "copies", "created_at", "updated_at"
  ];

  selectColumns.push(hasOwnerUserId ? "owner_user_id" : "NULL::text AS owner_user_id");
  selectColumns.push(hasClaimedByClientId ? "claimed_by_client_id" : "NULL::text AS claimed_by_client_id");
  selectColumns.push(hasClaimedAt ? "claimed_at" : "NULL::timestamptz AS claimed_at");
  selectColumns.push(hasColorMode ? "color_mode" : "NULL::text AS color_mode");
  selectColumns.push(hasOrientation ? "orientation" : "NULL::text AS orientation");
  selectColumns.push(hasPageRange ? "page_range" : "NULL::text AS page_range");
  selectColumns.push(hasContentScale ? "content_scale" : "NULL::text AS content_scale");
  selectColumns.push(hasNotes ? "notes" : "NULL::text AS notes");
  selectColumns.push(hasEstimatedPrice ? "estimated_price" : "0::int AS estimated_price");

  const res = await query(
    `SELECT ${selectColumns.join(", ")}
     FROM jobs
     ORDER BY created_at DESC`
  );

  return res.rows.map(row => ({
    id: row.id,
    sessionId: row.session_id,
    ownerUserId: row.owner_user_id || null,
    claimedByClientId: row.claimed_by_client_id || null,
    claimedAt: row.claimed_at?.toISOString?.() || row.claimed_at || null,
    originalName: row.original_name,
    storedPath: row.stored_path,
    size: Number(row.size_bytes),
    createdAt: row.created_at?.toISOString?.() || row.created_at,
    status: row.status,
    alias: row.alias || null,
    notes: row.notes || null,
    printConfig: {
      paperSize: row.paper_size,
      copies: row.copies,
      colorMode: row.color_mode || null,
      orientation: row.orientation || null,
      pageRange: row.page_range || null,
      contentScale: row.content_scale || null,
      estimatedPrice: Number(row.estimated_price || 0)
    }
  }));
}

async function saveJobs(jobs) {
  if (!useDb) {
    return writeJobs(jobs);
  }

  const hasOwnerUserId = await hasJobOwnerUserIdColumn();
  const hasClaimedByClientId = await hasJobClaimedByClientIdColumn();
  const hasClaimedAt = await hasJobClaimedAtColumn();
  const hasColorMode = await hasJobColorModeColumn();
  const hasOrientation = await hasJobOrientationColumn();
  const hasPageRange = await hasJobPageRangeColumn();
  const hasContentScale = await hasJobContentScaleColumn();
  const hasNotes = await hasJobNotesColumn();
  const hasEstimatedPrice = await hasJobEstimatedPriceColumn();

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
        j.originalName,
        j.storedPath,
        j.size,
        j.status,
        j.alias || null,
        j.printConfig?.paperSize,
        j.printConfig?.copies
      ];

      const updateSetClauses = [
        "session_id = EXCLUDED.session_id",
        "original_name = EXCLUDED.original_name",
        "stored_path = EXCLUDED.stored_path",
        "size_bytes = EXCLUDED.size_bytes",
        "status = EXCLUDED.status",
        "alias = EXCLUDED.alias",
        "paper_size = EXCLUDED.paper_size",
        "copies = EXCLUDED.copies"
      ];

      if (hasOwnerUserId) {
        insertColumns.push("owner_user_id");
        values.push(j.ownerUserId || null);
        updateSetClauses.push("owner_user_id = COALESCE(EXCLUDED.owner_user_id, jobs.owner_user_id)");
      }

      if (hasClaimedByClientId) {
        insertColumns.push("claimed_by_client_id");
        values.push(j.claimedByClientId || null);
        updateSetClauses.push("claimed_by_client_id = EXCLUDED.claimed_by_client_id");
      }

      if (hasClaimedAt) {
        insertColumns.push("claimed_at");
        values.push(j.claimedAt ? new Date(j.claimedAt) : null);
        updateSetClauses.push("claimed_at = EXCLUDED.claimed_at");
      }

      if (hasColorMode) {
        insertColumns.push("color_mode");
        values.push(j.printConfig?.colorMode || null);
        updateSetClauses.push("color_mode = EXCLUDED.color_mode");
      }

      if (hasOrientation) {
        insertColumns.push("orientation");
        values.push(j.printConfig?.orientation || null);
        updateSetClauses.push("orientation = EXCLUDED.orientation");
      }

      if (hasPageRange) {
        insertColumns.push("page_range");
        values.push(j.printConfig?.pageRange || null);
        updateSetClauses.push("page_range = EXCLUDED.page_range");
      }

      if (hasContentScale) {
        insertColumns.push("content_scale");
        values.push(j.printConfig?.contentScale || null);
        updateSetClauses.push("content_scale = EXCLUDED.content_scale");
      }

      if (hasNotes) {
        insertColumns.push("notes");
        values.push(j.notes || null);
        updateSetClauses.push("notes = EXCLUDED.notes");
      }

      if (hasEstimatedPrice) {
        insertColumns.push("estimated_price");
        values.push(Number.isFinite(Number(j.printConfig?.estimatedPrice)) ? Math.max(0, Math.round(Number(j.printConfig.estimatedPrice))) : 0);
        updateSetClauses.push("estimated_price = EXCLUDED.estimated_price");
      }

      insertColumns.push("created_at", "updated_at");
      values.push(
        j.createdAt ? new Date(j.createdAt) : null,
        new Date()
      );
      updateSetClauses.push("updated_at = EXCLUDED.updated_at");

      const createdAtIndex = values.length - 1;
      const updatedAtIndex = values.length;
      const valuePlaceholders = values.map((_, index) => {
        const placeholder = `$${index + 1}`;
        if (index + 1 === createdAtIndex || index + 1 === updatedAtIndex) {
          return `COALESCE(${placeholder}, now())`;
        }
        return placeholder;
      });

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

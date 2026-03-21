const path = require("path");
const express = require("express");
const { Pool } = require("pg");
const crypto = require("crypto");

// Load env from root .env
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const PORT = Number(process.env.MONITORING_PORT) || 3100;
const DATABASE_URL = process.env.DATABASE_URL;
const CLIENT_TTL_MS = Number(process.env.CLIENT_TTL_MS) || 2 * 60 * 1000;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required for monitoring app");
}

const pool = new Pool({ connectionString: DATABASE_URL });
const app = express();
let hasPinHashColumnCache = null;
let hasSessionOwnerUserIdColumnCache = null;
let hasJobOwnerUserIdColumnCache = null;
let hasJobClaimedByClientIdColumnCache = null;
let hasJobClaimedAtColumnCache = null;

app.use(express.static(path.join(__dirname, "public")));

app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/state", async (req, res) => {
  try {
    const snapshot = await fetchSnapshot();
    res.json(snapshot);
  } catch (err) {
    console.error("state error", err);
    res.status(500).json({ error: "failed to fetch state" });
  }
});

app.get("/api/stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  let alive = true;

  const send = async () => {
    if (!alive) return;
    try {
      const snapshot = await fetchSnapshot();
      res.write(`data: ${JSON.stringify(snapshot)}\n\n`);
    } catch (err) {
      console.error("stream error", err);
      res.write(`event: error\ndata: ${JSON.stringify({ error: "fetch failed" })}\n\n`);
    }
  };

  // Send immediately, then interval
  send();
  const interval = setInterval(send, 2000);

  req.on("close", () => {
    alive = false;
    clearInterval(interval);
  });
});

async function queryOrEmpty(text, params = []) {
  try {
    return await pool.query(text, params);
  } catch (err) {
    if (err && (err.code === "42P01" || err.code === "42703")) {
      return { rows: [] };
    }
    throw err;
  }
}

async function hasPinHashColumn() {
  if (hasPinHashColumnCache === true) {
    return true;
  }

  const res = await queryOrEmpty(
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

async function hasSessionOwnerUserIdColumn() {
  if (hasSessionOwnerUserIdColumnCache === true) {
    return true;
  }

  const res = await queryOrEmpty(
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

async function hasJobOwnerUserIdColumn() {
  if (hasJobOwnerUserIdColumnCache === true) {
    return true;
  }

  const res = await queryOrEmpty(
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
  if (hasJobClaimedByClientIdColumnCache === true) {
    return true;
  }

  const res = await queryOrEmpty(
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
  if (hasJobClaimedAtColumnCache === true) {
    return true;
  }

  const res = await queryOrEmpty(
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

function deriveClientStatus(row, nowMs) {
  const cachedStatus = String(row?.status || "").toLowerCase();
  if (cachedStatus === "offline") {
    return "offline";
  }

  const lastSeenMs = new Date(row?.last_seen_at).getTime();
  if (!Number.isFinite(lastSeenMs)) {
    return "offline";
  }

  return nowMs - lastSeenMs <= CLIENT_TTL_MS
    ? "online"
    : "offline";
}

async function fetchSnapshot() {
  const [
    hasPinHash,
    hasSessionOwnerUserId,
    hasJobOwnerUserId,
    hasJobClaimedByClientId,
    hasJobClaimedAt
  ] = await Promise.all([
    hasPinHashColumn(),
    hasSessionOwnerUserIdColumn(),
    hasJobOwnerUserIdColumn(),
    hasJobClaimedByClientIdColumn(),
    hasJobClaimedAtColumn()
  ]);

  const sessionOwnerUserIdSelect = hasSessionOwnerUserId
    ? "owner_user_id"
    : "NULL::text AS owner_user_id";

  const jobOwnerUserIdSelect = hasJobOwnerUserId
    ? "owner_user_id"
    : "NULL::text AS owner_user_id";
  const jobClaimedByClientIdSelect = hasJobClaimedByClientId
    ? "claimed_by_client_id"
    : "NULL::text AS claimed_by_client_id";
  const jobClaimedAtSelect = hasJobClaimedAt
    ? "claimed_at"
    : "NULL::timestamptz AS claimed_at";

  const usersQuery = hasPinHash
    ? `select id,
              username,
              email,
              role,
              created_at,
              (pin_hash is not null and length(trim(pin_hash)) > 0) as has_pin
         from users
         order by created_at desc
         limit 50`
    : `select id,
              username,
              email,
              role,
              created_at,
              false as has_pin
         from users
         order by created_at desc
         limit 50`;

  const [
    { rows: clientRows },
    { rows: sessionRows },
    { rows: jobRows },
    { rows: eventRows },
    { rows: auditRows },
    { rows: refreshTokenRows },
    { rows: refreshTokenSummaryRows },
    { rows: userRows },
    { rows: storageRows }
  ] = await Promise.all([
    queryOrEmpty(
      `select id,
              name,
              selected_printer,
              owner_user_id,
              status,
              last_seen_at
         from clients
         order by last_seen_at desc
         limit 50`
    ),
    queryOrEmpty(
      `select id,
              client_id,
              ${sessionOwnerUserIdSelect},
              alias,
              status,
              created_at,
              last_seen_at
         from sessions
         order by created_at desc
         limit 100`
    ),
    queryOrEmpty(
      `select id,
              status,
              session_id,
              ${jobOwnerUserIdSelect},
              ${jobClaimedByClientIdSelect},
              ${jobClaimedAtSelect},
              original_name,
              size_bytes,
              paper_size,
              copies,
              created_at,
              updated_at
         from jobs
         order by created_at desc
         limit 50`
    ),
    queryOrEmpty(
      `select id, type, client_id, session_id, job_id, created_at
         from events
         order by created_at desc
         limit 50`
    ),
    queryOrEmpty(
      `select id, actor_type, actor_id, action, target_type, target_id, created_at
         from audit_logs
         order by created_at desc
         limit 50`
    ),
    queryOrEmpty(
      `select id, user_id, created_at, expires_at, revoked_at, replaced_by_token_id
         from refresh_tokens
         order by created_at desc
         limit 50`
    ),
    queryOrEmpty(
      `select
         count(*)::int as total,
         count(*) filter (where revoked_at is null and expires_at > now())::int as active
       from refresh_tokens`
    ),
    queryOrEmpty(usersQuery),
    queryOrEmpty(
      `select total_bytes, file_count, computed_at
         from storage_usage
         order by computed_at desc
         limit 1`
    )
  ]);

  const now = Date.now();
  const onlineClients = clientRows.filter(c => deriveClientStatus(c, now) === "online").length;
  const recognizedClients = clientRows.filter(c => Boolean(c.owner_user_id)).length;

  const jobStatusCounts = jobRows.reduce((acc, row) => {
    const key = row.status || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const sessionStatusCounts = sessionRows.reduce((acc, row) => {
    const key = row.status || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const refreshSummaryRow = refreshTokenSummaryRows[0] || {};
  const refreshTokensTotal = Number(refreshSummaryRow.total || 0);
  const refreshTokensActive = Number(refreshSummaryRow.active || 0);
  const jobsClaimed = jobRows.filter(row => Boolean(row.claimed_by_client_id)).length;
  const sessionsOwned = sessionRows.filter(row => Boolean(row.owner_user_id)).length;
  const jobsOwned = jobRows.filter(row => Boolean(row.owner_user_id)).length;

  const storage = storageRows[0]
    ? {
        totalBytes: Number(storageRows[0].total_bytes ?? storageRows[0].totalBytes ?? 0),
        fileCount: Number(storageRows[0].file_count ?? storageRows[0].fileCount ?? 0),
        computedAt: storageRows[0].computed_at ?? storageRows[0].computedAt ?? null
      }
    : null;

  return {
    id: crypto.randomUUID?.() || String(now),
    generatedAt: new Date().toISOString(),
    summary: {
      clientsTotal: clientRows.length,
      clientsOnline: onlineClients,
      clientsRecognized: recognizedClients,
      sessionsTotal: sessionRows.length,
      sessionsOwned,
      jobsTotal: jobRows.length,
      jobsOwned,
      jobsClaimed,
      eventsTotal: eventRows.length,
      auditTotal: auditRows.length,
      refreshTokensTotal,
      refreshTokensActive,
      jobStatus: jobStatusCounts,
      sessionStatus: sessionStatusCounts,
      storage
    },
    clients: clientRows.map(row => ({
      id: row.id,
      name: row.name,
      status: deriveClientStatus(row, now),
      cachedStatus: row.status || null,
      ownerUserId: row.owner_user_id || null,
      recognized: Boolean(row.owner_user_id),
      selectedPrinter: row.selected_printer,
      lastSeenAt: row.last_seen_at
    })),
    sessions: sessionRows.map(row => ({
      id: row.id,
      clientId: row.client_id,
      ownerUserId: row.owner_user_id || null,
      alias: row.alias || null,
      status: row.status,
      createdAt: row.created_at,
      lastSeenAt: row.last_seen_at
    })),
    jobs: jobRows.map(row => ({
      id: row.id,
      status: row.status,
      sessionId: row.session_id,
      ownerUserId: row.owner_user_id || null,
      claimedByClientId: row.claimed_by_client_id || null,
      claimedAt: row.claimed_at || null,
      originalName: row.original_name,
      sizeBytes: Number(row.size_bytes),
      paperSize: row.paper_size || null,
      copies: Number(row.copies || 0),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    })),
    events: eventRows.map(row => ({
      id: row.id,
      type: row.type,
      clientId: row.client_id,
      sessionId: row.session_id,
      jobId: row.job_id,
      createdAt: row.created_at
    })),
    auditLogs: auditRows.map(row => ({
      id: row.id,
      actorType: row.actor_type,
      actorId: row.actor_id,
      action: row.action,
      targetType: row.target_type,
      targetId: row.target_id,
      createdAt: row.created_at
    })),
    users: userRows.map(row => ({
      id: row.id,
      username: row.username || null,
      email: row.email,
      role: row.role,
      hasPin: Boolean(row.has_pin),
      createdAt: row.created_at
    })),
    refreshTokens: refreshTokenRows.map(row => ({
      id: row.id,
      userId: row.user_id,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      revokedAt: row.revoked_at,
      replacedByTokenId: row.replaced_by_token_id
    }))
  };
}

app.listen(PORT, () => {
  console.log(`Monitoring listening on http://localhost:${PORT}`);
});

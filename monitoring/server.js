const path = require("path");
const express = require("express");
const { Pool } = require("pg");
const crypto = require("crypto");

// Load env from root .env
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const PORT = Number(process.env.MONITORING_PORT) || 3100;
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required for monitoring app");
}

const pool = new Pool({ connectionString: DATABASE_URL });
const app = express();

app.use(express.static(path.join(__dirname, "public")));

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

async function fetchSnapshot() {
  const [{ rows: clientRows }, { rows: sessionRows }, { rows: jobRows }] = await Promise.all([
    pool.query(
      `select id, name, status, selected_printer, last_seen_at
         from clients
         order by last_seen_at desc
         limit 50`
    ),
    pool.query(
      `select id, client_id, status, created_at, last_seen_at
        from sessions
        order by created_at desc
        limit 100`
    ),
    pool.query(
      `select id, status, session_id, target_client_id, target_client_name, original_name, size_bytes, created_at
         from jobs
         order by created_at desc
         limit 50`
    )
  ]);

  const now = Date.now();
  const onlineClients = clientRows.filter(c => (c.status || "").toLowerCase() === "online").length;

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

  return {
    id: crypto.randomUUID?.() || String(now),
    generatedAt: new Date().toISOString(),
    summary: {
      clientsTotal: clientRows.length,
      clientsOnline: onlineClients,
      sessionsTotal: sessionRows.length,
      jobsTotal: jobRows.length,
      jobStatus: jobStatusCounts,
      sessionStatus: sessionStatusCounts
    },
    clients: clientRows.map(row => ({
      id: row.id,
      name: row.name,
      status: row.status,
      selectedPrinter: row.selected_printer,
      lastSeenAt: row.last_seen_at
    })),
    sessions: sessionRows.map(row => ({
      id: row.id,
      clientId: row.client_id,
      status: row.status,
      createdAt: row.created_at,
      lastSeenAt: row.last_seen_at
    })),
    jobs: jobRows.map(row => ({
      id: row.id,
      status: row.status,
      sessionId: row.session_id,
      targetClientId: row.target_client_id,
      targetClientName: row.target_client_name,
      originalName: row.original_name,
      sizeBytes: Number(row.size_bytes),
      createdAt: row.created_at
    }))
  };
}

app.listen(PORT, () => {
  console.log(`Monitoring listening on http://localhost:${PORT}`);
});

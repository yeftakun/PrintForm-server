const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsp = fs.promises;

const app = express();
const port = process.env.PORT || 3000;

const storageDir = path.join(__dirname, "storage");
const filesDir = path.join(storageDir, "files");
const jobsFile = path.join(storageDir, "jobs.json");
const clientsFile = path.join(storageDir, "clients.json");
const pingsFile = path.join(storageDir, "pings.json");
const sessionsFile = path.join(storageDir, "sessions.json");

const upload = multer({ dest: filesDir });

app.use(express.json());
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
app.use(express.static(path.join(__dirname, "public")));

async function ensureStorage() {
  await fsp.mkdir(filesDir, { recursive: true });
  try {
    await fsp.access(jobsFile, fs.constants.F_OK);
  } catch {
    await fsp.writeFile(jobsFile, JSON.stringify([]));
  }
  try {
    await fsp.access(clientsFile, fs.constants.F_OK);
  } catch {
    await fsp.writeFile(clientsFile, JSON.stringify([]));
  }
  try {
    await fsp.access(pingsFile, fs.constants.F_OK);
  } catch {
    await fsp.writeFile(pingsFile, JSON.stringify({}));
  }
  try {
    await fsp.access(sessionsFile, fs.constants.F_OK);
  } catch {
    await fsp.writeFile(sessionsFile, JSON.stringify([]));
  }
}

async function readJson(filePath, fallback) {
  let raw = "";
  try {
    raw = await fsp.readFile(filePath, "utf8");
  } catch {
    await fsp.writeFile(filePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }

  if (!raw.trim()) {
    await fsp.writeFile(filePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch {
    await fsp.writeFile(filePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}

async function writeJson(filePath, payload) {
  await fsp.writeFile(filePath, JSON.stringify(payload, null, 2));
}

async function readJobs() {
  return readJson(jobsFile, []);
}

async function writeJobs(jobs) {
  await writeJson(jobsFile, jobs);
}

async function readClients() {
  return readJson(clientsFile, []);
}

async function writeClients(clients) {
  await writeJson(clientsFile, clients);
}

async function readPings() {
  return readJson(pingsFile, {});
}

async function writePings(pings) {
  await writeJson(pingsFile, pings);
}

async function readSessions() {
  return readJson(sessionsFile, []);
}

async function writeSessions(sessions) {
  await writeJson(sessionsFile, sessions);
}

function normalizePaperSize(value) {
  const v = String(value || "").toUpperCase().trim();
  if (v === "A4" || v === "A5") {
    return v;
  }
  return null;
}

function normalizeCopies(value) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 1 || n > 999) {
    return null;
  }
  return n;
}

function normalizeName(value) {
  const v = String(value || "").trim();
  if (!v) {
    return null;
  }
  return v.slice(0, 120);
}

function normalizePrinters(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => String(item || "").trim())
    .filter(item => item.length > 0)
    .slice(0, 50);
}

function normalizeSelectedPrinter(value, printers) {
  const v = String(value || "").trim();
  if (!v) {
    return null;
  }
  if (Array.isArray(printers) && printers.length > 0) {
    return printers.includes(v) ? v : null;
  }
  return v.slice(0, 120);
}

function normalizePrinterStatus(value) {
  const v = String(value || "").toLowerCase().trim();
  if (v === "idle" || v === "printing") {
    return v;
  }
  return null;
}

function toPublicJob(job) {
  return {
    id: job.id,
    originalName: job.originalName,
    size: job.size,
    createdAt: job.createdAt,
    status: job.status,
    printConfig: job.printConfig,
    targetClientId: job.targetClientId,
    targetClientName: job.targetClientName,
    sessionId: job.sessionId
  };
}

function toPublicClient(client) {
  return {
    id: client.id,
    name: client.name,
    printers: client.printers,
    selectedPrinter: client.selectedPrinter || null,
    printerStatus: client.printerStatus || null,
    lastSeen: client.lastSeen,
    status: client.status
  };
}

const CLIENT_TTL_MS = 2 * 60 * 1000;
const SESSION_TTL_MS = 30 * 1000;

function isClientOnline(client) {
  const lastSeen = new Date(client.lastSeen).getTime();
  return Number.isFinite(lastSeen) && Date.now() - lastSeen <= CLIENT_TTL_MS;
}

function withClientStatus(client) {
  const online = isClientOnline(client);
  return {
    ...client,
    status: online ? "online" : "offline"
  };
}

function pruneOfflineClients(clients) {
  const keep = clients.filter(isClientOnline);
  return {
    clients: keep,
    removed: clients.length - keep.length
  };
}

function isSessionActive(session) {
  const lastSeen = new Date(session.lastSeen).getTime();
  return Number.isFinite(lastSeen) && Date.now() - lastSeen <= SESSION_TTL_MS;
}

async function cleanupExpiredSessions() {
  const sessions = await readSessions();
  if (sessions.length === 0) {
    return { removedSessions: 0, removedJobs: 0 };
  }

  const activeSessions = sessions.filter(isSessionActive);
  const expiredIds = new Set(sessions.filter(s => !isSessionActive(s)).map(s => s.id));
  if (expiredIds.size === 0) {
    return { removedSessions: 0, removedJobs: 0 };
  }

  const jobs = await readJobs();
  const remainingJobs = [];
  const deleteQueue = [];

  for (const job of jobs) {
    if (expiredIds.has(job.sessionId)) {
      if (job.storedPath) {
        deleteQueue.push(job.storedPath);
      }
    } else {
      remainingJobs.push(job);
    }
  }

  await Promise.all(
    deleteQueue.map(filePath => fsp.unlink(filePath).catch(() => null))
  );
  await writeJobs(remainingJobs);
  await writeSessions(activeSessions);

  return { removedSessions: expiredIds.size, removedJobs: jobs.length - remainingJobs.length };
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/jobs", async (req, res) => {
  await cleanupExpiredSessions();
  let jobs = await readJobs();
  if (req.query.clientId) {
    jobs = jobs.filter(job => job.targetClientId === req.query.clientId);
  }
  if (req.query.sessionId) {
    jobs = jobs.filter(job => job.sessionId === req.query.sessionId);
  }
  if (req.query.status) {
    jobs = jobs.filter(job => job.status === req.query.status);
  }
  res.json(jobs.map(toPublicJob));
});

app.get("/api/jobs/:id", async (req, res) => {
  await cleanupExpiredSessions();
  const jobs = await readJobs();
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.json(toPublicJob(job));
});

app.get("/api/jobs/:id/download", async (req, res) => {
  await cleanupExpiredSessions();
  const jobs = await readJobs();
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.download(job.storedPath, job.originalName);
});

app.get("/api/clients", async (req, res) => {
  const existing = await readClients();
  const { clients, removed } = pruneOfflineClients(existing);
  if (removed > 0) {
    await writeClients(clients);
  }
  res.json(clients.map(withClientStatus).map(toPublicClient));
});

app.post("/api/sessions", async (req, res) => {
  await cleanupExpiredSessions();
  const clientId = typeof req.body?.clientId === "string" ? req.body.clientId : null;
  if (!clientId) {
    res.status(400).json({ error: "clientId is required" });
    return;
  }

  const clients = await readClients();
  const client = clients.find(c => c.id === clientId);
  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }

  const sessions = await readSessions();
  const session = {
    id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    clientId: client.id,
    clientName: client.name,
    createdAt: new Date().toISOString(),
    lastSeen: new Date().toISOString()
  };

  sessions.unshift(session);
  await writeSessions(sessions);
  res.json(session);
});

app.post("/api/sessions/heartbeat", async (req, res) => {
  await cleanupExpiredSessions();
  const sessionId = typeof req.body?.sessionId === "string" ? req.body.sessionId : null;
  if (!sessionId) {
    res.status(400).json({ error: "sessionId is required" });
    return;
  }

  const sessions = await readSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  session.lastSeen = new Date().toISOString();
  await writeSessions(sessions);
  res.json({ ok: true });
});

app.post("/api/sessions/close", async (req, res) => {
  const sessionId = typeof req.body?.sessionId === "string" ? req.body.sessionId : null;
  if (!sessionId) {
    res.status(400).json({ error: "sessionId is required" });
    return;
  }

  const sessions = await readSessions();
  const remainingSessions = sessions.filter(s => s.id !== sessionId);

  const jobs = await readJobs();
  const remainingJobs = [];
  const deleteQueue = [];

  for (const job of jobs) {
    if (job.sessionId === sessionId) {
      if (job.storedPath) {
        deleteQueue.push(job.storedPath);
      }
    } else {
      remainingJobs.push(job);
    }
  }

  await Promise.all(
    deleteQueue.map(filePath => fsp.unlink(filePath).catch(() => null))
  );
  await writeJobs(remainingJobs);
  await writeSessions(remainingSessions);

  res.json({ ok: true, removedJobs: jobs.length - remainingJobs.length });
});

app.post("/api/clients/register", async (req, res) => {
  const name = normalizeName(req.body?.name);
  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  const printers = normalizePrinters(req.body?.printers);
  const selectedPrinter = normalizeSelectedPrinter(req.body?.selectedPrinter, printers);
  const printerStatus = normalizePrinterStatus(req.body?.printerStatus);
  const clients = await readClients();
  const incomingId = typeof req.body?.clientId === "string" ? req.body.clientId : null;

  let client = incomingId ? clients.find(c => c.id === incomingId) : null;
  if (!client) {
    const id = incomingId || `client_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    client = {
      id,
      name,
      printers,
      selectedPrinter,
      printerStatus,
      createdAt: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    };
    clients.unshift(client);
  } else {
    client.name = name;
    client.printers = printers;
    client.selectedPrinter = selectedPrinter;
    client.printerStatus = printerStatus || client.printerStatus;
    client.lastSeen = new Date().toISOString();
  }

  const { clients: cleaned } = pruneOfflineClients(clients);
  await writeClients(cleaned);
  console.log("Client register:", client.id, client.name);
  res.json(toPublicClient(withClientStatus(client)));
});

app.post("/api/clients/heartbeat", async (req, res) => {
  const clientId = typeof req.body?.clientId === "string" ? req.body.clientId : null;
  if (!clientId) {
    res.status(400).json({ error: "clientId is required" });
    return;
  }

  const clients = await readClients();
  const client = clients.find(c => c.id === clientId);
  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }

  const selectedPrinter = normalizeSelectedPrinter(req.body?.selectedPrinter, client.printers);
  const printerStatus = normalizePrinterStatus(req.body?.printerStatus);
  if (selectedPrinter) {
    client.selectedPrinter = selectedPrinter;
  }
  if (printerStatus) {
    client.printerStatus = printerStatus;
  }
  client.lastSeen = new Date().toISOString();
  const { clients: cleaned } = pruneOfflineClients(clients);
  await writeClients(cleaned);
  console.log("Client heartbeat:", client.id);
  res.json(toPublicClient(withClientStatus(client)));
});

app.post("/api/clients/:id/ping", async (req, res) => {
  const clients = await readClients();
  const client = clients.find(c => c.id === req.params.id);
  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }

  const pings = await readPings();
  if (!Array.isArray(pings[client.id])) {
    pings[client.id] = [];
  }

  pings[client.id].push({
    id: `ping_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString()
  });

  await writePings(pings);
  res.json({ ok: true });
});

app.get("/api/clients/:id/ping", async (req, res) => {
  const clients = await readClients();
  const client = clients.find(c => c.id === req.params.id);
  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }

  client.lastSeen = new Date().toISOString();
  const { clients: cleaned } = pruneOfflineClients(clients);
  await writeClients(cleaned);

  const pings = await readPings();
  const items = Array.isArray(pings[client.id]) ? pings[client.id] : [];
  pings[client.id] = [];
  await writePings(pings);
  console.log("Client ping poll:", client.id, "items:", items.length);
  res.json({ items });
});

app.post("/api/clients/unregister", async (req, res) => {
  const clientId = typeof req.body?.clientId === "string" ? req.body.clientId : null;
  if (!clientId) {
    res.status(400).json({ error: "clientId is required" });
    return;
  }

  const clients = await readClients();
  const next = clients.filter(c => c.id !== clientId);
  const removed = clients.length - next.length;
  if (removed > 0) {
    await writeClients(next);
  }
  res.json({ ok: true, removed });
});

app.patch("/api/jobs/:id", async (req, res) => {
  await cleanupExpiredSessions();
  const jobs = await readJobs();
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const { status } = req.body || {};
  if (typeof status !== "string" || status.trim().length === 0) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  job.status = status.trim();
  await writeJobs(jobs);
  res.json(toPublicJob(job));
});

app.post("/api/jobs", upload.single("document"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Document is required" });
    return;
  }

  const paperSize = normalizePaperSize(req.body.paperSize);
  const copies = normalizeCopies(req.body.copies);
  const sessionId = typeof req.body.sessionId === "string" ? req.body.sessionId : null;

  if (!paperSize) {
    res.status(400).json({ error: "paperSize must be A4 or A5" });
    return;
  }
  if (!copies) {
    res.status(400).json({ error: "copies must be 1-999" });
    return;
  }
  if (!sessionId) {
    res.status(400).json({ error: "sessionId is required" });
    return;
  }

  await cleanupExpiredSessions();
  const sessions = await readSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session) {
    res.status(400).json({ error: "sessionId not found" });
    return;
  }

  const jobs = await readJobs();
  const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const job = {
    id,
    originalName: req.file.originalname,
    storedPath: req.file.path,
    size: req.file.size,
    createdAt: new Date().toISOString(),
    status: "ready",
    sessionId: session.id,
    targetClientId: session.clientId,
    targetClientName: session.clientName,
    printConfig: {
      paperSize,
      copies
    }
  };

  jobs.unshift(job);
  await writeJobs(jobs);
  res.status(201).json(toPublicJob(job));
});

ensureStorage()
  .then(() => {
    app.listen(port, () => {
      console.log(`PrintForm server running on http://localhost:${port}`);
    });

    setInterval(() => {
      cleanupExpiredSessions().catch(err => {
        console.warn("Cleanup sessions failed:", err.message);
      });
    }, 10000);
  })
  .catch(err => {
    console.error("Failed to initialize storage:", err);
    process.exit(1);
  });

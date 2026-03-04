const express = require("express");
const fsp = require("fs").promises;
const { getSessions, saveSessions } = require("../repositories/sessionsRepository");
const { getClients } = require("../repositories/clientsRepository");
const { getJobs, saveJobs } = require("../repositories/jobsRepository");
const { normalizeAlias } = require("../utils/normalize");
const { cleanupExpiredSessions } = require("../services/cleanup");

const router = express.Router();

router.post("/", async (req, res) => {
  await cleanupExpiredSessions();
  const clientId = typeof req.body?.clientId === "string" ? req.body.clientId : null;
  if (!clientId) {
    res.status(400).json({ error: "clientId is required" });
    return;
  }

  const clients = await getClients();
  const client = clients.find(c => c.id === clientId);
  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }

  const alias = normalizeAlias(req.body?.alias);
  const sessions = await getSessions();
  const session = {
    id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    clientId: client.id,
    clientName: client.name,
    alias,
    createdAt: new Date().toISOString(),
    lastSeen: new Date().toISOString()
  };

  sessions.unshift(session);
  await saveSessions(sessions);
  res.json(session);
});

router.post("/heartbeat", async (req, res) => {
  await cleanupExpiredSessions();
  const sessionId = typeof req.body?.sessionId === "string" ? req.body.sessionId : null;
  if (!sessionId) {
    res.status(400).json({ error: "sessionId is required" });
    return;
  }

  const sessions = await getSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  session.lastSeen = new Date().toISOString();
  await saveSessions(sessions);
  res.json({ ok: true });
});

router.post("/close", async (req, res) => {
  const sessionId = typeof req.body?.sessionId === "string" ? req.body.sessionId : null;
  if (!sessionId) {
    res.status(400).json({ error: "sessionId is required" });
    return;
  }

  const sessions = await getSessions();
  const remainingSessions = sessions.filter(s => s.id !== sessionId);

  const jobs = await getJobs();
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
  await saveJobs(remainingJobs);
  await saveSessions(remainingSessions);

  res.json({ ok: true, removedJobs: jobs.length - remainingJobs.length });
});

module.exports = router;

const express = require("express");
const fsp = require("fs").promises;
const { getSessions, saveSessions } = require("../repositories/sessionsRepository");
const { getClients, updateClientPresence } = require("../repositories/clientsRepository");
const { getJobs, saveJobs } = require("../repositories/jobsRepository");
const {
  SESSION_CREATE_CONFIRM_TIMEOUT_MS,
  SESSION_CREATE_CONFIRM_POLL_INTERVAL_MS
} = require("../config");
const { normalizeAlias } = require("../utils/normalize");
const { isClientOnline, withClientStatus } = require("../services/status");
const { toPublicClient } = require("../utils/publicMapper");
const { cleanupExpiredSessions } = require("../services/cleanup");
const { refreshStorageUsageSnapshot } = require("../services/storageUsage");
const {
  notifyJobsRemoved,
  notifyClientUpserted,
  publishRealtimeEvent,
  isClientRealtimeConnected
} = require("../services/realtime");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getLastSeenMs(client) {
  const lastSeenMs = new Date(client?.lastSeen).getTime();
  return Number.isFinite(lastSeenMs) ? lastSeenMs : 0;
}

function isClientAvailableForNewSession(client) {
  return Boolean(client && isClientRealtimeConnected(client.id));
}

async function waitForClientConfirmation(client) {
  const timeoutMs = Math.max(0, SESSION_CREATE_CONFIRM_TIMEOUT_MS);
  const pollIntervalMs = Math.max(100, SESSION_CREATE_CONFIRM_POLL_INTERVAL_MS);
  const startedAt = Date.now();
  const baselineLastSeenMs = getLastSeenMs(client);

  while (Date.now() - startedAt < timeoutMs) {
    await delay(pollIntervalMs);

    const clients = await getClients();
    const latestClient = clients.find(item => item.id === client.id);
    if (!latestClient) {
      return { ok: false, client: null, reason: "client-missing" };
    }

    if (isClientRealtimeConnected(latestClient.id)) {
      return { ok: true, client: latestClient, reason: "realtime-confirmed" };
    }

    const latestSeenMs = getLastSeenMs(latestClient);
    const hasNewActivitySignal = latestSeenMs > baselineLastSeenMs;
    if (hasNewActivitySignal && isClientOnline(latestClient)) {
      return {
        ok: true,
        client: latestClient,
        reason: "activity-confirmed"
      };
    }
  }

  const latestClients = await getClients();
  const latestClient = latestClients.find(item => item.id === client.id) || client;
  return { ok: false, client: latestClient, reason: "confirmation-timeout" };
}

router.post("/", asyncHandler(async (req, res) => {
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

  let sessionTargetClient = client;
  let availabilitySource = "initial";

  if (!isClientAvailableForNewSession(client)) {
    const confirmation = await waitForClientConfirmation(client);
    if (!confirmation.ok) {
      const updatedClient = await updateClientPresence(client.id, { status: "offline" });
      if (updatedClient) {
        notifyClientUpserted(
          toPublicClient(withClientStatus(updatedClient)),
          "session-create-rejected-offline"
        );
      }

      res.status(409).json({
        error: "Client sedang offline/tidak responsif. Session tidak bisa dibuat.",
        code: "CLIENT_UNAVAILABLE",
        clientId: client.id,
        reason: confirmation.reason
      });
      return;
    }

    if (confirmation.client) {
      sessionTargetClient = confirmation.client;
    }
    availabilitySource = confirmation.reason;
  } else {
    availabilitySource = "realtime-connected";
  }

  const alias = normalizeAlias(req.body?.alias);
  const sessions = await getSessions();
  const session = {
    id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    clientId: sessionTargetClient.id,
    clientName: sessionTargetClient.name,
    alias,
    createdAt: new Date().toISOString(),
    lastSeen: new Date().toISOString()
  };

  sessions.unshift(session);
  await saveSessions(sessions);
  res.json({
    ...session,
    availabilitySource
  });
}));

router.post("/heartbeat", asyncHandler(async (req, res) => {
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
}));

router.post("/close", asyncHandler(async (req, res) => {
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
  const removedJobIds = [];

  for (const job of jobs) {
    if (job.sessionId === sessionId) {
      removedJobIds.push(job.id);
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
  await refreshStorageUsageSnapshot(remainingJobs);

  if (removedJobIds.length > 0) {
    notifyJobsRemoved(removedJobIds, "session-close");
  }

  publishRealtimeEvent({
    type: "session.closed",
    channel: "sessions",
    payload: {
      sessionId,
      removedJobs: removedJobIds.length
    }
  });

  res.json({ ok: true, removedJobs: jobs.length - remainingJobs.length });
}));

module.exports = router;

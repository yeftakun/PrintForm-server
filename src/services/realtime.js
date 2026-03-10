const crypto = require("crypto");
const { URL } = require("url");
const { WebSocketServer, WebSocket } = require("ws");
const {
  REALTIME_PATH,
  REALTIME_PRESENCE_SYNC_INTERVAL_MS,
  REALTIME_PING_INTERVAL_MS,
  REALTIME_CLIENT_OFFLINE_GRACE_MS
} = require("../config");
const {
  getClients,
  updateClientStatuses,
  updateClientPresence
} = require("../repositories/clientsRepository");
const { withClientStatus } = require("./status");
const { toPublicClient } = require("../utils/publicMapper");
const { normalizeClientId, isValidClientId } = require("../utils/clientId");

const CHANNEL_ANY = "*";
const DEFAULT_CHANNELS = [CHANNEL_ANY];
const ROLE_OBSERVER = "observer";
const ROLE_CLIENT = "client";

const state = {
  wss: null,
  clientsMeta: new Map(),
  presenceByClientId: new Map(),
  presenceSocketsByClientId: new Map(),
  offlineTimersByClientId: new Map(),
  presenceInitialized: false,
  pingIntervalRef: null,
  presenceIntervalRef: null
};

function createEventEnvelope({ type, channel, payload }) {
  return {
    id: typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
    at: new Date().toISOString(),
    type,
    channel,
    payload
  };
}

function parseChannels(value) {
  if (!Array.isArray(value) || value.length === 0) {
    return new Set(DEFAULT_CHANNELS);
  }

  const channels = value
    .map(item => String(item || "").trim().toLowerCase())
    .filter(Boolean);

  if (channels.length === 0) {
    return new Set(DEFAULT_CHANNELS);
  }

  return new Set(channels);
}

function normalizeRealtimeRole(value) {
  const role = String(value || "").trim().toLowerCase();
  if (role === "client" || role === "print-client" || role === "printer") {
    return ROLE_CLIENT;
  }
  return ROLE_OBSERVER;
}

function parseIdentityFromRequest(request) {
  if (!request || typeof request.url !== "string") {
    return null;
  }

  try {
    const host = request.headers?.host || "localhost";
    const parsedUrl = new URL(request.url, `http://${host}`);
    const clientId = normalizeClientId(parsedUrl.searchParams.get("clientId"));
    if (!clientId || !isValidClientId(clientId)) {
      return null;
    }

    const role = normalizeRealtimeRole(parsedUrl.searchParams.get("role") || ROLE_CLIENT);
    return { clientId, role };
  } catch {
    return null;
  }
}

function hasActivePresenceSocket(clientId) {
  const sockets = state.presenceSocketsByClientId.get(clientId);
  return Boolean(sockets && sockets.size > 0);
}

function clearOfflineTransitionTimer(clientId) {
  const existing = state.offlineTimersByClientId.get(clientId);
  if (!existing) {
    return;
  }

  clearTimeout(existing);
  state.offlineTimersByClientId.delete(clientId);
}

function trackPresenceSocket(clientId, ws) {
  clearOfflineTransitionTimer(clientId);

  let sockets = state.presenceSocketsByClientId.get(clientId);
  if (!sockets) {
    sockets = new Set();
    state.presenceSocketsByClientId.set(clientId, sockets);
  }
  sockets.add(ws);
}

function untrackPresenceSocket(clientId, ws) {
  const sockets = state.presenceSocketsByClientId.get(clientId);
  if (!sockets) {
    return 0;
  }

  sockets.delete(ws);
  if (sockets.size === 0) {
    state.presenceSocketsByClientId.delete(clientId);
    return 0;
  }

  return sockets.size;
}

async function markClientOnlineFromRealtime(clientId, source) {
  const updatedClient = await updateClientPresence(clientId, {
    status: "online",
    lastSeen: new Date().toISOString()
  });

  if (!updatedClient) {
    return;
  }

  const previousStatus = state.presenceByClientId.get(clientId) || null;
  state.presenceByClientId.set(clientId, "online");

  if (previousStatus !== "online") {
    publishRealtimeEvent({
      type: "client.status.changed",
      channel: "clients",
      payload: {
        client: toPublicClient(withClientStatus(updatedClient)),
        previousStatus,
        currentStatus: "online",
        source: source || "realtime-identify"
      }
    });
  }
}

async function markClientOfflineFromRealtime(clientId, source) {
  const updatedClient = await updateClientPresence(clientId, {
    status: "offline"
  });

  if (!updatedClient) {
    return;
  }

  const previousStatus = state.presenceByClientId.get(clientId) || null;
  state.presenceByClientId.set(clientId, "offline");

  if (previousStatus !== "offline") {
    publishRealtimeEvent({
      type: "client.status.changed",
      channel: "clients",
      payload: {
        client: toPublicClient(withClientStatus(updatedClient)),
        previousStatus,
        currentStatus: "offline",
        source: source || "realtime-disconnect"
      }
    });
  }
}

function scheduleClientOfflineTransition(clientId, source) {
  clearOfflineTransitionTimer(clientId);

  const delayMs = Math.max(0, REALTIME_CLIENT_OFFLINE_GRACE_MS);
  const timer = setTimeout(() => {
    state.offlineTimersByClientId.delete(clientId);
    if (hasActivePresenceSocket(clientId)) {
      return;
    }

    markClientOfflineFromRealtime(clientId, source || "realtime-disconnect").catch(err => {
      console.warn("Realtime offline transition failed:", err.message);
    });
  }, delayMs);

  state.offlineTimersByClientId.set(clientId, timer);
}

async function identifySocketClient(ws, { clientId, role, source }) {
  const meta = state.clientsMeta.get(ws);
  if (!meta || meta.closed) {
    return;
  }

  const normalizedClientId = normalizeClientId(clientId);
  if (!normalizedClientId || !isValidClientId(normalizedClientId)) {
    sendJson(ws, {
      type: "realtime.error",
      message: "identify requires valid clientId"
    });
    return;
  }

  const normalizedRole = normalizeRealtimeRole(role || ROLE_CLIENT);
  if (normalizedRole !== ROLE_CLIENT) {
    sendJson(ws, {
      type: "realtime.error",
      message: "identify role is not eligible for client presence"
    });
    return;
  }

  const previousClientId = meta.clientId;
  meta.role = normalizedRole;
  meta.clientId = normalizedClientId;

  if (previousClientId && previousClientId !== normalizedClientId) {
    const remainingOldSockets = untrackPresenceSocket(previousClientId, ws);
    if (remainingOldSockets === 0) {
      scheduleClientOfflineTransition(previousClientId, "realtime-switch-identity");
    }
  }

  trackPresenceSocket(normalizedClientId, ws);
  await markClientOnlineFromRealtime(normalizedClientId, source || "realtime-identify");

  sendJson(ws, {
    type: "realtime.identified",
    clientId: normalizedClientId,
    role: normalizedRole,
    source: source || "realtime-identify"
  });
}

function cleanupSocket(ws, source) {
  const meta = state.clientsMeta.get(ws);
  if (!meta) {
    return;
  }

  if (meta.closed) {
    state.clientsMeta.delete(ws);
    return;
  }

  meta.closed = true;
  state.clientsMeta.delete(ws);

  if (meta.clientId) {
    const disconnectedClientId = meta.clientId;
    meta.clientId = null;

    const remainingSockets = untrackPresenceSocket(disconnectedClientId, ws);
    if (remainingSockets === 0) {
      scheduleClientOfflineTransition(disconnectedClientId, source || "realtime-disconnect");
    }
  }
}

function canReceiveChannel(meta, channel) {
  if (!meta || !meta.channels || meta.channels.size === 0) {
    return true;
  }

  if (meta.channels.has(CHANNEL_ANY)) {
    return true;
  }

  return meta.channels.has(String(channel || "").toLowerCase());
}

function sendJson(ws, payload) {
  if (!state.wss || ws.readyState !== WebSocket.OPEN) {
    return;
  }
  ws.send(JSON.stringify(payload));
}

function publishRealtimeEvent({ type, channel, payload }) {
  if (!state.wss) {
    return;
  }

  const normalizedChannel = String(channel || "system").toLowerCase();
  const event = createEventEnvelope({
    type,
    channel: normalizedChannel,
    payload
  });

  for (const [ws, meta] of state.clientsMeta.entries()) {
    if (!canReceiveChannel(meta, normalizedChannel)) {
      continue;
    }
    sendJson(ws, event);
  }
}

async function sendClientSnapshot(ws) {
  const clients = await getClients();
  const payload = {
    clients: clients.map(client => {
      const withStatus = withClientStatus(client);
      const effectiveStatus = hasActivePresenceSocket(client.id)
        ? "online"
        : withStatus.status;
      return toPublicClient({
        ...withStatus,
        status: effectiveStatus
      });
    })
  };
  sendJson(ws, createEventEnvelope({
    type: "clients.snapshot",
    channel: "clients",
    payload
  }));
}

async function syncPresence({ emitChanges }) {
  const clients = await getClients();
  const nextPresence = new Map();
  const cacheStatusUpdates = {};

  for (const rawClient of clients) {
    const withStatus = withClientStatus(rawClient);
    const hasSocketPresence = hasActivePresenceSocket(rawClient.id);
    const effectiveStatus = hasSocketPresence ? "online" : withStatus.status;
    const previousStatus = state.presenceByClientId.get(rawClient.id) || null;

    nextPresence.set(rawClient.id, effectiveStatus);

    const cachedStatus = String(rawClient?.status || "").toLowerCase();
    if (cachedStatus !== effectiveStatus) {
      cacheStatusUpdates[rawClient.id] = effectiveStatus;
    }

    if (emitChanges && previousStatus !== effectiveStatus) {
      publishRealtimeEvent({
        type: "client.status.changed",
        channel: "clients",
        payload: {
          client: toPublicClient({
            ...withStatus,
            status: effectiveStatus
          }),
          previousStatus,
          currentStatus: effectiveStatus,
          source: hasSocketPresence ? "presence-sync-ws" : "presence-sync-ttl"
        }
      });
    }
  }

  if (Object.keys(cacheStatusUpdates).length > 0) {
    await updateClientStatuses(cacheStatusUpdates);
  }

  if (emitChanges) {
    for (const [clientId, previousStatus] of state.presenceByClientId.entries()) {
      if (nextPresence.has(clientId)) {
        continue;
      }
      publishRealtimeEvent({
        type: "client.removed",
        channel: "clients",
        payload: {
          clientId,
          previousStatus,
          source: "presence-sync"
        }
      });
    }
  }

  state.presenceByClientId = nextPresence;
}

async function runPresenceSyncTick() {
  try {
    if (!state.presenceInitialized) {
      await syncPresence({ emitChanges: false });
      state.presenceInitialized = true;
      return;
    }
    await syncPresence({ emitChanges: true });
  } catch (err) {
    console.warn("Realtime presence sync failed:", err.message);
  }
}

function handleClientMessage(ws, rawData) {
  let parsed = null;
  try {
    parsed = JSON.parse(String(rawData || ""));
  } catch {
    sendJson(ws, {
      type: "realtime.error",
      message: "Invalid JSON payload"
    });
    return;
  }

  const action = String(parsed?.action || "").trim().toLowerCase();

  if (action === "identify") {
    identifySocketClient(ws, {
      clientId: parsed.clientId,
      role: parsed.role,
      source: "realtime-identify-message"
    }).catch(err => {
      sendJson(ws, {
        type: "realtime.error",
        message: `identify failed: ${err.message}`
      });
    });
    return;
  }

  if (action === "subscribe") {
    const channels = parseChannels(parsed.channels);
    const meta = state.clientsMeta.get(ws);
    if (meta) {
      meta.channels = channels;
      sendJson(ws, {
        type: "realtime.subscribed",
        channels: [...channels]
      });
    }
    return;
  }

  if (action === "ping") {
    const meta = state.clientsMeta.get(ws);
    if (meta?.clientId) {
      markClientOnlineFromRealtime(meta.clientId, "realtime-client-ping").catch(err => {
        console.warn("Realtime ping presence touch failed:", err.message);
      });
    }

    sendJson(ws, {
      type: "realtime.pong",
      at: new Date().toISOString()
    });
  }
}

function startKeepAliveTimer() {
  if (state.pingIntervalRef) {
    clearInterval(state.pingIntervalRef);
  }

  state.pingIntervalRef = setInterval(() => {
    for (const ws of state.clientsMeta.keys()) {
      if (ws.readyState !== WebSocket.OPEN) {
        continue;
      }
      ws.ping();
    }
  }, REALTIME_PING_INTERVAL_MS);
}

function startPresenceSyncTimer() {
  if (state.presenceIntervalRef) {
    clearInterval(state.presenceIntervalRef);
  }

  runPresenceSyncTick();
  state.presenceIntervalRef = setInterval(runPresenceSyncTick, REALTIME_PRESENCE_SYNC_INTERVAL_MS);
}

function initializeRealtime(server) {
  if (state.wss) {
    return;
  }

  const wss = new WebSocketServer({
    server,
    path: REALTIME_PATH
  });

  wss.on("connection", (ws, request) => {
    const meta = {
      channels: new Set(DEFAULT_CHANNELS),
      role: ROLE_OBSERVER,
      clientId: null,
      closed: false
    };

    state.clientsMeta.set(ws, meta);

    sendJson(ws, {
      type: "realtime.connected",
      path: REALTIME_PATH,
      channels: [...meta.channels],
      at: new Date().toISOString()
    });

    sendClientSnapshot(ws).catch(err => {
      sendJson(ws, {
        type: "realtime.error",
        message: `Failed to send client snapshot: ${err.message}`
      });
    });

    ws.on("message", data => {
      handleClientMessage(ws, data);
    });

    ws.on("close", () => {
      cleanupSocket(ws, "socket-close");
    });

    ws.on("error", () => {
      cleanupSocket(ws, "socket-error");
    });

    ws.on("pong", () => {
      const currentMeta = state.clientsMeta.get(ws);
      if (!currentMeta?.clientId) {
        return;
      }

      markClientOnlineFromRealtime(currentMeta.clientId, "realtime-socket-pong").catch(err => {
        console.warn("Realtime pong presence touch failed:", err.message);
      });
    });

    const identityFromRequest = parseIdentityFromRequest(request);
    if (identityFromRequest) {
      identifySocketClient(ws, {
        clientId: identityFromRequest.clientId,
        role: identityFromRequest.role,
        source: "realtime-identify-query"
      }).catch(err => {
        sendJson(ws, {
          type: "realtime.error",
          message: `identify failed: ${err.message}`
        });
      });
    }
  });

  state.wss = wss;
  startKeepAliveTimer();
  startPresenceSyncTimer();
}

function shutdownRealtime() {
  if (state.pingIntervalRef) {
    clearInterval(state.pingIntervalRef);
    state.pingIntervalRef = null;
  }

  if (state.presenceIntervalRef) {
    clearInterval(state.presenceIntervalRef);
    state.presenceIntervalRef = null;
  }

  if (state.wss) {
    for (const ws of state.clientsMeta.keys()) {
      try {
        ws.close();
      } catch {
        // Ignore socket close failures.
      }
    }
    state.wss.close();
    state.wss = null;
  }

  for (const timer of state.offlineTimersByClientId.values()) {
    clearTimeout(timer);
  }

  state.clientsMeta.clear();
  state.presenceByClientId.clear();
  state.presenceSocketsByClientId.clear();
  state.offlineTimersByClientId.clear();
  state.presenceInitialized = false;
}

function notifyJobCreated(job, source) {
  publishRealtimeEvent({
    type: "job.created",
    channel: "jobs",
    payload: {
      job,
      source: source || "server"
    }
  });
}

function notifyJobStatusChanged(job, previousStatus) {
  publishRealtimeEvent({
    type: "job.status.changed",
    channel: "jobs",
    payload: {
      job,
      previousStatus: previousStatus || null,
      currentStatus: job?.status || null
    }
  });
}

function notifyJobsRemoved(jobIds, source) {
  publishRealtimeEvent({
    type: "jobs.removed",
    channel: "jobs",
    payload: {
      jobIds: Array.isArray(jobIds) ? jobIds : [],
      source: source || "server"
    }
  });
}

function notifyClientUpserted(client, source) {
  publishRealtimeEvent({
    type: "client.upserted",
    channel: "clients",
    payload: {
      client,
      source: source || "server"
    }
  });
}

function notifyClientRemoved(clientId, source) {
  publishRealtimeEvent({
    type: "client.removed",
    channel: "clients",
    payload: {
      clientId,
      source: source || "server"
    }
  });
}

function getRealtimeState() {
  return {
    enabled: Boolean(state.wss),
    path: REALTIME_PATH,
    connections: state.clientsMeta.size,
    trackedClients: state.presenceSocketsByClientId.size,
    clientOfflineGraceMs: REALTIME_CLIENT_OFFLINE_GRACE_MS,
    channels: ["*", "clients", "jobs", "sessions", "system"]
  };
}

function isClientRealtimeConnected(clientId) {
  const normalizedClientId = normalizeClientId(clientId);
  if (!normalizedClientId || !isValidClientId(normalizedClientId)) {
    return false;
  }
  return hasActivePresenceSocket(normalizedClientId);
}

module.exports = {
  initializeRealtime,
  shutdownRealtime,
  publishRealtimeEvent,
  notifyJobCreated,
  notifyJobStatusChanged,
  notifyJobsRemoved,
  notifyClientUpserted,
  notifyClientRemoved,
  getRealtimeState,
  isClientRealtimeConnected
};

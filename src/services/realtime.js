const crypto = require("crypto");
const { WebSocketServer, WebSocket } = require("ws");
const {
  REALTIME_PATH,
  REALTIME_PRESENCE_SYNC_INTERVAL_MS,
  REALTIME_PING_INTERVAL_MS
} = require("../config");
const { getClients, updateClientStatuses } = require("../repositories/clientsRepository");
const { withClientStatus } = require("./status");
const { toPublicClient } = require("../utils/publicMapper");

const CHANNEL_ANY = "*";
const DEFAULT_CHANNELS = [CHANNEL_ANY];

const state = {
  wss: null,
  clientsMeta: new Map(),
  presenceByClientId: new Map(),
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
    clients: clients.map(withClientStatus).map(toPublicClient)
  };
  sendJson(ws, createEventEnvelope({
    type: "clients.snapshot",
    channel: "clients",
    payload
  }));
}

async function syncPresence({ emitChanges }) {
  const clients = await getClients();
  const current = clients.map(withClientStatus).map(toPublicClient);
  const rawById = new Map(clients.map(client => [client.id, client]));
  const nextPresence = new Map();
  const cacheStatusUpdates = {};

  for (const client of current) {
    const previousStatus = state.presenceByClientId.get(client.id) || null;
    nextPresence.set(client.id, client.status);

    const rawClient = rawById.get(client.id);
    const cachedStatus = String(rawClient?.status || "").toLowerCase();
    if (cachedStatus !== client.status) {
      cacheStatusUpdates[client.id] = client.status;
    }

    if (emitChanges && previousStatus !== client.status) {
      publishRealtimeEvent({
        type: "client.status.changed",
        channel: "clients",
        payload: {
          client,
          previousStatus,
          currentStatus: client.status,
          source: "presence-sync"
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

  const action = String(parsed?.action || "").toLowerCase();
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

  wss.on("connection", ws => {
    const meta = {
      channels: new Set(DEFAULT_CHANNELS)
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
      state.clientsMeta.delete(ws);
    });

    ws.on("error", () => {
      state.clientsMeta.delete(ws);
    });

    ws.on("pong", () => {
      // Keepalive hook for future idle timeout logic.
    });
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

  state.clientsMeta.clear();
  state.presenceByClientId.clear();
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
    channels: ["*", "clients", "jobs", "sessions", "system"]
  };
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
  getRealtimeState
};

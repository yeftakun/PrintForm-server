const {
  CLIENT_TTL_MS,
  SESSION_TTL_MS
} = require("../config");

const runtimeAuthByClientId = new Map();

function normalizeClientKey(clientId) {
  const key = String(clientId || "").trim();
  return key.length > 0 ? key : null;
}

function markClientRuntimeAuthenticated(clientId, userId) {
  const key = normalizeClientKey(clientId);
  const normalizedUserId = normalizeClientKey(userId);
  if (!key || !normalizedUserId) {
    return;
  }

  runtimeAuthByClientId.set(key, {
    userId: normalizedUserId,
    touchedAt: Date.now()
  });
}

function markClientRuntimeUnauthenticated(clientId) {
  const key = normalizeClientKey(clientId);
  if (!key) {
    return;
  }

  runtimeAuthByClientId.delete(key);
}

function isClientRuntimeAuthenticated(client) {
  const key = normalizeClientKey(client?.id);
  const ownerUserId = normalizeClientKey(client?.ownerUserId);
  if (!key || !ownerUserId) {
    return false;
  }

  const entry = runtimeAuthByClientId.get(key);
  if (!entry) {
    return false;
  }

  const maxAgeMs = Math.max(CLIENT_TTL_MS, 30 * 1000);
  if (!entry.touchedAt || Date.now() - entry.touchedAt > maxAgeMs) {
    runtimeAuthByClientId.delete(key);
    return false;
  }

  return entry.userId === ownerUserId;
}

function isClientOnline(client) {
  const cachedStatus = String(client?.status || "").toLowerCase();
  if (cachedStatus === "offline") {
    return false;
  }

  const lastSeen = new Date(client.lastSeen).getTime();
  return Number.isFinite(lastSeen) && Date.now() - lastSeen <= CLIENT_TTL_MS;
}

function isClientRecognized(client) {
  return Boolean(client?.ownerUserId);
}

function getClientReadiness(client) {
  if (!isClientOnline(client)) {
    return "offline";
  }

  if (!isClientRecognized(client)) {
    return "unowned";
  }

  return isClientRuntimeAuthenticated(client)
    ? "ready"
    : "owned";
}

function canClientAcceptJobs(client) {
  return getClientReadiness(client) === "ready";
}

function withClientStatus(client) {
  const online = isClientOnline(client);
  return {
    ...client,
    status: online ? "online" : "offline"
  };
}

function isSessionActive(session) {
  const lastSeen = new Date(session.lastSeen).getTime();
  return Number.isFinite(lastSeen) && Date.now() - lastSeen <= SESSION_TTL_MS;
}

module.exports = {
  markClientRuntimeAuthenticated,
  markClientRuntimeUnauthenticated,
  isClientOnline,
  isClientRecognized,
  isClientRuntimeAuthenticated,
  getClientReadiness,
  canClientAcceptJobs,
  withClientStatus,
  isSessionActive
};

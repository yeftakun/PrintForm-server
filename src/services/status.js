const {
  CLIENT_TTL_MS,
  SESSION_TTL_MS
} = require("../config");

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
  return isClientRecognized(client) ? "ready" : "not_ready";
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
  isClientOnline,
  isClientRecognized,
  getClientReadiness,
  canClientAcceptJobs,
  withClientStatus,
  isSessionActive
};

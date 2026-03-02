const {
  CLIENT_TTL_MS,
  SESSION_TTL_MS
} = require("../config");

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

module.exports = {
  isClientOnline,
  withClientStatus,
  pruneOfflineClients,
  isSessionActive
};

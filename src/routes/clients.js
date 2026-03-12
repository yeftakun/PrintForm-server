const express = require("express");
const {
  getClients,
  saveClients,
  updateClientOwner
} = require("../repositories/clientsRepository");
const { getPings, savePings } = require("../repositories/pingsRepository");
const {
  CLIENT_REGISTER_RATE_LIMIT_WINDOW_MS,
  CLIENT_REGISTER_RATE_LIMIT_MAX,
  CLIENT_HEARTBEAT_RATE_LIMIT_WINDOW_MS,
  CLIENT_HEARTBEAT_RATE_LIMIT_MAX,
  CLIENT_LIST_INCLUDE_UNRECOGNIZED
} = require("../config");
const {
  normalizeName,
  normalizePrinters,
  normalizeSelectedPrinter
} = require("../utils/normalize");
const { normalizeClientId, isValidClientId } = require("../utils/clientId");
const { toPublicClient } = require("../utils/publicMapper");
const {
  withClientStatus,
  markClientRuntimeAuthenticated,
  markClientRuntimeUnauthenticated
} = require("../services/status");
const { asyncHandler } = require("../utils/asyncHandler");
const { requireAuth } = require("../middleware/auth");
const { createInMemoryRateLimiter } = require("../middleware/rateLimiter");
const {
  notifyClientUpserted,
  notifyClientRemoved,
  isClientRealtimeConnected
} = require("../services/realtime");
const { getActorFromRequest, writeAuditLogSafe } = require("../services/audit");

const router = express.Router();

function getRequesterIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim().length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || "unknown";
}

function parseRequiredClientId(raw) {
  const clientId = normalizeClientId(raw);
  if (!clientId) {
    return { error: "clientId is required" };
  }
  if (!isValidClientId(clientId)) {
    return { error: "clientId must be a valid GUID/UUID" };
  }
  return { clientId };
}

function isOwnedByAnotherUser(client, user) {
  if (!client?.ownerUserId || !user) {
    return false;
  }
  return client.ownerUserId !== user.id;
}

function ensureClientOwnerMatch(req, res, client) {
  if (!client?.ownerUserId || !req.user) {
    return true;
  }

  if (!isOwnedByAnotherUser(client, req.user)) {
    return true;
  }

  res.status(403).json({ error: "Client belongs to another account" });
  return false;
}

function syncClientRuntimeAuth(client, user) {
  if (!client?.id) {
    return;
  }

  if (!client.ownerUserId) {
    markClientRuntimeUnauthenticated(client.id);
    return;
  }

  if (user?.id && user.id === client.ownerUserId) {
    markClientRuntimeAuthenticated(client.id, user.id);
    return;
  }

  markClientRuntimeUnauthenticated(client.id);
}

const registerRateLimiter = createInMemoryRateLimiter({
  windowMs: CLIENT_REGISTER_RATE_LIMIT_WINDOW_MS,
  maxRequests: CLIENT_REGISTER_RATE_LIMIT_MAX,
  keyFn: req => {
    const clientId = normalizeClientId(req.body?.clientId);
    return clientId ? `register:${clientId}` : `register-ip:${getRequesterIp(req)}`;
  },
  errorMessage: "Too many register requests"
});

const heartbeatRateLimiter = createInMemoryRateLimiter({
  windowMs: CLIENT_HEARTBEAT_RATE_LIMIT_WINDOW_MS,
  maxRequests: CLIENT_HEARTBEAT_RATE_LIMIT_MAX,
  keyFn: req => {
    const clientId = normalizeClientId(req.body?.clientId);
    return clientId ? `heartbeat:${clientId}` : `heartbeat-ip:${getRequesterIp(req)}`;
  },
  errorMessage: "Too many heartbeat requests"
});

router.get("/", asyncHandler(async (req, res) => {
  const clients = await getClients();
  let visibleClients = clients;
  if (req.user) {
    visibleClients = clients.filter(client => !client.ownerUserId || client.ownerUserId === req.user.id);
  } else if (!CLIENT_LIST_INCLUDE_UNRECOGNIZED) {
    visibleClients = clients.filter(client => Boolean(client.ownerUserId));
  }

  const payload = visibleClients.map(client => {
    const withStatusClient = withClientStatus(client);
    if (isClientRealtimeConnected(client.id)) {
      return toPublicClient({
        ...withStatusClient,
        status: "online"
      });
    }
    return toPublicClient(withStatusClient);
  });

  res.json(payload);
}));

router.post("/register", registerRateLimiter, asyncHandler(async (req, res) => {
  const name = normalizeName(req.body?.name);
  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  const parsedClientId = parseRequiredClientId(req.body?.clientId);
  if (parsedClientId.error) {
    res.status(400).json({ error: parsedClientId.error });
    return;
  }
  const { clientId } = parsedClientId;

  const printers = normalizePrinters(req.body?.printers);
  const selectedPrinter = normalizeSelectedPrinter(req.body?.selectedPrinter, printers);
  const clients = await getClients();
  const nowIso = new Date().toISOString();
  const isNewClient = !clients.some(c => c.id === clientId);

  let client = clients.find(c => c.id === clientId);
  if (client && !ensureClientOwnerMatch(req, res, client)) {
    return;
  }

  if (!client) {
    client = {
      id: clientId,
      name,
      printers,
      selectedPrinter,
      ownerUserId: null,
      createdAt: nowIso,
      lastSeen: nowIso,
      status: "online"
    };
    clients.unshift(client);
  } else {
    client.name = name;
    client.printers = printers;
    client.selectedPrinter = selectedPrinter;
    client.lastSeen = nowIso;
    client.status = "online";
  }

  syncClientRuntimeAuth(client, req.user);

  await saveClients(clients);

  const actor = getActorFromRequest(req, "client");
  await writeAuditLogSafe({
    actorType: actor.actorType,
    actorId: actor.actorId,
    action: isNewClient ? "client.registered" : "client.updated",
    targetType: "client",
    targetId: client.id,
    detail: {
      clientId: client.id,
      clientName: client.name || null
    }
  });

  notifyClientUpserted(
    toPublicClient(withClientStatus(client)),
    isNewClient ? "register-created" : "register-updated"
  );
  console.log("Client register:", client.id, client.name);

  const publicClient = toPublicClient(withClientStatus(client));
  res.json({
    ...publicClient,
    recognized: Boolean(client.ownerUserId)
  });
}));

router.post("/heartbeat", heartbeatRateLimiter, asyncHandler(async (req, res) => {
  const parsedClientId = parseRequiredClientId(req.body?.clientId);
  if (parsedClientId.error) {
    res.status(400).json({ error: parsedClientId.error });
    return;
  }
  const { clientId } = parsedClientId;

  const clients = await getClients();
  const client = clients.find(c => c.id === clientId);
  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }
  if (!ensureClientOwnerMatch(req, res, client)) {
    return;
  }

  const selectedPrinter = normalizeSelectedPrinter(req.body?.selectedPrinter, client.printers);
  if (selectedPrinter) {
    client.selectedPrinter = selectedPrinter;
  }
  client.lastSeen = new Date().toISOString();
  client.status = "online";
  syncClientRuntimeAuth(client, req.user);
  await saveClients(clients);
  notifyClientUpserted(
    toPublicClient(withClientStatus(client)),
    "heartbeat"
  );
  console.log("Client heartbeat:", client.id);
  res.json(toPublicClient(withClientStatus(client)));
}));

router.post("/:id/ping", asyncHandler(async (req, res) => {
  const parsedClientId = parseRequiredClientId(req.params.id);
  if (parsedClientId.error) {
    res.status(400).json({ error: parsedClientId.error });
    return;
  }

  const clients = await getClients();
  const client = clients.find(c => c.id === parsedClientId.clientId);
  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }
  if (!ensureClientOwnerMatch(req, res, client)) {
    return;
  }

  const pings = await getPings();
  if (!Array.isArray(pings[client.id])) {
    pings[client.id] = [];
  }

  pings[client.id].push({
    id: `ping_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString()
  });

  await savePings(pings);
  res.json({ ok: true });
}));

router.get("/:id/ping", asyncHandler(async (req, res) => {
  const parsedClientId = parseRequiredClientId(req.params.id);
  if (parsedClientId.error) {
    res.status(400).json({ error: parsedClientId.error });
    return;
  }

  const clients = await getClients();
  const client = clients.find(c => c.id === parsedClientId.clientId);
  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }
  if (!ensureClientOwnerMatch(req, res, client)) {
    return;
  }

  client.lastSeen = new Date().toISOString();
  client.status = "online";
  syncClientRuntimeAuth(client, req.user);
  await saveClients(clients);

  const pings = await getPings();
  const items = Array.isArray(pings[client.id]) ? pings[client.id] : [];
  pings[client.id] = [];
  await savePings(pings);
  console.log("Client ping poll:", client.id, "items:", items.length);
  res.json({ items });
}));

router.post("/:id/bind", requireAuth, asyncHandler(async (req, res) => {
  const parsedClientId = parseRequiredClientId(req.params.id);
  if (parsedClientId.error) {
    res.status(400).json({ error: parsedClientId.error });
    return;
  }

  const clients = await getClients();
  const client = clients.find(c => c.id === parsedClientId.clientId);
  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }

  const isAdmin = String(req.user?.role || "").toLowerCase() === "admin";
  if (client.ownerUserId && client.ownerUserId !== req.user.id && !isAdmin) {
    res.status(403).json({ error: "Client belongs to another account" });
    return;
  }

  const previousOwnerUserId = client.ownerUserId || null;
  const nextOwnerUserId = req.user.id;
  const updatedClient = await updateClientOwner(client.id, nextOwnerUserId);
  if (!updatedClient) {
    res.status(500).json({ error: "Failed to bind client" });
    return;
  }

  markClientRuntimeAuthenticated(updatedClient.id, nextOwnerUserId);

  const actor = getActorFromRequest(req, "user");
  await writeAuditLogSafe({
    actorType: actor.actorType,
    actorId: actor.actorId,
    action: "client.bound",
    targetType: "client",
    targetId: client.id,
    detail: {
      previousOwnerUserId,
      nextOwnerUserId
    }
  });

  notifyClientUpserted(
    toPublicClient(withClientStatus(updatedClient)),
    "owner-bound"
  );

  res.json({
    ok: true,
    client: toPublicClient(withClientStatus(updatedClient))
  });
}));

router.post("/:id/unbind", requireAuth, asyncHandler(async (req, res) => {
  const parsedClientId = parseRequiredClientId(req.params.id);
  if (parsedClientId.error) {
    res.status(400).json({ error: parsedClientId.error });
    return;
  }

  const clients = await getClients();
  const client = clients.find(c => c.id === parsedClientId.clientId);
  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }

  if (!client.ownerUserId) {
    res.status(409).json({ error: "Client is already unbound" });
    return;
  }

  const isAdmin = String(req.user?.role || "").toLowerCase() === "admin";
  if (client.ownerUserId !== req.user.id && !isAdmin) {
    res.status(403).json({ error: "Client belongs to another account" });
    return;
  }

  const previousOwnerUserId = client.ownerUserId;
  const updatedClient = await updateClientOwner(client.id, null);
  if (!updatedClient) {
    res.status(500).json({ error: "Failed to unbind client" });
    return;
  }

  markClientRuntimeUnauthenticated(updatedClient.id);

  const actor = getActorFromRequest(req, "user");
  await writeAuditLogSafe({
    actorType: actor.actorType,
    actorId: actor.actorId,
    action: "client.unbound",
    targetType: "client",
    targetId: client.id,
    detail: {
      previousOwnerUserId
    }
  });

  notifyClientUpserted(
    toPublicClient(withClientStatus(updatedClient)),
    "owner-unbound"
  );

  res.json({
    ok: true,
    client: toPublicClient(withClientStatus(updatedClient))
  });
}));

router.post("/unregister", asyncHandler(async (req, res) => {
  const parsedClientId = parseRequiredClientId(req.body?.clientId);
  if (parsedClientId.error) {
    res.status(400).json({ error: parsedClientId.error });
    return;
  }
  const { clientId } = parsedClientId;

  const clients = await getClients();
  const matched = clients.find(c => c.id === clientId);
  if (matched && !ensureClientOwnerMatch(req, res, matched)) {
    return;
  }

  const next = clients.filter(c => c.id !== clientId);
  const removed = clients.length - next.length;
  if (removed > 0) {
    markClientRuntimeUnauthenticated(clientId);
    await saveClients(next);

    const actor = getActorFromRequest(req, "client");
    await writeAuditLogSafe({
      actorType: actor.actorType,
      actorId: actor.actorId,
      action: "client.unregistered",
      targetType: "client",
      targetId: clientId,
      detail: {
        removed
      }
    });

    notifyClientRemoved(clientId, "unregister");
  }
  res.json({ ok: true, removed });
}));

module.exports = router;

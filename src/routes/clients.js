const express = require("express");
const { getClients, saveClients } = require("../repositories/clientsRepository");
const { getPings, savePings } = require("../repositories/pingsRepository");
const {
  CLIENT_REGISTER_RATE_LIMIT_WINDOW_MS,
  CLIENT_REGISTER_RATE_LIMIT_MAX,
  CLIENT_HEARTBEAT_RATE_LIMIT_WINDOW_MS,
  CLIENT_HEARTBEAT_RATE_LIMIT_MAX
} = require("../config");
const {
  normalizeName,
  normalizePrinters,
  normalizeSelectedPrinter
} = require("../utils/normalize");
const { normalizeClientId, isValidClientId } = require("../utils/clientId");
const { toPublicClient } = require("../utils/publicMapper");
const { withClientStatus } = require("../services/status");
const { asyncHandler } = require("../utils/asyncHandler");
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
  if (!user || !client?.ownerUserId) {
    return false;
  }
  return client.ownerUserId !== user.id;
}

function ensureClientAccess(req, res, client) {
  if (!isOwnedByAnotherUser(client, req.user)) {
    return true;
  }

  res.status(403).json({ error: "Client belongs to another account" });
  return false;
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
  const visibleClients = req.user
    ? clients.filter(client => !client.ownerUserId || client.ownerUserId === req.user.id)
    : clients;

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
  if (isOwnedByAnotherUser(client, req.user)) {
    res.status(403).json({ error: "Client belongs to another account" });
    return;
  }

  if (!client) {
    client = {
      id: clientId,
      name,
      printers,
      selectedPrinter,
      ownerUserId: req.user?.id || null,
      createdAt: nowIso,
      lastSeen: nowIso,
      status: "online"
    };
    clients.unshift(client);
  } else {
    if (!client.ownerUserId && req.user?.id) {
      client.ownerUserId = req.user.id;
    }
    client.name = name;
    client.printers = printers;
    client.selectedPrinter = selectedPrinter;
    client.lastSeen = nowIso;
    client.status = "online";
  }

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
  res.json(toPublicClient(withClientStatus(client)));
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
  if (!ensureClientAccess(req, res, client)) {
    return;
  }

  if (!client.ownerUserId && req.user?.id) {
    client.ownerUserId = req.user.id;
  }

  const selectedPrinter = normalizeSelectedPrinter(req.body?.selectedPrinter, client.printers);
  if (selectedPrinter) {
    client.selectedPrinter = selectedPrinter;
  }
  client.lastSeen = new Date().toISOString();
  client.status = "online";
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
  if (!ensureClientAccess(req, res, client)) {
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
  if (!ensureClientAccess(req, res, client)) {
    return;
  }

  if (!client.ownerUserId && req.user?.id) {
    client.ownerUserId = req.user.id;
  }

  client.lastSeen = new Date().toISOString();
  client.status = "online";
  await saveClients(clients);

  const pings = await getPings();
  const items = Array.isArray(pings[client.id]) ? pings[client.id] : [];
  pings[client.id] = [];
  await savePings(pings);
  console.log("Client ping poll:", client.id, "items:", items.length);
  res.json({ items });
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
  if (matched && !ensureClientAccess(req, res, matched)) {
    return;
  }

  const next = clients.filter(c => c.id !== clientId);
  const removed = clients.length - next.length;
  if (removed > 0) {
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

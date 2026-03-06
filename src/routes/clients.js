const express = require("express");
const { getClients, saveClients } = require("../repositories/clientsRepository");
const { getPings, savePings } = require("../repositories/pingsRepository");
const {
  normalizeName,
  normalizePrinters,
  normalizeSelectedPrinter
} = require("../utils/normalize");
const { toPublicClient } = require("../utils/publicMapper");
const { pruneOfflineClients, withClientStatus } = require("../services/status");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(async (req, res) => {
  const existing = await getClients();
  const { clients, removed } = pruneOfflineClients(existing);
  if (removed > 0) {
    await saveClients(clients);
  }
  res.json(clients.map(withClientStatus).map(toPublicClient));
}));

router.post("/register", asyncHandler(async (req, res) => {
  const name = normalizeName(req.body?.name);
  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  const printers = normalizePrinters(req.body?.printers);
  const selectedPrinter = normalizeSelectedPrinter(req.body?.selectedPrinter, printers);
  const clients = await getClients();
  const incomingId = typeof req.body?.clientId === "string" ? req.body.clientId : null;

  let client = incomingId ? clients.find(c => c.id === incomingId) : null;
  if (!client) {
    const id = incomingId || `client_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    client = {
      id,
      name,
      printers,
      selectedPrinter,
      createdAt: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    };
    clients.unshift(client);
  } else {
    client.name = name;
    client.printers = printers;
    client.selectedPrinter = selectedPrinter;
    client.lastSeen = new Date().toISOString();
  }

  const { clients: cleaned } = pruneOfflineClients(clients);
  await saveClients(cleaned);
  console.log("Client register:", client.id, client.name);
  res.json(toPublicClient(withClientStatus(client)));
}));

router.post("/heartbeat", asyncHandler(async (req, res) => {
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

  const selectedPrinter = normalizeSelectedPrinter(req.body?.selectedPrinter, client.printers);
  if (selectedPrinter) {
    client.selectedPrinter = selectedPrinter;
  }
  client.lastSeen = new Date().toISOString();
  const { clients: cleaned } = pruneOfflineClients(clients);
  await saveClients(cleaned);
  console.log("Client heartbeat:", client.id);
  res.json(toPublicClient(withClientStatus(client)));
}));

router.post("/:id/ping", asyncHandler(async (req, res) => {
  const clients = await getClients();
  const client = clients.find(c => c.id === req.params.id);
  if (!client) {
    res.status(404).json({ error: "Client not found" });
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
  const clients = await getClients();
  const client = clients.find(c => c.id === req.params.id);
  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }

  client.lastSeen = new Date().toISOString();
  const { clients: cleaned } = pruneOfflineClients(clients);
  await saveClients(cleaned);

  const pings = await getPings();
  const items = Array.isArray(pings[client.id]) ? pings[client.id] : [];
  pings[client.id] = [];
  await savePings(pings);
  console.log("Client ping poll:", client.id, "items:", items.length);
  res.json({ items });
}));

router.post("/unregister", asyncHandler(async (req, res) => {
  const clientId = typeof req.body?.clientId === "string" ? req.body.clientId : null;
  if (!clientId) {
    res.status(400).json({ error: "clientId is required" });
    return;
  }

  const clients = await getClients();
  const next = clients.filter(c => c.id !== clientId);
  const removed = clients.length - next.length;
  if (removed > 0) {
    await saveClients(next);
  }
  res.json({ ok: true, removed });
}));

module.exports = router;

const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { getClients } = require("../repositories/clientsRepository");
const { getJobs } = require("../repositories/jobsRepository");
const { listRecentAuditLogs } = require("../repositories/auditLogsRepository");
const { getUserById } = require("../repositories/usersRepository");
const { listOrdersForAdmin } = require("../services/billing");
const { getClientReadiness, withClientStatus } = require("../services/status");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

const PROBLEM_JOB_STATUSES = new Set(["canceled", "cancelled", "rejected", "failed", "error"]);
const ACTIVE_JOB_STATUSES = new Set(["pending", "queued", "sent", "claimed", "processing", "printing"]);

function requireAdmin(req, res, next) {
  if (String(req.user?.role || "").toLowerCase() !== "admin") {
    res.status(403).json({ error: "Akses admin diperlukan." });
    return;
  }

  next();
}

function toTimestamp(value) {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function isSameDay(value, now = new Date()) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return false;
  return date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate();
}

function isSameMonth(value, now = new Date()) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return false;
  return date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth();
}

function getStoreDisplayName(user, ownerUserId) {
  const config = user?.konfigurasiToko && typeof user.konfigurasiToko === "object"
    ? user.konfigurasiToko
    : {};
  const configuredName = String(config.namaToko || config.nama_toko || "").trim();
  if (configuredName) return configuredName;
  if (user?.username) return user.username;
  return `Kios-${String(ownerUserId || "unknown").slice(-6)}`;
}

async function getOwnerUserMap(ownerUserIds) {
  const userMap = new Map();
  await Promise.all(ownerUserIds.map(async ownerUserId => {
    try {
      const user = await getUserById(ownerUserId);
      if (user) {
        userMap.set(ownerUserId, user);
      }
    } catch {
      // User enrichment is optional for the summary endpoint.
    }
  }));
  return userMap;
}

async function buildKioskSummaries(clients) {
  const clientsByOwnerId = new Map();
  for (const client of clients || []) {
    if (!client?.ownerUserId) continue;
    const ownerUserId = client.ownerUserId;
    if (!clientsByOwnerId.has(ownerUserId)) {
      clientsByOwnerId.set(ownerUserId, []);
    }

    const effectiveClient = withClientStatus(client);
    clientsByOwnerId.get(ownerUserId).push({
      id: effectiveClient.id,
      name: effectiveClient.name,
      status: effectiveClient.status,
      selectedPrinter: effectiveClient.selectedPrinter || null,
      lastSeen: effectiveClient.lastSeen || null,
      readiness: getClientReadiness(effectiveClient)
    });
  }

  const ownerUserIds = [...clientsByOwnerId.keys()];
  const ownerUserMap = await getOwnerUserMap(ownerUserIds);
  const kiosks = ownerUserIds.map(ownerUserId => {
    const ownerClients = [...(clientsByOwnerId.get(ownerUserId) || [])]
      .sort((a, b) => toTimestamp(b.lastSeen) - toTimestamp(a.lastSeen));
    const readyClients = ownerClients.filter(client => client.readiness === "ready");
    const onlineClients = ownerClients.filter(client => client.status === "online");
    const readiness = readyClients.length > 0
      ? "ready"
      : onlineClients.length > 0
        ? "owned"
        : "offline";
    const ownerUser = ownerUserMap.get(ownerUserId) || null;

    return {
      id: ownerUserId,
      ownerUserId,
      displayName: getStoreDisplayName(ownerUser, ownerUserId),
      username: ownerUser?.username || null,
      email: ownerUser?.email || null,
      kodeToko: ownerUser?.kodeToko || null,
      readiness,
      canStartSession: readyClients.length > 0,
      targetClientId: readyClients[0]?.id || null,
      targetClientName: readyClients[0]?.name || null,
      clientCount: ownerClients.length,
      onlineClientCount: onlineClients.length,
      readyClientCount: readyClients.length,
      lastSeen: ownerClients[0]?.lastSeen || null
    };
  });

  return kiosks.sort((a, b) => {
    if (a.canStartSession !== b.canStartSession) {
      return a.canStartSession ? -1 : 1;
    }
    return toTimestamp(b.lastSeen) - toTimestamp(a.lastSeen);
  });
}

function buildStats({ orders, kiosks, clients, jobs }, now = new Date()) {
  const waitingPayments = orders.filter(order => order.status === "waiting_verification").length;
  const pendingPayments = orders.filter(order => order.status === "pending_payment").length;
  const paidThisMonth = orders
    .filter(order => order.status === "paid" && isSameMonth(order.createdAt, now))
    .reduce((sum, order) => sum + Number(order.totalIdr || 0), 0);
  const readyStores = kiosks.filter(kiosk => kiosk.readiness === "ready").length;
  const offlineStores = kiosks.filter(kiosk => kiosk.readiness === "offline").length;
  const onlineClients = kiosks.reduce((sum, kiosk) => sum + Number(kiosk.onlineClientCount || 0), 0);
  const readyClients = kiosks.reduce((sum, kiosk) => sum + Number(kiosk.readyClientCount || 0), 0);
  const jobsToday = jobs.filter(job => isSameDay(job.createdAt, now)).length;
  const activeJobs = jobs.filter(job => ACTIVE_JOB_STATUSES.has(String(job.status || "").toLowerCase())).length;
  const problemJobs = jobs.filter(job => PROBLEM_JOB_STATUSES.has(String(job.status || "").toLowerCase())).length;

  return {
    payments: {
      total: orders.length,
      waitingVerification: waitingPayments,
      pendingPayment: pendingPayments,
      paidThisMonth
    },
    stores: {
      total: kiosks.length,
      ready: readyStores,
      offline: offlineStores
    },
    clients: {
      total: (clients || []).filter(client => Boolean(client?.ownerUserId)).length,
      online: onlineClients,
      ready: readyClients
    },
    jobs: {
      total: jobs.length,
      today: jobsToday,
      active: activeJobs,
      problem: problemJobs
    },
    actionCount: waitingPayments + offlineStores
  };
}

function buildActionQueue({ orders, kiosks, jobs }) {
  return [
    ...orders
      .filter(order => order.status === "waiting_verification")
      .slice(0, 5)
      .map(order => ({
        id: `payment-${order.id}`,
        type: "payment",
        title: order.user?.storeName || order.user?.username || order.id,
        detail: `${order.id} · ${order.plan?.name || "Plan"} · Rp${Number(order.totalIdr || 0).toLocaleString("id-ID")}`,
        value: "Review",
        target: "adminPayments",
        priority: "high"
      })),
    ...kiosks
      .filter(kiosk => kiosk.readiness === "offline")
      .slice(0, 4)
      .map(kiosk => ({
        id: `store-${kiosk.id}`,
        type: "store",
        title: kiosk.displayName,
        detail: `${kiosk.clientCount} client terdaftar · terakhir ${kiosk.lastSeen || "-"}`,
        value: "Offline",
        target: "adminStores",
        priority: "medium"
    }))
  ].slice(0, 8);
}

function buildSignals({ stats, errors, generatedAt }) {
  return [
    {
      title: "Pembayaran",
      value: `${stats.payments.waitingVerification} menunggu review, ${stats.payments.pendingPayment} pending bayar`,
      status: stats.payments.waitingVerification > 0 ? "Perlu tindak" : "Normal"
    },
    {
      title: "Kesiapan toko",
      value: `${stats.stores.ready}/${stats.stores.total} toko siap menerima job`,
      status: stats.stores.offline > 0 ? "Perlu cek" : "Normal"
    },
    {
      title: "Client online",
      value: `${stats.clients.online}/${stats.clients.total} client online`,
      status: stats.clients.online > 0 || stats.clients.total === 0 ? "Normal" : "Perlu cek"
    },
    {
      title: "Data summary",
      value: errors.length > 0 ? `${errors.length} sumber data gagal dimuat` : `Sinkron ${generatedAt}`,
      status: errors.length > 0 ? "Perlu cek" : "Normal"
    }
  ];
}

function toRecentJob(job) {
  return {
    id: job.id,
    originalName: job.originalName || null,
    status: job.status || null,
    ownerUserId: job.ownerUserId || null,
    sessionId: job.sessionId || null,
    createdAt: job.createdAt || null,
    updatedAt: job.updatedAt || null
  };
}

async function loadDataSource(name, loader, fallback) {
  try {
    return {
      name,
      value: await loader(),
      error: null
    };
  } catch (err) {
    console.error(JSON.stringify({
      level: "warn",
      msg: "admin_summary_source_failed",
      source: name,
      error: err?.message || String(err)
    }));
    return {
      name,
      value: fallback,
      error: err?.message || "Gagal memuat data"
    };
  }
}

router.use(requireAuth);
router.use(requireAdmin);

router.get("/summary", asyncHandler(async (req, res) => {
  const generatedAt = new Date().toISOString();
  const [ordersResult, clientsResult, jobsResult, auditResult] = await Promise.all([
    loadDataSource("orders", listOrdersForAdmin, []),
    loadDataSource("clients", getClients, []),
    loadDataSource("jobs", getJobs, []),
    loadDataSource("audit", () => listRecentAuditLogs(8), [])
  ]);

  const orders = Array.isArray(ordersResult.value) ? ordersResult.value : [];
  const clients = Array.isArray(clientsResult.value) ? clientsResult.value : [];
  const jobs = Array.isArray(jobsResult.value) ? jobsResult.value : [];
  const audits = Array.isArray(auditResult.value) ? auditResult.value : [];
  const kiosks = await buildKioskSummaries(clients);
  const stats = buildStats({ orders, kiosks, clients, jobs });
  const errors = [ordersResult, clientsResult, jobsResult, auditResult]
    .filter(result => result.error)
    .map(result => ({ source: result.name, message: result.error }));

  res.json({
    generatedAt,
    stats,
    actionQueue: buildActionQueue({ orders, kiosks, jobs }),
    signals: buildSignals({ stats, errors, generatedAt }),
    recent: {
      orders: orders.slice(0, 8),
      kiosks: kiosks.slice(0, 8),
      jobs: jobs.slice(0, 8).map(toRecentJob),
      audits
    },
    errors
  });
}));

module.exports = router;

const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { getClients } = require("../repositories/clientsRepository");
const { getJobs } = require("../repositories/jobsRepository");
const { listAuditLogs, listRecentAuditLogs } = require("../repositories/auditLogsRepository");
const {
  getUserById,
  listMitraUsers,
  updateUserStoreSettings
} = require("../repositories/usersRepository");
const { listOrdersForAdmin, getCreditBalance } = require("../services/billing");
const { writeAuditLogSafe } = require("../services/audit");
const { getClientReadiness, withClientStatus } = require("../services/status");
const { summarizeOperationalSchedule } = require("../utils/storeOperational");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

const PROBLEM_JOB_STATUSES = new Set(["canceled", "cancelled", "rejected", "failed", "error"]);
const ACTIVE_JOB_STATUSES = new Set(["pending", "queued", "send", "sent", "claimed", "processing", "printing"]);

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

function normalizeBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) return true;
    if (["0", "false", "no", "off"].includes(normalized)) return false;
  }
  return fallback;
}

function getUserConfig(user) {
  return user?.konfigurasiToko && typeof user.konfigurasiToko === "object"
    ? user.konfigurasiToko
    : {};
}

function isStoreSuspended(user) {
  const config = getUserConfig(user);
  return normalizeBoolean(config.is_suspend ?? config.isSuspend ?? config.suspended, false);
}

function getStoreAddress(user) {
  return user?.alamat || "Alamat belum diatur";
}

function getStoreHours(user) {
  const config = getUserConfig(user);
  return config.jamOperasional
    || config.jam_operasional
    || summarizeOperationalSchedule(config.waktuOperasional || config.waktu_operasional);
}

function getPrinterLabel(client) {
  if (client?.selectedPrinter) {
    return String(client.selectedPrinter);
  }
  const firstPrinter = Array.isArray(client?.printers) ? client.printers[0] : null;
  if (!firstPrinter) return "-";
  if (typeof firstPrinter === "string") return firstPrinter;
  return firstPrinter.name || firstPrinter.displayName || firstPrinter.id || "-";
}

function formatFileSize(bytes) {
  const size = Number(bytes || 0);
  if (!Number.isFinite(size) || size <= 0) return "0 B";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function formatCurrencyText(value) {
  return `Rp${Number(value || 0).toLocaleString("id-ID")}`;
}

function formatPrintConfig(printConfig = {}) {
  const parts = [
    printConfig.paperSize,
    printConfig.colorMode,
    printConfig.orientation,
    printConfig.pageRange ? `Hal. ${printConfig.pageRange}` : "",
    printConfig.contentScale,
    printConfig.copies ? `${printConfig.copies} copy` : ""
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "-";
}

function toAdminClient(client) {
  const effectiveClient = withClientStatus(client);
  const readiness = getClientReadiness(effectiveClient);
  return {
    id: effectiveClient.id,
    name: effectiveClient.name || effectiveClient.id,
    status: effectiveClient.status,
    readiness,
    lastSeen: effectiveClient.lastSeen || null,
    printer: getPrinterLabel(effectiveClient),
    selectedPrinter: effectiveClient.selectedPrinter || null,
    printers: effectiveClient.printers || []
  };
}

function sortByCreatedDesc(a, b) {
  return toTimestamp(b?.createdAt) - toTimestamp(a?.createdAt);
}

function groupBy(items, keyGetter) {
  const map = new Map();
  for (const item of items || []) {
    const key = keyGetter(item);
    if (!key) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return map;
}

function normalizeListParam(value) {
  const values = Array.isArray(value) ? value : [value];
  return values
    .flatMap(item => String(item || "").split(","))
    .map(item => item.trim())
    .filter(Boolean);
}

function normalizeDateParam(value) {
  const text = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
}

function dateInputValue(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function normalizePaginationParams(query = {}) {
  const all = String(query.perPage || "").toLowerCase() === "all";
  return {
    all,
    page: Math.max(1, Number.parseInt(query.page, 10) || 1),
    perPage: all ? "all" : Math.min(Math.max(Number.parseInt(query.perPage, 10) || 20, 1), 100)
  };
}

function paginateRows(rows, query = {}) {
  const { all, page, perPage } = normalizePaginationParams(query);
  const total = rows.length;
  const totalPages = all ? 1 : Math.max(1, Math.ceil(total / perPage));
  const currentPage = all ? 1 : Math.min(page, totalPages);
  const startIndex = all ? 0 : (currentPage - 1) * perPage;
  const endIndex = all ? total : startIndex + perPage;
  return {
    items: all ? rows : rows.slice(startIndex, endIndex),
    total,
    page: currentPage,
    perPage,
    totalPages,
    all
  };
}

function getStoreReadiness(clients) {
  const readyCount = clients.filter(client => client.readiness === "ready").length;
  const onlineCount = clients.filter(client => client.status === "online").length;
  if (readyCount > 0) return "ready";
  if (onlineCount > 0) return "owned";
  return "offline";
}

function getStoreStatusLabel({ isSuspended, readiness, credit }) {
  if (isSuspended) return "Suspended";
  if (readiness === "ready") return "Aktif";
  if (readiness === "owned") return "Client belum siap";
  if (Number(credit || 0) <= 0) return "Perlu kredit";
  return "Offline";
}

function toAdminStore(user, { clients = [], jobs = [], orders = [], credit = null } = {}) {
  const adminClients = clients.map(toAdminClient).sort((a, b) => toTimestamp(b.lastSeen) - toTimestamp(a.lastSeen));
  const sortedJobs = [...jobs].sort(sortByCreatedDesc);
  const sortedOrders = [...orders].sort(sortByCreatedDesc);
  const readiness = getStoreReadiness(adminClients);
  const isSuspended = isStoreSuspended(user);
  const remainingCredits = Number(credit?.remainingCredits || 0);
  const scheduledCredits = Number(credit?.scheduledRemainingCredits || 0);
  const totalEntitledCredits = Number(credit?.totalEntitledRemainingCredits ?? remainingCredits + scheduledCredits);
  const lastOrder = sortedOrders[0]
    ? `${sortedOrders[0].plan?.name || "Order"} - ${sortedOrders[0].status}`
    : "Belum ada order";

  return {
    id: user.id,
    ownerUserId: user.id,
    name: getStoreDisplayName(user, user.id),
    username: user.username || "-",
    email: user.email || "-",
    code: user.kodeToko || "-",
    role: user.role || "mitra",
    createdAt: user.createdAt || null,
    address: getStoreAddress(user),
    operatingHours: getStoreHours(user),
    status: getStoreStatusLabel({ isSuspended, readiness, credit: remainingCredits }),
    readiness,
    is_suspend: isSuspended,
    credit: remainingCredits,
    scheduledCredit: scheduledCredits,
    totalEntitledCredit: totalEntitledCredits,
    creditBalance: credit,
    lastOrder,
    clients: adminClients,
    clientCount: adminClients.length,
    onlineClientCount: adminClients.filter(client => client.status === "online").length,
    readyClientCount: adminClients.filter(client => client.readiness === "ready").length,
    payments: sortedOrders.slice(0, 5).map(order => ({
      id: order.id,
      status: order.status,
      planName: order.plan?.name || "-",
      totalIdr: Number(order.totalIdr || 0),
      createdAt: order.createdAt || null,
      label: `${order.id} - ${order.status}`
    })),
    recentJobs: sortedJobs.slice(0, 5).map(job => ({
      id: job.id,
      status: job.status,
      originalName: job.originalName || "-",
      createdAt: job.createdAt || null,
      label: `${job.id} - ${job.status}`
    }))
  };
}

function toAdminJob(job, { ownerUserMap = new Map(), clientMap = new Map() } = {}) {
  const ownerUser = ownerUserMap.get(job.ownerUserId) || null;
  const claimedClient = clientMap.get(job.claimedByClientId) || null;
  const estimatedPrice = Number(job.printConfig?.estimatedPrice || 0);
  const updatedAt = job.updatedAt || job.claimedAt || job.createdAt || null;
  const timeline = [
    job.createdAt ? `created ${formatTime(job.createdAt)}` : "",
    job.claimedAt ? `claimed ${formatTime(job.claimedAt)}` : "",
    updatedAt ? `updated ${formatTime(updatedAt)}` : "",
    job.removedFileAt ? `file removed ${formatTime(job.removedFileAt)}` : ""
  ].filter(Boolean);

  return {
    id: job.id,
    storeId: job.ownerUserId || null,
    ownerUserId: job.ownerUserId || null,
    store: ownerUser ? getStoreDisplayName(ownerUser, ownerUser.id) : (job.ownerUserId || "-"),
    username: ownerUser?.username || "-",
    code: ownerUser?.kodeToko || "-",
    session: job.sessionId || "-",
    file: job.originalName || "-",
    fileStatus: job.fileStatus || "not-available",
    fileRemoved: Boolean(job.fileRemoved || job.fileDeleted || job.removedFileAt),
    mimeType: job.fileStatus || "-",
    sizeBytes: Number(job.size || 0),
    size: formatFileSize(job.size),
    price: estimatedPrice,
    status: job.status || "-",
    time: formatTime(job.createdAt),
    createdAt: job.createdAt || null,
    updatedAt,
    targetClientId: job.claimedByClientId || null,
    targetClient: claimedClient?.name || "-",
    printConfig: formatPrintConfig(job.printConfig),
    printConfigDetail: job.printConfig || {},
    creditUsage: job.ownerUserId ? 1 : 0,
    notes: job.notes || "",
    timeline: timeline.length ? timeline : ["Belum ada timeline"]
  };
}

function getStoreSearchText(store) {
  return [
    store.id,
    store.name,
    store.username,
    store.email,
    store.code,
    store.address,
    store.status
  ].join(" ").toLowerCase();
}

function filterAdminStores(stores, query = {}) {
  const search = String(query.search || "").trim().toLowerCase();
  const suspend = String(query.suspend || "all").trim().toLowerCase();
  const signals = new Set(normalizeListParam(query.signals || query.signal).map(item => item.toLowerCase()));

  return stores
    .filter(store => !search || getStoreSearchText(store).includes(search))
    .filter(store => {
      if (suspend === "suspended") return Boolean(store.is_suspend);
      if (suspend === "active") return !store.is_suspend;
      return true;
    })
    .filter(store => {
      if (!signals.size) return true;
      const clients = Array.isArray(store.clients) ? store.clients : [];
      const hasOnline = clients.some(client => client.status === "online");
      const hasOffline = clients.some(client => client.status !== "online");
      const noCredit = Number(store.credit || 0) <= 0;
      if (signals.has("client_online") && !hasOnline) return false;
      if (signals.has("client_offline") && !hasOffline) return false;
      if (signals.has("no_credit") && !noCredit) return false;
      return true;
    });
}

function getJobSearchText(job) {
  return [
    job.id,
    job.store,
    job.username,
    job.code,
    job.session,
    job.file,
    job.targetClient,
    job.status
  ].join(" ").toLowerCase();
}

function filterAdminJobs(jobs, query = {}) {
  const search = String(query.search || "").trim().toLowerCase();
  const statuses = new Set(normalizeListParam(query.status).map(item => {
    const normalized = item.toLowerCase();
    return normalized === "sent" ? "send" : normalized;
  }));
  const date = normalizeDateParam(query.date);

  return jobs
    .filter(job => !search || getJobSearchText(job).includes(search))
    .filter(job => {
      const status = String(job.status || "").toLowerCase();
      const normalizedStatus = status === "sent" ? "send" : status;
      return !statuses.size || statuses.has(normalizedStatus);
    })
    .filter(job => !date || dateInputValue(job.createdAt) === date);
}

async function safeListOrdersForAdmin() {
  try {
    return await listOrdersForAdmin();
  } catch (err) {
    console.warn("Admin orders enrichment failed:", err?.message || err);
    return [];
  }
}

async function safeGetCreditBalance(userId) {
  try {
    return await getCreditBalance(userId);
  } catch {
    return null;
  }
}

async function buildAdminDataContext() {
  const [users, clients, jobs, orders] = await Promise.all([
    listMitraUsers(),
    getClients(),
    getJobs(),
    safeListOrdersForAdmin()
  ]);
  const creditEntries = await Promise.all(users.map(async user => [user.id, await safeGetCreditBalance(user.id)]));
  const creditByUserId = new Map(creditEntries);
  const clientsByOwnerId = groupBy(clients, client => client.ownerUserId || null);
  const jobsByOwnerId = groupBy(jobs, job => job.ownerUserId || null);
  const ordersByUserId = groupBy(orders, order => order.userId || null);
  const userMap = new Map(users.map(user => [user.id, user]));
  const clientMap = new Map((clients || []).map(client => [client.id, toAdminClient(client)]));

  return {
    users,
    clients,
    jobs,
    orders,
    creditByUserId,
    clientsByOwnerId,
    jobsByOwnerId,
    ordersByUserId,
    userMap,
    clientMap
  };
}

function toAdminStoreFromContext(user, context) {
  return toAdminStore(user, {
    clients: context.clientsByOwnerId.get(user.id) || [],
    jobs: context.jobsByOwnerId.get(user.id) || [],
    orders: context.ordersByUserId.get(user.id) || [],
    credit: context.creditByUserId.get(user.id) || null
  });
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

router.get("/stores", asyncHandler(async (req, res) => {
  const context = await buildAdminDataContext();
  const filteredStores = filterAdminStores(
    context.users.map(user => toAdminStoreFromContext(user, context)),
    req.query
  );
  const page = paginateRows(filteredStores, req.query);
  res.json({
    stores: page.items,
    total: page.total,
    page: page.page,
    perPage: page.perPage,
    totalPages: page.totalPages,
    all: page.all
  });
}));

router.get("/stores/:id", asyncHandler(async (req, res) => {
  const context = await buildAdminDataContext();
  const user = context.userMap.get(req.params.id);
  if (!user) {
    res.status(404).json({ error: "Toko tidak ditemukan." });
    return;
  }

  res.json({ store: toAdminStoreFromContext(user, context) });
}));

router.patch("/stores/:id/suspend", asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.id);
  if (!user || String(user.role || "").toLowerCase() === "admin") {
    res.status(404).json({ error: "Toko tidak ditemukan." });
    return;
  }

  const hasExplicitValue = Object.prototype.hasOwnProperty.call(req.body || {}, "is_suspend")
    || Object.prototype.hasOwnProperty.call(req.body || {}, "isSuspend");
  const nextSuspended = hasExplicitValue
    ? normalizeBoolean(req.body?.is_suspend ?? req.body?.isSuspend, false)
    : !isStoreSuspended(user);
  const nextConfig = {
    ...getUserConfig(user),
    is_suspend: nextSuspended
  };

  await updateUserStoreSettings(user.id, {
    alamat: user.alamat || null,
    kodeToko: user.kodeToko || null,
    konfigurasiToko: nextConfig
  });

  await writeAuditLogSafe({
    actorType: "user",
    actorId: req.user.id,
    action: nextSuspended ? "admin.store.suspended" : "admin.store.unsuspended",
    targetType: "user",
    targetId: user.id,
    detail: {
      username: user.username || null,
      is_suspend: nextSuspended
    }
  });

  const context = await buildAdminDataContext();
  const updatedUser = context.userMap.get(user.id);
  res.json({ store: toAdminStoreFromContext(updatedUser, context) });
}));

router.get("/jobs", asyncHandler(async (req, res) => {
  const context = await buildAdminDataContext();
  const rows = context.jobs
    .map(job => toAdminJob(job, {
      ownerUserMap: context.userMap,
      clientMap: context.clientMap
    }))
    .sort(sortByCreatedDesc);
  const page = paginateRows(filterAdminJobs(rows, req.query), req.query);
  res.json({
    jobs: page.items,
    total: page.total,
    page: page.page,
    perPage: page.perPage,
    totalPages: page.totalPages,
    all: page.all
  });
}));

router.get("/jobs/:id", asyncHandler(async (req, res) => {
  const context = await buildAdminDataContext();
  const job = context.jobs.find(item => item.id === req.params.id);
  if (!job) {
    res.status(404).json({ error: "Job tidak ditemukan." });
    return;
  }

  res.json({
    job: toAdminJob(job, {
      ownerUserMap: context.userMap,
      clientMap: context.clientMap
    })
  });
}));

router.get("/audit", asyncHandler(async (req, res) => {
  const result = await listAuditLogs({
    page: req.query.page,
    perPage: req.query.perPage,
    search: req.query.search,
    date: req.query.date
  });

  res.json(result);
}));

module.exports = router;

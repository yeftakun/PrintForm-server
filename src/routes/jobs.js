const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsp = fs.promises;
const {
  filesDir,
  MAX_UPLOAD_BYTES,
  ALLOWED_UPLOAD_MIME_TYPES,
  ALLOWED_UPLOAD_EXTENSIONS,
  AUTO_DELETE_TERMINAL_JOB_FILES
} = require("../config");
const { getJobs, saveJobs } = require("../repositories/jobsRepository");
const { getSessions } = require("../repositories/sessionsRepository");
const { getClients } = require("../repositories/clientsRepository");
const { normalizePaperSize, normalizeCopies } = require("../utils/normalize");
const { toPublicJob } = require("../utils/publicMapper");
const { isSessionActive } = require("../services/status");
const { cleanupExpiredSessions } = require("../services/cleanup");
const { refreshStorageUsageSnapshot, getQuotaProjection } = require("../services/storageUsage");
const {
  notifyJobCreated,
  notifyJobStatusChanged,
  publishRealtimeEvent
} = require("../services/realtime");
const { getActorFromRequest, writeAuditLogSafe } = require("../services/audit");
const { asyncHandler } = require("../utils/asyncHandler");

const ALLOWED_MIME_TYPES = new Set(
  (ALLOWED_UPLOAD_MIME_TYPES || []).map(value => String(value || "").toLowerCase())
);
const ALLOWED_EXTENSIONS = new Set(
  (ALLOWED_UPLOAD_EXTENSIONS || []).map(value => {
    const normalized = String(value || "").trim().toLowerCase();
    if (!normalized) {
      return "";
    }
    return normalized.startsWith(".") ? normalized : `.${normalized}`;
  }).filter(Boolean)
);

const ALLOWED_JOB_STATUSES = new Set([
  "ready",
  "printing",
  "done",
  "pending",
  "failed",
  "rejected",
  "canceled",
  "send"
]);

const TERMINAL_JOB_STATUSES = new Set([
  "done",
  "failed",
  "rejected",
  "canceled"
]);

function isAllowedUploadFile(file) {
  const mimeType = String(file?.mimetype || "").trim().toLowerCase();
  if (mimeType && ALLOWED_MIME_TYPES.has(mimeType)) {
    return true;
  }

  const extension = path.extname(String(file?.originalname || "")).trim().toLowerCase();
  return Boolean(extension && ALLOWED_EXTENSIONS.has(extension));
}

async function removeFileSafe(filePath) {
  if (!filePath) {
    return;
  }
  await fsp.unlink(filePath).catch(() => null);
}

function isAccessibleClientForUser(client, user) {
  if (!user) {
    return true;
  }
  if (!client?.ownerUserId) {
    return true;
  }
  return client.ownerUserId === user.id;
}

async function buildAccessibleClientIdSet(user) {
  if (!user) {
    return null;
  }

  const clients = await getClients();
  const ids = clients
    .filter(client => isAccessibleClientForUser(client, user))
    .map(client => client.id);

  return new Set(ids);
}

function canAccessClientId(accessibleClientIds, clientId) {
  if (!accessibleClientIds) {
    return true;
  }
  return Boolean(clientId) && accessibleClientIds.has(clientId);
}

function getRequestSessionId(req) {
  const bodySessionId = typeof req.body?.sessionId === "string"
    ? req.body.sessionId.trim()
    : "";
  if (bodySessionId) {
    return bodySessionId;
  }

  const querySessionId = typeof req.query?.sessionId === "string"
    ? req.query.sessionId.trim()
    : "";
  if (querySessionId) {
    return querySessionId;
  }

  return null;
}

const upload = multer({
  dest: filesDir,
  limits: {
    fileSize: MAX_UPLOAD_BYTES
  },
  fileFilter: (req, file, callback) => {
    if (isAllowedUploadFile(file)) {
      callback(null, true);
      return;
    }

    const error = new Error("File type is not allowed");
    error.statusCode = 400;
    error.code = "UPLOAD_TYPE_NOT_ALLOWED";
    callback(error);
  }
});

function uploadDocument(req, res, next) {
  upload.single("document")(req, res, err => {
    if (!err) {
      next();
      return;
    }

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        res.status(413).json({ error: `File too large. Max ${MAX_UPLOAD_BYTES} bytes` });
        return;
      }
      res.status(400).json({ error: err.message || "Upload failed" });
      return;
    }

    if (err.code === "UPLOAD_TYPE_NOT_ALLOWED") {
      res.status(400).json({ error: err.message });
      return;
    }

    next(err);
  });
}

const router = express.Router();

router.get("/", asyncHandler(async (req, res) => {
  await cleanupExpiredSessions();
  let jobs = await getJobs();
  const accessibleClientIds = await buildAccessibleClientIdSet(req.user);

  if (accessibleClientIds) {
    jobs = jobs.filter(job => canAccessClientId(accessibleClientIds, job.targetClientId));
  } else {
    const guestSessionId = typeof req.query.sessionId === "string"
      ? req.query.sessionId.trim()
      : "";
    if (!guestSessionId) {
      res.json([]);
      return;
    }

    const sessions = await getSessions();
    const session = sessions.find(item => item.id === guestSessionId);
    if (!session || !isSessionActive(session)) {
      res.json([]);
      return;
    }

    jobs = jobs.filter(job => job.sessionId === guestSessionId);
  }

  if (req.query.clientId) {
    jobs = jobs.filter(job => job.targetClientId === req.query.clientId);
  }
  if (req.query.sessionId) {
    jobs = jobs.filter(job => job.sessionId === req.query.sessionId);
  }
  if (req.query.status) {
    jobs = jobs.filter(job => job.status === req.query.status);
  }
  res.json(jobs.map(toPublicJob));
}));

router.get("/:id", asyncHandler(async (req, res) => {
  await cleanupExpiredSessions();
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const jobs = await getJobs();
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const accessibleClientIds = await buildAccessibleClientIdSet(req.user);
  if (!canAccessClientId(accessibleClientIds, job.targetClientId)) {
    res.status(403).json({ error: "Client belongs to another account" });
    return;
  }

  res.json(toPublicJob(job));
}));

router.get("/:id/download", asyncHandler(async (req, res) => {
  await cleanupExpiredSessions();
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const jobs = await getJobs();
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const accessibleClientIds = await buildAccessibleClientIdSet(req.user);
  if (!canAccessClientId(accessibleClientIds, job.targetClientId)) {
    res.status(403).json({ error: "Client belongs to another account" });
    return;
  }

  try {
    await fsp.access(job.storedPath, fs.constants.F_OK);
  } catch {
    res.status(404).json({ error: "Document file is not available" });
    return;
  }

  res.download(job.storedPath, job.originalName);
}));

router.post("/:id/clone", asyncHandler(async (req, res) => {
  await cleanupExpiredSessions();
  const jobs = await getJobs();
  const sourceJob = jobs.find(j => j.id === req.params.id);
  if (!sourceJob) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const requestSessionId = getRequestSessionId(req);
  if (!req.user) {
    if (!requestSessionId) {
      res.status(400).json({ error: "sessionId is required" });
      return;
    }

    if (requestSessionId !== sourceJob.sessionId) {
      res.status(403).json({ error: "Job does not belong to the current session" });
      return;
    }
  }

  const accessibleClientIds = await buildAccessibleClientIdSet(req.user);
  if (req.user && !canAccessClientId(accessibleClientIds, sourceJob.targetClientId)) {
    res.status(403).json({ error: "Client belongs to another account" });
    return;
  }

  const sessions = await getSessions();
  const session = sessions.find(s => s.id === sourceJob.sessionId);
  if (!session || !isSessionActive(session)) {
    res.status(400).json({ error: "Session is not active" });
    return;
  }

  if (!req.user && requestSessionId && requestSessionId !== session.id) {
    res.status(403).json({ error: "Session mismatch" });
    return;
  }

  if (req.user && !canAccessClientId(accessibleClientIds, session.clientId)) {
    res.status(403).json({ error: "Client belongs to another account" });
    return;
  }

  try {
    await fsp.access(sourceJob.storedPath, fs.constants.F_OK);
  } catch {
    res.status(404).json({ error: "Source file missing" });
    return;
  }

  const sourceStat = await fsp.stat(sourceJob.storedPath);
  const sourceSize = Number(sourceJob.size) > 0 ? Number(sourceJob.size) : sourceStat.size;

  const usageBeforeClone = await refreshStorageUsageSnapshot(jobs);
  const cloneQuotaProjection = getQuotaProjection(usageBeforeClone, sourceSize);
  if (cloneQuotaProjection.quotaExceeded) {
    res.status(413).json({ error: "Server storage quota exceeded" });
    return;
  }

  const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const storedPath = path.join(filesDir, id);
  try {
    await fsp.copyFile(sourceJob.storedPath, storedPath);
  } catch {
    res.status(500).json({ error: "Failed to clone file" });
    return;
  }

  const clonedJob = {
    id,
    originalName: sourceJob.originalName,
    storedPath,
    size: sourceSize,
    createdAt: new Date().toISOString(),
    status: "ready",
    alias: sourceJob.alias || null,
    sessionId: session.id,
    targetClientId: session.clientId,
    targetClientName: session.clientName,
    printConfig: sourceJob.printConfig
  };

  try {
    jobs.unshift(clonedJob);
    await saveJobs(jobs);
    await refreshStorageUsageSnapshot(jobs);

    const actor = getActorFromRequest(req);
    await writeAuditLogSafe({
      actorType: actor.actorType,
      actorId: actor.actorId,
      action: "job.cloned",
      targetType: "job",
      targetId: clonedJob.id,
      detail: {
        sourceJobId: sourceJob.id,
        clientId: clonedJob.targetClientId || null,
        sessionId: clonedJob.sessionId || null
      }
    });

    const publicClonedJob = toPublicJob(clonedJob);
    notifyJobCreated(publicClonedJob, "clone");
    res.status(201).json(publicClonedJob);
  } catch (err) {
    await removeFileSafe(storedPath);
    throw err;
  }
}));

router.patch("/:id", asyncHandler(async (req, res) => {
  await cleanupExpiredSessions();
  const jobs = await getJobs();
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const accessibleClientIds = await buildAccessibleClientIdSet(req.user);
  if (!canAccessClientId(accessibleClientIds, job.targetClientId)) {
    res.status(403).json({ error: "Client belongs to another account" });
    return;
  }

  const { status } = req.body || {};
  if (typeof status !== "string" || status.trim().length === 0) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const normalizedStatus = status.trim().toLowerCase();
  if (!ALLOWED_JOB_STATUSES.has(normalizedStatus)) {
    res.status(400).json({ error: "Unsupported status" });
    return;
  }

  const requestSessionId = getRequestSessionId(req);
  if (!req.user) {
    if (!requestSessionId) {
      res.status(400).json({ error: "sessionId is required" });
      return;
    }

    if (requestSessionId !== job.sessionId) {
      res.status(403).json({ error: "Job does not belong to the current session" });
      return;
    }

    if (normalizedStatus !== "canceled") {
      res.status(403).json({ error: "Guest can only cancel jobs" });
      return;
    }
  }

  const previousStatus = job.status;

  const shouldDeleteDocument =
    AUTO_DELETE_TERMINAL_JOB_FILES &&
    TERMINAL_JOB_STATUSES.has(normalizedStatus) &&
    job.storedPath;

  if (shouldDeleteDocument) {
    await removeFileSafe(job.storedPath);
    publishRealtimeEvent({
      type: "job.file.removed",
      channel: "jobs",
      payload: {
        jobId: job.id,
        status: normalizedStatus,
        source: "terminal-status"
      }
    });
  }

  job.status = normalizedStatus;
  await saveJobs(jobs);
  await refreshStorageUsageSnapshot(jobs);

  const actor = getActorFromRequest(req);
  await writeAuditLogSafe({
    actorType: actor.actorType,
    actorId: actor.actorId,
    action: "job.status.changed",
    targetType: "job",
    targetId: job.id,
    detail: {
      previousStatus,
      nextStatus: normalizedStatus,
      clientId: job.targetClientId || null,
      sessionId: job.sessionId || null
    }
  });

  const publicJob = toPublicJob(job);
  notifyJobStatusChanged(publicJob, previousStatus);
  res.json(publicJob);
}));

router.post("/", uploadDocument, asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Document is required" });
    return;
  }

  const paperSize = normalizePaperSize(req.body.paperSize);
  const copies = normalizeCopies(req.body.copies);
  const sessionId = typeof req.body.sessionId === "string" ? req.body.sessionId : null;

  if (!paperSize) {
    await removeFileSafe(req.file.path);
    res.status(400).json({ error: "paperSize must be A4 or A5" });
    return;
  }
  if (!copies) {
    await removeFileSafe(req.file.path);
    res.status(400).json({ error: "copies must be 1-999" });
    return;
  }
  if (!sessionId) {
    await removeFileSafe(req.file.path);
    res.status(400).json({ error: "sessionId is required" });
    return;
  }

  await cleanupExpiredSessions();
  const sessions = await getSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session) {
    await removeFileSafe(req.file.path);
    res.status(400).json({ error: "sessionId not found" });
    return;
  }

  if (!isSessionActive(session)) {
    await removeFileSafe(req.file.path);
    res.status(400).json({ error: "Session is not active" });
    return;
  }

  const accessibleClientIds = await buildAccessibleClientIdSet(req.user);
  if (!canAccessClientId(accessibleClientIds, session.clientId)) {
    await removeFileSafe(req.file.path);
    res.status(403).json({ error: "Client belongs to another account" });
    return;
  }

  const jobs = await getJobs();
  const usageBeforeUpload = await refreshStorageUsageSnapshot(jobs);
  const uploadQuotaProjection = getQuotaProjection(usageBeforeUpload, req.file.size);
  if (uploadQuotaProjection.quotaExceeded) {
    await removeFileSafe(req.file.path);
    res.status(413).json({ error: "Server storage quota exceeded" });
    return;
  }

  const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const job = {
    id,
    originalName: req.file.originalname,
    storedPath: req.file.path,
    size: req.file.size,
    createdAt: new Date().toISOString(),
    status: "ready",
    alias: session.alias || null,
    sessionId: session.id,
    targetClientId: session.clientId,
    targetClientName: session.clientName,
    printConfig: {
      paperSize,
      copies
    }
  };

  try {
    jobs.unshift(job);
    await saveJobs(jobs);
    await refreshStorageUsageSnapshot(jobs);

    const actor = getActorFromRequest(req);
    await writeAuditLogSafe({
      actorType: actor.actorType,
      actorId: actor.actorId,
      action: "job.created",
      targetType: "job",
      targetId: job.id,
      detail: {
        clientId: job.targetClientId || null,
        sessionId: job.sessionId || null,
        originalName: job.originalName || null
      }
    });

    const publicJob = toPublicJob(job);
    notifyJobCreated(publicJob, "upload");
    res.status(201).json(publicJob);
  } catch (err) {
    await removeFileSafe(req.file.path);
    throw err;
  }
}));

module.exports = router;

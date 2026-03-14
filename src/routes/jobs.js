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

const CLAIM_GUARDED_STATUSES = new Set([
  "printing",
  "pending",
  "done",
  "failed",
  "rejected",
  "send"
]);

const jobLockQueueById = new Map();

function acquireJobLock(jobId) {
  const key = String(jobId || "").trim();
  if (!key) {
    return Promise.resolve(() => {});
  }

  return new Promise(resolve => {
    const queue = jobLockQueueById.get(key) || [];
    const release = () => {
      const activeQueue = jobLockQueueById.get(key);
      if (!activeQueue || activeQueue.length === 0) {
        return;
      }

      activeQueue.shift();
      if (activeQueue.length === 0) {
        jobLockQueueById.delete(key);
        return;
      }

      const nextResolve = activeQueue[0];
      nextResolve(release);
    };

    queue.push(resolve);
    jobLockQueueById.set(key, queue);

    if (queue.length === 1) {
      resolve(release);
    }
  });
}

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

function canAccessOwnedResource({ ownerUserId, clientId }, user, accessibleClientIds) {
  if (!user) {
    return true;
  }

  if (ownerUserId) {
    return ownerUserId === user.id;
  }

  return canAccessClientId(accessibleClientIds, clientId);
}

function canAccessSessionForUser(session, user, accessibleClientIds) {
  return canAccessOwnedResource(
    {
      ownerUserId: session?.ownerUserId || null,
      clientId: session?.clientId || null
    },
    user,
    accessibleClientIds
  );
}

function canAccessJobForUser(job, user, accessibleClientIds) {
  return canAccessOwnedResource(
    {
      ownerUserId: job?.ownerUserId || null,
      clientId: job?.targetClientId || null
    },
    user,
    accessibleClientIds
  );
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

function getRequestClientId(req) {
  const bodyClientId = typeof req.body?.clientId === "string"
    ? req.body.clientId.trim()
    : "";
  if (bodyClientId) {
    return bodyClientId;
  }

  const queryClientId = typeof req.query?.clientId === "string"
    ? req.query.clientId.trim()
    : "";
  if (queryClientId) {
    return queryClientId;
  }

  return "";
}

function getRequestOwnerUserId(req) {
  const query = req?.query || {};
  const candidates = [query.ownerUserId, query.kioskId, query.accountId];
  for (const value of candidates) {
    if (typeof value !== "string") {
      continue;
    }

    const normalized = value.trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function shouldIncludeJobInOwnerScope(job, ownerUserId, accessibleClientIds) {
  if (!ownerUserId) {
    return false;
  }

  if (job.ownerUserId) {
    return job.ownerUserId === ownerUserId;
  }

  // Legacy fallback before owner_user_id backfill is complete.
  return canAccessClientId(accessibleClientIds, job.targetClientId);
}

function filterJobsByClaimClient(jobs, claimClientId) {
  if (!claimClientId) {
    return jobs;
  }

  return jobs.filter(job => {
    const status = String(job.status || "").toLowerCase();
    if (job.claimedByClientId) {
      return job.claimedByClientId === claimClientId;
    }

    return status === "ready";
  });
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

  if (req.user) {
    const requestedOwnerUserId = getRequestOwnerUserId(req);
    const isAdmin = String(req.user?.role || "").toLowerCase() === "admin";
    const ownerScopeUserId = requestedOwnerUserId || req.user.id;

    if (requestedOwnerUserId && requestedOwnerUserId !== req.user.id && !isAdmin) {
      res.status(403).json({ error: "Kiosk belongs to another account" });
      return;
    }

    jobs = jobs.filter(job => {
      if (!canAccessJobForUser(job, req.user, accessibleClientIds)) {
        return false;
      }

      return shouldIncludeJobInOwnerScope(job, ownerScopeUserId, accessibleClientIds);
    });

    const claimClientId = getRequestClientId(req);
    jobs = filterJobsByClaimClient(jobs, claimClientId);
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
  if (!canAccessJobForUser(job, req.user, accessibleClientIds)) {
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
  if (!canAccessJobForUser(job, req.user, accessibleClientIds)) {
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
  if (req.user && !canAccessJobForUser(sourceJob, req.user, accessibleClientIds)) {
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

  if (req.user && !canAccessSessionForUser(session, req.user, accessibleClientIds)) {
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
    ownerUserId: session.ownerUserId || sourceJob.ownerUserId || null,
    claimedByClientId: null,
    claimedAt: null,
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
        ownerUserId: clonedJob.ownerUserId || null,
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
  const releaseLock = await acquireJobLock(req.params.id);
  try {
    const jobs = await getJobs();
    const job = jobs.find(j => j.id === req.params.id);
    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    const accessibleClientIds = await buildAccessibleClientIdSet(req.user);
    if (!canAccessJobForUser(job, req.user, accessibleClientIds)) {
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
    const requestClientId = getRequestClientId(req);
    const claimantClientId = requestClientId || job.targetClientId || "";
    const isClaimGuardedStatus = CLAIM_GUARDED_STATUSES.has(normalizedStatus);

    if (isClaimGuardedStatus && !claimantClientId) {
      res.status(400).json({
        error: "clientId is required for claim-guarded status updates",
        code: "JOB_CLAIM_CLIENT_REQUIRED",
        jobId: job.id
      });
      return;
    }

    if (isClaimGuardedStatus && job.status === "ready") {
      if (job.claimedByClientId && job.claimedByClientId !== claimantClientId) {
        res.status(409).json({
          error: "Job sudah di-claim oleh client lain",
          code: "JOB_ALREADY_CLAIMED",
          jobId: job.id,
          claimedByClientId: job.claimedByClientId
        });
        return;
      }

      if (!job.claimedByClientId) {
        job.claimedByClientId = claimantClientId;
        job.claimedAt = new Date().toISOString();
      }
    }

    if (isClaimGuardedStatus && job.claimedByClientId && claimantClientId && job.claimedByClientId !== claimantClientId) {
      res.status(409).json({
        error: "Job sedang diproses oleh client lain",
        code: "JOB_CLAIM_CONFLICT",
        jobId: job.id,
        claimedByClientId: job.claimedByClientId
      });
      return;
    }

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
    if (normalizedStatus === "ready") {
      job.claimedByClientId = null;
      job.claimedAt = null;
    }

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
        ownerUserId: job.ownerUserId || null,
        claimedByClientId: job.claimedByClientId || null,
        requestClientId: requestClientId || null,
        sessionId: job.sessionId || null
      }
    });

    const publicJob = toPublicJob(job);
    notifyJobStatusChanged(publicJob, previousStatus);
    res.json(publicJob);
  } finally {
    releaseLock();
  }
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
  if (!canAccessSessionForUser(session, req.user, accessibleClientIds)) {
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
    ownerUserId: session.ownerUserId || null,
    claimedByClientId: null,
    claimedAt: null,
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
        ownerUserId: job.ownerUserId || null,
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

const fs = require("fs");
const path = require("path");
const fsp = fs.promises;
const { secureDelete } = require("../utils/secureDelete");
const {
  filesDir,
  ORPHAN_GRACE_MS,
  CLIENT_RETENTION_MS,
  useDb
} = require("../config");
const { getJobs, saveJobs } = require("../repositories/jobsRepository");
const { getSessions, saveSessions } = require("../repositories/sessionsRepository");
const { getClients, saveClients, deleteClientsByIds } = require("../repositories/clientsRepository");
const { isSessionActive } = require("./status");
const { refreshStorageUsageSnapshot } = require("./storageUsage");
const { notifyClientRemoved, notifyJobStatusChanged, publishRealtimeEvent } = require("./realtime");
const { toPublicJob } = require("../utils/publicMapper");
const { query } = require("../db");

function isWaitingJobStatus(status) {
  const normalized = String(status || "").toLowerCase();
  return normalized === "ready" || normalized === "pending" || normalized === "send";
}

function markJobFileRemoved(job, removedAt) {
  if (!job) {
    return;
  }

  if (isWaitingJobStatus(job.status)) {
    job.status = "canceled";
  }
  job.fileDeleted = true;
  job.fileRemoved = true;
  job.removedFileAt = job.removedFileAt || removedAt;
  job.fileStatus = "not-available";
}

async function removeJobFiles(jobs, shouldRemove, source) {
  const removedAt = new Date().toISOString();
  const removedJobIds = [];

  for (const job of jobs) {
    if (!shouldRemove(job)) {
      continue;
    }

    if (!job.fileDeleted && job.storedPath) {
      await secureDelete(job.storedPath);
      removedJobIds.push(job.id);
      publishRealtimeEvent({
        type: "job.file.removed",
        channel: "jobs",
        payload: {
          jobId: job.id,
          status: job.status || null,
          source
        }
      });
    }

    markJobFileRemoved(job, removedAt);
  }

  return removedJobIds;
}

function cancelWaitingJobsForInactiveSessions(jobs, inactiveSessionIds) {
  const canceledJobs = [];

  for (const job of jobs) {
    if (!inactiveSessionIds.has(job.sessionId) || !isWaitingJobStatus(job.status)) {
      continue;
    }

    const previousStatus = job.status;
    job.status = "canceled";
    canceledJobs.push({ job, previousStatus });
  }

  return canceledJobs;
}

async function cleanupExpiredSessions() {
  const sessions = await getSessions();
  if (sessions.length === 0) {
    return { removedSessions: 0, removedJobs: 0, canceledJobs: 0 };
  }

  const expiredIds = new Set(
    sessions
      .filter(s => String(s.status || "active").toLowerCase() === "active" && !isSessionActive(s))
      .map(s => s.id)
  );
  const inactiveIds = new Set(
    sessions
      .filter(s => !isSessionActive(s))
      .map(s => s.id)
  );
  if (inactiveIds.size === 0) {
    return { removedSessions: 0, removedJobs: 0, canceledJobs: 0 };
  }

  const expiredAt = new Date().toISOString();
  for (const session of sessions) {
    if (expiredIds.has(session.id) && String(session.status || "active").toLowerCase() === "active") {
      session.status = "expired";
      session.lastSeen = session.lastSeen || expiredAt;
    }
  }

  const jobs = await getJobs();
  const removedJobIds = await removeJobFiles(
    jobs,
    job => expiredIds.has(job.sessionId),
    "session-expired"
  );
  const canceledJobs = cancelWaitingJobsForInactiveSessions(jobs, inactiveIds);

  if (expiredIds.size > 0) {
    await cleanupPreviewFilesBySessionIds([...expiredIds]);
  }

  if (expiredIds.size > 0 || removedJobIds.length > 0 || canceledJobs.length > 0) {
    await saveJobs(jobs);
    await saveSessions(sessions);
    await refreshStorageUsageSnapshot(jobs);
  }

  for (const { job, previousStatus } of canceledJobs) {
    notifyJobStatusChanged(toPublicJob(job), previousStatus);
  }

  if (expiredIds.size > 0) {
    publishRealtimeEvent({
      type: "sessions.expired",
      channel: "sessions",
      payload: {
        sessionIds: [...expiredIds]
      }
    });
  }

  return {
    removedSessions: expiredIds.size,
    removedJobs: removedJobIds.length,
    canceledJobs: canceledJobs.length
  };
}

async function cleanupPreviewFilesBySessionIds(sessionIds) {
  const normalizedSessionIds = [...new Set(
    (sessionIds || [])
      .map(sessionId => String(sessionId || "").trim())
      .filter(Boolean)
  )];

  if (normalizedSessionIds.length === 0 || !useDb) {
    return { removedFiles: 0 };
  }

  try {
    const res = await query(
      "SELECT stored_name FROM preview_files WHERE session_id = ANY($1)",
      [normalizedSessionIds]
    );

    const storedNames = (res.rows || [])
      .map(row => String(row.stored_name || "").trim())
      .filter(Boolean);

    const deleteQueue = storedNames.map(fileName => path.join(filesDir, fileName));

    await Promise.all(deleteQueue.map(filePath => secureDelete(filePath)));

    // Hard-delete DB records after physical files are removed.
    if (storedNames.length > 0) {
      await query(
        "DELETE FROM preview_files WHERE stored_name = ANY($1)",
        [storedNames]
      );
    }

    return { removedFiles: storedNames.length };
  } catch (err) {
    console.error("Failed to cleanup preview files by session:", err?.message || err);
    return { removedFiles: 0 };
  }
}

async function cleanupOrphanFiles() {
  const jobs = await getJobs();
  const jobFiles = new Set(
    jobs
      .map(job => job.storedPath)
      .filter(Boolean)
      .map(filePath => path.basename(filePath))
  );

  // If database is enabled, fetch active preview_files to protect them from deletion
  const previewProtected = new Set();
  if (useDb) {
    try {
      const res = await query("SELECT stored_name, expires_at FROM preview_files");
      const nowTs = Date.now();
      for (const row of res.rows || []) {
        const name = row.stored_name;
        if (!name) continue;
        if (row.expires_at) {
          const exp = new Date(row.expires_at).getTime();
          if (!Number.isFinite(exp) || exp <= nowTs) {
            // expired -> not protected
            continue;
          }
        }
        previewProtected.add(name);
      }
    } catch (err) {
      // On DB failure, fall back to legacy behavior
      console.error("Failed to load preview_files for cleanup:", err?.message || err);
    }
  }

  let entries = [];
  try {
    entries = await fsp.readdir(filesDir, { withFileTypes: true });
  } catch {
    return { removedFiles: 0 };
  }

  const now = Date.now();
  let removedFiles = 0;
  const deletedFileNames = [];

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }
    if (entry.name === ".gitkeep") {
      continue;
    }
    // Legacy behavior: protect preview_* files when DB mode is not enabled
    if (!useDb && entry.name.startsWith("preview_")) {
      continue;
    }
    if (jobFiles.has(entry.name)) {
      continue;
    }
    if (previewProtected.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(filesDir, entry.name);
    try {
      const stat = await fsp.stat(fullPath);
      const ageMs = now - stat.mtimeMs;
      if (ageMs < ORPHAN_GRACE_MS) {
        continue;
      }

      await secureDelete(fullPath);
      deletedFileNames.push(entry.name);
      removedFiles += 1;
    } catch {
      // File mungkin sudah dihapus atau tidak bisa diakses
    }
  }

  // Hard-delete any preview_files DB records whose physical file was just removed.
  if (useDb && deletedFileNames.length > 0) {
    await query(
      "DELETE FROM preview_files WHERE stored_name = ANY($1)",
      [deletedFileNames]
    ).catch(err => {
      console.error("Failed to delete orphaned preview_files rows:", err?.message || err);
    });
  }

  return { removedFiles };
}

async function cleanupStaleClients() {
  const clients = await getClients();
  if (!clients.length) return { removedClients: 0, removedSessions: 0, removedJobs: 0 };

  const sessions = await getSessions();
  const jobs = await getJobs();

  const threshold = Date.now() - CLIENT_RETENTION_MS;
  const stale = clients.filter(c => {
    const seen = new Date(c.lastSeen).getTime();
    return Number.isFinite(seen) && seen < threshold;
  });

  if (stale.length === 0) {
    return { removedClients: 0, removedSessions: 0, removedJobs: 0 };
  }

  const staleIds = new Set(stale.map(c => c.id));

  const staleSessionIds = sessions.filter(s => staleIds.has(s.clientId)).map(s => s.id);
  const staleSessionIdSet = new Set(staleSessionIds);
  const removedJobIds = await removeJobFiles(
    jobs,
    job => staleSessionIdSet.has(job.sessionId),
    "client-retention-cleanup"
  );

  const closedAt = new Date().toISOString();
  for (const session of sessions) {
    if (staleSessionIdSet.has(session.id) && String(session.status || "active").toLowerCase() === "active") {
      session.status = "expired";
      session.lastSeen = session.lastSeen || closedAt;
    }
  }

  if (useDb) {
    if (staleSessionIds.length > 0) {
      await cleanupPreviewFilesBySessionIds(staleSessionIds);
    }
    await deleteClientsByIds([...staleIds]);
    await saveSessions(sessions);
    await saveJobs(jobs);
    await refreshStorageUsageSnapshot(jobs);
  } else {
    const keepClients = clients.filter(c => !staleIds.has(c.id));
    await saveClients(keepClients);
    await saveSessions(sessions);
    await saveJobs(jobs);
    await refreshStorageUsageSnapshot(jobs);
  }

  for (const clientId of staleIds) {
    notifyClientRemoved(clientId, "retention-cleanup");
  }

  return {
    removedClients: staleIds.size,
    removedSessions: staleSessionIds.length,
    removedJobs: removedJobIds.length
  };
}

module.exports = {
  cleanupExpiredSessions,
  cleanupPreviewFilesBySessionIds,
  cleanupOrphanFiles,
  cleanupStaleClients
};

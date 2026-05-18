const path = require("path");
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
const { notifyJobsRemoved, notifyClientRemoved, publishRealtimeEvent } = require("./realtime");
const { query } = require("../db");

async function cleanupExpiredSessions() {
  const sessions = await getSessions();
  if (sessions.length === 0) {
    return { removedSessions: 0, removedJobs: 0 };
  }

  const activeSessions = sessions.filter(isSessionActive);
  const expiredIds = new Set(sessions.filter(s => !isSessionActive(s)).map(s => s.id));
  if (expiredIds.size === 0) {
    return { removedSessions: 0, removedJobs: 0 };
  }

  const jobs = await getJobs();
  const remainingJobs = [];
  const deleteQueue = [];
  const removedJobIds = [];

  for (const job of jobs) {
    if (expiredIds.has(job.sessionId)) {
      removedJobIds.push(job.id);
      if (job.storedPath) {
        deleteQueue.push(job.storedPath);
      }
    } else {
      remainingJobs.push(job);
    }
  }

  await Promise.all(
    deleteQueue.map(filePath => secureDelete(filePath))
  );
  await cleanupPreviewFilesBySessionIds([...expiredIds]);
  await saveJobs(remainingJobs);
  await saveSessions(activeSessions);
  await refreshStorageUsageSnapshot(remainingJobs);

  if (removedJobIds.length > 0) {
    notifyJobsRemoved(removedJobIds, "session-expired");
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

  return { removedSessions: expiredIds.size, removedJobs: jobs.length - remainingJobs.length };
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
      "SELECT stored_name FROM preview_files WHERE session_id = ANY($1) AND deleted = false",
      [normalizedSessionIds]
    );

    const deleteQueue = (res.rows || [])
      .map(row => String(row.stored_name || "").trim())
      .filter(Boolean)
      .map(fileName => path.join(filesDir, fileName));

    await Promise.all(deleteQueue.map(filePath => secureDelete(filePath)));
    return { removedFiles: deleteQueue.length };
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
      const res = await query("SELECT stored_name, deleted, expires_at FROM preview_files WHERE deleted = false");
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
      removedFiles += 1;
    } catch {
      // File mungkin sudah dihapus atau tidak bisa diakses
    }
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
  const staleJobIds = new Set(
    jobs
      .filter(j => staleSessionIds.includes(j.sessionId))
      .map(j => j.id)
  );

  if (useDb) {
    if (staleSessionIds.length > 0) {
      await cleanupPreviewFilesBySessionIds(staleSessionIds);
      // jobs tied to sessions will cascade on session delete
      await query("DELETE FROM sessions WHERE id = ANY($1)", [staleSessionIds]);
    }
    await deleteClientsByIds([...staleIds]);
    const currentJobs = await getJobs();
    await refreshStorageUsageSnapshot(currentJobs);
  } else {
    const keepClients = clients.filter(c => !staleIds.has(c.id));
    const keepSessions = sessions.filter(s => !staleIds.has(s.clientId));
    const keepJobs = jobs.filter(j => !staleSessionIds.includes(j.sessionId));
    await saveClients(keepClients);
    await saveSessions(keepSessions);
    await saveJobs(keepJobs);
    await refreshStorageUsageSnapshot(keepJobs);
  }

  for (const clientId of staleIds) {
    notifyClientRemoved(clientId, "retention-cleanup");
  }

  return {
    removedClients: staleIds.size,
    removedSessions: staleSessionIds.length,
    removedJobs: staleJobIds.size
  };
}

module.exports = {
  cleanupExpiredSessions,
  cleanupPreviewFilesBySessionIds,
  cleanupOrphanFiles,
  cleanupStaleClients
};

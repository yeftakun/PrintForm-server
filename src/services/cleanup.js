const fs = require("fs");
const path = require("path");
const fsp = fs.promises;
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

  for (const job of jobs) {
    if (expiredIds.has(job.sessionId)) {
      if (job.storedPath) {
        deleteQueue.push(job.storedPath);
      }
    } else {
      remainingJobs.push(job);
    }
  }

  await Promise.all(
    deleteQueue.map(filePath => fsp.unlink(filePath).catch(() => null))
  );
  await saveJobs(remainingJobs);
  await saveSessions(activeSessions);

  return { removedSessions: expiredIds.size, removedJobs: jobs.length - remainingJobs.length };
}

async function cleanupOrphanFiles() {
  const jobs = await getJobs();
  const jobFiles = new Set(
    jobs
      .map(job => job.storedPath)
      .filter(Boolean)
      .map(filePath => path.basename(filePath))
  );

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
    if (jobFiles.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(filesDir, entry.name);
    try {
      const stat = await fsp.stat(fullPath);
      const ageMs = now - stat.mtimeMs;
      if (ageMs < ORPHAN_GRACE_MS) {
        continue;
      }

      await fsp.unlink(fullPath);
      removedFiles += 1;
    } catch {
      // File mungkin sudah dihapus atau tidak bisa diakses
    }
  }

  return { removedFiles };
}

async function cleanupStaleClients() {
  const clients = await getClients();
  if (!clients.length) return { removedClients: 0 };

  const sessions = await getSessions();
  const jobs = await getJobs();

  const referenced = new Set();
  for (const s of sessions) {
    if (s.clientId) referenced.add(s.clientId);
  }
  for (const j of jobs) {
    if (j.targetClientId) referenced.add(j.targetClientId);
  }

  const threshold = Date.now() - CLIENT_RETENTION_MS;
  const stale = clients.filter(c => {
    const seen = new Date(c.lastSeen).getTime();
    return Number.isFinite(seen) && seen < threshold && !referenced.has(c.id);
  });

  if (stale.length === 0) {
    return { removedClients: 0 };
  }

  if (useDb) {
    await deleteClientsByIds(stale.map(c => c.id));
  } else {
    const staleSet = new Set(stale.map(c => c.id));
    const remaining = clients.filter(c => !staleSet.has(c.id));
    await saveClients(remaining);
  }

  return { removedClients: stale.length };
}

module.exports = {
  cleanupExpiredSessions,
  cleanupOrphanFiles,
  cleanupStaleClients
};

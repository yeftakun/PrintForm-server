const fs = require("fs");
const path = require("path");
const fsp = fs.promises;
const {
  filesDir,
  ORPHAN_GRACE_MS
} = require("../config");
const { getJobs, saveJobs } = require("../repositories/jobsRepository");
const { getSessions, saveSessions } = require("../repositories/sessionsRepository");
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

module.exports = {
  cleanupExpiredSessions,
  cleanupOrphanFiles
};

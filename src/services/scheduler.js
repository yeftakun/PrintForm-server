const {
  SESSION_CLEANUP_INTERVAL_MS,
  FILE_CLEANUP_INTERVAL_MS,
  RETENTION_CLEANUP_INTERVAL_MS
} = require("../config");
const {
  cleanupExpiredSessions,
  cleanupOrphanFiles,
  cleanupStaleClients
} = require("./cleanup");

let schedulerState = null;

function logTaskError(taskName, err) {
  const message = err && err.message ? err.message : String(err);
  console.warn(`[scheduler] ${taskName} failed: ${message}`);
}

async function runTask(taskName, taskFn) {
  try {
    await taskFn();
  } catch (err) {
    logTaskError(taskName, err);
  }
}

function startTaskLoop(taskName, taskFn, intervalMs) {
  const normalizedIntervalMs = Number(intervalMs) > 0 ? Number(intervalMs) : 1000;
  return setInterval(() => {
    runTask(taskName, taskFn);
  }, normalizedIntervalMs);
}

async function runBootstrapTasks() {
  await Promise.all([
    runTask("cleanup-expired-sessions", cleanupExpiredSessions),
    runTask("cleanup-orphan-files", cleanupOrphanFiles),
    runTask("cleanup-stale-clients", cleanupStaleClients)
  ]);
}

function startInternalScheduler({ runOnStart = true } = {}) {
  if (schedulerState) {
    return schedulerState;
  }

  const intervals = [
    startTaskLoop("cleanup-expired-sessions", cleanupExpiredSessions, SESSION_CLEANUP_INTERVAL_MS),
    startTaskLoop("cleanup-orphan-files", cleanupOrphanFiles, FILE_CLEANUP_INTERVAL_MS),
    startTaskLoop("cleanup-stale-clients", cleanupStaleClients, RETENTION_CLEANUP_INTERVAL_MS)
  ];

  schedulerState = {
    intervals
  };

  if (runOnStart) {
    void runBootstrapTasks();
  }

  return schedulerState;
}

function stopInternalScheduler() {
  if (!schedulerState) {
    return;
  }

  for (const intervalId of schedulerState.intervals) {
    clearInterval(intervalId);
  }

  schedulerState = null;
}

module.exports = {
  startInternalScheduler,
  stopInternalScheduler
};

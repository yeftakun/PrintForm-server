const { createApp } = require("./src/app");
const { ensureStorage } = require("./src/storage/jsonStore");
const { port, FILE_CLEANUP_INTERVAL_MS, RETENTION_CLEANUP_INTERVAL_MS } = require("./src/config");
const {
  cleanupExpiredSessions,
  cleanupOrphanFiles,
  cleanupStaleClients
} = require("./src/services/cleanup");
const { getJobs } = require("./src/repositories/jobsRepository");
const { refreshStorageUsageSnapshot } = require("./src/services/storageUsage");

ensureStorage()
  .then(() => {
    const app = createApp();

    getJobs()
      .then(jobs => refreshStorageUsageSnapshot(jobs))
      .catch(err => {
        console.warn("Storage usage snapshot init failed:", err.message);
      });

    app.listen(port, () => {
      console.log(`PrintForm server running on http://localhost:${port}`);
    });

    setInterval(() => {
      cleanupExpiredSessions().catch(err => {
        console.warn("Cleanup sessions failed:", err.message);
      });
    }, 10000);

    setInterval(() => {
      cleanupOrphanFiles().catch(err => {
        console.warn("Cleanup orphan files failed:", err.message);
      });
    }, FILE_CLEANUP_INTERVAL_MS);

    setInterval(() => {
      cleanupStaleClients().catch(err => {
        console.warn("Cleanup stale clients failed:", err.message);
      });
    }, RETENTION_CLEANUP_INTERVAL_MS);
  })
  .catch(err => {
    console.error("Failed to initialize storage:", err);
    process.exit(1);
  });

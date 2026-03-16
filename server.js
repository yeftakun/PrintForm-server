const http = require("http");
const { createApp } = require("./src/app");
const { ensureStorage } = require("./src/storage/jsonStore");
const { port } = require("./src/config");
const { getJobs } = require("./src/repositories/jobsRepository");
const { refreshStorageUsageSnapshot } = require("./src/services/storageUsage");
const { initializeRealtime, shutdownRealtime } = require("./src/services/realtime");
const { startInternalScheduler, stopInternalScheduler } = require("./src/services/scheduler");

ensureStorage()
  .then(() => {
    const app = createApp();
    const server = http.createServer(app);

    initializeRealtime(server);

    getJobs()
      .then(jobs => refreshStorageUsageSnapshot(jobs))
      .catch(err => {
        console.warn("Storage usage snapshot init failed:", err.message);
      });

    server.listen(port, () => {
      console.log(`PrintForm server running on http://localhost:${port}`);
    });

    startInternalScheduler({ runOnStart: true });

    const shutdownHandler = () => {
      stopInternalScheduler();
      shutdownRealtime();
      server.close(() => {
        process.exit(0);
      });
    };

    process.once("SIGINT", shutdownHandler);
    process.once("SIGTERM", shutdownHandler);
  })
  .catch(err => {
    console.error("Failed to initialize storage:", err);
    process.exit(1);
  });

const { createApp } = require("./src/app");
const { ensureStorage } = require("./src/storage/jsonStore");
const { port, FILE_CLEANUP_INTERVAL_MS } = require("./src/config");
const {
  cleanupExpiredSessions,
  cleanupOrphanFiles
} = require("./src/services/cleanup");

ensureStorage()
  .then(() => {
    const app = createApp();

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
  })
  .catch(err => {
    console.error("Failed to initialize storage:", err);
    process.exit(1);
  });

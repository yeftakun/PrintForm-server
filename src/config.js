const path = require("path");

const port = process.env.PORT || 3000;
const rootDir = path.join(__dirname, "..");

const storageDir = path.join(rootDir, "storage");
const filesDir = path.join(storageDir, "files");
const jobsFile = path.join(storageDir, "jobs.json");
const clientsFile = path.join(storageDir, "clients.json");
const pingsFile = path.join(storageDir, "pings.json");
const sessionsFile = path.join(storageDir, "sessions.json");

const CLIENT_TTL_MS = 2 * 60 * 1000;
const SESSION_TTL_MS = 30 * 1000;
const ORPHAN_GRACE_MS = 2 * 60 * 1000;
const FILE_CLEANUP_INTERVAL_MS = 60 * 1000;

module.exports = {
  port,
  rootDir,
  storageDir,
  filesDir,
  jobsFile,
  clientsFile,
  pingsFile,
  sessionsFile,
  CLIENT_TTL_MS,
  SESSION_TTL_MS,
  ORPHAN_GRACE_MS,
  FILE_CLEANUP_INTERVAL_MS
};

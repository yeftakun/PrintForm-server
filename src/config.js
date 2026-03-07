const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const port = Number(process.env.PORT) || 3000;
const rootDir = path.join(__dirname, "..");
const useDb = process.env.USE_DB === "true";
const databaseUrl = process.env.DATABASE_URL || "";

const storageDir = process.env.STORAGE_DIR || path.join(rootDir, "storage");
const filesDir = path.join(storageDir, "files");
const jobsFile = path.join(storageDir, "jobs.json");
const clientsFile = path.join(storageDir, "clients.json");
const pingsFile = path.join(storageDir, "pings.json");
const sessionsFile = path.join(storageDir, "sessions.json");

const CLIENT_TTL_MS = Number(process.env.CLIENT_TTL_MS) || 2 * 60 * 1000;
const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS) || 30 * 1000;
const ORPHAN_GRACE_MS = Number(process.env.ORPHAN_GRACE_MS) || 2 * 60 * 1000;
const FILE_CLEANUP_INTERVAL_MS = Number(process.env.FILE_CLEANUP_INTERVAL_MS) || 60 * 1000;
const FILE_QUOTA_BYTES = Number(process.env.FILE_QUOTA_BYTES) || 1_073_741_824; // default 1GB
const CLIENT_RETENTION_DAYS = Number(process.env.CLIENT_RETENTION_DAYS) || 30;
const CLIENT_RETENTION_MS = CLIENT_RETENTION_DAYS * 1000;
const RETENTION_CLEANUP_INTERVAL_MS = Number(process.env.RETENTION_CLEANUP_INTERVAL_MS) || 6 * 60 * 60 * 1000;
// const CLIENT_RETENTION_MS = CLIENT_RETENTION_DAYS * 24 * 60 * 60 * 1000;
// const RETENTION_CLEANUP_INTERVAL_MS = Number(process.env.RETENTION_CLEANUP_INTERVAL_MS) || 6 * 60 * 60 * 1000; // default 6h

module.exports = {
  port,
  rootDir,
  storageDir,
  filesDir,
  jobsFile,
  clientsFile,
  pingsFile,
  sessionsFile,
  useDb,
  databaseUrl,
  CLIENT_TTL_MS,
  SESSION_TTL_MS,
  ORPHAN_GRACE_MS,
  FILE_CLEANUP_INTERVAL_MS,
  FILE_QUOTA_BYTES,
  CLIENT_RETENTION_DAYS,
  CLIENT_RETENTION_MS,
  RETENTION_CLEANUP_INTERVAL_MS
};

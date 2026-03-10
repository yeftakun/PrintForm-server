const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

function parseCsvList(value, fallback) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return fallback;
  }
  const items = value
    .split(",")
    .map(item => item.trim().toLowerCase())
    .filter(Boolean);
  return items.length > 0 ? items : fallback;
}

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
const SESSION_CREATE_CONFIRM_TIMEOUT_MS = Number(process.env.SESSION_CREATE_CONFIRM_TIMEOUT_MS) || 6500;
const SESSION_CREATE_CONFIRM_POLL_INTERVAL_MS = Number(process.env.SESSION_CREATE_CONFIRM_POLL_INTERVAL_MS) || 300;
const ORPHAN_GRACE_MS = Number(process.env.ORPHAN_GRACE_MS) || 2 * 60 * 1000;
const FILE_CLEANUP_INTERVAL_MS = Number(process.env.FILE_CLEANUP_INTERVAL_MS) || 60 * 1000;
const FILE_QUOTA_BYTES = Number(process.env.FILE_QUOTA_BYTES) || 1_073_741_824; // default 1GB
const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_BYTES) || 25 * 1024 * 1024; // default 25MB
const ALLOWED_UPLOAD_MIME_TYPES = parseCsvList(process.env.ALLOWED_UPLOAD_MIME_TYPES, [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);
const ALLOWED_UPLOAD_EXTENSIONS = parseCsvList(process.env.ALLOWED_UPLOAD_EXTENSIONS, [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".txt",
  ".doc",
  ".docx"
]);
const AUTO_DELETE_TERMINAL_JOB_FILES = process.env.AUTO_DELETE_TERMINAL_JOB_FILES !== "false";
const CLIENT_RETENTION_DAYS = Number(process.env.CLIENT_RETENTION_DAYS) || 30;

// Test set
// const CLIENT_RETENTION_MS = CLIENT_RETENTION_DAYS * 1000; // sementara sec
// const RETENTION_CLEANUP_INTERVAL_MS = Number(process.env.RETENTION_CLEANUP_INTERVAL_MS) || 6 * 60 * 60 * 1000;

// Default set
const CLIENT_RETENTION_MS = CLIENT_RETENTION_DAYS * 24 * 60 * 60 * 1000;
const RETENTION_CLEANUP_INTERVAL_MS = Number(process.env.RETENTION_CLEANUP_INTERVAL_MS) || 6 * 60 * 60 * 1000;
const CLIENT_REGISTER_RATE_LIMIT_WINDOW_MS = Number(process.env.CLIENT_REGISTER_RATE_LIMIT_WINDOW_MS) || 60 * 1000;
const CLIENT_REGISTER_RATE_LIMIT_MAX = Number(process.env.CLIENT_REGISTER_RATE_LIMIT_MAX) || 20;
const CLIENT_HEARTBEAT_RATE_LIMIT_WINDOW_MS = Number(process.env.CLIENT_HEARTBEAT_RATE_LIMIT_WINDOW_MS) || 60 * 1000;
const CLIENT_HEARTBEAT_RATE_LIMIT_MAX = Number(process.env.CLIENT_HEARTBEAT_RATE_LIMIT_MAX) || 120;
const REALTIME_PATH = process.env.REALTIME_PATH || "/ws";
const REALTIME_PRESENCE_SYNC_INTERVAL_MS = Number(process.env.REALTIME_PRESENCE_SYNC_INTERVAL_MS) || 5 * 1000;
const REALTIME_PING_INTERVAL_MS = Number(process.env.REALTIME_PING_INTERVAL_MS) || 30 * 1000;
const REALTIME_CLIENT_OFFLINE_GRACE_MS = Number(process.env.REALTIME_CLIENT_OFFLINE_GRACE_MS) || 1500;

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
  SESSION_CREATE_CONFIRM_TIMEOUT_MS,
  SESSION_CREATE_CONFIRM_POLL_INTERVAL_MS,
  ORPHAN_GRACE_MS,
  FILE_CLEANUP_INTERVAL_MS,
  FILE_QUOTA_BYTES,
  MAX_UPLOAD_BYTES,
  ALLOWED_UPLOAD_MIME_TYPES,
  ALLOWED_UPLOAD_EXTENSIONS,
  AUTO_DELETE_TERMINAL_JOB_FILES,
  CLIENT_RETENTION_DAYS,
  CLIENT_RETENTION_MS,
  RETENTION_CLEANUP_INTERVAL_MS,
  CLIENT_REGISTER_RATE_LIMIT_WINDOW_MS,
  CLIENT_REGISTER_RATE_LIMIT_MAX,
  CLIENT_HEARTBEAT_RATE_LIMIT_WINDOW_MS,
  CLIENT_HEARTBEAT_RATE_LIMIT_MAX,
  REALTIME_PATH,
  REALTIME_PRESENCE_SYNC_INTERVAL_MS,
  REALTIME_PING_INTERVAL_MS,
  REALTIME_CLIENT_OFFLINE_GRACE_MS
};

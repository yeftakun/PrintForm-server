const fs = require("fs");
const fsp = fs.promises;
const { FILE_QUOTA_BYTES, useDb } = require("../config");
const { query } = require("../db");

function getTrackedPaths(jobs = []) {
  const seen = new Set();
  for (const job of jobs) {
    if (!job || typeof job.storedPath !== "string" || job.storedPath.length === 0) {
      continue;
    }
    seen.add(job.storedPath);
  }
  return [...seen];
}

async function computeStorageUsage(jobs = []) {
  const paths = getTrackedPaths(jobs);
  let totalBytes = 0;
  let fileCount = 0;

  for (const filePath of paths) {
    try {
      const stat = await fsp.stat(filePath);
      if (!stat.isFile()) {
        continue;
      }
      totalBytes += stat.size;
      fileCount += 1;
    } catch {
      // Ignore missing/inaccessible files; orphan cleanup handles stale files.
    }
  }

  return {
    totalBytes,
    fileCount,
    computedAt: new Date().toISOString()
  };
}

async function persistStorageUsageSnapshot(usage) {
  if (!useDb || !usage) {
    return;
  }

  try {
    await query(
      `INSERT INTO storage_usage (id, total_bytes, file_count, computed_at)
       VALUES (true, $1, $2, now())
       ON CONFLICT (id) DO UPDATE SET
         total_bytes = EXCLUDED.total_bytes,
         file_count = EXCLUDED.file_count,
         computed_at = EXCLUDED.computed_at`,
      [usage.totalBytes, usage.fileCount]
    );
  } catch (err) {
    // Do not break request flow if optional table is not created yet.
    if (err && err.code === "42P01") {
      return;
    }
    throw err;
  }
}

async function refreshStorageUsageSnapshot(jobs = []) {
  const usage = await computeStorageUsage(jobs);
  await persistStorageUsageSnapshot(usage);
  return usage;
}

function getQuotaProjection(usage, additionalBytes = 0) {
  const normalizedAdditional = Math.max(0, Number(additionalBytes) || 0);
  const projectedTotalBytes = usage.totalBytes + normalizedAdditional;
  return {
    quotaBytes: FILE_QUOTA_BYTES,
    projectedTotalBytes,
    quotaExceeded: projectedTotalBytes > FILE_QUOTA_BYTES
  };
}

module.exports = {
  computeStorageUsage,
  refreshStorageUsageSnapshot,
  getQuotaProjection
};

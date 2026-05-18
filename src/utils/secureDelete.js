const fsp = require("fs").promises;
const crypto = require("crypto");

// Write in chunks to avoid large heap allocations for big files.
const CHUNK_SIZE = 64 * 1024; // 64 KB

/**
 * Overwrite file content with random bytes, then unlink.
 *
 * NOTE: On SSDs with wear-leveling / TRIM, the OS cannot guarantee
 * the overwrite lands on the same physical block. This is a
 * best-effort software mitigation — sufficient for most threat models.
 *
 * @param {string} filePath - Absolute path to the file to delete.
 * @param {number} [passes=1] - Number of random-overwrite passes (1 is sufficient for most cases).
 */

async function secureDelete(filePath, passes = 1) {
  if (!filePath) return;

  try {
    const stats = await fsp.stat(filePath);
    const fileSize = stats.size;

    if (fileSize > 0) {
      const fd = await fsp.open(filePath, "r+");
      try {
        for (let pass = 0; pass < passes; pass++) {
          let written = 0;
          while (written < fileSize) {
            const chunkSize = Math.min(CHUNK_SIZE, fileSize - written);
            const chunk = crypto.randomBytes(chunkSize);
            await fd.write(chunk, 0, chunkSize, written);
            written += chunkSize;
          }
          // Flush each pass to disk before the next.
          await fd.datasync();
        }
      } finally {
        await fd.close();
      }
    }

    await fsp.unlink(filePath);
  } catch {
    // Fallback: at minimum, remove the file from the directory.
    await fsp.unlink(filePath).catch(() => null);
  }
}

module.exports = { secureDelete };

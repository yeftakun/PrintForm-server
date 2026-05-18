const fs = require("fs");
const path = require("path");
const { filesDir, useDb } = require("../config");
const { convertToPdf } = require("../services/convertToPdf");
const { query } = require("../db");
const crypto = require("crypto");
const { secureDelete } = require("../utils/secureDelete");

const fsp = fs.promises;
const OFFICE_EXTENSIONS = new Set([".doc", ".docx", ".ppt", ".pptx"]);
const PREVIEW_PREFIX = "preview_";

function normalizeConversionMode(value) {
  return String(value || "SYNC").trim().toUpperCase();
}

function buildPreviewUrl(fileName) {
  return `/api/jobs/preview/file/${encodeURIComponent(fileName)}`;
}

function buildPreviewStatusUrl(fileName) {
  return `/api/jobs/preview/status/${encodeURIComponent(fileName)}`;
}

function isSafeFileName(fileName) {
  if (!fileName) {
    return false;
  }
  if (fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) {
    return false;
  }
  return path.basename(fileName) === fileName;
}

async function removeFileSafe(filePath) {
  await secureDelete(filePath);
}

async function handlePreviewUpload(req, res) {
  let storedPath = req.file?.path || "";

  try {
    // Validate input file presence.
    if (!req.file) {
      res.status(400).json({ error: "Document is required" });
      return;
    }

    // Validate allowed office extensions for conversion.
    const extension = path.extname(String(req.file.originalname || "")).toLowerCase();
    if (!OFFICE_EXTENSIONS.has(extension)) {
      await removeFileSafe(req.file.path);
      res.status(400).json({ error: "Preview hanya mendukung DOC/DOCX/PPT/PPTX" });
      return;
    }

    // Rename the temp file to keep the original extension for preview URLs.
    const storedFileName = `${PREVIEW_PREFIX}${req.file.filename}${extension}`;
    storedPath = path.join(filesDir, storedFileName);
    await fsp.rename(req.file.path, storedPath);

    const conversionMode = normalizeConversionMode(process.env.CONVERSION_MODE);

    if (conversionMode === "HYBRID") {
      // Hybrid mode: respond immediately with original file URL.
      const pdfFileName = `${PREVIEW_PREFIX}${req.file.filename}.convert.pdf`;
      res.status(202).json({
        status: "accepted",
        sourceUrl: buildPreviewUrl(storedFileName),
        sourcePath: storedPath,
        pdfUrl: buildPreviewUrl(pdfFileName),
        pdfStatusUrl: buildPreviewStatusUrl(pdfFileName)
      });

      // Run conversion in the background using a temp copy to preserve the source.
      const copyName = `${PREVIEW_PREFIX}${req.file.filename}.convert${extension}`;
      const copyPath = path.join(filesDir, copyName);
      // Background conversion: after conversion, move PDF to canonical storage and register in DB when available.
      fsp.copyFile(storedPath, copyPath)
        .then(() => convertToPdf(copyPath, filesDir))
        .then(async pdfPath => {
          try {
            const stat = await fsp.stat(pdfPath);
            const storedId = crypto.randomBytes(16).toString("hex");
            const destPath = path.join(filesDir, storedId);
            await fsp.rename(pdfPath, destPath);
            if (useDb) {
              await query(
                `INSERT INTO preview_files (id, stored_name, converted_name, original_name, mime_type, size_bytes, status, session_id, created_at, last_seen_at)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,now(),now())`,
                [storedId, storedId, storedId, req.file.originalname, "application/pdf", stat.size, "ready", req.body?.sessionId || null]
              );
            }
          } catch (err) {
            console.error("Background preview registration failed:", err?.message || err);
            await secureDelete(pdfPath);
          }
        })
        .catch(err => {
          console.error("Preview conversion failed:", err?.message || err);
        });
      return;
    }

    // Sync mode: wait for PDF conversion and return PDF URL.
    const pdfPath = await convertToPdf(storedPath, filesDir);
    // Move converted PDF to canonical stored id and register in DB so job can reference it.
    const stat = await fsp.stat(pdfPath);
    const storedId = crypto.randomBytes(16).toString("hex");
    const destPath = path.join(filesDir, storedId);
    await fsp.rename(pdfPath, destPath);

    if (useDb) {
      try {
        await query(
          `INSERT INTO preview_files (id, stored_name, converted_name, original_name, mime_type, size_bytes, status, session_id, created_at, last_seen_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,now(),now())`,
          [storedId, storedId, storedId, req.file.originalname, "application/pdf", stat.size, "ready", req.body?.sessionId || null]
        );
      } catch (err) {
        // If DB insert fails, remove the stored file to avoid orphan
        await removeFileSafe(destPath);
        throw err;
      }
    }

    res.status(200).json({
      status: "ready",
      previewId: storedId,
      pdfUrl: buildPreviewUrl(storedId),
      pdfStatusUrl: buildPreviewStatusUrl(storedId),
      pdfPath: destPath
    });
  } catch (err) {
    // Cleanup any temporary file on failure.
    await removeFileSafe(storedPath);
    res.status(500).json({ error: "Preview conversion failed" });
  }
}

async function downloadPreviewFile(req, res) {
  // Serve preview files via a controlled filename parameter.
  const fileName = String(req.params.fileName || "").trim();
  if (!isSafeFileName(fileName)) {
    res.status(400).json({ error: "Invalid file name" });
    return;
  }

  const filePath = path.join(filesDir, fileName);
  try {
    await fsp.access(filePath, fs.constants.F_OK);
  } catch {
    res.status(404).json({ error: "File not found" });
    return;
  }

  res.sendFile(filePath);
}

async function getPreviewFileStatus(req, res) {
  // Return readiness state without using 404 to avoid noisy polling logs.
  const fileName = String(req.params.fileName || "").trim();
  if (!isSafeFileName(fileName)) {
    res.status(400).json({ error: "Invalid file name" });
    return;
  }

  const filePath = path.join(filesDir, fileName);
  try {
    const stat = await fsp.stat(filePath);
    if (!stat.isFile()) {
      res.json({ ready: false });
      return;
    }

    res.json({
      ready: true,
      size: stat.size,
      url: buildPreviewUrl(fileName)
    });
  } catch {
    res.json({ ready: false });
  }
}

module.exports = {
  handlePreviewUpload,
  downloadPreviewFile,
  getPreviewFileStatus
};

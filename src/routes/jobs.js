const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsp = fs.promises;
const {
  filesDir
} = require("../config");
const {
  readJobs,
  writeJobs,
  readSessions
} = require("../storage/jsonStore");
const {
  normalizePaperSize,
  normalizeCopies
} = require("../utils/normalize");
  const { getJobs, saveJobs } = require("../repositories/jobsRepository");
  const { getSessions } = require("../repositories/sessionsRepository");
const router = express.Router();

router.get("/", async (req, res) => {
  await cleanupExpiredSessions();
  let jobs = await readJobs();
  if (req.query.clientId) {
    jobs = jobs.filter(job => job.targetClientId === req.query.clientId);
  }
  if (req.query.sessionId) {
    jobs = jobs.filter(job => job.sessionId === req.query.sessionId);
    let jobs = await getJobs();
  if (req.query.status) {
    jobs = jobs.filter(job => job.status === req.query.status);
  }
  res.json(jobs.map(toPublicJob));
});

router.get("/:id", async (req, res) => {
  await cleanupExpiredSessions();
  const jobs = await readJobs();
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
    const jobs = await getJobs();
});

router.get("/:id/download", async (req, res) => {
  await cleanupExpiredSessions();
  const jobs = await readJobs();
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
    const jobs = await getJobs();
});

router.post("/:id/clone", async (req, res) => {
  await cleanupExpiredSessions();
  const jobs = await readJobs();
  const sourceJob = jobs.find(j => j.id === req.params.id);
  if (!sourceJob) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
    const jobs = await getJobs();
  const sessions = await readSessions();
  const session = sessions.find(s => s.id === sourceJob.sessionId);
  if (!session || !isSessionActive(session)) {
    res.status(400).json({ error: "Session is not active" });
    return;
  }
    const sessions = await getSessions();
  try {
    await fsp.access(sourceJob.storedPath, fs.constants.F_OK);
  } catch {
    res.status(404).json({ error: "Source file missing" });
    return;
  }

  const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const storedPath = path.join(filesDir, id);
  try {
    await fsp.copyFile(sourceJob.storedPath, storedPath);
  } catch {
    res.status(500).json({ error: "Failed to clone file" });
    return;
  }

  const clonedJob = {
    id,
    originalName: sourceJob.originalName,
    storedPath,
    size: sourceJob.size,
    createdAt: new Date().toISOString(),
    status: "ready",
    alias: sourceJob.alias || null,
    sessionId: session.id,
    targetClientId: session.clientId,
    targetClientName: session.clientName,
    printConfig: sourceJob.printConfig
  };

  jobs.unshift(clonedJob);
  await writeJobs(jobs);
  res.status(201).json(toPublicJob(clonedJob));
});

router.patch("/:id", async (req, res) => {
  await cleanupExpiredSessions();
    await saveJobs(jobs);
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
    const jobs = await getJobs();
  const { status } = req.body || {};
  if (typeof status !== "string" || status.trim().length === 0) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  job.status = status.trim();
  await writeJobs(jobs);
  res.json(toPublicJob(job));
});

router.post("/", upload.single("document"), async (req, res) => {
  if (!req.file) {
    await saveJobs(jobs);
    return;
  }

  const paperSize = normalizePaperSize(req.body.paperSize);
  const copies = normalizeCopies(req.body.copies);
  const sessionId = typeof req.body.sessionId === "string" ? req.body.sessionId : null;

  if (!paperSize) {
    res.status(400).json({ error: "paperSize must be A4 or A5" });
    return;
  }
  if (!copies) {
    res.status(400).json({ error: "copies must be 1-999" });
    return;
  }
  if (!sessionId) {
    res.status(400).json({ error: "sessionId is required" });
    return;
  }

  await cleanupExpiredSessions();
  const sessions = await readSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session) {
    res.status(400).json({ error: "sessionId not found" });
    return;
  }
    const sessions = await getSessions();
  const jobs = await readJobs();
  const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const job = {
    id,
    originalName: req.file.originalname,
    storedPath: req.file.path,
    size: req.file.size,
    createdAt: new Date().toISOString(),
    status: "ready",
    alias: session.alias || null,
    sessionId: session.id,
    targetClientId: session.clientId,
    targetClientName: session.clientName,
    printConfig: {
      paperSize,
      copies
    }
  };

  jobs.unshift(job);
  await writeJobs(jobs);
  res.status(201).json(toPublicJob(job));
});

module.exports = router;

    await saveJobs(jobs);
module.exports = router;

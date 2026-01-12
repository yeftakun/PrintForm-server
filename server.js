const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsp = fs.promises;

const app = express();
const port = process.env.PORT || 3000;

const storageDir = path.join(__dirname, "storage");
const filesDir = path.join(storageDir, "files");
const jobsFile = path.join(storageDir, "jobs.json");

const upload = multer({ dest: filesDir });

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

async function ensureStorage() {
  await fsp.mkdir(filesDir, { recursive: true });
  try {
    await fsp.access(jobsFile, fs.constants.F_OK);
  } catch {
    await fsp.writeFile(jobsFile, JSON.stringify([]));
  }
}

async function readJobs() {
  const raw = await fsp.readFile(jobsFile, "utf8");
  return JSON.parse(raw);
}

async function writeJobs(jobs) {
  await fsp.writeFile(jobsFile, JSON.stringify(jobs, null, 2));
}

function normalizePaperSize(value) {
  const v = String(value || "").toUpperCase().trim();
  if (v === "A4" || v === "A5") {
    return v;
  }
  return null;
}

function normalizeCopies(value) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 1 || n > 999) {
    return null;
  }
  return n;
}

function toPublicJob(job) {
  return {
    id: job.id,
    originalName: job.originalName,
    size: job.size,
    createdAt: job.createdAt,
    status: job.status,
    printConfig: job.printConfig
  };
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/jobs", async (req, res) => {
  const jobs = await readJobs();
  res.json(jobs.map(toPublicJob));
});

app.get("/api/jobs/:id", async (req, res) => {
  const jobs = await readJobs();
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.json(toPublicJob(job));
});

app.get("/api/jobs/:id/download", async (req, res) => {
  const jobs = await readJobs();
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.download(job.storedPath, job.originalName);
});

app.patch("/api/jobs/:id", async (req, res) => {
  const jobs = await readJobs();
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const { status } = req.body || {};
  if (typeof status !== "string" || status.trim().length === 0) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  job.status = status.trim();
  await writeJobs(jobs);
  res.json(toPublicJob(job));
});

app.post("/api/jobs", upload.single("document"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Document is required" });
    return;
  }

  const paperSize = normalizePaperSize(req.body.paperSize);
  const copies = normalizeCopies(req.body.copies);

  if (!paperSize) {
    res.status(400).json({ error: "paperSize must be A4 or A5" });
    return;
  }
  if (!copies) {
    res.status(400).json({ error: "copies must be 1-999" });
    return;
  }

  const jobs = await readJobs();
  const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const job = {
    id,
    originalName: req.file.originalname,
    storedPath: req.file.path,
    size: req.file.size,
    createdAt: new Date().toISOString(),
    status: "ready",
    printConfig: {
      paperSize,
      copies
    }
  };

  jobs.unshift(job);
  await writeJobs(jobs);
  res.status(201).json(toPublicJob(job));
});

ensureStorage()
  .then(() => {
    app.listen(port, () => {
      console.log(`PrintForm server running on http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error("Failed to initialize storage:", err);
    process.exit(1);
  });

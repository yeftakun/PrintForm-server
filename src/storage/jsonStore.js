const fs = require("fs");
const fsp = fs.promises;
const {
  filesDir,
  jobsFile,
  clientsFile,
  pingsFile,
  sessionsFile
} = require("../config");

async function ensureStorage() {
  await fsp.mkdir(filesDir, { recursive: true });
  await ensureFile(jobsFile, []);
  await ensureFile(clientsFile, []);
  await ensureFile(pingsFile, {});
  await ensureFile(sessionsFile, []);
}

async function ensureFile(filePath, fallback) {
  try {
    await fsp.access(filePath, fs.constants.F_OK);
  } catch {
    await fsp.writeFile(filePath, JSON.stringify(fallback));
  }
}

async function readJson(filePath, fallback) {
  let raw = "";
  try {
    raw = await fsp.readFile(filePath, "utf8");
  } catch {
    await fsp.writeFile(filePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }

  if (!raw.trim()) {
    await fsp.writeFile(filePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch {
    await fsp.writeFile(filePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}

async function writeJson(filePath, payload) {
  await fsp.writeFile(filePath, JSON.stringify(payload, null, 2));
}

const readJobs = () => readJson(jobsFile, []);
const writeJobs = jobs => writeJson(jobsFile, jobs);

const readClients = () => readJson(clientsFile, []);
const writeClients = clients => writeJson(clientsFile, clients);

const readPings = () => readJson(pingsFile, {});
const writePings = pings => writeJson(pingsFile, pings);

const readSessions = () => readJson(sessionsFile, []);
const writeSessions = sessions => writeJson(sessionsFile, sessions);

module.exports = {
  ensureStorage,
  readJson,
  writeJson,
  readJobs,
  writeJobs,
  readClients,
  writeClients,
  readPings,
  writePings,
  readSessions,
  writeSessions
};

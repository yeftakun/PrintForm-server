// Usage: DATABASE_URL=postgres://... USE_DB=true node scripts/migrateJsonToDb.js
// Migrates JSON storage to Postgres using repository layer.

process.env.USE_DB = process.env.USE_DB || "true";

const { databaseUrl } = require("../src/config");
const {
  readClients,
  readSessions,
  readJobs,
  readPings
} = require("../src/storage/jsonStore");
const {
  saveClients
} = require("../src/repositories/clientsRepository");
const {
  saveSessions
} = require("../src/repositories/sessionsRepository");
const {
  saveJobs
} = require("../src/repositories/jobsRepository");
const {
  savePings
} = require("../src/repositories/pingsRepository");
const { isClientOnline } = require("../src/services/status");

async function main() {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const clients = await readClients();
  const sessions = await readSessions();
  const jobs = await readJobs();
  const pings = await readPings();

  const enrichedClients = clients.map(c => ({
    ...c,
    status: isClientOnline(c) ? "online" : "offline"
  }));

  const enrichedSessions = sessions.map(s => ({
    ...s,
    clientId: s.clientId,
    status: s.status || "active"
  }));

  const normalizedJobs = jobs.map(j => ({
    id: j.id,
    sessionId: j.sessionId,
    targetClientId: j.targetClientId,
    targetClientName: j.targetClientName || null,
    originalName: j.originalName,
    storedPath: j.storedPath,
    size: j.size,
    createdAt: j.createdAt,
    status: j.status,
    alias: j.alias || null,
    printConfig: j.printConfig || { paperSize: null, copies: null }
  }));

  console.log("Migrating to DB...");
  console.log(`Clients: ${clients.length}`);
  console.log(`Sessions: ${sessions.length}`);
  console.log(`Jobs: ${jobs.length}`);

  await saveClients(enrichedClients);
  await saveSessions(enrichedSessions);
  await saveJobs(normalizedJobs);
  await savePings(pings);

  console.log("Migration completed.");
}

main().catch(err => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});

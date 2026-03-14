const { getClientReadiness, canClientAcceptJobs } = require("../services/status");

function toPublicJob(job) {
  return {
    id: job.id,
    originalName: job.originalName,
    size: job.size,
    createdAt: job.createdAt,
    status: job.status,
    alias: job.alias || null,
    printConfig: job.printConfig,
    targetClientId: job.targetClientId,
    targetClientName: job.targetClientName,
    sessionId: job.sessionId,
    claimedByClientId: job.claimedByClientId || null,
    claimedAt: job.claimedAt || null
  };
}

function toPublicClient(client) {
  const readiness = getClientReadiness(client);
  return {
    id: client.id,
    name: client.name,
    printers: client.printers,
    selectedPrinter: client.selectedPrinter || null,
    lastSeen: client.lastSeen,
    status: client.status,
    recognized: Boolean(client.ownerUserId),
    readiness,
    acceptingJobs: canClientAcceptJobs(client)
  };
}

module.exports = {
  toPublicJob,
  toPublicClient
};

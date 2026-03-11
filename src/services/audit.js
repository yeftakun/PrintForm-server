const { createAuditLog } = require("../repositories/auditLogsRepository");

function getActorFromRequest(req, fallbackActorType = "system") {
  if (req?.user?.id) {
    return {
      actorType: "user",
      actorId: req.user.id
    };
  }

  return {
    actorType: fallbackActorType,
    actorId: null
  };
}

async function writeAuditLogSafe(event) {
  try {
    return await createAuditLog(event);
  } catch (err) {
    console.warn("Audit log write failed:", err?.message || err);
    return null;
  }
}

module.exports = {
  getActorFromRequest,
  writeAuditLogSafe
};

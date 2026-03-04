const crypto = require("crypto");

function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();
  const reqId = generateId();
  req.id = reqId;
  res.setHeader("X-Request-Id", reqId);

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    const logEntry = {
      level: "info",
      msg: "request",
      reqId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      contentLength: res.getHeader("content-length") || null,
      useDb: process.env.USE_DB === "true" || false
    };
    console.log(JSON.stringify(logEntry));
  });

  next();
}

function generateId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

module.exports = { requestLogger };

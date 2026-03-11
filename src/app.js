const express = require("express");
const path = require("path");
const { rootDir } = require("./config");
const { requestLogger } = require("./middleware/requestLogger");
const { errorHandler } = require("./middleware/errorHandler");
const { optionalAuth } = require("./middleware/auth");
const healthRouter = require("./routes/health");
const authRouter = require("./routes/auth");
const clientsRouter = require("./routes/clients");
const sessionsRouter = require("./routes/sessions");
const jobsRouter = require("./routes/jobs");

function createApp() {
  const app = express();
  app.use(requestLogger);
  app.use(express.json());
  app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  app.use(express.static(path.join(rootDir, "public")));

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);

  // Customer flow on `/` is guest-first; routes still receive `req.user` when bearer token exists.
  app.use("/api/clients", optionalAuth, clientsRouter);
  app.use("/api/sessions", optionalAuth, sessionsRouter);
  app.use("/api/jobs", optionalAuth, jobsRouter);

  app.use(errorHandler);

  return app;
}

module.exports = { createApp };

const express = require("express");
const path = require("path");
const { AUTH_ENFORCE, rootDir } = require("./config");
const { requestLogger } = require("./middleware/requestLogger");
const { errorHandler } = require("./middleware/errorHandler");
const { optionalAuth, requireAuth } = require("./middleware/auth");
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

  const protectedApiMiddleware = AUTH_ENFORCE ? requireAuth : optionalAuth;
  app.use("/api/clients", optionalAuth, clientsRouter);
  app.use("/api/sessions", protectedApiMiddleware, sessionsRouter);
  app.use("/api/jobs", protectedApiMiddleware, jobsRouter);

  app.use(errorHandler);

  return app;
}

module.exports = { createApp };

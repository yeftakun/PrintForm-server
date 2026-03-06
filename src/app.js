const express = require("express");
const path = require("path");
const { rootDir } = require("./config");
const { requestLogger } = require("./middleware/requestLogger");
const { errorHandler } = require("./middleware/errorHandler");
const healthRouter = require("./routes/health");
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
  app.use("/api/clients", clientsRouter);
  app.use("/api/sessions", sessionsRouter);
  app.use("/api/jobs", jobsRouter);

  app.use(errorHandler);

  return app;
}

module.exports = { createApp };

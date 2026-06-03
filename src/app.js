const express = require("express");
const path = require("path");
const { rootDir, profilePhotosDir } = require("./config");
const { requestLogger } = require("./middleware/requestLogger");
const { errorHandler } = require("./middleware/errorHandler");
const { optionalAuth } = require("./middleware/auth");
const { rejectSuspendedMitra } = require("./middleware/suspension");
const healthRouter = require("./routes/health");
const authRouter = require("./routes/auth");
const clientsRouter = require("./routes/clients");
const sessionsRouter = require("./routes/sessions");
const jobsRouter = require("./routes/jobs");
const billingRouter = require("./routes/billing");
const adminRouter = require("./routes/admin");

function createApp() {
  const app = express();
  app.use(requestLogger);
  app.use(express.json());
  app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  app.use("/portal", express.static(path.join(rootDir, "public", "portal")));
  app.get(["/mitra/reset-password", "/mitra/reset-password/"], (req, res) => {
    res.sendFile(path.join(rootDir, "public", "mitra", "reset-password", "index.html"));
  });
  app.use(express.static(path.join(rootDir, "public")));
  app.use("/uploads/profile-photos", express.static(profilePhotosDir));

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);

  // Customer flow on `/` is guest-first; routes still receive `req.user` when bearer token exists.
  app.use("/api/clients", optionalAuth, rejectSuspendedMitra, clientsRouter);
  app.use("/api/sessions", optionalAuth, rejectSuspendedMitra, sessionsRouter);
  app.use("/api/jobs", optionalAuth, rejectSuspendedMitra, jobsRouter);
  app.use("/api/billing", billingRouter);
  app.use("/api/admin", adminRouter);

  app.get("/p/:kodeToko", (req, res, next) => {
    const kodeToko = String(req.params.kodeToko || "").trim();
    if (!kodeToko || kodeToko.includes(".")) {
      next();
      return;
    }

    res.sendFile(path.join(rootDir, "public", "store", "index.html"));
  });

  app.use(errorHandler);

  return app;
}

module.exports = { createApp };

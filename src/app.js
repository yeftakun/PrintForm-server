const express = require("express");
const fs = require("fs");
const path = require("path");
const { APP_BASE_URL, rootDir, profilePhotosDir } = require("./config");
const { requestLogger } = require("./middleware/requestLogger");
const { errorHandler } = require("./middleware/errorHandler");
const { optionalAuth } = require("./middleware/auth");
const { rejectSuspendedMitra } = require("./middleware/suspension");
const { getUserByStoreCode } = require("./repositories/usersRepository");
const healthRouter = require("./routes/health");
const authRouter = require("./routes/auth");
const clientsRouter = require("./routes/clients");
const sessionsRouter = require("./routes/sessions");
const jobsRouter = require("./routes/jobs");
const billingRouter = require("./routes/billing");
const adminRouter = require("./routes/admin");
const installersRouter = require("./routes/installers");

const storePagePath = path.join(rootDir, "public", "store", "index.html");
const storeMetaStart = "<!-- store-meta:start -->";
const storeMetaEnd = "<!-- store-meta:end -->";
let storePageTemplatePromise = null;

function getStorePageTemplate() {
  if (!storePageTemplatePromise) {
    storePageTemplatePromise = fs.promises.readFile(storePagePath, "utf8");
  }
  return storePageTemplatePromise;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeMetaText(value, maxLength) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!maxLength || text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function getBaseUrl(req) {
  const configuredBaseUrl = String(APP_BASE_URL || "").trim().replace(/\/+$/, "");
  const configuredIsLocalhost = /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::|\/|$)/i.test(configuredBaseUrl);
  if (configuredBaseUrl && !configuredIsLocalhost) {
    return configuredBaseUrl;
  }

  const forwardedProto = String(req.get("x-forwarded-proto") || "").split(",")[0].trim();
  const forwardedHost = String(req.get("x-forwarded-host") || "").split(",")[0].trim();
  const host = forwardedHost || req.get("host");
  if (host) {
    const requestHostIsLocalhost = /^(?:localhost|127\.0\.0\.1|\[::1\])(?::|$)/i.test(host);
    const protocol = forwardedProto || (requestHostIsLocalhost ? req.protocol || "http" : "https");
    return `${protocol}://${host}`.replace(/\/+$/, "");
  }

  return configuredBaseUrl || "https://printorder.web.id";
}

function getStoreConfig(user) {
  return user?.konfigurasiToko && typeof user.konfigurasiToko === "object"
    ? user.konfigurasiToko
    : {};
}

function getStoreMetaData(user, kodeToko, req) {
  const baseUrl = getBaseUrl(req);
  const canonicalUrl = `${baseUrl}/p/${encodeURIComponent(kodeToko)}`;
  const previewUrl = `${baseUrl}/assets/preview.jpg`;

  if (!user) {
    return {
      title: "Toko tidak ditemukan - PrintOrder",
      description: normalizeMetaText(`Kode toko ${kodeToko} tidak terdaftar di PrintOrder.`, 180),
      canonicalUrl,
      previewUrl,
      robots: "noindex, nofollow"
    };
  }

  const config = getStoreConfig(user);
  const storeName = normalizeMetaText(config.namaToko || config.nama_toko || user.username || "Toko Percetakan", 80);
  const address = normalizeMetaText(user.alamat || "", 140);
  const contact = normalizeMetaText(config.kontak || "", 80);
  const detailParts = [
    address ? `Alamat: ${address}` : "Alamat belum diatur",
    contact ? `Kontak: ${contact}` : "Kontak belum diatur"
  ];

  return {
    title: `${storeName} - PrintOrder`,
    description: normalizeMetaText(detailParts.join(". "), 230),
    canonicalUrl,
    previewUrl,
    robots: "index, follow"
  };
}

function renderStoreMeta(meta) {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const canonicalUrl = escapeHtml(meta.canonicalUrl);
  const previewUrl = escapeHtml(meta.previewUrl);
  const robots = escapeHtml(meta.robots || "index, follow");

  return [
    storeMetaStart,
    `    <title>${title}</title>`,
    `    <meta name="title" content="${title}">`,
    `    <meta name="description" content="${description}">`,
    `    <meta name="robots" content="${robots}">`,
    `    <link rel="canonical" href="${canonicalUrl}">`,
    "",
    `    <meta property="og:type" content="website">`,
    `    <meta property="og:url" content="${canonicalUrl}">`,
    `    <meta property="og:title" content="${title}">`,
    `    <meta property="og:description" content="${description}">`,
    `    <meta property="og:image" content="${previewUrl}">`,
    `    <meta property="og:image:secure_url" content="${previewUrl}">`,
    `    <meta property="og:image:type" content="image/jpeg">`,
    `    <meta property="og:image:width" content="1200">`,
    `    <meta property="og:image:height" content="675">`,
    `    <meta property="og:image:alt" content="PrintOrder - platform layanan cetak dokumen mandiri">`,
    `    <meta property="og:site_name" content="PrintOrder">`,
    `    <meta property="og:locale" content="id_ID">`,
    "",
    `    <meta name="twitter:card" content="summary_large_image">`,
    `    <meta name="twitter:url" content="${canonicalUrl}">`,
    `    <meta name="twitter:title" content="${title}">`,
    `    <meta name="twitter:description" content="${description}">`,
    `    <meta name="twitter:image" content="${previewUrl}">`,
    `    <meta name="twitter:image:alt" content="PrintOrder - platform layanan cetak dokumen mandiri">`,
    `    ${storeMetaEnd}`
  ].join("\n");
}

function injectStoreMeta(template, meta) {
  const startIndex = template.indexOf(storeMetaStart);
  const endIndex = template.indexOf(storeMetaEnd);
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return template;
  }

  return `${template.slice(0, startIndex)}${renderStoreMeta(meta)}${template.slice(endIndex + storeMetaEnd.length)}`;
}

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
  app.use("/api/installers", installersRouter);

  // Customer flow on `/` is guest-first; routes still receive `req.user` when bearer token exists.
  app.use("/api/clients", optionalAuth, rejectSuspendedMitra, clientsRouter);
  app.use("/api/sessions", optionalAuth, rejectSuspendedMitra, sessionsRouter);
  app.use("/api/jobs", optionalAuth, rejectSuspendedMitra, jobsRouter);
  app.use("/api/billing", billingRouter);
  app.use("/api/admin", adminRouter);

  app.get("/p/:kodeToko", async (req, res, next) => {
    const kodeToko = String(req.params.kodeToko || "").trim();
    if (!kodeToko || kodeToko.includes(".")) {
      next();
      return;
    }

    try {
      let storeUser = null;
      try {
        storeUser = await getUserByStoreCode(kodeToko);
      } catch (err) {
        console.warn("Store metadata lookup failed:", err?.message || err);
      }

      const template = await getStorePageTemplate();
      const meta = getStoreMetaData(storeUser, kodeToko, req);
      res.type("html").send(injectStoreMeta(template, meta));
    } catch (err) {
      next(err);
    }
  });

  app.use(errorHandler);

  return app;
}

module.exports = { createApp };

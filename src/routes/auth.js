const express = require("express");
const {
  AUTH_ALLOW_PUBLIC_REGISTER,
  AUTH_ACCESS_TOKEN_TTL
} = require("../config");
const {
  countUsers,
  getUserByUsername,
  getUserByEmail,
  getUserByIdentifier,
  getUserById,
  createUser,
  updateUserProfile,
  updateUserStoreSettings,
  updateUserPasswordHash,
  updateUserPinHash
} = require("../repositories/usersRepository");
const {
  createRefreshTokenRecord,
  getActiveRefreshTokenByHash,
  revokeRefreshTokenById,
  revokeRefreshTokenByHash,
  revokeAllUserRefreshTokens
} = require("../repositories/refreshTokensRepository");
const {
  REFRESH_TOKEN_TYPE,
  createOpaqueId,
  toPublicUser,
  getRefreshTokenExpiryDate,
  hashToken,
  hashPassword,
  verifyPassword,
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken
} = require("../services/auth");
const { asyncHandler } = require("../utils/asyncHandler");
const { optionalAuth, requireAuth } = require("../middleware/auth");
const { writeAuditLogSafe } = require("../services/audit");
const {
  normalizeOperationalSchedule,
  summarizeOperationalSchedule
} = require("../utils/storeOperational");

const router = express.Router();

function normalizeUsername(value) {
  const username = String(value || "").trim().toLowerCase();
  if (!username) {
    return null;
  }

  if (!/^[a-z0-9._-]{3,64}$/.test(username)) {
    return null;
  }

  return username;
}

function normalizeEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  if (!email) {
    return null;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return null;
  }

  return email;
}

function normalizePassword(value) {
  const password = String(value || "");
  if (password.length < 8) {
    return null;
  }
  return password;
}

function normalizePin(value) {
  const pin = String(value || "").trim();
  if (!/^\d{4,8}$/.test(pin)) {
    return null;
  }
  return pin;
}

function normalizeOptionalText(value, maxLength = 255) {
  const text = String(value || "").trim();
  if (!text) {
    return "";
  }
  return text.slice(0, maxLength);
}

function normalizeStoreCode(value) {
  const code = String(value || "").trim();
  if (!code) {
    return "";
  }

  if (!/^[a-zA-Z0-9._-]{3,64}$/.test(code)) {
    return null;
  }

  return code;
}

function normalizeStoreStatus(value) {
  return String(value || "").trim().toLowerCase() === "closed" ? "closed" : "open";
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value === 1;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) return true;
    if (["0", "false", "no", "off"].includes(normalized)) return false;
  }
  return fallback;
}

function normalizeColorMode(value) {
  const mode = String(value || "").trim().toLowerCase();
  if (mode === "color" || mode === "bw") {
    return mode;
  }
  return "both";
}

function normalizePaperTypes(value) {
  const list = Array.isArray(value)
    ? value
    : String(value || "").split(",");

  const normalized = list
    .map(item => String(item || "").trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 12);

  return [...new Set(normalized)];
}

function normalizeNonNegativeNumber(value, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    return fallback;
  }
  return Math.round(number);
}

function normalizeFileLimitMb(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return 25;
  }
  return Math.min(500, Math.max(1, Math.round(number)));
}

function getRequesterIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim().length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || null;
}

async function issueAuthTokens(user, req) {
  const refreshTokenId = createOpaqueId("rt");
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken({ user, tokenId: refreshTokenId });
  const refreshTokenHash = hashToken(refreshToken);
  const refreshTokenExpiresAt = getRefreshTokenExpiryDate();

  await createRefreshTokenRecord({
    id: refreshTokenId,
    userId: user.id,
    tokenHash: refreshTokenHash,
    userAgent: req.headers["user-agent"] || null,
    ipAddress: getRequesterIp(req),
    expiresAt: refreshTokenExpiresAt
  });

  return {
    accessToken,
    refreshToken,
    refreshTokenId,
    accessTokenTtl: AUTH_ACCESS_TOKEN_TTL,
    refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString()
  };
}

function toPublicTokenBundle(tokenBundle) {
  const { refreshTokenId, ...publicBundle } = tokenBundle;
  return publicBundle;
}

router.use(optionalAuth);

router.post("/register", asyncHandler(async (req, res) => {
  if (!AUTH_ALLOW_PUBLIC_REGISTER && !req.user) {
    res.status(403).json({ error: "Public register is disabled" });
    return;
  }

  const username = normalizeUsername(req.body?.username);
  if (!username) {
    res.status(400).json({ error: "username must be 3-64 chars (a-z, 0-9, ., _, -)" });
    return;
  }

  const password = normalizePassword(req.body?.password);
  if (!password) {
    res.status(400).json({ error: "password must be at least 8 chars" });
    return;
  }

  const email = normalizeEmail(req.body?.email);
  if (req.body?.email && !email) {
    res.status(400).json({ error: "email format is invalid" });
    return;
  }

  const existingByUsername = await getUserByUsername(username);
  if (existingByUsername) {
    res.status(409).json({ error: "username already exists" });
    return;
  }

  if (email) {
    const existingByEmail = await getUserByEmail(email);
    if (existingByEmail) {
      res.status(409).json({ error: "email already exists" });
      return;
    }
  }

  const usersCount = await countUsers();
  const role = usersCount === 0 ? "admin" : "user";
  const passwordHash = await hashPassword(password);
  const user = await createUser({
    id: createOpaqueId("user"),
    username,
    email,
    passwordHash,
    role
  });

  await writeAuditLogSafe({
    actorType: "user",
    actorId: user.id,
    action: "auth.register",
    targetType: "user",
    targetId: user.id,
    detail: {
      username: user.username || null,
      email: user.email || null,
      role: user.role || "user"
    }
  });

  const tokenBundle = await issueAuthTokens(user, req);
  res.status(201).json({
    user: toPublicUser(user),
    ...toPublicTokenBundle(tokenBundle)
  });
}));

router.post("/login", asyncHandler(async (req, res) => {
  const identifier = String(
    req.body?.identifier || req.body?.username || req.body?.email || ""
  ).trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (!identifier || !password) {
    res.status(400).json({ error: "identifier and password are required" });
    return;
  }

  const user = await getUserByIdentifier(identifier);
  if (!user || !user.passwordHash) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const passwordValid = await verifyPassword(password, user.passwordHash);
  if (!passwordValid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const tokenBundle = await issueAuthTokens(user, req);

  await writeAuditLogSafe({
    actorType: "user",
    actorId: user.id,
    action: "auth.login",
    targetType: "user",
    targetId: user.id,
    detail: {
      identifier
    }
  });

  res.json({
    user: toPublicUser(user),
    ...toPublicTokenBundle(tokenBundle)
  });
}));

router.post("/refresh", asyncHandler(async (req, res) => {
  const refreshToken = String(req.body?.refreshToken || "").trim();
  if (!refreshToken) {
    res.status(400).json({ error: "refreshToken is required" });
    return;
  }

  let payload = null;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    res.status(401).json({ error: "Invalid or expired refresh token" });
    return;
  }

  if (payload?.tokenType !== REFRESH_TOKEN_TYPE || !payload?.sub || !payload?.tokenId) {
    res.status(401).json({ error: "Invalid refresh token payload" });
    return;
  }

  const tokenHash = hashToken(refreshToken);
  const storedToken = await getActiveRefreshTokenByHash(tokenHash);
  if (!storedToken || storedToken.id !== payload.tokenId || storedToken.userId !== payload.sub) {
    res.status(401).json({ error: "Refresh token not recognized" });
    return;
  }

  const user = await getUserById(storedToken.userId);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const nextTokenBundle = await issueAuthTokens(user, req);

  await revokeRefreshTokenById(storedToken.id, {
    replacedByTokenId: nextTokenBundle.refreshTokenId
  });

  await writeAuditLogSafe({
    actorType: "user",
    actorId: user.id,
    action: "auth.refresh",
    targetType: "user",
    targetId: user.id,
    detail: {
      previousRefreshTokenId: storedToken.id,
      nextRefreshTokenId: nextTokenBundle.refreshTokenId
    }
  });

  res.json({
    user: toPublicUser(user),
    ...toPublicTokenBundle(nextTokenBundle)
  });
}));

router.post("/logout", asyncHandler(async (req, res) => {
  const refreshToken = String(req.body?.refreshToken || "").trim();
  if (!refreshToken) {
    res.status(400).json({ error: "refreshToken is required" });
    return;
  }

  let logoutPayload = null;
  try {
    logoutPayload = verifyRefreshToken(refreshToken);
  } catch {
    logoutPayload = null;
  }

  const revokedCount = await revokeRefreshTokenByHash(hashToken(refreshToken));

  await writeAuditLogSafe({
    actorType: "user",
    actorId: logoutPayload?.sub || null,
    action: "auth.logout",
    targetType: "user",
    targetId: logoutPayload?.sub || null,
    detail: {
      revokedCount
    }
  });

  res.json({ ok: true, revokedCount });
}));

router.post("/logout-all", requireAuth, asyncHandler(async (req, res) => {
  const revokedCount = await revokeAllUserRefreshTokens(req.user.id);

  await writeAuditLogSafe({
    actorType: "user",
    actorId: req.user.id,
    action: "auth.logout_all",
    targetType: "user",
    targetId: req.user.id,
    detail: {
      revokedCount
    }
  });

  res.json({ ok: true, revokedCount });
}));

router.get("/me", requireAuth, asyncHandler(async (req, res) => {
  res.json({ user: toPublicUser(req.user) });
}));

router.patch("/me", requireAuth, asyncHandler(async (req, res) => {
  const hasUsername = Object.prototype.hasOwnProperty.call(req.body || {}, "username");
  const hasEmail = Object.prototype.hasOwnProperty.call(req.body || {}, "email");

  if (!hasUsername && !hasEmail) {
    res.status(400).json({ error: "username or email is required" });
    return;
  }

  let nextUsername = req.user.username;
  if (hasUsername) {
    nextUsername = normalizeUsername(req.body?.username);
    if (!nextUsername) {
      res.status(400).json({ error: "username must be 3-64 chars (a-z, 0-9, ., _, -)" });
      return;
    }

    const existingByUsername = await getUserByUsername(nextUsername);
    if (existingByUsername && existingByUsername.id !== req.user.id) {
      res.status(409).json({ error: "username already exists" });
      return;
    }
  }

  let nextEmail = req.user.email;
  if (hasEmail) {
    nextEmail = normalizeEmail(req.body?.email);
    if (req.body?.email && !nextEmail) {
      res.status(400).json({ error: "email format is invalid" });
      return;
    }

    if (nextEmail) {
      const existingByEmail = await getUserByEmail(nextEmail);
      if (existingByEmail && existingByEmail.id !== req.user.id) {
        res.status(409).json({ error: "email already exists" });
        return;
      }
    }
  }

  const updatedUser = await updateUserProfile(req.user.id, {
    username: nextUsername,
    email: nextEmail,
    updateUsername: hasUsername,
    updateEmail: hasEmail
  });

  if (!updatedUser) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  await writeAuditLogSafe({
    actorType: "user",
    actorId: req.user.id,
    action: "user.profile.updated",
    targetType: "user",
    targetId: req.user.id,
    detail: {
      updatedUsername: hasUsername,
      updatedEmail: hasEmail
    }
  });

  res.json({ user: toPublicUser(updatedUser) });
}));

router.patch("/me/store", requireAuth, asyncHandler(async (req, res) => {
  const kodeToko = normalizeStoreCode(req.body?.kodeToko);
  if (kodeToko === null) {
    res.status(400).json({ error: "kodeToko must be 3-64 chars (a-z, A-Z, 0-9, ., _, -)" });
    return;
  }

  if (kodeToko && String(kodeToko).toLowerCase() !== String(req.user.kodeToko || "").toLowerCase()) {
    const existingStoreUser = await getUserByStoreCode(kodeToko);
    if (existingStoreUser && existingStoreUser.id !== req.user.id) {
      res.status(409).json({ error: "kodeToko already exists" });
      return;
    }
  }

  const currentConfig = req.user.konfigurasiToko && typeof req.user.konfigurasiToko === "object"
    ? req.user.konfigurasiToko
    : {};
  const requestedService = req.body?.layanan && typeof req.body.layanan === "object"
    ? req.body.layanan
    : {};
  const waktuOperasional = normalizeOperationalSchedule(
    req.body?.waktuOperasional,
    currentConfig.waktuOperasional || currentConfig.waktu_operasional
  );
  const jamOperasional = normalizeOptionalText(req.body?.jamOperasional, 500)
    || summarizeOperationalSchedule(waktuOperasional);

  const konfigurasiToko = {
    ...currentConfig,
    namaToko: normalizeOptionalText(req.body?.storeName, 80),
    statusToko: normalizeStoreStatus(req.body?.statusToko),
    jamOperasional,
    waktuOperasional,
    forceOpenOutsideOperationalHours: normalizeBoolean(req.body?.forceOpenOutsideOperationalHours, false),
    kontak: normalizeOptionalText(req.body?.kontak, 80),
    layanan: {
      ...(currentConfig.layanan && typeof currentConfig.layanan === "object" ? currentConfig.layanan : {}),
      jenisKertas: normalizePaperTypes(requestedService.jenisKertas),
      modeWarna: normalizeColorMode(requestedService.modeWarna),
      hargaDasar: normalizeNonNegativeNumber(requestedService.hargaDasar, 0),
      batasFileMb: normalizeFileLimitMb(requestedService.batasFileMb)
    }
  };

  const updatedUser = await updateUserStoreSettings(req.user.id, {
    alamat: normalizeOptionalText(req.body?.alamat, 500),
    kodeToko,
    konfigurasiToko
  });

  if (!updatedUser) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  await writeAuditLogSafe({
    actorType: "user",
    actorId: req.user.id,
    action: "user.store_settings.updated",
    targetType: "user",
    targetId: req.user.id,
    detail: {
      updatedStoreSettings: true,
      hasKodeToko: Boolean(kodeToko)
    }
  });

  res.json({ user: toPublicUser(updatedUser) });
}));

router.patch("/me/password", requireAuth, asyncHandler(async (req, res) => {
  const currentPassword = String(req.body?.currentPassword || "");
  const newPassword = normalizePassword(req.body?.newPassword);

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: "currentPassword and newPassword are required (min 8 chars)" });
    return;
  }

  if (!req.user.passwordHash) {
    res.status(400).json({ error: "Current password is not set for this account" });
    return;
  }

  const currentPasswordValid = await verifyPassword(currentPassword, req.user.passwordHash);
  if (!currentPasswordValid) {
    res.status(401).json({ error: "Current password is invalid" });
    return;
  }

  const isSamePassword = await verifyPassword(newPassword, req.user.passwordHash);
  if (isSamePassword) {
    res.status(400).json({ error: "newPassword must be different from currentPassword" });
    return;
  }

  const nextPasswordHash = await hashPassword(newPassword);
  const updatedUser = await updateUserPasswordHash(req.user.id, nextPasswordHash);
  if (!updatedUser) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  await revokeAllUserRefreshTokens(req.user.id);

  await writeAuditLogSafe({
    actorType: "user",
    actorId: req.user.id,
    action: "user.password.updated",
    targetType: "user",
    targetId: req.user.id,
    detail: {
      refreshTokensRevoked: true
    }
  });

  res.json({
    ok: true,
    message: "Password updated. Please sign in again on other devices."
  });
}));

router.patch("/me/pin", requireAuth, asyncHandler(async (req, res) => {
  const currentPassword = String(req.body?.currentPassword || "");
  const pin = normalizePin(req.body?.pin);

  if (!currentPassword || !pin) {
    res.status(400).json({ error: "currentPassword and pin are required (pin 4-8 digit)" });
    return;
  }

  if (!req.user.passwordHash) {
    res.status(400).json({ error: "Current password is not set for this account" });
    return;
  }

  const currentPasswordValid = await verifyPassword(currentPassword, req.user.passwordHash);
  if (!currentPasswordValid) {
    res.status(401).json({ error: "Current password is invalid" });
    return;
  }

  const pinHash = await hashPassword(pin);
  const updatedUser = await updateUserPinHash(req.user.id, pinHash);
  if (!updatedUser) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  await writeAuditLogSafe({
    actorType: "user",
    actorId: req.user.id,
    action: "user.pin.updated",
    targetType: "user",
    targetId: req.user.id,
    detail: {
      pinLength: pin.length
    }
  });

  res.json({ ok: true, message: "PIN updated" });
}));

router.post("/verify-pin", requireAuth, asyncHandler(async (req, res) => {
  const pin = normalizePin(req.body?.pin);
  if (!pin) {
    res.status(400).json({ error: "pin is required (4-8 digit)" });
    return;
  }

  if (!req.user.pinHash) {
    res.status(409).json({ error: "PIN akun belum diatur. Atur PIN di halaman akun mitra." });
    return;
  }

  const valid = await verifyPassword(pin, req.user.pinHash);
  if (!valid) {
    res.status(401).json({ error: "PIN tidak valid" });
    return;
  }

  res.json({ ok: true });
}));

module.exports = router;

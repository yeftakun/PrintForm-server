const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  AUTH_ACCESS_TOKEN_SECRET,
  AUTH_REFRESH_TOKEN_SECRET,
  AUTH_ACCESS_TOKEN_TTL,
  AUTH_REFRESH_TOKEN_TTL_DAYS,
  AUTH_BCRYPT_ROUNDS
} = require("../config");

const ACCESS_TOKEN_TYPE = "access";
const REFRESH_TOKEN_TYPE = "refresh";

function createOpaqueId(prefix) {
  const value = typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}_${value}`;
}

function toPublicUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username || null,
    email: user.email || null,
    role: user.role || "user",
    createdAt: user.createdAt || null
  };
}

function getRefreshTokenExpiryDate() {
  const days = Math.max(1, Number(AUTH_REFRESH_TOKEN_TTL_DAYS) || 30);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function hashToken(rawToken) {
  return crypto
    .createHash("sha256")
    .update(String(rawToken || ""))
    .digest("hex");
}

async function hashPassword(password) {
  const rounds = Math.max(8, Number(AUTH_BCRYPT_ROUNDS) || 12);
  return bcrypt.hash(password, rounds);
}

async function verifyPassword(password, passwordHash) {
  if (!passwordHash) {
    return false;
  }
  return bcrypt.compare(password, passwordHash);
}

function buildAccessTokenPayload(user) {
  return {
    sub: user.id,
    username: user.username || null,
    role: user.role || "user",
    tokenType: ACCESS_TOKEN_TYPE
  };
}

function buildRefreshTokenPayload({ user, tokenId }) {
  return {
    sub: user.id,
    tokenId,
    tokenType: REFRESH_TOKEN_TYPE
  };
}

function createAccessToken(user) {
  const payload = buildAccessTokenPayload(user);
  return jwt.sign(payload, AUTH_ACCESS_TOKEN_SECRET, {
    expiresIn: AUTH_ACCESS_TOKEN_TTL
  });
}

function createRefreshToken({ user, tokenId }) {
  const payload = buildRefreshTokenPayload({ user, tokenId });
  const days = Math.max(1, Number(AUTH_REFRESH_TOKEN_TTL_DAYS) || 30);
  return jwt.sign(payload, AUTH_REFRESH_TOKEN_SECRET, {
    expiresIn: `${days}d`
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, AUTH_ACCESS_TOKEN_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, AUTH_REFRESH_TOKEN_SECRET);
}

module.exports = {
  ACCESS_TOKEN_TYPE,
  REFRESH_TOKEN_TYPE,
  createOpaqueId,
  toPublicUser,
  getRefreshTokenExpiryDate,
  hashToken,
  hashPassword,
  verifyPassword,
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};

const { asyncHandler } = require("../utils/asyncHandler");
const { getUserById } = require("../repositories/usersRepository");
const { verifyAccessToken, ACCESS_TOKEN_TYPE } = require("../services/auth");

function buildAuthError(message, statusCode = 401) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function extractBearerToken(req) {
  const header = req.headers?.authorization;
  if (typeof header !== "string") {
    return null;
  }

  const [scheme, token] = header.trim().split(/\s+/, 2);
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return null;
  }

  return token;
}

async function resolveAuthenticatedUser(accessToken) {
  let payload = null;
  try {
    payload = verifyAccessToken(accessToken);
  } catch {
    throw buildAuthError("Invalid or expired access token", 401);
  }

  if (payload?.tokenType !== ACCESS_TOKEN_TYPE) {
    throw buildAuthError("Invalid access token type", 401);
  }

  const userId = payload?.sub;
  if (!userId) {
    throw buildAuthError("Invalid access token payload", 401);
  }

  const user = await getUserById(userId);
  if (!user) {
    throw buildAuthError("User not found", 401);
  }

  return {
    user,
    tokenPayload: payload
  };
}

const optionalAuth = asyncHandler(async (req, res, next) => {
  const accessToken = extractBearerToken(req);
  if (!accessToken) {
    req.user = null;
    req.tokenPayload = null;
    next();
    return;
  }

  const resolved = await resolveAuthenticatedUser(accessToken);
  req.user = resolved.user;
  req.tokenPayload = resolved.tokenPayload;
  next();
});

const requireAuth = asyncHandler(async (req, res, next) => {
  const accessToken = extractBearerToken(req);
  if (!accessToken) {
    throw buildAuthError("Authentication required", 401);
  }

  const resolved = await resolveAuthenticatedUser(accessToken);
  req.user = resolved.user;
  req.tokenPayload = resolved.tokenPayload;
  next();
});

module.exports = {
  optionalAuth,
  requireAuth,
  extractBearerToken
};

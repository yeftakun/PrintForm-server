const crypto = require("crypto");
const {
  TURNSTILE_ENABLED,
  TURNSTILE_SECRET_KEY,
  TURNSTILE_VERIFY_URL,
  TURNSTILE_ALLOWED_HOSTNAMES
} = require("../config");

function getRequesterIp(req) {
  const cfConnectingIp = req.headers["cf-connecting-ip"];
  if (typeof cfConnectingIp === "string" && cfConnectingIp.trim()) {
    return cfConnectingIp.trim();
  }

  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || "";
}

function getTurnstileToken(req) {
  return String(
    req.body?.turnstileToken
    || req.body?.cfTurnstileResponse
    || req.body?.["cf-turnstile-response"]
    || ""
  ).trim();
}

function createTurnstileError(message, statusCode = 400, code = "TURNSTILE_FAILED") {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

async function verifyTurnstileToken(token, remoteIp) {
  if (!TURNSTILE_SECRET_KEY) {
    throw createTurnstileError("Konfigurasi Turnstile belum lengkap.", 503, "TURNSTILE_NOT_CONFIGURED");
  }

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      secret: TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: remoteIp || undefined,
      idempotency_key: crypto.randomUUID()
    })
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    const errorCodes = Array.isArray(result?.["error-codes"]) ? result["error-codes"] : [];
    const err = createTurnstileError(
      "Verifikasi keamanan gagal. Silakan coba lagi.",
      400,
      "TURNSTILE_INVALID"
    );
    err.turnstileErrors = errorCodes;
    throw err;
  }

  const hostname = String(result.hostname || "").toLowerCase();
  if (
    TURNSTILE_ALLOWED_HOSTNAMES.length > 0
    && hostname
    && !TURNSTILE_ALLOWED_HOSTNAMES.includes(hostname)
  ) {
    throw createTurnstileError("Hostname verifikasi tidak sesuai.", 400, "TURNSTILE_HOSTNAME_MISMATCH");
  }

  return result;
}

function requireTurnstile(req, res, next) {
  if (!TURNSTILE_ENABLED) {
    next();
    return;
  }

  const token = getTurnstileToken(req);
  if (!token) {
    res.status(400).json({
      error: "Verifikasi keamanan wajib diselesaikan.",
      code: "TURNSTILE_TOKEN_REQUIRED"
    });
    return;
  }

  verifyTurnstileToken(token, getRequesterIp(req))
    .then(result => {
      req.turnstile = {
        success: true,
        challengeTs: result.challenge_ts || null,
        hostname: result.hostname || null,
        action: result.action || null,
        cdata: result.cdata || null
      };
      next();
    })
    .catch(err => {
      console.warn("Turnstile verification failed:", {
        code: err.code,
        errors: err.turnstileErrors || [],
        ip: getRequesterIp(req)
      });

      res.status(err.statusCode || 400).json({
        error: err.message || "Verifikasi keamanan gagal.",
        code: err.code || "TURNSTILE_FAILED"
      });
    });
}

module.exports = {
  requireTurnstile,
  verifyTurnstileToken
};
function createInMemoryRateLimiter(options) {
  const {
    windowMs,
    maxRequests,
    keyFn,
    errorMessage = "Too many requests"
  } = options || {};

  if (!Number.isFinite(windowMs) || windowMs <= 0) {
    throw new Error("windowMs must be a positive number");
  }
  if (!Number.isFinite(maxRequests) || maxRequests <= 0) {
    throw new Error("maxRequests must be a positive number");
  }
  if (typeof keyFn !== "function") {
    throw new Error("keyFn is required");
  }

  const buckets = new Map();
  let hitCounter = 0;

  function cleanupExpired(nowMs) {
    for (const [key, bucket] of buckets.entries()) {
      if (bucket.resetAt <= nowMs) {
        buckets.delete(key);
      }
    }
  }

  return function inMemoryRateLimiter(req, res, next) {
    const nowMs = Date.now();
    const key = keyFn(req);

    if (!key) {
      next();
      return;
    }

    hitCounter += 1;
    if (hitCounter >= 200) {
      cleanupExpired(nowMs);
      hitCounter = 0;
    }

    const current = buckets.get(key);
    if (!current || current.resetAt <= nowMs) {
      buckets.set(key, { count: 1, resetAt: nowMs + windowMs });
      next();
      return;
    }

    current.count += 1;
    if (current.count > maxRequests) {
      const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - nowMs) / 1000));
      res.setHeader("Retry-After", String(retryAfterSeconds));
      res.status(429).json({
        error: errorMessage,
        retryAfterSeconds
      });
      return;
    }

    next();
  };
}

module.exports = {
  createInMemoryRateLimiter
};

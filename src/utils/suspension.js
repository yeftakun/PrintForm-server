function normalizeBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) return true;
    if (["0", "false", "no", "off"].includes(normalized)) return false;
  }
  return fallback;
}

function getUserConfig(user) {
  return user?.konfigurasiToko && typeof user.konfigurasiToko === "object"
    ? user.konfigurasiToko
    : {};
}

function isUserSuspended(user) {
  if (!user || String(user.role || "").toLowerCase() === "admin") {
    return false;
  }

  const config = getUserConfig(user);
  return normalizeBoolean(config.is_suspend ?? config.isSuspend ?? config.suspended, false);
}

module.exports = {
  normalizeBoolean,
  getUserConfig,
  isUserSuspended
};

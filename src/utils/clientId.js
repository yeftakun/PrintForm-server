const GUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function normalizeClientId(value) {
  if (typeof value !== "string") {
    return null;
  }

  let normalized = value.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  // Accept GUID values with optional braces from some clients.
  if (normalized.startsWith("{") && normalized.endsWith("}")) {
    normalized = normalized.slice(1, -1).trim();
  }

  return normalized || null;
}

function isValidClientId(clientId) {
  return typeof clientId === "string" && GUID_REGEX.test(clientId);
}

module.exports = {
  normalizeClientId,
  isValidClientId
};

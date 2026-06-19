const crypto = require("crypto");
const { useDb } = require("../config");
const { query, withTransaction } = require("../db");
const { readInstallers, writeInstallers } = require("../storage/jsonStore");

const DEFAULT_INSTALLER = {
  id: "installer_1_3_1",
  version: "1.3.1",
  downloadUrl: "https://github.com/yeftakun/PrintForm/releases/download/1.3.1/PrintOrder-Setup-1.3.1.exe",
  label: "PrintOrder Installer v1.3.1",
  fileSizeLabel: "56MB",
  notes: "Windows installer",
  isActive: true,
  isPrimary: true,
  createdAt: "2026-06-19T00:00:00.000Z",
  updatedAt: "2026-06-19T00:00:00.000Z"
};

function createClientError(message, statusCode = 400, code = "INSTALLER_INVALID_INPUT") {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

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

function normalizeRequiredText(value, fieldName, maxLength) {
  const text = String(value || "").trim();
  if (!text) {
    throw createClientError(`${fieldName} wajib diisi.`);
  }
  return text.slice(0, maxLength);
}

function normalizeOptionalText(value, maxLength) {
  const text = String(value || "").trim();
  return text ? text.slice(0, maxLength) : "";
}

function normalizeVersion(value) {
  const version = normalizeRequiredText(value, "Versi installer", 64);
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._+-]*$/.test(version)) {
    throw createClientError("Versi installer hanya boleh berisi huruf, angka, titik, dash, underscore, dan plus.");
  }
  return version;
}

function normalizeDownloadUrl(value) {
  const downloadUrl = normalizeRequiredText(value, "Link download installer", 1200);
  let url = null;
  try {
    url = new URL(downloadUrl);
  } catch {
    throw createClientError("Link download installer tidak valid.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw createClientError("Link download installer harus memakai http atau https.");
  }

  return url.toString();
}

function normalizeInstallerPayload(payload = {}, existing = null) {
  const version = normalizeVersion(payload.version ?? existing?.version);
  const downloadUrl = normalizeDownloadUrl(payload.downloadUrl ?? payload.download_url ?? existing?.downloadUrl);
  const label = normalizeOptionalText(payload.label ?? existing?.label, 160)
    || `PrintOrder Installer v${version}`;
  const fileSizeLabel = normalizeOptionalText(
    payload.fileSizeLabel ?? payload.file_size_label ?? existing?.fileSizeLabel,
    32
  );
  const notes = normalizeOptionalText(payload.notes ?? existing?.notes, 500);
  const isActive = normalizeBoolean(payload.isActive ?? payload.is_active, existing?.isActive ?? true);
  const isPrimary = normalizeBoolean(payload.isPrimary ?? payload.is_primary, existing?.isPrimary ?? false);

  return {
    version,
    downloadUrl,
    label,
    fileSizeLabel,
    notes,
    isActive,
    isPrimary
  };
}

function createInstallerId() {
  return `installer_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
}

function toIso(value) {
  return value?.toISOString?.() || value || null;
}

function toPublicInstaller(row) {
  if (!row) return null;
  return {
    id: row.id,
    version: row.version,
    downloadUrl: row.download_url || row.downloadUrl,
    label: row.label || `PrintOrder Installer v${row.version}`,
    fileSizeLabel: row.file_size_label || row.fileSizeLabel || "",
    notes: row.notes || "",
    isActive: Boolean(row.is_active ?? row.isActive),
    isPrimary: Boolean(row.is_primary ?? row.isPrimary),
    createdAt: toIso(row.created_at || row.createdAt),
    updatedAt: toIso(row.updated_at || row.updatedAt)
  };
}

function parseVersionParts(version) {
  return String(version || "")
    .split(/[._+-]/)
    .map(part => (/^\d+$/.test(part) ? Number(part) : part.toLowerCase()));
}

function compareVersionDesc(a, b) {
  const left = parseVersionParts(a?.version);
  const right = parseVersionParts(b?.version);
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const l = left[index] ?? 0;
    const r = right[index] ?? 0;
    if (l === r) continue;
    if (typeof l === "number" && typeof r === "number") return r - l;
    return String(r).localeCompare(String(l));
  }
  return new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime();
}

function sortInstallers(installers = []) {
  return [...installers].sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    return compareVersionDesc(a, b);
  });
}

function resolveCurrentInstaller(installers = []) {
  const active = installers.filter(installer => installer.isActive);
  if (!active.length) return null;
  return sortInstallers(active)[0] || null;
}

async function listInstallers() {
  if (!useDb) {
    const rows = await readInstallers();
    const installers = Array.isArray(rows) && rows.length
      ? rows.map(toPublicInstaller).filter(Boolean)
      : [DEFAULT_INSTALLER];
    return sortInstallers(installers);
  }

  const result = await query(
    `SELECT id, version, download_url, label, file_size_label, notes, is_active, is_primary, created_at, updated_at
       FROM installers
      ORDER BY is_primary DESC, is_active DESC, created_at DESC`
  );
  return sortInstallers(result.rows.map(toPublicInstaller).filter(Boolean));
}

async function getInstallerCatalog({ includeInactive = false } = {}) {
  const installers = await listInstallers();
  const availableInstallers = includeInactive
    ? installers
    : installers.filter(installer => installer.isActive);
  const current = resolveCurrentInstaller(availableInstallers);
  return {
    current,
    installers: sortInstallers(availableInstallers),
    otherInstallers: sortInstallers(availableInstallers.filter(installer => installer.id !== current?.id))
  };
}

async function createInstaller(payload = {}) {
  const normalized = normalizeInstallerPayload(payload);
  const id = createInstallerId();
  const nowIso = new Date().toISOString();

  if (!useDb) {
    const installers = await readInstallers();
    const nextInstaller = {
      id,
      ...normalized,
      createdAt: nowIso,
      updatedAt: nowIso
    };
    if (nextInstaller.isPrimary) {
      installers.forEach(installer => {
        installer.isPrimary = false;
      });
    }
    installers.unshift(nextInstaller);
    await writeInstallers(installers);
    return toPublicInstaller(nextInstaller);
  }

  return withTransaction(async client => {
    if (normalized.isPrimary) {
      await client.query("UPDATE installers SET is_primary = false, updated_at = now()");
    }

    const result = await client.query(
      `INSERT INTO installers (id, version, download_url, label, file_size_label, notes, is_active, is_primary)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, version, download_url, label, file_size_label, notes, is_active, is_primary, created_at, updated_at`,
      [
        id,
        normalized.version,
        normalized.downloadUrl,
        normalized.label,
        normalized.fileSizeLabel || null,
        normalized.notes || null,
        normalized.isActive,
        normalized.isPrimary
      ]
    );
    return toPublicInstaller(result.rows[0]);
  });
}

async function updateInstaller(id, payload = {}) {
  const installerId = String(id || "").trim();
  if (!installerId) {
    throw createClientError("Installer tidak ditemukan.", 404, "INSTALLER_NOT_FOUND");
  }

  if (!useDb) {
    const installers = await readInstallers();
    const index = installers.findIndex(installer => installer.id === installerId);
    if (index === -1) {
      throw createClientError("Installer tidak ditemukan.", 404, "INSTALLER_NOT_FOUND");
    }
    const existing = toPublicInstaller(installers[index]);
    const normalized = normalizeInstallerPayload(payload, existing);
    if (normalized.isPrimary) {
      installers.forEach(installer => {
        installer.isPrimary = false;
      });
    }
    installers[index] = {
      ...installers[index],
      ...normalized,
      updatedAt: new Date().toISOString()
    };
    await writeInstallers(installers);
    return toPublicInstaller(installers[index]);
  }

  return withTransaction(async client => {
    const existingResult = await client.query(
      `SELECT id, version, download_url, label, file_size_label, notes, is_active, is_primary, created_at, updated_at
         FROM installers
        WHERE id = $1`,
      [installerId]
    );
    if (!existingResult.rows.length) {
      throw createClientError("Installer tidak ditemukan.", 404, "INSTALLER_NOT_FOUND");
    }

    const normalized = normalizeInstallerPayload(payload, toPublicInstaller(existingResult.rows[0]));
    if (normalized.isPrimary) {
      await client.query("UPDATE installers SET is_primary = false, updated_at = now()");
    }

    const result = await client.query(
      `UPDATE installers
          SET version = $2,
              download_url = $3,
              label = $4,
              file_size_label = $5,
              notes = $6,
              is_active = $7,
              is_primary = $8,
              updated_at = now()
        WHERE id = $1
        RETURNING id, version, download_url, label, file_size_label, notes, is_active, is_primary, created_at, updated_at`,
      [
        installerId,
        normalized.version,
        normalized.downloadUrl,
        normalized.label,
        normalized.fileSizeLabel || null,
        normalized.notes || null,
        normalized.isActive,
        normalized.isPrimary
      ]
    );
    return toPublicInstaller(result.rows[0]);
  });
}

async function setInstallerActive(id, value) {
  const installerId = String(id || "").trim();
  const isActive = normalizeBoolean(value, false);

  if (!useDb) {
    const installers = await readInstallers();
    const installer = installers.find(item => item.id === installerId);
    if (!installer) {
      throw createClientError("Installer tidak ditemukan.", 404, "INSTALLER_NOT_FOUND");
    }
    installer.isActive = isActive;
    if (!isActive) {
      installer.isPrimary = false;
    }
    installer.updatedAt = new Date().toISOString();
    await writeInstallers(installers);
    return toPublicInstaller(installer);
  }

  const result = await query(
    `UPDATE installers
        SET is_active = $2,
            is_primary = CASE WHEN $2 = false THEN false ELSE is_primary END,
            updated_at = now()
      WHERE id = $1
      RETURNING id, version, download_url, label, file_size_label, notes, is_active, is_primary, created_at, updated_at`,
    [installerId, isActive]
  );
  if (!result.rows.length) {
    throw createClientError("Installer tidak ditemukan.", 404, "INSTALLER_NOT_FOUND");
  }
  return toPublicInstaller(result.rows[0]);
}

async function setPrimaryInstaller(id) {
  const installerId = String(id || "").trim();

  if (!useDb) {
    const installers = await readInstallers();
    const installer = installers.find(item => item.id === installerId);
    if (!installer) {
      throw createClientError("Installer tidak ditemukan.", 404, "INSTALLER_NOT_FOUND");
    }
    installers.forEach(item => {
      item.isPrimary = item.id === installerId;
      if (item.id === installerId) {
        item.isActive = true;
        item.updatedAt = new Date().toISOString();
      }
    });
    await writeInstallers(installers);
    return toPublicInstaller(installer);
  }

  return withTransaction(async client => {
    const existing = await client.query("SELECT id FROM installers WHERE id = $1", [installerId]);
    if (!existing.rows.length) {
      throw createClientError("Installer tidak ditemukan.", 404, "INSTALLER_NOT_FOUND");
    }
    await client.query("UPDATE installers SET is_primary = false, updated_at = now()");
    const result = await client.query(
      `UPDATE installers
          SET is_primary = true,
              is_active = true,
              updated_at = now()
        WHERE id = $1
        RETURNING id, version, download_url, label, file_size_label, notes, is_active, is_primary, created_at, updated_at`,
      [installerId]
    );
    return toPublicInstaller(result.rows[0]);
  });
}

module.exports = {
  getInstallerCatalog,
  listInstallers,
  createInstaller,
  updateInstaller,
  setInstallerActive,
  setPrimaryInstaller
};

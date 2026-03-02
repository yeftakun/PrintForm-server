function normalizePaperSize(value) {
  const v = String(value || "").toUpperCase().trim();
  if (v === "A4" || v === "A5") {
    return v;
  }
  return null;
}

function normalizeCopies(value) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 1 || n > 999) {
    return null;
  }
  return n;
}

function normalizeName(value) {
  const v = String(value || "").trim();
  if (!v) {
    return null;
  }
  return v.slice(0, 120);
}

function normalizePrinters(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => String(item || "").trim())
    .filter(item => item.length > 0)
    .slice(0, 50);
}

function normalizeSelectedPrinter(value, printers) {
  const v = String(value || "").trim();
  if (!v) {
    return null;
  }
  if (Array.isArray(printers) && printers.length > 0) {
    return printers.includes(v) ? v : null;
  }
  return v.slice(0, 120);
}

function normalizeAlias(value) {
  const v = String(value || "").trim();
  if (!v) {
    return null;
  }
  return v.slice(0, 80);
}

module.exports = {
  normalizePaperSize,
  normalizeCopies,
  normalizeName,
  normalizePrinters,
  normalizeSelectedPrinter,
  normalizeAlias
};

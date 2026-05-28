function normalizePaperSize(value) {
  const v = String(value || "").toUpperCase().trim();
  const allowed = {
    A3: "A3",
    A4: "A4",
    A5: "A5",
    A6: "A6",
    B4: "B4",
    B5: "B5",
    F4: "F4",
    LETTER: "Letter",
    LEGAL: "Legal",
    FOLIO: "Folio",
    KWARTO: "Kwarto",
    AMPLOP: "Amplop"
  };
  return allowed[v] || null;
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

function normalizeColorMode(value) {
  const v = String(value || "").toLowerCase().trim();
  if (v === "bw") {
    return "bw";
  }
  return "color";
}

function normalizeOrientation(value) {
  const v = String(value || "").toLowerCase().trim();
  if (v === "landscape") {
    return "landscape";
  }
  return "portrait";
}

function normalizePageRange(value) {
  const v = String(value || "").trim();
  if (!v) {
    return null;
  }
  if (v.length > 50) {
    return null; // Too long
  }
  // Allow digits, comma, hyphen, space
  if (!/^[0-9,\-\s]+$/.test(v)) {
    return null; // Invalid characters
  }
  return v;
}

function normalizeContentScale(value) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) {
    return 100; // Default
  }
  if (n < 10) return 10;
  if (n > 500) return 500;
  return n;
}

function normalizeNotes(value) {
  const v = String(value || "").trim();
  if (!v) {
    return null;
  }
  return v.slice(0, 500);
}

module.exports = {
  normalizePaperSize,
  normalizeCopies,
  normalizeName,
  normalizePrinters,
  normalizeSelectedPrinter,
  normalizeAlias,
  normalizeColorMode,
  normalizeOrientation,
  normalizePageRange,
  normalizeContentScale,
  normalizeNotes
};

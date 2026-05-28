const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const DAY_LABELS = {
  sunday: "Minggu",
  monday: "Senin",
  tuesday: "Selasa",
  wednesday: "Rabu",
  thursday: "Kamis",
  friday: "Jumat",
  saturday: "Sabtu"
};

const DEFAULT_OPERATIONAL_SCHEDULE = DAY_KEYS.map(day => ({
  day,
  enabled: true,
  open: "08:00",
  close: "21:00"
}));

function cloneDefaultSchedule() {
  return DEFAULT_OPERATIONAL_SCHEDULE.map(item => ({ ...item }));
}

function normalizeOperationalTime(value, fallback) {
  const text = String(value || "").trim();
  const match = text.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  return match ? text : fallback;
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

function scheduleToMap(schedule) {
  const map = new Map();
  if (!Array.isArray(schedule)) {
    return map;
  }
  schedule.forEach(item => {
    const day = String(item?.day || item?.key || item?.hari || "").trim().toLowerCase();
    if (DAY_KEYS.includes(day)) {
      map.set(day, item);
    }
  });
  return map;
}

function normalizeOperationalSchedule(value, fallback = null) {
  const fallbackSchedule = Array.isArray(fallback) && fallback.length > 0
    ? fallback
    : cloneDefaultSchedule();
  const fallbackMap = scheduleToMap(fallbackSchedule);
  const inputMap = scheduleToMap(Array.isArray(value) ? value : []);

  return DAY_KEYS.map(day => {
    const fallbackRow = fallbackMap.get(day) || DEFAULT_OPERATIONAL_SCHEDULE.find(item => item.day === day);
    const inputRow = inputMap.get(day) || {};
    const hasInput = inputMap.has(day);

    return {
      day,
      enabled: hasInput
        ? normalizeBoolean(inputRow.enabled ?? inputRow.aktif, Boolean(fallbackRow?.enabled))
        : Boolean(fallbackRow?.enabled),
      open: normalizeOperationalTime(inputRow.open ?? inputRow.buka, fallbackRow?.open || "08:00"),
      close: normalizeOperationalTime(inputRow.close ?? inputRow.tutup, fallbackRow?.close || "21:00")
    };
  });
}

function timeToMinutes(value) {
  const [hour, minute] = String(value || "").split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return null;
  }
  return hour * 60 + minute;
}

function getTodaySchedule(schedule, date = new Date()) {
  const normalizedSchedule = normalizeOperationalSchedule(schedule);
  const day = DAY_KEYS[date.getDay()];
  return normalizedSchedule.find(item => item.day === day) || null;
}

function isWithinOperationalSchedule(schedule, date = new Date()) {
  const today = getTodaySchedule(schedule, date);
  if (!today?.enabled) {
    return false;
  }

  const openMinutes = timeToMinutes(today.open);
  const closeMinutes = timeToMinutes(today.close);
  if (openMinutes === null || closeMinutes === null) {
    return false;
  }

  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  if (openMinutes === closeMinutes) {
    return true;
  }
  if (closeMinutes > openMinutes) {
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  }
  return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
}

function summarizeOperationalSchedule(schedule, date = new Date()) {
  const normalizedSchedule = normalizeOperationalSchedule(schedule);
  const activeRows = normalizedSchedule.filter(item => item.enabled);
  if (activeRows.length === 0) {
    return "Semua hari tutup";
  }

  const sameHours = activeRows.every(item => item.open === activeRows[0].open && item.close === activeRows[0].close);
  if (activeRows.length === 7 && sameHours) {
    return `Setiap hari ${activeRows[0].open} - ${activeRows[0].close}`;
  }

  const today = getTodaySchedule(normalizedSchedule, date);
  const todayText = today?.enabled
    ? `${DAY_LABELS[today.day]} ${today.open} - ${today.close}`
    : `${DAY_LABELS[today?.day]} tutup`;
  return `${activeRows.length} hari aktif. Hari ini: ${todayText}`;
}

function getOperationalState(config, date = new Date()) {
  const source = config && typeof config === "object" ? config : {};
  const schedule = normalizeOperationalSchedule(source.waktuOperasional || source.waktu_operasional);
  const isWithinHours = isWithinOperationalSchedule(schedule, date);
  const manualStatus = String(source.statusToko || source.status_toko || "open").toLowerCase() === "closed"
    ? "closed"
    : "open";
  const forceOpenOutsideOperationalHours = normalizeBoolean(
    source.forceOpenOutsideOperationalHours ?? source.force_open_outside_operational_hours,
    false
  );
  const isForcedOpenOutsideHours = manualStatus === "open" && !isWithinHours && forceOpenOutsideOperationalHours;
  const status = manualStatus === "closed"
    ? "closed"
    : isWithinHours || isForcedOpenOutsideHours
      ? "open"
      : "closed";

  return {
    status,
    schedule,
    isWithinHours,
    forceOpenOutsideOperationalHours,
    isForcedOpenOutsideHours,
    summary: summarizeOperationalSchedule(schedule, date)
  };
}

module.exports = {
  DAY_KEYS,
  DAY_LABELS,
  DEFAULT_OPERATIONAL_SCHEDULE,
  normalizeOperationalSchedule,
  summarizeOperationalSchedule,
  getOperationalState,
  isWithinOperationalSchedule
};

(() => {
  const authShell = document.querySelector(".auth-shell");
  const dashboardShell = document.getElementById("dashboardShell");
  const dashboardUserChip = document.getElementById("dashboardUserChip");
  const dashboardStoreCode = document.getElementById("dashboardStoreCode");
  const dashboardLastSync = document.getElementById("dashboardLastSync");
  const storeOverrideBadge = document.getElementById("storeOverrideBadge");

  const heroText = document.getElementById("heroText");
  const heroStatus = document.getElementById("heroStatus");
  const linkedClientsStatus = document.getElementById("linkedClientsStatus");
  const linkedClientsBody = document.getElementById("linkedClientsBody");
  const refreshLinkedClientsBtn = document.getElementById("refreshLinkedClientsBtn");
  const connectClientBtn = document.getElementById("connectClientBtn");
  const downloadClientBtn = document.getElementById("downloadClientBtn");

  const statClientOnline = document.getElementById("statClientOnline");
  const statJobsToday = document.getElementById("statJobsToday");
  const statJobsDone = document.getElementById("statJobsDone");
  const statJobsFailed = document.getElementById("statJobsFailed");
  const openAllJobsModalBtn = document.getElementById("openAllJobsModalBtn");
  const allJobsModalBackdrop = document.getElementById("allJobsModalBackdrop");
  const allJobsTableBody = document.getElementById("allJobsTableBody");
  const jobsStatusFilter = document.getElementById("jobsStatusFilter");
  const jobsSearchInput = document.getElementById("jobsSearchInput");

  const storeSettingsForm = document.getElementById("storeSettingsForm");
  const serviceSettingsForm = document.getElementById("serviceSettingsForm");
  const storeSettingsStatus = document.getElementById("storeSettingsStatus");
  const serviceSettingsStatus = document.getElementById("serviceSettingsStatus");
  const storeOperationalSummary = document.getElementById("storeOperationalSummary");
  const openOperationalHoursBtn = document.getElementById("openOperationalHoursBtn");
  const storeQrCanvas = document.getElementById("storeQrCanvas");
  const storeQrUrl = document.getElementById("storeQrUrl");
  const storeQrStatus = document.getElementById("storeQrStatus");
  const downloadStoreQrBtn = document.getElementById("downloadStoreQrBtn");

  const accountUsername = document.getElementById("accountUsername");
  const accountEmail = document.getElementById("accountEmail");
  const accountPinStatus = document.getElementById("accountPinStatus");
  const activityList = document.getElementById("activityList");

  const registerModalBackdrop = document.getElementById("registerModalBackdrop");
  const operationalHoursModalBackdrop = document.getElementById("operationalHoursModalBackdrop");
  const profileModalBackdrop = document.getElementById("profileModalBackdrop");
  const passwordModalBackdrop = document.getElementById("passwordModalBackdrop");
  const pinModalBackdrop = document.getElementById("pinModalBackdrop");
  const openRegisterBtn = document.getElementById("openRegisterBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const toLoginBtn = document.getElementById("toLoginBtn");

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const accountProfileForm = document.getElementById("accountProfileForm");
  const accountPasswordForm = document.getElementById("accountPasswordForm");
  const accountPinForm = document.getElementById("accountPinForm");

  const loginStatus = document.getElementById("loginStatus");
  const registerStatus = document.getElementById("registerStatus");
  const operationalHoursStatus = document.getElementById("operationalHoursStatus");
  const operationalDaysList = document.getElementById("operationalDaysList");
  const saveOperationalHoursBtn = document.getElementById("saveOperationalHoursBtn");
  const accountProfileStatus = document.getElementById("accountProfileStatus");
  const accountPasswordStatus = document.getElementById("accountPasswordStatus");
  const accountPinStatusMessage = document.getElementById("accountPinStatusMessage");

  const unbindInProgress = new Set();
  const OPERATIONAL_DAYS = [
    { key: "monday", label: "Senin" },
    { key: "tuesday", label: "Selasa" },
    { key: "wednesday", label: "Rabu" },
    { key: "thursday", label: "Kamis" },
    { key: "friday", label: "Jumat" },
    { key: "saturday", label: "Sabtu" },
    { key: "sunday", label: "Minggu" }
  ];
  const DATE_DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const DEFAULT_OPERATIONAL_SCHEDULE = OPERATIONAL_DAYS.map(day => ({
    day: day.key,
    enabled: true,
    open: "08:00",
    close: "21:00"
  }));
  const PAPER_SIZE_OPTIONS = [
    "A3",
    "A4",
    "A5",
    "A6",
    "B4",
    "B5",
    "F4",
    "Letter",
    "Legal",
    "Folio",
    "Kwarto",
    "Amplop"
  ];
  let currentUser = null;
  let latestClients = [];
  let latestJobs = [];
  let currentOperationalSchedule = DEFAULT_OPERATIONAL_SCHEDULE.map(day => ({ ...day }));
  let manualStoreStatus = "open";
  let forceOpenOutsideOperationalHours = false;

  function setStatus(el, text, kind = "") {
    if (!el) {
      return;
    }
    el.textContent = text || "";
    el.className = kind ? `status ${kind}` : "status";
  }

  function notify(options) {
    if (window.PrintFormAlert?.notify) {
      window.PrintFormAlert.notify(options);
      return;
    }

    if (options?.message) {
      window.alert(options.message);
    }
  }

  async function confirmAction(options) {
    if (window.PrintFormAlert?.confirm) {
      return window.PrintFormAlert.confirm(options);
    }
    return window.confirm(options?.message || "Lanjutkan aksi ini?");
  }

  function openModal(modal) {
    if (!modal) {
      return;
    }
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal(modal) {
    if (!modal) {
      return;
    }
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getStoreNameValue() {
    return String(storeSettingsForm.elements.storeName.value || currentUser?.username || "Nama Toko").trim();
  }

  function getStoreCodeValue() {
    return String(storeSettingsForm.elements.kodeToko.value || currentUser?.kodeToko || "").trim();
  }

  function getStoreQrUrl() {
    const code = getStoreCodeValue();
    if (!code) {
      return "";
    }
    return `${window.location.origin}/p/${encodeURIComponent(code)}`;
  }

  function getQrMatrix() {
    const qrText = getStoreQrUrl();
    if (!qrText || !window.PrintFormQr?.createMatrixForText) {
      return null;
    }
    return window.PrintFormQr.createMatrixForText(qrText);
  }

  function renderStoreQr() {
    const qrText = getStoreQrUrl();
    storeQrUrl.textContent = qrText || "Isi kode toko untuk membuat QR.";
    downloadStoreQrBtn.disabled = !qrText;

    if (!qrText) {
      setStatus(storeQrStatus, "");
      const ctx = storeQrCanvas.getContext("2d");
      ctx.clearRect(0, 0, storeQrCanvas.width, storeQrCanvas.height);
      return;
    }

    try {
      const matrix = getQrMatrix();
      window.PrintFormQr.drawMatrixToCanvas(storeQrCanvas, matrix, {
        pixelSize: 5,
        foreground: "#241006",
        background: "#ffffff"
      });
      setStatus(storeQrStatus, "");
    } catch (err) {
      setStatus(storeQrStatus, err.message || "Gagal membuat QR.", "error");
    }
  }

  function drawRoundRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawCenteredText(ctx, text, x, y, maxWidth, fontSize, weight, color) {
    let size = fontSize;
    do {
      ctx.font = `${weight} ${size}px Arial, sans-serif`;
      if (ctx.measureText(text).width <= maxWidth || size <= 24) {
        break;
      }
      size -= 2;
    } while (size > 24);

    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
  }

  function drawPosterQrMatrix(ctx, matrix, x, y, size, foreground) {
    const quiet = 4;
    const moduleSize = size / (matrix.length + quiet * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = foreground;
    matrix.forEach((row, rowIndex) => {
      row.forEach((isDark, colIndex) => {
        if (isDark) {
          ctx.fillRect(
            x + (colIndex + quiet) * moduleSize,
            y + (rowIndex + quiet) * moduleSize,
            Math.ceil(moduleSize),
            Math.ceil(moduleSize)
          );
        }
      });
    });
  }

  function downloadStoreQrPoster() {
    const qrText = getStoreQrUrl();
    if (!qrText) {
      setStatus(storeQrStatus, "Isi kode toko sebelum download QR.", "error");
      return;
    }

    try {
      const matrix = getQrMatrix();
      const storeName = getStoreNameValue();
      const storeCode = getStoreCodeValue();
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1440;
      const ctx = canvas.getContext("2d");

      const accent = "#c65327";
      const ink = "#241006";
      const softLine = "#efcdbd";
      const softBg = "#fffaf7";

      ctx.fillStyle = softBg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = softLine;
      ctx.lineWidth = 3;
      drawRoundRect(ctx, 22, 18, 1036, 1404, 24);
      ctx.stroke();

      drawCenteredText(ctx, "PrintForm", 540, 100, 520, 48, "700", ink);
      ctx.strokeStyle = softLine;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(338, 163);
      ctx.lineTo(520, 163);
      ctx.moveTo(568, 163);
      ctx.lineTo(752, 163);
      ctx.stroke();
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(544, 163, 8, 0, Math.PI * 2);
      ctx.fill();

      drawCenteredText(ctx, storeName, 540, 260, 780, 82, "800", accent);

      const cardX = 242;
      const cardY = 325;
      const cardW = 596;
      const cardH = 684;
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = softLine;
      ctx.lineWidth = 3;
      drawRoundRect(ctx, cardX, cardY, cardW, cardH, 26);
      ctx.fill();
      ctx.stroke();
      drawPosterQrMatrix(ctx, matrix, cardX + 54, cardY + 48, 488, "#241006");

      const pillX = cardX + 58;
      const pillY = cardY + 588;
      const pillW = cardW - 116;
      const gradient = ctx.createLinearGradient(pillX, pillY, pillX + pillW, pillY);
      gradient.addColorStop(0, "#d65b2c");
      gradient.addColorStop(1, "#bb431d");
      ctx.fillStyle = gradient;
      drawRoundRect(ctx, pillX, pillY, pillW, 68, 34);
      ctx.fill();
      drawCenteredText(ctx, storeCode || "Kode Toko", 540, pillY + 35, pillW - 40, 40, "800", "#ffffff");

      ctx.strokeStyle = softLine;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(210, 1072);
      ctx.lineTo(362, 1072);
      ctx.moveTo(720, 1072);
      ctx.lineTo(872, 1072);
      ctx.stroke();
      ctx.fillStyle = "#f3e2d9";
      drawRoundRect(ctx, 382, 1038, 316, 68, 34);
      ctx.fill();
      ctx.strokeStyle = softLine;
      ctx.stroke();
      drawCenteredText(ctx, "Cara Pakai", 548, 1072, 220, 34, "800", ink);

      const steps = [
        ["1", "Scan QR"],
        ["2", "Upload dokumen & atur cetak"],
        ["3", "Cetak di mitra"]
      ];
      steps.forEach(([number, label], index) => {
        const y = 1150 + index * 68;
        ctx.fillStyle = "#f3e2d9";
        ctx.beginPath();
        ctx.arc(316, y, 29, 0, Math.PI * 2);
        ctx.fill();
        drawCenteredText(ctx, number, 316, y, 40, 30, "800", ink);
        ctx.fillStyle = ink;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.font = "700 30px Arial, sans-serif";
        ctx.fillText(label, 366, y);
      });

      ctx.strokeStyle = softLine;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(212, 1342);
      ctx.lineTo(520, 1342);
      ctx.moveTo(568, 1342);
      ctx.lineTo(876, 1342);
      ctx.stroke();
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(544, 1342, 8, 0, Math.PI * 2);
      ctx.fill();
      drawCenteredText(ctx, "Layanan cetak yang lebih praktis dan privat", 540, 1390, 660, 27, "700", ink);

      const link = document.createElement("a");
      const safeName = (storeName || storeCode || "toko")
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, "-")
        .replace(/^-+|-+$/g, "") || "toko";
      link.download = `printform-qr-${safeName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      setStatus(storeQrStatus, err.message || "Gagal download QR.", "error");
    }
  }

  function formatReadiness(readiness) {
    const normalized = String(readiness || "").toLowerCase();
    if (normalized === "ready") {
      return "siap";
    }
    if (normalized === "owned") {
      return "sudah bind";
    }
    if (normalized === "unowned" || normalized === "not_ready") {
      return "belum bind";
    }
    return "offline";
  }

  function formatDateTime(value) {
    if (!value) {
      return "-";
    }

    const timestamp = new Date(value);
    if (!Number.isFinite(timestamp.getTime())) {
      return "-";
    }

    return timestamp.toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }

  function formatStatusLabel(status) {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "done" || normalized === "sent") return "Selesai";
    if (normalized === "failed") return "Gagal";
    if (normalized === "rejected") return "Ditolak";
    if (normalized === "canceled") return "Batal";
    if (normalized === "printing" || normalized === "claimed") return "Diproses";
    if (normalized === "ready" || normalized === "pending") return "Menunggu";
    return normalized || "-";
  }

  function getJobStatusClass(status) {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "done" || normalized === "sent") return "online";
    if (normalized === "failed" || normalized === "rejected" || normalized === "canceled") return "offline";
    return "";
  }

  function formatCurrency(value) {
    if (!Number.isFinite(Number(value))) {
      return "-";
    }

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(Number(value));
  }

  function getJobPrice(job) {
    const price = Number(job?.printConfig?.estimatedPrice);
    return Number.isFinite(price) && price > 0 ? price : 0;
  }

  function normalizeJobFileStatus(job) {
    const status = String(job?.fileStatus || "").trim().toLowerCase().replace(/\s+/g, "-");
    if (status === "available") {
      return "available";
    }
    if (status === "not-available") {
      return "not-available";
    }
    return job?.fileDeleted || job?.fileRemoved || job?.removedFileAt ? "not-available" : "available";
  }

  function getJobConfigText(job) {
    const config = job?.printConfig || {};
    const contentScale = Number(config.contentScale || 100);
    return [
      config.paperSize,
      config.colorMode === "bw" ? "BW" : "Warna",
      config.orientation === "landscape" ? "Landscape" : "Portrait",
      config.copies ? `${config.copies} salinan` : "",
      config.pageRange ? `Hal. ${config.pageRange}` : "",
      contentScale !== 100 ? `${contentScale}%` : ""
    ].filter(Boolean).join(" - ");
  }

  function isToday(value) {
    const timestamp = new Date(value);
    if (!Number.isFinite(timestamp.getTime())) {
      return false;
    }

    const now = new Date();
    return timestamp.getFullYear() === now.getFullYear()
      && timestamp.getMonth() === now.getMonth()
      && timestamp.getDate() === now.getDate();
  }

  function getStoreConfig(user) {
    return user?.konfigurasiToko && typeof user.konfigurasiToko === "object"
      ? user.konfigurasiToko
      : {};
  }

  function getServiceConfig(user) {
    const config = getStoreConfig(user);
    return config.layanan && typeof config.layanan === "object"
      ? config.layanan
      : {};
  }

  function normalizeOperationalTime(value, fallback) {
    const text = String(value || "").trim();
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(text) ? text : fallback;
  }

  function normalizeOperationalSchedule(value) {
    const rows = Array.isArray(value) ? value : [];
    return OPERATIONAL_DAYS.map(day => {
      const fallbackRow = DEFAULT_OPERATIONAL_SCHEDULE.find(item => item.day === day.key);
      const row = rows.find(item => String(item?.day || item?.key || "").toLowerCase() === day.key) || {};
      return {
        day: day.key,
        enabled: typeof row.enabled === "boolean" ? row.enabled : Boolean(fallbackRow?.enabled),
        open: normalizeOperationalTime(row.open || row.buka, fallbackRow?.open || "08:00"),
        close: normalizeOperationalTime(row.close || row.tutup, fallbackRow?.close || "21:00")
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

  function getTodayOperationalRow(schedule, date = new Date()) {
    const todayKey = DATE_DAY_KEYS[date.getDay()];
    return schedule.find(item => item.day === todayKey) || null;
  }

  function isWithinOperationalSchedule(schedule, date = new Date()) {
    const today = getTodayOperationalRow(schedule, date);
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

  function getDayLabel(dayKey) {
    return OPERATIONAL_DAYS.find(day => day.key === dayKey)?.label || dayKey;
  }

  function summarizeOperationalSchedule(schedule) {
    const activeRows = schedule.filter(item => item.enabled);
    if (activeRows.length === 0) {
      return "Semua hari tutup";
    }

    const sameHours = activeRows.every(item => item.open === activeRows[0].open && item.close === activeRows[0].close);
    if (activeRows.length === 7 && sameHours) {
      return `Setiap hari ${activeRows[0].open} - ${activeRows[0].close}`;
    }

    const today = getTodayOperationalRow(schedule);
    const todayText = today?.enabled
      ? `${getDayLabel(today.day)} ${today.open} - ${today.close}`
      : `${getDayLabel(today?.day)} tutup`;
    return `${activeRows.length} hari aktif. Hari ini: ${todayText}`;
  }

  function getOperationalFormState() {
    const selectedStatus = String(storeSettingsForm.elements.storeStatus.value || "open");
    const isWithinHours = isWithinOperationalSchedule(currentOperationalSchedule);
    const isForcedOpenOutsideHours = selectedStatus === "open" && !isWithinHours && forceOpenOutsideOperationalHours;
    const effectiveStatus = selectedStatus === "closed"
      ? "closed"
      : isWithinHours || isForcedOpenOutsideHours
        ? "open"
        : "closed";

    return {
      selectedStatus,
      effectiveStatus,
      isWithinHours,
      isForcedOpenOutsideHours
    };
  }

  function updateOperationalUi({ autoCloseOutsideHours = false } = {}) {
    if (!storeSettingsForm?.elements?.storeStatus) {
      return;
    }

    const isWithinHours = isWithinOperationalSchedule(currentOperationalSchedule);
    if (isWithinHours && forceOpenOutsideOperationalHours) {
      forceOpenOutsideOperationalHours = false;
    }
    if (autoCloseOutsideHours && manualStoreStatus === "open") {
      storeSettingsForm.elements.storeStatus.value = isWithinHours || forceOpenOutsideOperationalHours
        ? "open"
        : "closed";
    }
    if (manualStoreStatus === "closed") {
      storeSettingsForm.elements.storeStatus.value = "closed";
    }

    storeOperationalSummary.textContent = summarizeOperationalSchedule(currentOperationalSchedule);
    const state = getOperationalFormState();
    storeOverrideBadge?.classList.toggle("hidden", !state.isForcedOpenOutsideHours);
  }

  function renderOperationalDaysModal() {
    operationalDaysList.innerHTML = currentOperationalSchedule.map(row => `
      <div class="operational-day-row" data-operational-day="${escapeHtml(row.day)}">
        <label class="operational-day-toggle">
          <input type="checkbox" name="enabled" ${row.enabled ? "checked" : ""}>
          <span>${escapeHtml(getDayLabel(row.day))}</span>
        </label>
        <label>
          <span>Buka</span>
          <input type="time" name="open" value="${escapeHtml(row.open)}">
        </label>
        <label>
          <span>Tutup</span>
          <input type="time" name="close" value="${escapeHtml(row.close)}">
        </label>
      </div>
    `).join("");
  }

  function readOperationalDaysModal() {
    return OPERATIONAL_DAYS.map(day => {
      const row = operationalDaysList.querySelector(`[data-operational-day="${day.key}"]`);
      return {
        day: day.key,
        enabled: Boolean(row?.querySelector('[name="enabled"]')?.checked),
        open: normalizeOperationalTime(row?.querySelector('[name="open"]')?.value, "08:00"),
        close: normalizeOperationalTime(row?.querySelector('[name="close"]')?.value, "21:00")
      };
    });
  }

  function renderPaperTypeOptions(selectedTypes = []) {
    const selectedSet = new Set(selectedTypes.map(item => String(item || "").trim().toUpperCase()));
    const options = [
      ...PAPER_SIZE_OPTIONS,
      ...selectedTypes.filter(item => !PAPER_SIZE_OPTIONS.some(option => option.toUpperCase() === String(item || "").toUpperCase()))
    ];

    const uniqueOptions = [...new Map(options.map(option => [String(option).toUpperCase(), option])).values()];
    const group = document.getElementById("paperTypesGroup");
    group.innerHTML = uniqueOptions.map(option => {
      const value = String(option).trim();
      return `
        <label class="service-check-label">
          <input type="checkbox" name="paperTypes" value="${escapeHtml(value)}" ${selectedSet.has(value.toUpperCase()) ? "checked" : ""}>
          <span>${escapeHtml(value)}</span>
        </label>
      `;
    }).join("");
  }

  function getSelectedPaperTypes() {
    return Array.from(serviceSettingsForm.querySelectorAll('input[name="paperTypes"]:checked'))
      .map(input => String(input.value || "").trim())
      .filter(Boolean);
  }

  function getSelectedColorModes() {
    return Array.from(serviceSettingsForm.querySelectorAll('input[name="colorModes"]:checked'))
      .map(input => String(input.value || "").trim())
      .filter(value => value === "bw" || value === "color");
  }

  function legacyColorModeFromSelection(selectedModes) {
    const modes = new Set(selectedModes);
    if (modes.has("bw") && modes.has("color")) {
      return "both";
    }
    if (modes.has("color")) {
      return "color";
    }
    return "bw";
  }

  function colorSelectionFromLegacy(mode) {
    const normalized = String(mode || "both").toLowerCase();
    if (normalized === "color") {
      return ["color"];
    }
    if (normalized === "bw") {
      return ["bw"];
    }
    return ["bw", "color"];
  }

  function setColorModeSelection(selectedModes) {
    const selectedSet = new Set(selectedModes);
    serviceSettingsForm.querySelectorAll('input[name="colorModes"]').forEach(input => {
      input.checked = selectedSet.has(input.value);
    });
    updateColorPriceInputStates();
  }

  function updateColorPriceInputStates() {
    const selectedModes = new Set(getSelectedColorModes());
    serviceSettingsForm.elements.priceBw.disabled = !selectedModes.has("bw");
    serviceSettingsForm.elements.priceColor.disabled = !selectedModes.has("color");
  }

  function setLinkedClientsEmpty(text) {
    linkedClientsBody.innerHTML = `<tr><td colspan="6" class="muted-cell">${escapeHtml(text)}</td></tr>`;
  }

  function renderLinkedClients(clients) {
    if (!Array.isArray(clients) || clients.length === 0) {
      setLinkedClientsEmpty("Belum ada client yang terhubung dengan akun ini.");
      return;
    }

    linkedClientsBody.innerHTML = clients.map(client => {
      const status = String(client.status || "offline").toLowerCase();
      const readiness = formatReadiness(client.readiness);
      const printer = client.selectedPrinter || "-";
      const disableUnbind = unbindInProgress.has(client.id);
      const unbindLabel = disableUnbind ? "Melepas..." : "Unbind";
      const statusClass = status === "online" ? "online" : "offline";

      return `
        <tr>
          <td>${escapeHtml(client.name || "-")}</td>
          <td><code>${escapeHtml(client.id || "-")}</code></td>
          <td><span class="status-pill ${statusClass}">${escapeHtml(status)}</span> ${escapeHtml(readiness)}</td>
          <td>${escapeHtml(printer)}</td>
          <td>${escapeHtml(formatDateTime(client.lastSeen))}</td>
          <td>
            <button
              class="btn btn-danger btn-compact"
              type="button"
              data-action="unbind-client"
              data-client-id="${escapeHtml(client.id)}"
              data-client-name="${escapeHtml(client.name || "client")}"${disableUnbind ? " disabled" : ""}
            >${unbindLabel}</button>
          </td>
        </tr>
      `;
    }).join("");
  }

  function renderStats(clients, jobs) {
    const onlineClients = clients.filter(client => String(client.status || "").toLowerCase() === "online");
    const jobsToday = jobs.filter(job => isToday(job.createdAt));
    const doneJobs = jobs.filter(job => ["done", "sent"].includes(String(job.status || "").toLowerCase()));
    const failedJobs = jobs.filter(job => ["failed", "rejected"].includes(String(job.status || "").toLowerCase()));

    statClientOnline.textContent = onlineClients.length;
    statJobsToday.textContent = jobsToday.length;
    statJobsDone.textContent = doneJobs.length;
    statJobsFailed.textContent = failedJobs.length;
  }

  function getFilteredJobs() {
    const statusFilter = String(jobsStatusFilter?.value || "all").toLowerCase();
    const searchText = String(jobsSearchInput?.value || "").trim().toLowerCase();

    return latestJobs
      .filter(job => {
        const status = String(job.status || "").toLowerCase();
        if (statusFilter === "today") {
          return isToday(job.createdAt);
        }
        if (statusFilter === "done") {
          return status === "done" || status === "sent";
        }
        if (statusFilter === "failed") {
          return status === "failed" || status === "rejected";
        }
        if (statusFilter === "printing") {
          return status === "printing" || status === "claimed";
        }
        if (statusFilter === "ready") {
          return status === "ready" || status === "pending";
        }
        if (statusFilter === "canceled") {
          return status === "canceled";
        }
        return true;
      })
      .filter(job => {
        if (!searchText) {
          return true;
        }
        const haystack = [
          job.id,
          job.originalName,
          job.alias,
          job.sessionId,
          getJobConfigText(job),
          formatStatusLabel(job.status)
        ].join(" ").toLowerCase();
        return haystack.includes(searchText);
      })
      .sort((a, b) => new Date(b.createdAt || b.updatedAt || 0).getTime() - new Date(a.createdAt || a.updatedAt || 0).getTime());
  }

  function renderAllJobsTable() {
    if (!allJobsTableBody) {
      return;
    }

    const jobs = getFilteredJobs();
    if (jobs.length === 0) {
      allJobsTableBody.innerHTML = '<tr><td colspan="8" class="muted-cell">Tidak ada job yang sesuai filter.</td></tr>';
      return;
    }

    allJobsTableBody.innerHTML = jobs.map(job => {
      const statusClass = getJobStatusClass(job.status);
      const fileStatus = normalizeJobFileStatus(job);
      const fileStatusClass = fileStatus === "available" ? "online" : "offline";
      const price = getJobPrice(job);
      return `
        <tr>
          <td>${escapeHtml(formatDateTime(job.createdAt || job.updatedAt))}</td>
          <td><code>${escapeHtml(job.sessionId || "-")}</code></td>
          <td>
            <strong>${escapeHtml(job.originalName || "-")}</strong>
            <small>${escapeHtml(job.id || "-")}</small>
          </td>
          <td>${escapeHtml(job.alias || "-")}</td>
          <td>${escapeHtml(getJobConfigText(job) || "-")}</td>
          <td>${escapeHtml(price > 0 ? formatCurrency(price) : "-")}</td>
          <td><span class="status-pill ${statusClass}">${escapeHtml(formatStatusLabel(job.status))}</span></td>
          <td><span class="status-pill ${fileStatusClass}">${escapeHtml(fileStatus)}</span></td>
        </tr>
      `;
    }).join("");
  }

  function renderActivity(clients, jobs) {
    const clientItems = clients
      .filter(client => client.lastSeen)
      .map(client => ({
        type: "Client",
        title: client.name || client.id || "Client",
        meta: `${String(client.status || "offline").toUpperCase()} - ${formatReadiness(client.readiness)}`,
        date: client.lastSeen,
        time: new Date(client.lastSeen).getTime()
      }));

    const jobItems = jobs
      .filter(job => job.createdAt || job.updatedAt)
      .map(job => ({
        type: "Job",
        title: job.alias || job.originalName || job.id || "Tugas cetak",
        meta: formatStatusLabel(job.status),
        date: job.updatedAt || job.createdAt,
        time: new Date(job.updatedAt || job.createdAt).getTime()
      }));

    const items = [...clientItems, ...jobItems]
      .filter(item => Number.isFinite(item.time))
      .sort((a, b) => b.time - a.time)
      .slice(0, 8);

    if (items.length === 0) {
      activityList.innerHTML = '<p class="muted-cell">Belum ada aktivitas.</p>';
      return;
    }

    activityList.innerHTML = items.map(item => `
      <article class="activity-item">
        <span>${escapeHtml(item.type)}</span>
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <small>${escapeHtml(item.meta)} - ${escapeHtml(formatDateTime(item.date))}</small>
        </div>
      </article>
    `).join("");
  }

  function renderDashboardData() {
    renderLinkedClients(latestClients);
    renderStats(latestClients, latestJobs);
    renderActivity(latestClients, latestJobs);
    renderAllJobsTable();
    dashboardLastSync.textContent = `Sinkron: ${new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit"
    })}`;
  }

  async function loadDashboardData() {
    const authState = window.MitraAuth.getState();
    if (!authState?.accessToken) {
      setLinkedClientsEmpty("Silakan login untuk melihat daftar client.");
      setStatus(linkedClientsStatus, "");
      return;
    }

    setStatus(linkedClientsStatus, "Memuat data dashboard...");

    const [clientsResult, jobsResult] = await Promise.allSettled([
      window.MitraAuth.apiJson("/api/clients", { method: "GET" }),
      window.MitraAuth.apiJson("/api/jobs", { method: "GET" })
    ]);

    if (clientsResult.status === "fulfilled") {
      latestClients = Array.isArray(clientsResult.value)
        ? clientsResult.value.filter(client => Boolean(client?.recognized))
        : [];
    }

    if (jobsResult.status === "fulfilled") {
      latestJobs = Array.isArray(jobsResult.value) ? jobsResult.value : [];
    }

    renderDashboardData();

    if (clientsResult.status === "rejected") {
      setStatus(linkedClientsStatus, clientsResult.reason?.message || "Gagal memuat client.", "error");
      return;
    }

    setStatus(
      linkedClientsStatus,
      latestClients.length > 0 ? `${latestClients.length} client terhubung ditemukan.` : "Belum ada client yang terhubung.",
      latestClients.length > 0 ? "success" : ""
    );

    if (jobsResult.status === "rejected") {
      notify({
        title: "Data tugas belum termuat",
        message: jobsResult.reason?.message || "Dashboard tetap menampilkan data client.",
        variant: "warning"
      });
    }
  }

  async function unbindClient(clientId, clientName) {
    const safeClientId = String(clientId || "").trim();
    if (!safeClientId) {
      return;
    }

    const confirmed = await confirmAction({
      title: "Lepas client?",
      message: `Client "${clientName || "client"}" akan dilepas dari akun mitra ini.`,
      okText: "Lepas",
      cancelText: "Batal",
      variant: "warning"
    });
    if (!confirmed) {
      return;
    }

    unbindInProgress.add(safeClientId);
    renderDashboardData();
    setStatus(linkedClientsStatus, `Melepas binding ${clientName || "client"}...`);

    try {
      await window.MitraAuth.apiJson(`/api/clients/${encodeURIComponent(safeClientId)}/unbind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      notify({
        title: "Client dilepas",
        message: `${clientName || "Client"} berhasil di-unbind.`,
        variant: "success"
      });
    } catch (err) {
      setStatus(linkedClientsStatus, err.message || "Gagal melakukan unbind client.", "error");
    } finally {
      unbindInProgress.delete(safeClientId);
      await loadDashboardData();
    }
  }

  async function syncMe() {
    const state = window.MitraAuth.getState();
    if (!state?.accessToken) {
      return null;
    }

    try {
      const meRes = await window.MitraAuth.apiJson("/api/auth/me", {
        method: "GET"
      });
      const nextState = {
        ...window.MitraAuth.getState(),
        user: meRes.user
      };
      window.MitraAuth.saveState(nextState);
      return meRes.user;
    } catch {
      window.MitraAuth.clearState();
      return null;
    }
  }

  function fillDashboardForms(user) {
    const config = getStoreConfig(user);
    const service = getServiceConfig(user);
    const paperTypes = Array.isArray(service.jenisKertas) && service.jenisKertas.length > 0
      ? service.jenisKertas
      : ["A4", "F4"];
    const selectedColorModes = Array.isArray(service.modeWarnaPilihan) && service.modeWarnaPilihan.length > 0
      ? service.modeWarnaPilihan
      : colorSelectionFromLegacy(service.modeWarna);
    const modePrices = service.hargaModeWarna && typeof service.hargaModeWarna === "object"
      ? service.hargaModeWarna
      : {};
    const legacyBasePrice = Number.isFinite(Number(service.hargaDasar))
      ? Number(service.hargaDasar)
      : 0;

    storeSettingsForm.elements.storeName.value = config.namaToko || user?.username || "";
    storeSettingsForm.elements.kodeToko.value = user?.kodeToko || "";
    currentOperationalSchedule = normalizeOperationalSchedule(config.waktuOperasional || config.waktu_operasional);
    forceOpenOutsideOperationalHours = Boolean(config.forceOpenOutsideOperationalHours || config.force_open_outside_operational_hours);
    const configuredStatus = String(config.statusToko || config.status_toko || "open").toLowerCase() === "closed" ? "closed" : "open";
    manualStoreStatus = configuredStatus;
    const isWithinHours = isWithinOperationalSchedule(currentOperationalSchedule);
    const shouldShowOpen = configuredStatus === "open" && (isWithinHours || forceOpenOutsideOperationalHours);
    storeSettingsForm.elements.storeStatus.value = shouldShowOpen ? "open" : "closed";
    storeSettingsForm.elements.storeContact.value = config.kontak || "";
    storeSettingsForm.elements.storeAddress.value = user?.alamat || "";
    updateOperationalUi();
    renderStoreQr();

    renderPaperTypeOptions(paperTypes);
    setColorModeSelection(selectedColorModes);
    serviceSettingsForm.elements.priceBw.value = Number.isFinite(Number(modePrices.bw))
      ? String(Number(modePrices.bw))
      : String(legacyBasePrice || "");
    serviceSettingsForm.elements.priceColor.value = Number.isFinite(Number(modePrices.color))
      ? String(Number(modePrices.color))
      : String(legacyBasePrice || "");
    serviceSettingsForm.elements.fileLimitMb.value = Number.isFinite(Number(service.batasFileMb))
      ? String(Number(service.batasFileMb))
      : "25";

    dashboardUserChip.textContent = user?.username ? `@${user.username}` : "Akun Mitra";
    dashboardStoreCode.textContent = `Kode toko: ${user?.kodeToko || "-"}`;
    accountUsername.textContent = user?.username ? `@${user.username}` : "-";
    accountEmail.textContent = user?.email || "-";
    accountPinStatus.textContent = user?.hasPin ? "Aktif" : "Belum diatur";
    fillAccountProfileForm(user);
  }

  function fillAccountProfileForm(user) {
    if (!accountProfileForm || !user) {
      return;
    }

    accountProfileForm.elements.username.value = user.username || "";
    accountProfileForm.elements.email.value = user.email || "";
  }

  function buildSettingsPayload() {
    const paperTypes = getSelectedPaperTypes();
    const selectedColorModes = getSelectedColorModes();
    const safeColorModes = selectedColorModes.length > 0 ? selectedColorModes : ["bw"];
    const priceBw = Number(serviceSettingsForm.elements.priceBw.value || 0);
    const priceColor = Number(serviceSettingsForm.elements.priceColor.value || 0);
    const basePrices = safeColorModes.map(mode => mode === "color" ? priceColor : priceBw);
    const hargaDasar = basePrices.find(price => Number.isFinite(price) && price > 0) || 0;

    return {
      storeName: String(storeSettingsForm.elements.storeName.value || "").trim(),
      kodeToko: String(storeSettingsForm.elements.kodeToko.value || "").trim(),
      statusToko: manualStoreStatus,
      jamOperasional: summarizeOperationalSchedule(currentOperationalSchedule),
      waktuOperasional: currentOperationalSchedule,
      forceOpenOutsideOperationalHours,
      kontak: String(storeSettingsForm.elements.storeContact.value || "").trim(),
      alamat: String(storeSettingsForm.elements.storeAddress.value || "").trim(),
      layanan: {
        jenisKertas: paperTypes,
        modeWarna: legacyColorModeFromSelection(safeColorModes),
        modeWarnaPilihan: safeColorModes,
        hargaDasar,
        hargaModeWarna: {
          bw: Number.isFinite(priceBw) ? priceBw : 0,
          color: Number.isFinite(priceColor) ? priceColor : 0
        },
        batasFileMb: Number(serviceSettingsForm.elements.fileLimitMb.value || 25)
      }
    };
  }

  async function saveDashboardSettings(statusEl, successMessage) {
    setStatus(statusEl, "Menyimpan pengaturan...");

    try {
      const body = await window.MitraAuth.apiJson("/api/auth/me/store", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildSettingsPayload())
      });

      const nextState = {
        ...window.MitraAuth.getState(),
        user: body.user
      };
      window.MitraAuth.saveState(nextState);
      currentUser = body.user;
      fillDashboardForms(body.user);
      setStatus(statusEl, successMessage, "success");
      notify({
        title: "Pengaturan tersimpan",
        message: successMessage,
        variant: "success"
      });
    } catch (err) {
      setStatus(statusEl, err.message || "Gagal menyimpan pengaturan.", "error");
    }
  }

  function renderAuthedState(user) {
    currentUser = user;
    document.body.classList.add("mitra-dashboard-active");
    authShell?.classList.add("hidden");
    dashboardShell?.classList.remove("hidden");
    fillDashboardForms(user);
    setStatus(heroStatus, "");
    heroText.textContent = "Akun sudah aktif.";
  }

  function renderGuestState() {
    currentUser = null;
    latestClients = [];
    latestJobs = [];
    document.body.classList.remove("mitra-dashboard-active");
    dashboardShell?.classList.add("hidden");
    authShell?.classList.remove("hidden");
    setLinkedClientsEmpty("Silakan login untuk melihat daftar client.");
    setStatus(linkedClientsStatus, "");
    heroText.textContent = "Silakan login atau daftar untuk membuka pengaturan akun.";
  }

  async function renderAuthState() {
    const state = window.MitraAuth.getState();
    if (!state?.accessToken) {
      renderGuestState();
      return;
    }

    const user = await syncMe();
    if (!user) {
      renderGuestState();
      return;
    }

    renderAuthedState(user);
    await loadDashboardData();
  }

  async function submitLogin(event) {
    event.preventDefault();
    setStatus(loginStatus, "Memverifikasi akun...");

    const formData = new FormData(loginForm);
    const identifier = String(formData.get("identifier") || "").trim();
    const password = String(formData.get("password") || "");

    try {
      const body = await window.MitraAuth.apiJson("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password })
      }, { retry: false });

      window.MitraAuth.saveState({
        accessToken: body.accessToken,
        refreshToken: body.refreshToken,
        accessTokenTtl: body.accessTokenTtl,
        refreshTokenExpiresAt: body.refreshTokenExpiresAt,
        user: body.user
      });

      setStatus(loginStatus, "Login berhasil.", "success");
      loginForm.reset();
      await renderAuthState();
    } catch (err) {
      setStatus(loginStatus, err.message || "Login gagal.", "error");
    }
  }

  async function submitRegister(event) {
    event.preventDefault();
    setStatus(registerStatus, "Membuat akun...");

    const formData = new FormData(registerForm);
    const username = String(formData.get("username") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const passwordConfirm = String(formData.get("passwordConfirm") || "");

    if (password !== passwordConfirm) {
      setStatus(registerStatus, "Konfirmasi password tidak sama.", "error");
      registerForm.elements.passwordConfirm?.focus();
      return;
    }

    try {
      const body = await window.MitraAuth.apiJson("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      }, { retry: false });

      window.MitraAuth.saveState({
        accessToken: body.accessToken,
        refreshToken: body.refreshToken,
        accessTokenTtl: body.accessTokenTtl,
        refreshTokenExpiresAt: body.refreshTokenExpiresAt,
        user: body.user
      });

      setStatus(registerStatus, "Akun berhasil dibuat.", "success");
      closeModal(registerModalBackdrop);
      registerForm.reset();
      await renderAuthState();
    } catch (err) {
      setStatus(registerStatus, err.message || "Daftar gagal.", "error");
    }
  }

  async function submitAccountProfile(event) {
    event.preventDefault();
    setStatus(accountProfileStatus, "Menyimpan profil...");

    const username = String(accountProfileForm.elements.username.value || "").trim();
    const email = String(accountProfileForm.elements.email.value || "").trim();

    try {
      const body = await window.MitraAuth.apiJson("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email })
      });

      const nextState = {
        ...window.MitraAuth.getState(),
        user: body.user
      };
      window.MitraAuth.saveState(nextState);
      currentUser = body.user;
      fillDashboardForms(body.user);
      setStatus(accountProfileStatus, "Profil berhasil diperbarui.", "success");
      notify({
        title: "Profil tersimpan",
        message: "Data akun mitra berhasil diperbarui.",
        variant: "success"
      });
    } catch (err) {
      setStatus(accountProfileStatus, err.message || "Gagal memperbarui profil.", "error");
    }
  }

  async function submitAccountPassword(event) {
    event.preventDefault();
    setStatus(accountPasswordStatus, "Memperbarui password...");

    const currentPassword = String(accountPasswordForm.elements.currentPassword.value || "");
    const newPassword = String(accountPasswordForm.elements.newPassword.value || "");
    const confirmPassword = String(accountPasswordForm.elements.confirmPassword.value || "");

    if (newPassword !== confirmPassword) {
      setStatus(accountPasswordStatus, "Konfirmasi password tidak sama.", "error");
      accountPasswordForm.elements.confirmPassword?.focus();
      return;
    }

    try {
      await window.MitraAuth.apiJson("/api/auth/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      accountPasswordForm.reset();
      setStatus(accountPasswordStatus, "Password berhasil diubah. Anda akan logout otomatis.", "success");
      notify({
        title: "Password diperbarui",
        message: "Silakan login kembali dengan password baru.",
        variant: "success"
      });

      setTimeout(async () => {
        await window.MitraAuth.logoutCurrentSession();
        closeModal(passwordModalBackdrop);
        renderGuestState();
      }, 900);
    } catch (err) {
      setStatus(accountPasswordStatus, err.message || "Gagal memperbarui password.", "error");
    }
  }

  async function submitAccountPin(event) {
    event.preventDefault();
    setStatus(accountPinStatusMessage, "Menyimpan PIN...");

    const currentPassword = String(accountPinForm.elements.currentPassword.value || "");
    const pin = String(accountPinForm.elements.pin.value || "").trim();
    const confirmPin = String(accountPinForm.elements.confirmPin.value || "").trim();

    if (!/^\d{4,8}$/.test(pin)) {
      setStatus(accountPinStatusMessage, "PIN harus 4-8 digit angka.", "error");
      accountPinForm.elements.pin?.focus();
      return;
    }

    if (pin !== confirmPin) {
      setStatus(accountPinStatusMessage, "Konfirmasi PIN tidak sama.", "error");
      accountPinForm.elements.confirmPin?.focus();
      return;
    }

    try {
      await window.MitraAuth.apiJson("/api/auth/me/pin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, pin })
      });

      accountPinForm.reset();
      const nextUser = {
        ...(currentUser || window.MitraAuth.getState()?.user || {}),
        hasPin: true
      };
      const nextState = {
        ...window.MitraAuth.getState(),
        user: nextUser
      };
      window.MitraAuth.saveState(nextState);
      currentUser = nextUser;
      fillDashboardForms(nextUser);
      setStatus(accountPinStatusMessage, "PIN berhasil disimpan.", "success");
      notify({
        title: "PIN tersimpan",
        message: "PIN akun mitra berhasil diperbarui.",
        variant: "success"
      });
    } catch (err) {
      setStatus(accountPinStatusMessage, err.message || "Gagal menyimpan PIN.", "error");
    }
  }

  async function onLogout() {
    await window.MitraAuth.logoutCurrentSession();
    renderGuestState();
    notify({
      title: "Logout berhasil",
      message: "Anda sudah keluar dari dashboard mitra.",
      variant: "success"
    });
  }

  function showDownloadInfo() {
    if (window.PrintFormAlert?.ok) {
      window.PrintFormAlert.ok({
        title: "Download Klien",
        message: "Paket installer desktop belum tersedia di folder public. Setelah file installer ditambahkan, tombol ini bisa diarahkan ke file tersebut.",
        variant: "info"
      });
      return;
    }
    window.alert("Paket installer desktop belum tersedia.");
  }

  function showConnectClientInfo() {
    if (window.PrintFormAlert?.ok) {
      window.PrintFormAlert.ok({
        title: "Hubungkan Client Baru",
        message: "Install aplikasi desktop PrintForm, login dengan akun mitra ini, lalu pilih printer aktif dari aplikasi client.",
        variant: "info"
      });
      return;
    }
    window.alert("Install aplikasi desktop PrintForm dan login dengan akun mitra ini.");
  }

  function showHelpInfo(action) {
    const messages = {
      download: ["Download aplikasi desktop", "Tambahkan file installer ke folder public agar tombol download dapat diarahkan langsung ke file tersebut."],
      install: ["Panduan instalasi", "Install client desktop, login dengan akun mitra, pilih printer, lalu pastikan status client online."],
      troubleshoot: ["Troubleshooting", "Pastikan server aktif, client desktop login, printer terpilih, dan koneksi jaringan stabil."]
    };
    const [title, message] = messages[action] || messages.troubleshoot;

    if (window.PrintFormAlert?.ok) {
      window.PrintFormAlert.ok({ title, message, variant: "info" });
      return;
    }
    window.alert(message);
  }

  function onStoreStatusChange() {
    const selectedStatus = String(storeSettingsForm.elements.storeStatus.value || "open");
    const isWithinHours = isWithinOperationalSchedule(currentOperationalSchedule);
    manualStoreStatus = selectedStatus;
    forceOpenOutsideOperationalHours = selectedStatus === "open" && !isWithinHours;
    updateOperationalUi();
  }

  function onSaveOperationalHours() {
    const nextSchedule = readOperationalDaysModal();
    currentOperationalSchedule = nextSchedule;
    forceOpenOutsideOperationalHours = false;
    updateOperationalUi({ autoCloseOutsideHours: true });
    setStatus(operationalHoursStatus, "Waktu operasional diperbarui. Simpan pengaturan toko untuk menyimpan ke server.", "success");
    closeModal(operationalHoursModalBackdrop);
  }

  function bindModalHandlers() {
    openRegisterBtn.addEventListener("click", () => {
      setStatus(registerStatus, "");
      openModal(registerModalBackdrop);
    });

    toLoginBtn.addEventListener("click", () => {
      closeModal(registerModalBackdrop);
      setStatus(loginStatus, "");
      loginForm.scrollIntoView({ behavior: "smooth", block: "center" });
      loginForm.elements.identifier?.focus();
    });

    openOperationalHoursBtn.addEventListener("click", () => {
      setStatus(operationalHoursStatus, "");
      renderOperationalDaysModal();
      openModal(operationalHoursModalBackdrop);
    });

    document.querySelectorAll("[data-account-modal]").forEach(button => {
      button.addEventListener("click", () => {
        const target = document.getElementById(button.dataset.accountModal);
        setStatus(accountProfileStatus, "");
        setStatus(accountPasswordStatus, "");
        setStatus(accountPinStatusMessage, "");
        fillAccountProfileForm(currentUser || window.MitraAuth.getState()?.user);
        openModal(target);
      });
    });

    document.querySelectorAll("[data-close]").forEach(button => {
      button.addEventListener("click", () => {
        const targetId = button.getAttribute("data-close");
        const target = document.getElementById(targetId);
        if (target) {
          closeModal(target);
        }
      });
    });

    [registerModalBackdrop, allJobsModalBackdrop, operationalHoursModalBackdrop, profileModalBackdrop, passwordModalBackdrop, pinModalBackdrop].forEach(modal => {
      modal.addEventListener("click", event => {
        if (event.target === modal) {
          closeModal(modal);
        }
      });
    });
  }

  function bindActionHandlers() {
    loginForm.addEventListener("submit", submitLogin);
    registerForm.addEventListener("submit", submitRegister);
    accountProfileForm.addEventListener("submit", submitAccountProfile);
    accountPasswordForm.addEventListener("submit", submitAccountPassword);
    accountPinForm.addEventListener("submit", submitAccountPin);
    storeSettingsForm.elements.storeStatus.addEventListener("change", onStoreStatusChange);
    saveOperationalHoursBtn.addEventListener("click", onSaveOperationalHours);
    storeSettingsForm.elements.storeName.addEventListener("input", renderStoreQr);
    storeSettingsForm.elements.kodeToko.addEventListener("input", renderStoreQr);
    downloadStoreQrBtn.addEventListener("click", downloadStoreQrPoster);
    serviceSettingsForm.querySelectorAll('input[name="colorModes"]').forEach(input => {
      input.addEventListener("change", updateColorPriceInputStates);
    });
    storeSettingsForm.addEventListener("submit", event => {
      event.preventDefault();
      updateOperationalUi({ autoCloseOutsideHours: true });
      saveDashboardSettings(storeSettingsStatus, "Pengaturan toko berhasil disimpan.");
    });
    serviceSettingsForm.addEventListener("submit", event => {
      event.preventDefault();
      saveDashboardSettings(serviceSettingsStatus, "Pengaturan layanan berhasil disimpan.");
    });

    document.querySelectorAll("[data-password-toggle]").forEach(button => {
      button.addEventListener("click", () => {
        const target = document.getElementById(button.dataset.target);
        if (!(target instanceof HTMLInputElement)) {
          return;
        }

        const shouldShow = target.type === "password";
        target.type = shouldShow ? "text" : "password";
        button.classList.toggle("is-visible", shouldShow);
        button.setAttribute("aria-label", shouldShow ? "Sembunyikan password" : "Tampilkan password");
      });
    });

    refreshLinkedClientsBtn.addEventListener("click", loadDashboardData);
    openAllJobsModalBtn.addEventListener("click", () => {
      renderAllJobsTable();
      openModal(allJobsModalBackdrop);
    });
    jobsStatusFilter.addEventListener("change", renderAllJobsTable);
    jobsSearchInput.addEventListener("input", renderAllJobsTable);
    connectClientBtn.addEventListener("click", showConnectClientInfo);
    downloadClientBtn.addEventListener("click", showDownloadInfo);

    linkedClientsBody.addEventListener("click", event => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) {
        return;
      }

      if (target.dataset.action !== "unbind-client") {
        return;
      }

      const clientId = target.dataset.clientId;
      const clientName = target.dataset.clientName;
      unbindClient(clientId, clientName);
    });

    document.querySelectorAll("[data-help-action]").forEach(button => {
      button.addEventListener("click", () => showHelpInfo(button.dataset.helpAction));
    });

    logoutBtn.addEventListener("click", onLogout);
  }

  bindModalHandlers();
  bindActionHandlers();
  renderAuthState();
  setInterval(() => {
    updateOperationalUi({ autoCloseOutsideHours: true });
  }, 60000);
})();

(() => {
  const PORTAL_HOME_PATH = "/portal/";
  const PORTAL_ADMIN_PATH = "/portal/admin/";
  const PORTAL_PAYMENT_PATH = "/portal/payment/";

  const authShell = document.querySelector(".auth-shell");
  const dashboardShell = document.getElementById("dashboardShell");
  const dashboardSidebar = document.getElementById("dashboardSidebar");
  const dashboardSidebarToggle = document.getElementById("dashboardSidebarToggle");
  const dashboardSidebarClose = document.getElementById("dashboardSidebarClose");
  const dashboardSidebarBackdrop = document.getElementById("dashboardSidebarBackdrop");
  const dashboardNavLinks = Array.from(document.querySelectorAll("[data-dashboard-target]"));
  const dashboardPanels = Array.from(document.querySelectorAll("[data-dashboard-panel]"));
  const dashboardMain = document.querySelector(".dashboard-main");
  const dashboardUserChip = document.getElementById("dashboardUserChip");
  const dashboardStoreCode = document.getElementById("dashboardStoreCode");
  const dashboardLastSync = document.getElementById("dashboardLastSync");
  const dashboardStoreStatusBadge = document.getElementById("dashboardStoreStatusBadge");
  const dashboardStoreStatusText = document.getElementById("dashboardStoreStatusText");
  const storeOverrideBadge = document.getElementById("storeOverrideBadge");

  const heroText = document.getElementById("heroText");
  const heroStatus = document.getElementById("heroStatus");
  const linkedClientsStatus = document.getElementById("linkedClientsStatus");
  const linkedClientsBody = document.getElementById("linkedClientsBody");
  const refreshLinkedClientsBtn = document.getElementById("refreshLinkedClientsBtn");
  const connectClientBtn = document.getElementById("connectClientBtn");
  const downloadClientBtn = document.getElementById("downloadClientBtn");
  const downloadClientBtnLabel = document.getElementById("downloadClientBtnLabel");
  const downloadClientModalBackdrop = document.getElementById("downloadClientModalBackdrop");
  const otherInstallersBtn = document.getElementById("otherInstallersBtn");
  const downloadClientOtherVersionsBtn = document.getElementById("downloadClientOtherVersionsBtn");
  const otherInstallersModalBackdrop = document.getElementById("otherInstallersModalBackdrop");
  const otherInstallersList = document.getElementById("otherInstallersList");
  const downloadClientPrimaryLink = document.getElementById("downloadClientPrimaryLink");
  const downloadClientPrimaryTitle = document.getElementById("downloadClientPrimaryTitle");
  const downloadClientPrimaryNotes = document.getElementById("downloadClientPrimaryNotes");
  const downloadClientPrimarySize = document.getElementById("downloadClientPrimarySize");
  const downloadClientStatus = document.getElementById("downloadClientStatus");

  const statClientOnline = document.getElementById("statClientOnline");
  const statJobsToday = document.getElementById("statJobsToday");
  const statJobsDone = document.getElementById("statJobsDone");
  const statJobsRejectedCanceled = document.getElementById("statJobsRejectedCanceled");
  const statEstimatedFunds = document.getElementById("statEstimatedFunds");
  const openFundEstimateModalBtn = document.getElementById("openFundEstimateModalBtn");
  const fundEstimateModalBackdrop = document.getElementById("fundEstimateModalBackdrop");
  const fundEstimateValue = document.getElementById("fundEstimateValue");
  const fundEstimateDayInput = document.getElementById("fundEstimateDayInput");
  const fundEstimateStartInput = document.getElementById("fundEstimateStartInput");
  const fundEstimateEndInput = document.getElementById("fundEstimateEndInput");
  const openAllJobsModalBtn = document.getElementById("openAllJobsModalBtn");
  const allJobsModalBackdrop = document.getElementById("allJobsModalBackdrop");
  const jobsFilterModalBackdrop = document.getElementById("jobsFilterModalBackdrop");
  const allJobsTableBody = document.getElementById("allJobsTableBody");
  const jobsSearchInput = document.getElementById("jobsSearchInput");
  const openJobsFilterBtn = document.getElementById("openJobsFilterBtn");
  const openJobsReportDownloadBtn = document.getElementById("openJobsReportDownloadBtn");
  const jobsReportDownloadModalBackdrop = document.getElementById("jobsReportDownloadModalBackdrop");
  const jobsReportDownloadDayInput = document.getElementById("jobsReportDownloadDayInput");
  const jobsReportDownloadStartInput = document.getElementById("jobsReportDownloadStartInput");
  const jobsReportDownloadEndInput = document.getElementById("jobsReportDownloadEndInput");
  const jobsReportDownloadStatus = document.getElementById("jobsReportDownloadStatus");
  const resetJobsFilterBtn = document.getElementById("resetJobsFilterBtn");
  const refreshAllJobsBtn = document.getElementById("refreshAllJobsBtn");
  const resetJobsFilterModalBtn = document.getElementById("resetJobsFilterModalBtn");
  const applyJobsFilterBtn = document.getElementById("applyJobsFilterBtn");
  const jobsDateDayInput = document.getElementById("jobsDateDayInput");
  const jobsDateStartInput = document.getElementById("jobsDateStartInput");
  const jobsDateEndInput = document.getElementById("jobsDateEndInput");
  const jobsPageSizeSelect = document.getElementById("jobsPageSizeSelect");
  const jobsPageInfo = document.getElementById("jobsPageInfo");
  const jobsFirstPageBtn = document.getElementById("jobsFirstPageBtn");
  const jobsPrevPageBtn = document.getElementById("jobsPrevPageBtn");
  const jobsNextPageBtn = document.getElementById("jobsNextPageBtn");
  const jobsLastPageBtn = document.getElementById("jobsLastPageBtn");
  const refreshBillingBtn = document.getElementById("refreshBillingBtn");
  const creditTotalActive = document.getElementById("creditTotalActive");
  const creditUsed = document.getElementById("creditUsed");
  const creditRemaining = document.getElementById("creditRemaining");
  const creditNearestExpiry = document.getElementById("creditNearestExpiry");
  const creditBreakdown = document.getElementById("creditBreakdown");
  const creditServiceBanner = document.getElementById("creditServiceBanner");
  const creditServiceBannerText = document.getElementById("creditServiceBannerText");
  const creditServiceBillingBtn = document.getElementById("creditServiceBillingBtn");
  const billingStatus = document.getElementById("billingStatus");
  const plansGrid = document.getElementById("plansGrid");
  const openOrdersModalBtn = document.getElementById("openOrdersModalBtn");
  const ordersModalBackdrop = document.getElementById("ordersModalBackdrop");
  const refreshOrdersBtn = document.getElementById("refreshOrdersBtn");
  const ordersStatusFilter = document.getElementById("ordersStatusFilter");
  const ordersSearchInput = document.getElementById("ordersSearchInput");
  const ordersPageSizeSelect = document.getElementById("ordersPageSizeSelect");
  const ordersPageInfo = document.getElementById("ordersPageInfo");
  const ordersFirstPageBtn = document.getElementById("ordersFirstPageBtn");
  const ordersPrevPageBtn = document.getElementById("ordersPrevPageBtn");
  const ordersNextPageBtn = document.getElementById("ordersNextPageBtn");
  const ordersLastPageBtn = document.getElementById("ordersLastPageBtn");
  const ordersTableBody = document.getElementById("ordersTableBody");
  const orderDetailModalBackdrop = document.getElementById("orderDetailModalBackdrop");
  const orderDetailBody = document.getElementById("orderDetailBody");
  const orderProofPreview = document.getElementById("orderProofPreview");
  const orderDetailStatus = document.getElementById("orderDetailStatus");
  const paymentProofModalBackdrop = document.getElementById("paymentProofModalBackdrop");
  const paymentProofForm = document.getElementById("paymentProofForm");
  const paymentProofOrderMeta = document.getElementById("paymentProofOrderMeta");
  const paymentProofAccountText = document.getElementById("paymentProofAccountText");
  const paymentProofInstructionText = document.getElementById("paymentProofInstructionText");
  const paymentProofUploadSummary = document.getElementById("paymentProofUploadSummary");
  const paymentProofUploadFields = document.getElementById("paymentProofUploadFields");
  const paymentProofStatus = document.getElementById("paymentProofStatus");

  const storeSettingsForm = document.getElementById("storeSettingsForm");
  const serviceSettingsForm = document.getElementById("serviceSettingsForm");
  const storeSettingsStatus = document.getElementById("storeSettingsStatus");
  const serviceSettingsStatus = document.getElementById("serviceSettingsStatus");
  const dashboardUserMenuBtn = document.getElementById("dashboardUserMenuBtn");
  const dashboardUserMenu = document.getElementById("dashboardUserMenu");
  const dashboardProfilePhoto = document.getElementById("dashboardProfilePhoto");
  const dashboardUserStoreCode = document.getElementById("dashboardUserStoreCode");
  const storeProfilePhotoPreview = document.getElementById("storeProfilePhotoPreview");
  const storeProfilePhotoInitial = document.getElementById("storeProfilePhotoInitial");
  const storeProfilePhotoName = document.getElementById("storeProfilePhotoName");
  const storeProfilePhotoInput = document.getElementById("storeProfilePhotoInput");
  const pickStoreProfilePhotoBtn = document.getElementById("pickStoreProfilePhotoBtn");
  const storeProfilePhotoStatus = document.getElementById("storeProfilePhotoStatus");
  const profilePhotoCropModalBackdrop = document.getElementById("profilePhotoCropModalBackdrop");
  const profileCropStage = document.getElementById("profileCropStage");
  const profileCropImage = document.getElementById("profileCropImage");
  const profileCropZoom = document.getElementById("profileCropZoom");
  const saveProfilePhotoBtn = document.getElementById("saveProfilePhotoBtn");
  const profilePhotoCropStatus = document.getElementById("profilePhotoCropStatus");
  const storeOperationalSummary = document.getElementById("storeOperationalSummary");
  const openOperationalHoursBtn = document.getElementById("openOperationalHoursBtn");
  const storeQrCanvas = document.getElementById("storeQrCanvas");
  const storeQrUrl = document.getElementById("storeQrUrl");
  const storeQrStatus = document.getElementById("storeQrStatus");
  const downloadStoreQrBtn = document.getElementById("downloadStoreQrBtn");

  const accountUsername = document.getElementById("accountUsername");
  const accountEmail = document.getElementById("accountEmail");
  const accountPinStatus = document.getElementById("accountPinStatus");

  const registerModalBackdrop = document.getElementById("registerModalBackdrop");
  const operationalHoursModalBackdrop = document.getElementById("operationalHoursModalBackdrop");
  const profileModalBackdrop = document.getElementById("profileModalBackdrop");
  const passwordModalBackdrop = document.getElementById("passwordModalBackdrop");
  const pinModalBackdrop = document.getElementById("pinModalBackdrop");
  const openRegisterBtn = document.getElementById("openRegisterBtn");
  const openForgotPasswordBtn = document.getElementById("openForgotPasswordBtn");
  const forgotPasswordModalBackdrop = document.getElementById("forgotPasswordModalBackdrop");
  const logoutBtn = document.getElementById("logoutBtn");
  const toLoginBtn = document.getElementById("toLoginBtn");

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const forgotPasswordForm = document.getElementById("forgotPasswordForm");
  const registerTurnstile = document.getElementById("registerTurnstile");
  const forgotPasswordTurnstile = document.getElementById("forgotPasswordTurnstile");
  const accountProfileForm = document.getElementById("accountProfileForm");
  const accountPasswordForm = document.getElementById("accountPasswordForm");
  const accountPinForm = document.getElementById("accountPinForm");

  const loginStatus = document.getElementById("loginStatus");
  const registerStatus = document.getElementById("registerStatus");
  const forgotPasswordStatus = document.getElementById("forgotPasswordStatus");
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
    "Kwarto",
    "Amplop"
  ];
  const PAPER_SIZE_META = {
    A3: { label: "A3", size: "297 x 420 mm" },
    A4: { label: "A4", size: "210 x 297 mm" },
    A5: { label: "A5", size: "148 x 210 mm" },
    A6: { label: "A6", size: "105 x 148 mm" },
    B4: { label: "B4", size: "250 x 353 mm" },
    B5: { label: "B5", size: "176 x 250 mm" },
    F4: { label: "F4 / Folio", size: "215 x 330 mm" },
    LETTER: { label: "Letter", size: "216 x 279 mm" },
    LEGAL: { label: "Legal", size: "216 x 356 mm" },
    KWARTO: { label: "Kwarto", size: "216 x 279 mm" },
    AMPLOP: { label: "Amplop", size: "110 x 220 mm" }
  };
  let currentUser = null;

  const turnstileState = {
    enabled: false,
    siteKey: "",
    scriptReady: false,
    widgets: {
      register: null,
      forgotPassword: null
    },
    tokens: {
      register: "",
      forgotPassword: ""
    }
  };

  function getUserRole(user) {
    return String(user?.role || "").trim().toLowerCase();
  }

  function isAdminUser(user) {
    return getUserRole(user) === "admin";
  }

  function goToAdminPortal() {
    window.location.href = PORTAL_ADMIN_PATH;
  }

  let latestClients = [];
  let latestJobs = [];
  let installerCatalog = {
    current: null,
    installers: [],
    otherInstallers: []
  };
  let installerCatalogLoaded = false;
  let installerCatalogLoading = false;
  let latestPlans = [];
  let latestOrders = [];
  let latestCreditBalance = null;
  let latestPaymentInstructions = null;
  let paymentInstructionsPromise = null;
  let activePaymentProofOrderId = null;
  let activeOrderProofObjectUrl = "";
  let currentOperationalSchedule = DEFAULT_OPERATIONAL_SCHEDULE.map(day => ({ ...day }));
  let manualStoreStatus = "open";
  let forceOpenOutsideOperationalHours = false;
  let activeDashboardPanel = "";
  let activeProfilePhotoFile = null;
  let activeProfilePhotoObjectUrl = "";
  const profileCropState = {
    dragging: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    x: 0,
    y: 0,
    dragStartX: 0,
    dragStartY: 0,
    baseScale: 1,
    zoom: 1,
    naturalWidth: 0,
    naturalHeight: 0
  };
  const jobTableState = {
    statusFilters: new Set(),
    fileFilters: new Set(),
    dateMode: "day",
    date: "",
    startDate: "",
    endDate: "",
    search: "",
    sortKey: "createdAt",
    sortDirection: "desc",
    pageSize: 20,
    currentPage: 1
  };
  const orderTableState = {
    status: "all",
    search: "",
    pageSize: 20,
    currentPage: 1
  };
  const fundEstimateState = {
    dateMode: "day",
    date: "",
    startDate: "",
    endDate: ""
  };
  const reportDownloadState = {
    dateMode: "day",
    date: "",
    startDate: "",
    endDate: ""
  };

  function setStatus(el, text, kind = "") {
    if (!el) {
      return;
    }
    el.textContent = text || "";
    el.className = kind ? `status ${kind}` : "status";
  }

  function notify(options) {
    if (window.PrintOrderAlert?.notify) {
      window.PrintOrderAlert.notify(options);
      return;
    }

    if (options?.message) {
      window.alert(options.message);
    }
  }

  async function confirmAction(options) {
    if (window.PrintOrderAlert?.confirm) {
      return window.PrintOrderAlert.confirm(options);
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
    if (modal === orderDetailModalBackdrop) {
      clearOrderProofPreview();
    }
  }

  function getDashboardTargetIds() {
    return dashboardNavLinks
      .map(link => link.getAttribute("data-dashboard-target"))
      .filter(Boolean);
  }

  function getDashboardTargetFromHash() {
    const hash = decodeURIComponent(String(window.location.hash || "").replace(/^#/, ""));
    return getDashboardTargetIds().includes(hash) ? hash : "dashboardStats";
  }

  function getUploadProofOrderIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return String(params.get("uploadProofOrderId") || "").trim();
  }

  function clearUploadProofOrderIdFromUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete("uploadProofOrderId");
    const nextSearch = url.searchParams.toString();
    window.history.replaceState(null, "", `${url.pathname}${nextSearch ? `?${nextSearch}` : ""}${url.hash || "#creditSection"}`);
  }

  function openDashboardSidebar() {
    document.body.classList.add("dashboard-sidebar-open");
    dashboardSidebarToggle?.setAttribute("aria-expanded", "true");
  }

  function closeDashboardSidebar() {
    document.body.classList.remove("dashboard-sidebar-open");
    dashboardSidebarToggle?.setAttribute("aria-expanded", "false");
  }

  function closeDashboardUserMenu() {
    dashboardUserMenu?.classList.remove("open");
    dashboardUserMenu?.setAttribute("aria-hidden", "true");
    dashboardUserMenuBtn?.setAttribute("aria-expanded", "false");
  }

  function toggleDashboardUserMenu() {
    const isOpen = dashboardUserMenu?.classList.contains("open");
    if (isOpen) {
      closeDashboardUserMenu();
      return;
    }
    dashboardUserMenu?.classList.add("open");
    dashboardUserMenu?.setAttribute("aria-hidden", "false");
    dashboardUserMenuBtn?.setAttribute("aria-expanded", "true");
  }

  function activateDashboardPanel(targetId, options = {}) {
    const nextTarget = getDashboardTargetIds().includes(targetId) ? targetId : "dashboardStats";
    activeDashboardPanel = nextTarget;

    dashboardPanels.forEach(panel => {
      panel.hidden = panel.getAttribute("data-dashboard-panel") !== nextTarget;
    });

    dashboardNavLinks.forEach(link => {
      const isActive = link.getAttribute("data-dashboard-target") === nextTarget;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    if (options.updateHash !== false && window.location.hash !== `#${nextTarget}`) {
      window.history.replaceState(null, "", `#${nextTarget}`);
    }

    if (options.resetScroll !== false && dashboardMain) {
      dashboardMain.scrollTop = 0;
    }

    if (options.closeSidebar !== false) {
      closeDashboardSidebar();
    }
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

  function updateProfileCropTransform() {
    if (!profileCropImage) {
      return;
    }
    const scale = profileCropState.baseScale * profileCropState.zoom;
    const stageRect = profileCropStage.getBoundingClientRect();
    const displayWidth = profileCropState.naturalWidth * scale;
    const displayHeight = profileCropState.naturalHeight * scale;
    const maxX = Math.max(0, (displayWidth - stageRect.width) / 2);
    const maxY = Math.max(0, (displayHeight - stageRect.height) / 2);
    profileCropState.x = Math.max(-maxX, Math.min(maxX, profileCropState.x));
    profileCropState.y = Math.max(-maxY, Math.min(maxY, profileCropState.y));
    profileCropImage.style.transform = `translate(-50%, -50%) translate(${profileCropState.x}px, ${profileCropState.y}px) scale(${scale})`;
  }

  function resetProfileCrop() {
    const stageRect = profileCropStage.getBoundingClientRect();
    const frameSize = Math.min(stageRect.width, stageRect.height);
    const naturalWidth = profileCropImage.naturalWidth || 1;
    const naturalHeight = profileCropImage.naturalHeight || 1;
    profileCropState.naturalWidth = naturalWidth;
    profileCropState.naturalHeight = naturalHeight;
    profileCropState.baseScale = frameSize / Math.min(naturalWidth, naturalHeight);
    profileCropState.zoom = 1;
    profileCropState.x = 0;
    profileCropState.y = 0;
    profileCropZoom.value = "1";
    updateProfileCropTransform();
  }

  function openProfilePhotoCrop(file) {
    if (!file || !file.type.startsWith("image/")) {
      setStatus(storeProfilePhotoStatus, "Pilih file gambar JPG, PNG, atau WebP.", "error");
      return;
    }

    activeProfilePhotoFile = file;
    if (activeProfilePhotoObjectUrl) {
      URL.revokeObjectURL(activeProfilePhotoObjectUrl);
    }
    activeProfilePhotoObjectUrl = URL.createObjectURL(file);
    profileCropImage.onload = resetProfileCrop;
    setStatus(profilePhotoCropStatus, "");
    openModal(profilePhotoCropModalBackdrop);
    profileCropImage.src = activeProfilePhotoObjectUrl;
  }

  function getProfileCropSourceRect() {
    const stageRect = profileCropStage.getBoundingClientRect();
    const frameSize = Math.min(stageRect.width, stageRect.height);
    const displayWidth = profileCropState.naturalWidth * profileCropState.baseScale * profileCropState.zoom;
    const displayHeight = profileCropState.naturalHeight * profileCropState.baseScale * profileCropState.zoom;
    const imageLeft = stageRect.left + stageRect.width / 2 + profileCropState.x - displayWidth / 2;
    const imageTop = stageRect.top + stageRect.height / 2 + profileCropState.y - displayHeight / 2;
    const frameLeft = stageRect.left + (stageRect.width - frameSize) / 2;
    const frameTop = stageRect.top + (stageRect.height - frameSize) / 2;
    const scale = profileCropState.naturalWidth / displayWidth;

    return {
      sx: Math.max(0, (frameLeft - imageLeft) * scale),
      sy: Math.max(0, (frameTop - imageTop) * scale),
      sw: Math.min(profileCropState.naturalWidth, frameSize * scale),
      sh: Math.min(profileCropState.naturalHeight, frameSize * scale)
    };
  }

  function createProfilePhotoBlob() {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const size = 512;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Browser tidak mendukung pemrosesan foto profil."));
        return;
      }
      const source = getProfileCropSourceRect();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(profileCropImage, source.sx, source.sy, source.sw, source.sh, 0, 0, size, size);
      canvas.toBlob(blob => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("Gagal membuat foto profil."));
      }, "image/jpeg", 0.92);
    });
  }

  function getQrMatrix() {
    const qrText = getStoreQrUrl();
    if (!qrText || !window.PrintOrderQr?.createMatrixForText) {
      return null;
    }
    return window.PrintOrderQr.createMatrixForText(qrText);
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
      window.PrintOrderQr.drawMatrixToCanvas(storeQrCanvas, matrix, {
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

      drawCenteredText(ctx, "PrintOrder", 540, 100, 520, 48, "700", ink);
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
        ["3", "Cetak di toko"]
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
      link.download = `printorder-qr-${safeName}.png`;
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

  function formatInteger(value) {
    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 0
    }).format(Number(value || 0));
  }

  function formatDate(value) {
    if (!value) {
      return "-";
    }
    const timestamp = new Date(value);
    if (!Number.isFinite(timestamp.getTime())) {
      return "-";
    }
    return timestamp.toLocaleDateString("id-ID", { dateStyle: "medium" });
  }

  function formatNumber(value) {
    return Number.isFinite(Number(value)) ? String(Number(value)) : "0";
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

  function getJobStatusGroup(status) {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "done" || normalized === "sent") return "done";
    if (normalized === "failed" || normalized === "rejected") return "failed";
    if (normalized === "printing" || normalized === "claimed") return "printing";
    if (normalized === "ready" || normalized === "pending" || normalized === "send") return "ready";
    if (normalized === "canceled") return "canceled";
    return normalized || "unknown";
  }

  function getPlanDurationText(plan) {
    const months = Number(plan?.durationMonths || 0);
    if (months > 0) {
      return `${months} bulan`;
    }
    if (String(plan?.planType || "").toLowerCase() === "free") {
      return "1 minggu";
    }
    return "-";
  }

  function getPlanCtaLabel(plan) {
    const code = String(plan?.code || "").toLowerCase();
    const name = String(plan?.name || "").toLowerCase();
    if (code.includes("starter") || name === "starter") return "Pilih Starter";
    if (code.includes("pro") || name === "pro") return "Pilih Pro";
    if (code.includes("credit") || name === "buy credit") return "Top Up";
    return "Pilih Plan";
  }

  function getPlanUnitPriceText(plan) {
    const planType = String(plan?.planType || "").toLowerCase();
    const priceIdr = Number(plan?.priceIdr || 0);
    const creditsPerUnit = Number(plan?.creditsPerUnit || 0);
    if (planType !== "subscription" || priceIdr <= 0 || creditsPerUnit <= 0) {
      return "";
    }

    return `± ${formatCurrency(priceIdr / creditsPerUnit)} / tugas`;
  }

  function isProPlan(plan) {
    const code = String(plan?.code || "").toLowerCase();
    const name = String(plan?.name || "").toLowerCase();
    return code.includes("pro") || name === "pro";
  }

  function getOrderStatusLabel(status) {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "pending_payment") return "Menunggu Pembayaran";
    if (normalized === "waiting_verification") return "Menunggu Verifikasi";
    if (normalized === "paid") return "Paid / Aktif";
    if (normalized === "rejected") return "Ditolak";
    if (normalized === "cancelled" || normalized === "canceled") return "Dibatalkan";
    if (normalized === "expired") return "Kedaluwarsa";
    return normalized || "-";
  }

  function getOrderStatusClass(status) {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "paid") return "online";
    if (normalized === "rejected" || normalized === "cancelled" || normalized === "canceled" || normalized === "expired") return "offline";
    return "";
  }

  function getSourceTypeLabel(sourceType) {
    const normalized = String(sourceType || "").toLowerCase();
    if (normalized === "subscription") return "Subscription";
    if (normalized === "topup") return "Top Up";
    if (normalized === "free") return "Free";
    if (normalized === "bonus") return "Bonus";
    if (normalized === "refund") return "Refund";
    return normalized || "-";
  }

  function toDateInputValue(value) {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function todayDateInputValue() {
    return toDateInputValue(new Date());
  }

  function getSelectedDateMode(name, fallback = "day") {
    return document.querySelector(`input[name="${name}"]:checked`)?.value || fallback;
  }

  function setSelectedDateMode(name, value) {
    const input = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (input) {
      input.checked = true;
    }
  }

  function setDateInputDisabled(input, disabled) {
    if (input) {
      input.disabled = disabled;
    }
  }

  function syncDateModeInputs(mode, dayInput, startInput, endInput) {
    const isDay = mode === "day";
    const isRange = mode === "range";
    setDateInputDisabled(dayInput, !isDay);
    setDateInputDisabled(startInput, !isRange);
    setDateInputDisabled(endInput, !isRange);
    startInput?.parentElement?.classList.toggle("is-disabled", !isRange);
  }

  function isJobWithinDateScope(job, scope) {
    const mode = scope?.dateMode || "day";
    if (mode === "all") {
      return true;
    }

    const jobDate = toDateInputValue(job?.createdAt || job?.updatedAt);
    if (!jobDate) {
      return false;
    }

    if (mode === "range") {
      const startDate = scope.startDate || "";
      const endDate = scope.endDate || "";
      if (startDate && jobDate < startDate) {
        return false;
      }
      if (endDate && jobDate > endDate) {
        return false;
      }
      return true;
    }

    return jobDate === (scope.date || todayDateInputValue());
  }

  function isRevenueJob(job) {
    return ["done", "sent"].includes(String(job?.status || "").toLowerCase());
  }

  function calculateEstimatedFunds(scope) {
    return latestJobs
      .filter(isRevenueJob)
      .filter(job => isJobWithinDateScope(job, scope))
      .reduce((total, job) => total + getJobPrice(job), 0);
  }

  function getJobSortValue(job, key) {
    if (key === "createdAt") return new Date(job.createdAt || job.updatedAt || 0).getTime() || 0;
    if (key === "price") return getJobPrice(job);
    if (key === "status") return formatStatusLabel(job.status).toLowerCase();
    if (key === "fileStatus") return normalizeJobFileStatus(job);
    if (key === "sessionId") return String(job.sessionId || "").toLowerCase();
    if (key === "originalName") return String(job.originalName || "").toLowerCase();
    if (key === "alias") return String(job.alias || "").toLowerCase();
    return "";
  }

  function compareJobSortValues(left, right) {
    if (typeof left === "number" && typeof right === "number") {
      return left - right;
    }
    return String(left).localeCompare(String(right), "id-ID", { numeric: true, sensitivity: "base" });
  }

  function updateJobSortIcons() {
    document.querySelectorAll("[data-sort-icon]").forEach(icon => {
      const key = icon.getAttribute("data-sort-icon");
      if (key !== jobTableState.sortKey) {
        icon.textContent = "↕";
        return;
      }
      icon.textContent = jobTableState.sortDirection === "asc" ? "↑" : "↓";
    });
  }

  function syncJobsFilterInputs() {
    document.querySelectorAll('input[name="jobStatusFilters"]').forEach(input => {
      input.checked = jobTableState.statusFilters.has(input.value);
    });
    document.querySelectorAll('input[name="jobFileFilters"]').forEach(input => {
      input.checked = jobTableState.fileFilters.has(input.value);
    });
    setSelectedDateMode("jobsDateMode", jobTableState.dateMode || "day");
    if (jobsDateDayInput) jobsDateDayInput.value = jobTableState.date || todayDateInputValue();
    if (jobsDateStartInput) jobsDateStartInput.value = jobTableState.startDate || "";
    if (jobsDateEndInput) jobsDateEndInput.value = jobTableState.endDate || "";
    syncDateModeInputs(jobTableState.dateMode || "day", jobsDateDayInput, jobsDateStartInput, jobsDateEndInput);
  }

  function readJobsFilterInputs() {
    jobTableState.statusFilters = new Set(
      Array.from(document.querySelectorAll('input[name="jobStatusFilters"]:checked')).map(input => input.value)
    );
    jobTableState.fileFilters = new Set(
      Array.from(document.querySelectorAll('input[name="jobFileFilters"]:checked')).map(input => input.value)
    );
    jobTableState.dateMode = getSelectedDateMode("jobsDateMode", "day");
    jobTableState.date = jobsDateDayInput?.value || todayDateInputValue();
    jobTableState.startDate = jobsDateStartInput?.value || "";
    jobTableState.endDate = jobsDateEndInput?.value || "";
    jobTableState.currentPage = 1;
  }

  function resetJobsFilters() {
    jobTableState.statusFilters = new Set();
    jobTableState.fileFilters = new Set();
    jobTableState.dateMode = "day";
    jobTableState.date = todayDateInputValue();
    jobTableState.startDate = "";
    jobTableState.endDate = "";
    jobTableState.search = "";
    jobTableState.currentPage = 1;
    if (jobsSearchInput) {
      jobsSearchInput.value = "";
    }
    syncJobsFilterInputs();
    renderAllJobsTable();
  }

  function initializeDateStates() {
    const today = todayDateInputValue();
    jobTableState.date = jobTableState.date || today;
    fundEstimateState.date = fundEstimateState.date || today;
    reportDownloadState.date = reportDownloadState.date || today;
    syncJobsFilterInputs();
    syncFundEstimateInputs();
    syncReportDownloadInputs();
  }

  function syncFundEstimateInputs() {
    setSelectedDateMode("fundEstimateMode", fundEstimateState.dateMode || "day");
    if (fundEstimateDayInput) fundEstimateDayInput.value = fundEstimateState.date || todayDateInputValue();
    if (fundEstimateStartInput) fundEstimateStartInput.value = fundEstimateState.startDate || "";
    if (fundEstimateEndInput) fundEstimateEndInput.value = fundEstimateState.endDate || "";
    syncDateModeInputs(
      fundEstimateState.dateMode || "day",
      fundEstimateDayInput,
      fundEstimateStartInput,
      fundEstimateEndInput
    );
  }

  function readFundEstimateInputs() {
    fundEstimateState.dateMode = getSelectedDateMode("fundEstimateMode", "day");
    fundEstimateState.date = fundEstimateDayInput?.value || todayDateInputValue();
    fundEstimateState.startDate = fundEstimateStartInput?.value || "";
    fundEstimateState.endDate = fundEstimateEndInput?.value || "";
  }

  function renderFundEstimate() {
    if (fundEstimateValue) {
      fundEstimateValue.textContent = formatCurrency(calculateEstimatedFunds(fundEstimateState));
    }
  }

  function syncReportDownloadInputs() {
    setSelectedDateMode("jobsReportDownloadMode", reportDownloadState.dateMode || "day");
    if (jobsReportDownloadDayInput) jobsReportDownloadDayInput.value = reportDownloadState.date || todayDateInputValue();
    if (jobsReportDownloadStartInput) jobsReportDownloadStartInput.value = reportDownloadState.startDate || "";
    if (jobsReportDownloadEndInput) jobsReportDownloadEndInput.value = reportDownloadState.endDate || "";
    syncDateModeInputs(
      reportDownloadState.dateMode || "day",
      jobsReportDownloadDayInput,
      jobsReportDownloadStartInput,
      jobsReportDownloadEndInput
    );
  }

  function readReportDownloadInputs() {
    reportDownloadState.dateMode = getSelectedDateMode("jobsReportDownloadMode", "day");
    reportDownloadState.date = jobsReportDownloadDayInput?.value || todayDateInputValue();
    reportDownloadState.startDate = jobsReportDownloadStartInput?.value || "";
    reportDownloadState.endDate = jobsReportDownloadEndInput?.value || "";
  }

  function formatFilenameDate(value) {
    const date = toDateInputValue(value) || todayDateInputValue();
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
  }

  function getReportFilenameBase(scope) {
    if (scope?.dateMode === "range") {
      const startDate = scope.startDate || todayDateInputValue();
      const endDate = scope.endDate || startDate;
      return `laporan_${formatFilenameDate(startDate)}_hingga_${formatFilenameDate(endDate)}`;
    }
    return `laporan_${formatFilenameDate(scope?.date || todayDateInputValue())}`;
  }

  function getReportJobs(scope) {
    return latestJobs
      .filter(job => isJobWithinDateScope(job, scope))
      .sort((a, b) => (new Date(b.createdAt || b.updatedAt || 0).getTime() || 0) - (new Date(a.createdAt || a.updatedAt || 0).getTime() || 0));
  }

  function getReportRows(scope) {
    return [
      ["Waktu", "Session ID", "Job ID", "Dokumen", "Alias", "Konfigurasi", "Harga", "Status", "File"],
      ...getReportJobs(scope).map(job => [
        formatDateTime(job.createdAt || job.updatedAt),
        job.sessionId || "-",
        job.id || "-",
        job.originalName || "-",
        job.alias || "-",
        getJobConfigText(job) || "-",
        formatNumber(getJobPrice(job)),
        formatStatusLabel(job.status),
        normalizeJobFileStatus(job)
      ])
    ];
  }

  function escapeCsvValue(value) {
    const text = String(value ?? "");
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function createCsvBlob(rows) {
    const content = `\ufeff${rows.map(row => row.map(escapeCsvValue).join(",")).join("\r\n")}\r\n`;
    return new Blob([content], { type: "text/csv;charset=utf-8" });
  }

  function escapeXml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getColumnName(index) {
    let number = index + 1;
    let name = "";
    while (number > 0) {
      const remainder = (number - 1) % 26;
      name = String.fromCharCode(65 + remainder) + name;
      number = Math.floor((number - 1) / 26);
    }
    return name;
  }

  function createWorksheetXml(rows) {
    const sheetRows = rows.map((row, rowIndex) => {
      const rowNumber = rowIndex + 1;
      const cells = row.map((value, columnIndex) => {
        const cellRef = `${getColumnName(columnIndex)}${rowNumber}`;
        return `<c r="${cellRef}" t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`;
      }).join("");
      return `<row r="${rowNumber}">${cells}</row>`;
    }).join("");
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`;
  }

  function createCrc32Table() {
    const table = new Uint32Array(256);
    for (let index = 0; index < 256; index += 1) {
      let value = index;
      for (let bit = 0; bit < 8; bit += 1) {
        value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
      }
      table[index] = value >>> 0;
    }
    return table;
  }

  const CRC32_TABLE = createCrc32Table();

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (let index = 0; index < bytes.length; index += 1) {
      crc = CRC32_TABLE[(crc ^ bytes[index]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function dosDateTime(date = new Date()) {
    const year = Math.max(1980, date.getFullYear());
    const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
    const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
    return { dosDate, dosTime };
  }

  function writeUint16(bytes, offset, value) {
    bytes[offset] = value & 0xff;
    bytes[offset + 1] = (value >>> 8) & 0xff;
  }

  function writeUint32(bytes, offset, value) {
    bytes[offset] = value & 0xff;
    bytes[offset + 1] = (value >>> 8) & 0xff;
    bytes[offset + 2] = (value >>> 16) & 0xff;
    bytes[offset + 3] = (value >>> 24) & 0xff;
  }

  function concatBytes(parts) {
    const length = parts.reduce((total, part) => total + part.length, 0);
    const bytes = new Uint8Array(length);
    let offset = 0;
    parts.forEach(part => {
      bytes.set(part, offset);
      offset += part.length;
    });
    return bytes;
  }

  function createZipBlob(entries) {
    const encoder = new TextEncoder();
    const { dosDate, dosTime } = dosDateTime();
    const localParts = [];
    const centralParts = [];
    let offset = 0;

    entries.forEach(entry => {
      const nameBytes = encoder.encode(entry.name);
      const dataBytes = encoder.encode(entry.content);
      const checksum = crc32(dataBytes);

      const localHeader = new Uint8Array(30 + nameBytes.length);
      writeUint32(localHeader, 0, 0x04034b50);
      writeUint16(localHeader, 4, 20);
      writeUint16(localHeader, 6, 0);
      writeUint16(localHeader, 8, 0);
      writeUint16(localHeader, 10, dosTime);
      writeUint16(localHeader, 12, dosDate);
      writeUint32(localHeader, 14, checksum);
      writeUint32(localHeader, 18, dataBytes.length);
      writeUint32(localHeader, 22, dataBytes.length);
      writeUint16(localHeader, 26, nameBytes.length);
      writeUint16(localHeader, 28, 0);
      localHeader.set(nameBytes, 30);
      localParts.push(localHeader, dataBytes);

      const centralHeader = new Uint8Array(46 + nameBytes.length);
      writeUint32(centralHeader, 0, 0x02014b50);
      writeUint16(centralHeader, 4, 20);
      writeUint16(centralHeader, 6, 20);
      writeUint16(centralHeader, 8, 0);
      writeUint16(centralHeader, 10, 0);
      writeUint16(centralHeader, 12, dosTime);
      writeUint16(centralHeader, 14, dosDate);
      writeUint32(centralHeader, 16, checksum);
      writeUint32(centralHeader, 20, dataBytes.length);
      writeUint32(centralHeader, 24, dataBytes.length);
      writeUint16(centralHeader, 28, nameBytes.length);
      writeUint16(centralHeader, 30, 0);
      writeUint16(centralHeader, 32, 0);
      writeUint16(centralHeader, 34, 0);
      writeUint16(centralHeader, 36, 0);
      writeUint32(centralHeader, 38, 0);
      writeUint32(centralHeader, 42, offset);
      centralHeader.set(nameBytes, 46);
      centralParts.push(centralHeader);

      offset += localHeader.length + dataBytes.length;
    });

    const localBytes = concatBytes(localParts);
    const centralBytes = concatBytes(centralParts);
    const end = new Uint8Array(22);
    writeUint32(end, 0, 0x06054b50);
    writeUint16(end, 4, 0);
    writeUint16(end, 6, 0);
    writeUint16(end, 8, entries.length);
    writeUint16(end, 10, entries.length);
    writeUint32(end, 12, centralBytes.length);
    writeUint32(end, 16, localBytes.length);
    writeUint16(end, 20, 0);

    return new Blob([localBytes, centralBytes, end], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
  }

  function createXlsxBlob(rows) {
    return createZipBlob([
      {
        name: "[Content_Types].xml",
        content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'
      },
      {
        name: "_rels/.rels",
        content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'
      },
      {
        name: "xl/workbook.xml",
        content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Laporan Job" sheetId="1" r:id="rId1"/></sheets></workbook>'
      },
      {
        name: "xl/_rels/workbook.xml.rels",
        content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'
      },
      {
        name: "xl/worksheets/sheet1.xml",
        content: createWorksheetXml(rows)
      }
    ]);
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function downloadJobsReport(format) {
    readReportDownloadInputs();
    syncReportDownloadInputs();
    const rows = getReportRows(reportDownloadState);
    const filenameBase = getReportFilenameBase(reportDownloadState);
    const extension = format === "xlsx" ? "xlsx" : "csv";
    const blob = extension === "xlsx" ? createXlsxBlob(rows) : createCsvBlob(rows);
    downloadBlob(blob, `${filenameBase}.${extension}`);
    setStatus(jobsReportDownloadStatus, `${filenameBase}.${extension} dibuat.`, "success");
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

  function getProfilePhotoUrl(user) {
    const config = getStoreConfig(user);
    if (config.fotoProfil && typeof config.fotoProfil === "object" && config.fotoProfil.url) {
      return String(config.fotoProfil.url);
    }
    return String(config.fotoProfilUrl || config.profilePhotoUrl || "");
  }

  function getStoreInitial(user) {
    const config = getStoreConfig(user);
    const source = String(config.namaToko || user?.username || "P").trim();
    return (source[0] || "P").toUpperCase();
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

  function renderStoreStatusBadge(state) {
    if (!dashboardStoreStatusBadge || !dashboardStoreStatusText) {
      return;
    }

    const status = state?.effectiveStatus === "open"
      ? "open"
      : state?.effectiveStatus === "closed"
        ? "closed"
        : "unknown";
    const label = status === "open" ? "Buka" : status === "closed" ? "Tutup" : "-";

    dashboardStoreStatusText.textContent = label;
    dashboardStoreStatusBadge.classList.toggle("is-open", status === "open");
    dashboardStoreStatusBadge.classList.toggle("is-closed", status === "closed");
    dashboardStoreStatusBadge.classList.toggle("is-unknown", status === "unknown");
    dashboardStoreStatusBadge.setAttribute("aria-label", `Status toko: ${label}`);
  }

  function updateOperationalUi({ autoCloseOutsideHours = false } = {}) {
    if (!storeSettingsForm?.elements?.storeStatus) {
      renderStoreStatusBadge(null);
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
    renderStoreStatusBadge(state);
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

  function canonicalPaperType(value) {
    const normalized = String(value || "").trim().toUpperCase();
    if (normalized === "FOLIO") {
      return "F4";
    }
    if (PAPER_SIZE_META[normalized]) {
      return normalized;
    }
    return normalized;
  }

  function renderPaperTypeOptions(selectedTypes = []) {
    const selectedSet = new Set(selectedTypes.map(canonicalPaperType));
    const options = [
      ...PAPER_SIZE_OPTIONS,
      ...selectedTypes.filter(item => !PAPER_SIZE_OPTIONS.some(option => canonicalPaperType(option) === canonicalPaperType(item)))
    ];

    const uniqueOptions = [...new Map(options.map(option => [canonicalPaperType(option), option])).values()];
    const group = document.getElementById("paperTypesGroup");
    group.innerHTML = uniqueOptions.map(option => {
      const value = canonicalPaperType(option);
      const meta = PAPER_SIZE_META[value] || { label: String(option).trim(), size: "Ukuran khusus" };
      return `
        <label class="service-check-label">
          <input type="checkbox" name="paperTypes" value="${escapeHtml(value)}" ${selectedSet.has(value) ? "checked" : ""}>
          <span>${escapeHtml(meta.label)}</span>
          <small>${escapeHtml(meta.size)}</small>
        </label>
      `;
    }).join("");
  }

  function getSelectedPaperTypes() {
    return Array.from(serviceSettingsForm.querySelectorAll('input[name="paperTypes"]:checked'))
      .map(input => canonicalPaperType(input.value))
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
    const rejectedCanceledJobs = jobs.filter(job => ["rejected", "canceled"].includes(String(job.status || "").toLowerCase()));
    const todayFunds = calculateEstimatedFunds({ dateMode: "day", date: todayDateInputValue() });

    statClientOnline.textContent = onlineClients.length;
    statJobsToday.textContent = jobsToday.length;
    statJobsDone.textContent = doneJobs.length;
    statJobsRejectedCanceled.textContent = rejectedCanceledJobs.length;
    statEstimatedFunds.textContent = formatCurrency(todayFunds);
    renderFundEstimate();
  }

  function renderCreditServiceBanner(balance) {
    if (!creditServiceBanner) {
      return;
    }
    if (!latestCreditBalance || Number(balance.remainingCredits || 0) > 0) {
      creditServiceBanner.classList.add("hidden");
      return;
    }

    const pieces = ["Toko belum menerima layanan karena kredit habis."];
    if (balance.hasActiveFreePeriod && balance.activeFreePeriodExpiresAt) {
      pieces.push(`Free masih aktif sampai ${formatDate(balance.activeFreePeriodExpiresAt)}.`);
    }
    if (balance.nextScheduledStart && Number(balance.nextScheduledCredits || 0) > 0) {
      pieces.push(`Kredit terjadwal berikutnya mulai ${formatDate(balance.nextScheduledStart)}.`);
    }
    if (creditServiceBannerText) {
      creditServiceBannerText.textContent = pieces.join(" ");
    }
    creditServiceBanner.classList.remove("hidden");
  }

  function renderCreditBalance() {
    const balance = latestCreditBalance || {};
    renderCreditServiceBanner(balance);
    creditTotalActive.textContent = formatInteger(balance.remainingCredits || 0);
    creditUsed.textContent = formatInteger(balance.scheduledRemainingCredits || 0);
    creditRemaining.textContent = formatInteger(balance.totalEntitledRemainingCredits ?? balance.remainingCredits ?? 0);
    creditNearestExpiry.textContent = balance.nearestExpiration
      ? `${formatDate(balance.nearestExpiration)} · ${formatInteger(balance.nearestExpirationCredits || 0)} kredit`
      : balance.nextScheduledStart
        ? `Mulai ${formatDate(balance.nextScheduledStart)} · ${formatInteger(balance.nextScheduledCredits || 0)} kredit`
      : "-";

    const items = Object.values(balance.breakdown || {});
    const scheduledItems = Object.values(balance.scheduledBreakdown || {});
    const operationItems = [
      `
        <span class="credit-operational-item">
          <strong>Bisa dipakai sekarang</strong>
          <small>${escapeHtml(formatInteger(balance.remainingCredits || 0))} kredit siap digunakan untuk print.</small>
        </span>
      `
    ];

    if (balance.nextScheduledStart && Number(balance.nextScheduledCredits || 0) > 0) {
      operationItems.push(`
        <span class="credit-operational-item">
          <strong>Terjadwal mulai tanggal ${escapeHtml(formatDate(balance.nextScheduledStart))}</strong>
          <small>${escapeHtml(formatInteger(balance.nextScheduledCredits || 0))} kredit aktif setelah periode sebelumnya habis.</small>
        </span>
      `);
    } else if (Number(balance.scheduledRemainingCredits || 0) > 0) {
      operationItems.push(`
        <span class="credit-operational-item">
          <strong>Terjadwal</strong>
          <small>${escapeHtml(formatInteger(balance.scheduledRemainingCredits || 0))} kredit akan aktif sesuai jadwal masa berlaku.</small>
        </span>
      `);
    }

    if (balance.hasActiveFreePeriod) {
      const freeUntil = balance.activeFreePeriodExpiresAt
        ? ` sampai ${formatDate(balance.activeFreePeriodExpiresAt)}`
        : "";
      operationItems.push(`
        <span class="credit-operational-item">
          <strong>Free masih aktif${escapeHtml(freeUntil)}</strong>
          <small>Sisa free: ${escapeHtml(formatInteger(balance.activeFreePeriodRemainingCredits || 0))} kredit.</small>
        </span>
      `);
    }

    if (items.length === 0 && scheduledItems.length === 0) {
      creditBreakdown.innerHTML = [
        ...operationItems,
        '<p class="muted-cell">Belum ada kredit aktif atau terjadwal.</p>'
      ].join("");
      return;
    }

    creditBreakdown.innerHTML = [
      ...operationItems,
      ...items.map(item => `
      <span class="credit-breakdown-item">
        ${escapeHtml(getSourceTypeLabel(item.sourceType))} aktif: ${escapeHtml(formatInteger(item.remainingCredits || 0))}
      </span>
    `),
      ...scheduledItems.map(item => `
      <span class="credit-breakdown-item">
        ${escapeHtml(getSourceTypeLabel(item.sourceType))} terjadwal: ${escapeHtml(formatInteger(item.remainingCredits || 0))}
      </span>
    `)
    ].join("");
  }

  function renderPlans() {
    if (!plansGrid) {
      return;
    }
    if (!latestPlans.length) {
      plansGrid.innerHTML = '<p class="muted-cell">Belum ada plan aktif.</p>';
      return;
    }

    plansGrid.innerHTML = latestPlans.map(plan => {
      const isFree = String(plan.planType || "").toLowerCase() === "free";
      const freeBlocked = Boolean(latestCreditBalance?.hasActiveFreePeriod)
        || Number(latestCreditBalance?.totalEntitledRemainingCredits ?? latestCreditBalance?.remainingCredits ?? 0) > 0;
      const freeDisabled = isFree && freeBlocked;
      const unitPrice = getPlanUnitPriceText(plan);
      return `
        <article class="plan-card">
          <div>
            <h3>${escapeHtml(plan.name || "-")}</h3>
            <p>${escapeHtml(plan.description || "")}</p>
          </div>
          <div class="plan-price">${escapeHtml(formatCurrency(plan.priceIdr || 0))}</div>
          ${unitPrice ? `<span class="plan-unit-price">${escapeHtml(unitPrice)}</span>` : ""}
          <dl class="plan-meta-list">
            <div>
              <dt>Kredit</dt>
              <dd>${escapeHtml(formatInteger(plan.creditsPerUnit || 0))}</dd>
            </div>
            <div>
              <dt>Berlaku</dt>
              <dd>${escapeHtml(getPlanDurationText(plan))}</dd>
            </div>
          </dl>
          <span class="plan-label-slot">${isProPlan(plan) ? '<span class="plan-savings-label">Paling Hemat</span>' : ""}</span>
          <button
            class="btn btn-primary btn-compact"
            type="button"
            data-select-plan="${escapeHtml(plan.id)}"
            ${freeDisabled ? "disabled" : ""}
          >${escapeHtml(getPlanCtaLabel(plan))}</button>
        </article>
      `;
    }).join("");
  }

  function getFilteredOrders() {
    const statusFilter = String(orderTableState.status || "all").toLowerCase();
    const searchText = String(orderTableState.search || "").trim().toLowerCase();
    return latestOrders
      .filter(order => statusFilter === "all" || String(order.status || "").toLowerCase() === statusFilter)
      .filter(order => {
        if (!searchText) {
          return true;
        }
        const haystack = [
          order.id,
          order.planId,
          order.plan?.name,
          order.couponCode,
          getOrderStatusLabel(order.status),
          order.paymentProof?.originalName
        ].join(" ").toLowerCase();
        return haystack.includes(searchText);
      });
  }

  function getOrderTablePage(filteredOrders) {
    const totalItems = filteredOrders.length;
    const pageSize = orderTableState.pageSize === "all" ? totalItems || 1 : Number(orderTableState.pageSize || 20);
    const totalPages = orderTableState.pageSize === "all" ? 1 : Math.max(1, Math.ceil(totalItems / pageSize));
    orderTableState.currentPage = Math.min(Math.max(1, orderTableState.currentPage), totalPages);
    const startIndex = orderTableState.pageSize === "all" ? 0 : (orderTableState.currentPage - 1) * pageSize;
    const endIndex = orderTableState.pageSize === "all" ? totalItems : startIndex + pageSize;
    return {
      items: filteredOrders.slice(startIndex, endIndex),
      totalItems,
      totalPages,
      startIndex,
      endIndex: Math.min(endIndex, totalItems)
    };
  }

  function renderOrders() {
    if (!ordersTableBody) {
      return;
    }
    const filteredOrders = getFilteredOrders();
    const page = getOrderTablePage(filteredOrders);
    if (page.totalItems === 0) {
      ordersTableBody.innerHTML = '<tr><td colspan="6" class="muted-cell">Tidak ada order yang sesuai filter.</td></tr>';
    } else {
      ordersTableBody.innerHTML = page.items.map(order => {
      const statusClass = getOrderStatusClass(order.status);
      const planName = order.plan?.name || order.planId || "-";
      const canUpload = order.status === "pending_payment";
      let action = `<button class="btn btn-outline btn-compact" type="button" data-order-detail="${escapeHtml(order.id)}">Detail</button>`;
      if (canUpload) {
        action += `
          <button class="btn btn-outline btn-compact" type="button" data-upload-proof-order="${escapeHtml(order.id)}">Upload Bukti Pembayaran</button>
          <button class="btn btn-ghost btn-compact" type="button" data-cancel-order="${escapeHtml(order.id)}">Batalkan Order</button>
        `;
      } else if (order.status === "waiting_verification") {
        action += "<small>Pembayaran sedang menunggu verifikasi.</small>";
      } else if (order.status === "paid") {
        action += "<small>Order berhasil/aktif.</small>";
      } else if (order.status === "rejected") {
        action += `<small>${escapeHtml(order.rejectedReason || "Order ditolak.")}</small>`;
      } else {
        action += `<small>${escapeHtml(getOrderStatusLabel(order.status))}</small>`;
      }
      const proofText = order.paymentProof
        ? `<small>Bukti: ${escapeHtml(order.paymentProof.originalName || order.paymentProof.id)}</small>`
        : "";
      return `
        <tr>
          <td>${escapeHtml(formatDateTime(order.createdAt))}<small>${escapeHtml(order.id || "-")}</small></td>
          <td>${escapeHtml(planName)}</td>
          <td>${escapeHtml(formatInteger(order.quantity || 1))}</td>
          <td>${escapeHtml(formatCurrency(order.totalIdr || 0))}</td>
          <td><span class="status-pill ${statusClass}">${escapeHtml(getOrderStatusLabel(order.status))}</span></td>
          <td><div class="order-action-stack">${action}${proofText}</div></td>
        </tr>
      `;
      }).join("");
    }

    if (ordersPageInfo) {
      ordersPageInfo.textContent = page.totalItems === 0
        ? "0 order"
        : `${page.startIndex + 1}-${page.endIndex} dari ${page.totalItems} order`;
    }
    [ordersFirstPageBtn, ordersPrevPageBtn].forEach(button => {
      if (button) button.disabled = orderTableState.currentPage <= 1;
    });
    [ordersNextPageBtn, ordersLastPageBtn].forEach(button => {
      if (button) button.disabled = orderTableState.currentPage >= page.totalPages;
    });
  }

  function renderBillingData() {
    renderCreditBalance();
    renderPlans();
    renderOrders();
  }

  function getFilteredJobs() {
    const searchText = String(jobTableState.search || "").trim().toLowerCase();

    return latestJobs
      .filter(job => {
        return jobTableState.statusFilters.size === 0 || jobTableState.statusFilters.has(getJobStatusGroup(job.status));
      })
      .filter(job => {
        return jobTableState.fileFilters.size === 0 || jobTableState.fileFilters.has(normalizeJobFileStatus(job));
      })
      .filter(job => {
        return isJobWithinDateScope(job, jobTableState);
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
      .sort((a, b) => {
        const result = compareJobSortValues(
          getJobSortValue(a, jobTableState.sortKey),
          getJobSortValue(b, jobTableState.sortKey)
        );
        return jobTableState.sortDirection === "asc" ? result : -result;
      });
  }

  function getJobTablePage(filteredJobs) {
    const totalItems = filteredJobs.length;
    const pageSize = jobTableState.pageSize === "all" ? totalItems || 1 : Number(jobTableState.pageSize || 20);
    const totalPages = jobTableState.pageSize === "all" ? 1 : Math.max(1, Math.ceil(totalItems / pageSize));
    jobTableState.currentPage = Math.min(Math.max(1, jobTableState.currentPage), totalPages);
    const startIndex = jobTableState.pageSize === "all" ? 0 : (jobTableState.currentPage - 1) * pageSize;
    const endIndex = jobTableState.pageSize === "all" ? totalItems : startIndex + pageSize;
    return {
      items: filteredJobs.slice(startIndex, endIndex),
      totalItems,
      totalPages,
      startIndex,
      endIndex: Math.min(endIndex, totalItems)
    };
  }

  function renderAllJobsTable() {
    if (!allJobsTableBody) {
      return;
    }

    updateJobSortIcons();
    const filteredJobs = getFilteredJobs();
    const page = getJobTablePage(filteredJobs);
    if (page.totalItems === 0) {
      allJobsTableBody.innerHTML = '<tr><td colspan="8" class="muted-cell">Tidak ada job yang sesuai filter.</td></tr>';
    } else {
      allJobsTableBody.innerHTML = page.items.map(job => {
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

    if (jobsPageInfo) {
      jobsPageInfo.textContent = page.totalItems === 0
        ? "0 job"
        : `${page.startIndex + 1}-${page.endIndex} dari ${page.totalItems} job`;
    }
    [jobsFirstPageBtn, jobsPrevPageBtn].forEach(button => {
      if (button) button.disabled = jobTableState.currentPage <= 1;
    });
    [jobsNextPageBtn, jobsLastPageBtn].forEach(button => {
      if (button) button.disabled = jobTableState.currentPage >= page.totalPages;
    });
  }

  function renderDashboardData() {
    renderLinkedClients(latestClients);
    renderStats(latestClients, latestJobs);
    renderBillingData();
    renderAllJobsTable();
    dashboardLastSync.textContent = `Sinkron: ${new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit"
    })}`;
  }

  async function loadDashboardData() {
    const authState = window.PortalAuth.getState();
    if (!authState?.accessToken) {
      setLinkedClientsEmpty("Silakan login untuk melihat daftar client.");
      setStatus(linkedClientsStatus, "");
      setStatus(billingStatus, "");
      return;
    }

    setStatus(linkedClientsStatus, "Memuat data dashboard...");
    setStatus(billingStatus, "Memuat data billing...");

    const [clientsResult, jobsResult, plansResult, ordersResult, creditResult] = await Promise.allSettled([
      window.PortalAuth.apiJson("/api/clients", { method: "GET" }),
      window.PortalAuth.apiJson("/api/jobs", { method: "GET" }),
      window.PortalAuth.apiJson("/api/billing/plans", { method: "GET" }),
      window.PortalAuth.apiJson("/api/billing/orders", { method: "GET" }),
      window.PortalAuth.apiJson("/api/billing/credits/balance", { method: "GET" })
    ]);

    if (clientsResult.status === "fulfilled") {
      latestClients = Array.isArray(clientsResult.value)
        ? clientsResult.value.filter(client => Boolean(client?.recognized))
        : [];
    }

    if (jobsResult.status === "fulfilled") {
      latestJobs = Array.isArray(jobsResult.value) ? jobsResult.value : [];
    }

    if (plansResult.status === "fulfilled") {
      latestPlans = Array.isArray(plansResult.value?.plans) ? plansResult.value.plans : [];
    }

    if (ordersResult.status === "fulfilled") {
      latestOrders = Array.isArray(ordersResult.value?.orders) ? ordersResult.value.orders : [];
    }

    if (creditResult.status === "fulfilled") {
      latestCreditBalance = creditResult.value?.balance || null;
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

    if (plansResult.status === "rejected" || ordersResult.status === "rejected" || creditResult.status === "rejected") {
      setStatus(billingStatus, "Sebagian data billing belum termuat.", "error");
    } else {
      setStatus(billingStatus, "Data billing terbaru sudah dimuat.", "success");
    }
  }

  function selectPlan(planId) {
    const plan = latestPlans.find(item => item.id === planId);
    if (!plan) {
      return;
    }
    const params = new URLSearchParams({
      planId: plan.id,
      quantity: "1"
    });
    window.location.href = `${PORTAL_PAYMENT_PATH}?${params.toString()}`;
  }

  async function loadPaymentInstructions() {
    if (latestPaymentInstructions) {
      return latestPaymentInstructions;
    }
    if (!paymentInstructionsPromise) {
      paymentInstructionsPromise = window.PortalAuth.apiJson("/api/billing/payment-instructions", { method: "GET" })
        .then(body => {
          latestPaymentInstructions = body || {};
          return latestPaymentInstructions;
        })
        .finally(() => {
          paymentInstructionsPromise = null;
        });
    }
    return paymentInstructionsPromise;
  }

  function renderPaymentProofPaymentInfo(order, instructions = latestPaymentInstructions) {
    const accountNumber = String(instructions?.accountNumber || "no_rek").trim();
    const bankName = String(instructions?.bankName || "bank xxx").trim();
    const accountName = String(instructions?.accountName || "").trim();
    const accountLabel = instructions?.accountLabel
      || `${accountNumber} (${bankName})`;
    if (paymentProofAccountText) {
      paymentProofAccountText.textContent = accountName
        ? `${accountLabel} a.n. ${accountName}`
        : accountLabel;
    }
    if (paymentProofInstructionText) {
      paymentProofInstructionText.textContent = order?.paymentInstruction
        || instructions?.paymentInstruction
        || "Transfer sesuai nominal order, lalu upload bukti pembayaran.";
    }
  }

  function getPaymentAccountText(instructions = latestPaymentInstructions) {
    const accountNumber = String(instructions?.accountNumber || "no_rek").trim();
    const bankName = String(instructions?.bankName || "bank xxx").trim();
    const accountName = String(instructions?.accountName || "").trim();
    const accountLabel = instructions?.accountLabel || `${accountNumber} (${bankName})`;
    return accountName ? `${accountLabel} a.n. ${accountName}` : accountLabel;
  }

  function getOrderById(orderId) {
    const safeOrderId = String(orderId || "").trim();
    return latestOrders.find(item => String(item.id || "") === safeOrderId) || null;
  }

  function clearOrderProofPreview() {
    if (activeOrderProofObjectUrl) {
      URL.revokeObjectURL(activeOrderProofObjectUrl);
      activeOrderProofObjectUrl = "";
    }
    if (orderProofPreview) {
      orderProofPreview.innerHTML = "";
    }
    setStatus(orderDetailStatus, "");
  }

  function renderOrderDetailBody(order) {
    if (!orderDetailBody) {
      return;
    }
    if (!order) {
      orderDetailBody.innerHTML = '<p class="muted-cell">Order tidak ditemukan.</p>';
      return;
    }

    const statusClass = getOrderStatusClass(order.status);
    const planName = order.plan?.name || order.planId || "-";
    const proof = order.paymentProof;
    const canUpload = order.status === "pending_payment";
    const proofText = proof
      ? `${proof.originalName || proof.id || "Bukti pembayaran"} · ${formatDateTime(proof.submittedAt)}`
      : "Belum ada bukti pembayaran.";
    const instruction = order.paymentInstruction
      || latestPaymentInstructions?.paymentInstruction
      || "Transfer sesuai nominal order, lalu upload bukti pembayaran.";

    orderDetailBody.innerHTML = `
      <dl class="order-detail-grid">
        <div>
          <dt>Order</dt>
          <dd><code>${escapeHtml(order.id || "-")}</code></dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd><span class="status-pill ${statusClass}">${escapeHtml(getOrderStatusLabel(order.status))}</span></dd>
        </div>
        <div>
          <dt>Plan</dt>
          <dd>${escapeHtml(planName)}</dd>
        </div>
        <div>
          <dt>Quantity</dt>
          <dd>${escapeHtml(formatInteger(order.quantity || 1))}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>${escapeHtml(formatCurrency(order.totalIdr || 0))}</dd>
        </div>
        <div>
          <dt>Dibuat</dt>
          <dd>${escapeHtml(formatDateTime(order.createdAt))}</dd>
        </div>
        <div>
          <dt>Kedaluwarsa Order</dt>
          <dd>${escapeHtml(order.paymentExpiresAt ? formatDateTime(order.paymentExpiresAt) : "-")}</dd>
        </div>
        <div>
          <dt>Kupon</dt>
          <dd>${escapeHtml(order.couponCode || "-")}</dd>
        </div>
        <div class="order-detail-wide">
          <dt>Instruksi Pembayaran</dt>
          <dd>${escapeHtml(instruction)}</dd>
        </div>
        <div class="order-detail-wide">
          <dt>Bukti Pembayaran</dt>
          <dd>${escapeHtml(proofText)}</dd>
        </div>
        ${order.rejectedReason ? `
          <div class="order-detail-wide">
            <dt>Alasan Ditolak</dt>
            <dd>${escapeHtml(order.rejectedReason)}</dd>
          </div>
        ` : ""}
      </dl>
      <div class="order-detail-actions">
        ${canUpload ? `<button class="btn btn-primary btn-compact" type="button" data-upload-proof-order="${escapeHtml(order.id)}">Upload Bukti</button>` : ""}
        ${proof ? `<button class="btn btn-outline btn-compact" type="button" data-download-order-proof="${escapeHtml(order.id)}">Download Bukti</button>` : ""}
      </div>
    `;
  }

  async function renderOrderProofPreview(order) {
    if (!orderProofPreview) {
      return;
    }
    const proof = order?.paymentProof;
    if (!proof) {
      orderProofPreview.innerHTML = `
        <div class="order-proof-card">
          <span>Bukti pembayaran</span>
          <p>Belum ada bukti pembayaran yang diupload untuk order ini.</p>
        </div>
      `;
      return;
    }
    if (!proof.previewUrl) {
      orderProofPreview.innerHTML = `
        <div class="order-proof-card">
          <span>Bukti pembayaran</span>
          <p>Preview bukti pembayaran belum tersedia.</p>
        </div>
      `;
      return;
    }

    orderProofPreview.innerHTML = `
      <div class="order-proof-card">
        <div class="order-proof-head">
          <div>
            <span>Bukti pembayaran</span>
            <p>${escapeHtml(proof.originalName || proof.id || "Bukti pembayaran")}</p>
          </div>
          <button class="btn btn-outline btn-compact" type="button" data-download-order-proof="${escapeHtml(order.id)}">Download</button>
        </div>
        <div class="order-proof-frame" id="orderProofPreviewFrame">Memuat preview bukti...</div>
      </div>
    `;

    const frame = document.getElementById("orderProofPreviewFrame");
    try {
      const response = await window.PortalAuth.apiFetch(proof.previewUrl, { method: "GET" });
      if (!response.ok) {
        throw new Error(`Gagal memuat preview (${response.status})`);
      }
      const blob = await response.blob();
      const mimeType = blob.type || proof.mimeType || "";
      activeOrderProofObjectUrl = URL.createObjectURL(blob);
      if (mimeType.startsWith("image/")) {
        frame.innerHTML = `<img src="${activeOrderProofObjectUrl}" alt="Preview bukti pembayaran">`;
      } else if (mimeType === "application/pdf") {
        frame.innerHTML = `<iframe src="${activeOrderProofObjectUrl}" title="Preview bukti pembayaran"></iframe>`;
      } else {
        frame.innerHTML = '<p>Preview file ini tidak tersedia. Gunakan tombol download.</p>';
      }
    } catch (err) {
      if (frame) {
        frame.innerHTML = `<p>${escapeHtml(err.message || "Gagal memuat preview bukti pembayaran.")}</p>`;
      }
    }
  }

  async function openOrderDetailModal(orderId) {
    const order = getOrderById(orderId);
    clearOrderProofPreview();
    renderOrderDetailBody(order);
    openModal(orderDetailModalBackdrop);
    if (order) {
      renderOrderProofPreview(order);
    }
  }

  async function downloadOrderProof(orderId) {
    const order = getOrderById(orderId);
    const proof = order?.paymentProof;
    if (!proof?.downloadUrl && !proof?.previewUrl) {
      setStatus(orderDetailStatus, "Bukti pembayaran belum tersedia.", "error");
      return;
    }
    setStatus(orderDetailStatus, "Mengunduh bukti pembayaran...");
    try {
      const response = await window.PortalAuth.apiFetch(proof.downloadUrl || proof.previewUrl, { method: "GET" });
      if (!response.ok) {
        throw new Error(`Download gagal (${response.status})`);
      }
      const blob = await response.blob();
      downloadBlob(blob, proof.originalName || "payment-proof");
      setStatus(orderDetailStatus, "Bukti pembayaran berhasil diunduh.", "success");
    } catch (err) {
      setStatus(orderDetailStatus, err.message || "Gagal download bukti pembayaran.", "error");
    }
  }

  function renderPaymentProofUploadSummary(order, proof, instructions = latestPaymentInstructions) {
    if (!paymentProofUploadSummary) {
      return;
    }
    if (!order && !proof) {
      paymentProofUploadSummary.classList.add("hidden");
      paymentProofUploadSummary.innerHTML = "";
      return;
    }
    const instruction = order?.paymentInstruction
      || instructions?.paymentInstruction
      || "Transfer sesuai nominal order, lalu upload bukti pembayaran.";
    paymentProofUploadSummary.innerHTML = `
      <strong>Bukti sudah terkirim</strong>
      <p>Status order: ${escapeHtml(getOrderStatusLabel(order?.status || "waiting_verification"))}. Admin akan memverifikasi pembayaran.</p>
      <dl>
        <div>
          <dt>Rekening</dt>
          <dd>${escapeHtml(getPaymentAccountText(instructions))}</dd>
        </div>
        <div>
          <dt>Instruksi</dt>
          <dd>${escapeHtml(instruction)}</dd>
        </div>
        <div>
          <dt>Kedaluwarsa Order</dt>
          <dd>${escapeHtml(order?.paymentExpiresAt ? formatDateTime(order.paymentExpiresAt) : "-")}</dd>
        </div>
        <div>
          <dt>File Bukti</dt>
          <dd>${escapeHtml(proof?.originalName || order?.paymentProof?.originalName || "-")}</dd>
        </div>
      </dl>
    `;
    paymentProofUploadSummary.classList.remove("hidden");
  }

  function openPaymentProofModal(orderId) {
    const safeOrderId = String(orderId || "").trim();
    const order = getOrderById(safeOrderId);
    activePaymentProofOrderId = safeOrderId;
    paymentProofForm.reset();
    setStatus(paymentProofStatus, "");
    renderPaymentProofUploadSummary(null, null);
    paymentProofUploadFields?.classList.remove("hidden");
    if (paymentProofOrderMeta) {
      const pieces = order
        ? [
          order.plan?.name || order.planId || "Order",
          formatCurrency(order.totalIdr || 0),
          getOrderStatusLabel(order.status)
        ]
        : [`Order ${safeOrderId || "-"}`];
      paymentProofOrderMeta.textContent = pieces.filter(Boolean).join(" - ");
    }
    renderPaymentProofPaymentInfo(order);
    openModal(paymentProofModalBackdrop);
    loadPaymentInstructions()
      .then(instructions => {
        if (activePaymentProofOrderId === safeOrderId) {
          renderPaymentProofPaymentInfo(order, instructions);
        }
      })
      .catch(err => {
        setStatus(paymentProofStatus, err.message || "Instruksi pembayaran belum termuat.", "error");
      });
  }

  function openPaymentProofModalFromUrl() {
    const orderId = getUploadProofOrderIdFromUrl();
    if (!orderId) {
      return;
    }
    activateDashboardPanel("creditSection", { closeSidebar: true, resetScroll: false });
    openPaymentProofModal(orderId);
    clearUploadProofOrderIdFromUrl();
  }

  async function cancelOrder(orderId) {
    const safeOrderId = String(orderId || "").trim();
    if (!safeOrderId) {
      return;
    }
    const confirmed = await confirmAction({
      title: "Batalkan order?",
      message: "Order pending payment ini akan dibatalkan.",
      okText: "Batalkan",
      cancelText: "Kembali",
      variant: "warning"
    });
    if (!confirmed) {
      return;
    }

    setStatus(billingStatus, "Membatalkan order...");
    try {
      await window.PortalAuth.apiJson(`/api/billing/orders/${encodeURIComponent(safeOrderId)}/cancel`, {
        method: "POST"
      });
      notify({
        title: "Order dibatalkan",
        message: "Order berhasil dibatalkan.",
        variant: "success"
      });
      await loadDashboardData();
    } catch (err) {
      setStatus(billingStatus, err.message || "Gagal membatalkan order.", "error");
    }
  }

  async function submitPaymentProof(event) {
    event.preventDefault();
    if (!activePaymentProofOrderId) {
      setStatus(paymentProofStatus, "Order tidak valid.", "error");
      return;
    }
    const formData = new FormData(paymentProofForm);
    setStatus(paymentProofStatus, "Mengupload bukti pembayaran...");
    try {
      const response = await window.PortalAuth.apiFetch(
        `/api/billing/orders/${encodeURIComponent(activePaymentProofOrderId)}/payment-proof`,
        {
          method: "POST",
          body: formData
        }
      );
      let body = null;
      try {
        body = await response.json();
      } catch {
        body = null;
      }
      if (!response.ok) {
        throw new Error(body?.error || `Upload gagal (${response.status})`);
      }
      const updatedOrder = body?.order || getOrderById(activePaymentProofOrderId);
      const instructions = await loadPaymentInstructions().catch(() => latestPaymentInstructions);
      renderPaymentProofUploadSummary(updatedOrder, body?.proof, instructions);
      paymentProofUploadFields?.classList.add("hidden");
      activePaymentProofOrderId = null;
      setStatus(paymentProofStatus, "Bukti sudah terkirim. Status order menunggu verifikasi admin.", "success");
      notify({
        title: "Bukti pembayaran diupload",
        message: "Order sekarang menunggu verifikasi admin.",
        variant: "success"
      });
      await loadDashboardData();
    } catch (err) {
      setStatus(paymentProofStatus, err.message || "Gagal upload bukti pembayaran.", "error");
    }
  }

  async function unbindClient(clientId, clientName) {
    const safeClientId = String(clientId || "").trim();
    if (!safeClientId) {
      return;
    }

    const confirmed = await confirmAction({
      title: "Lepas client?",
      message: `Client "${clientName || "client"}" akan dilepas dari akun portal ini.`,
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
      await window.PortalAuth.apiJson(`/api/clients/${encodeURIComponent(safeClientId)}/unbind`, {
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
    const state = window.PortalAuth.getState();
    if (!state?.accessToken) {
      return null;
    }

    try {
      const meRes = await window.PortalAuth.apiJson("/api/auth/me", {
        method: "GET"
      });
      const nextState = {
        ...window.PortalAuth.getState(),
        user: meRes.user
      };
      window.PortalAuth.saveState(nextState);
      return meRes.user;
    } catch {
      window.PortalAuth.clearState();
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
    dashboardUserChip.textContent = user?.username ? `@${user.username}` : "Akun Portal";
    dashboardStoreCode.textContent = `Kode toko: ${user?.kodeToko || "-"}`;
    dashboardUserStoreCode.textContent = `Kode toko: ${user?.kodeToko || "-"}`;
    const profilePhotoUrl = getProfilePhotoUrl(user);
    const profileInitial = getStoreInitial(user);
    [dashboardProfilePhoto, storeProfilePhotoPreview].forEach(image => {
      image.src = profilePhotoUrl || "";
      image.classList.toggle("has-photo", Boolean(profilePhotoUrl));
    });
    dashboardUserMenuBtn.classList.toggle("has-photo", Boolean(profilePhotoUrl));
    storeProfilePhotoInitial.textContent = profileInitial;
    storeProfilePhotoInitial.classList.toggle("hidden", Boolean(profilePhotoUrl));
    storeProfilePhotoName.textContent = profilePhotoUrl ? "Foto profil aktif" : "Belum ada foto";
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
        }
      }
    };
  }

  async function saveDashboardSettings(statusEl, successMessage) {
    setStatus(statusEl, "Menyimpan pengaturan...");

    try {
      const body = await window.PortalAuth.apiJson("/api/auth/me/store", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildSettingsPayload())
      });

      const nextState = {
        ...window.PortalAuth.getState(),
        user: body.user
      };
      window.PortalAuth.saveState(nextState);
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

  async function uploadProfilePhoto() {
    if (!activeProfilePhotoFile) {
      return;
    }
    setStatus(profilePhotoCropStatus, "Menyimpan foto profil...");

    try {
      const blob = await createProfilePhotoBlob();
      const formData = new FormData();
      formData.append("photo", blob, "profile-photo.jpg");
      const res = await window.PortalAuth.apiFetch("/api/auth/me/store/profile-photo", {
        method: "POST",
        body: formData
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.error || `Upload gagal (${res.status})`);
      }

      const state = window.PortalAuth.getState() || {};
      const nextState = { ...state, user: body.user };
      window.PortalAuth.saveState(nextState);
      currentUser = body.user;
      fillDashboardForms(body.user);
      setStatus(storeProfilePhotoStatus, "Foto profil berhasil diperbarui.", "success");
      closeModal(profilePhotoCropModalBackdrop);
      notify({
        title: "Foto profil tersimpan",
        message: "Foto profil toko berhasil diperbarui.",
        variant: "success"
      });
    } catch (err) {
      setStatus(profilePhotoCropStatus, err.message || "Gagal menyimpan foto profil.", "error");
    }
  }

  function renderAuthedState(user) {
    if (isAdminUser(user)) {
      goToAdminPortal();
      return;
    }
    currentUser = user;
    document.body.classList.add("portal-dashboard-active");
    authShell?.classList.add("hidden");
    dashboardShell?.classList.remove("hidden");
    fillDashboardForms(user);
    activateDashboardPanel(getDashboardTargetFromHash(), { closeSidebar: false, resetScroll: false });
    loadInstallerCatalog({ silent: true });
    setStatus(heroStatus, "");
    heroText.textContent = "Akun sudah aktif.";
  }

  function renderGuestState() {
    currentUser = null;
    latestClients = [];
    latestJobs = [];
    installerCatalog = { current: null, installers: [], otherInstallers: [] };
    installerCatalogLoaded = false;
    installerCatalogLoading = false;
    renderInstallerCatalog();
    document.body.classList.remove("portal-dashboard-active");
    closeDashboardSidebar();
    dashboardShell?.classList.add("hidden");
    authShell?.classList.remove("hidden");
    setLinkedClientsEmpty("Silakan login untuk melihat daftar client.");
    setStatus(linkedClientsStatus, "");
    renderStoreStatusBadge(null);
    heroText.textContent = "Silakan login atau daftar untuk membuka pengaturan akun.";
  }

  async function renderAuthState() {
    const state = window.PortalAuth.getState();
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
    openPaymentProofModalFromUrl();
  }

  async function submitLogin(event) {
    event.preventDefault();
    setStatus(loginStatus, "Memverifikasi akun...");

    const formData = new FormData(loginForm);
    const identifier = String(formData.get("identifier") || "").trim();
    const password = String(formData.get("password") || "");

    try {
      const body = await window.PortalAuth.apiJson("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password })
      }, { retry: false });

      window.PortalAuth.saveState({
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

  async function submitForgotPassword(event) {
    event.preventDefault();
    setStatus(forgotPasswordStatus, "Mengirim tautan reset...");

    const submitButton = forgotPasswordForm.querySelector('button[type="submit"]');
    const formData = new FormData(forgotPasswordForm);
    const email = String(formData.get("email") || "").trim();

    const turnstileToken = getTurnstileTokenOrFocus("forgotPassword", forgotPasswordStatus);
    if (turnstileToken === null) {
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      await window.PortalAuth.apiJson("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstileToken })
      }, { retry: false });

      forgotPasswordForm.reset();
      setStatus(forgotPasswordStatus, "Jika email terdaftar, tautan reset password telah dikirim.", "success");
    } catch (err) {
      setStatus(forgotPasswordStatus, err.message || "Gagal mengirim tautan reset password.", "error");
    } finally {
      resetTurnstileWidget("forgotPassword");
      if (submitButton) {
        submitButton.disabled = false;
      }
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

    const turnstileToken = getTurnstileTokenOrFocus("register", registerStatus);
    if (turnstileToken === null) {
      return;
    }

    try {
      const body = await window.PortalAuth.apiJson("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, turnstileToken })
      }, { retry: false });

      window.PortalAuth.saveState({
        accessToken: body.accessToken,
        refreshToken: body.refreshToken,
        accessTokenTtl: body.accessTokenTtl,
        refreshTokenExpiresAt: body.refreshTokenExpiresAt,
        user: body.user
      });

      setStatus(registerStatus, "Akun berhasil dibuat.", "success");
      closeModal(registerModalBackdrop);
      registerForm.reset();
      resetTurnstileWidget("register");
      await renderAuthState();
    } catch (err) {
      setStatus(registerStatus, err.message || "Daftar gagal.", "error");
      resetTurnstileWidget("register");
    }
  }

  async function submitAccountProfile(event) {
    event.preventDefault();
    setStatus(accountProfileStatus, "Menyimpan profil...");

    const username = String(accountProfileForm.elements.username.value || "").trim();
    const email = String(accountProfileForm.elements.email.value || "").trim();

    try {
      const body = await window.PortalAuth.apiJson("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email })
      });

      const nextState = {
        ...window.PortalAuth.getState(),
        user: body.user
      };
      window.PortalAuth.saveState(nextState);
      currentUser = body.user;
      fillDashboardForms(body.user);
      setStatus(accountProfileStatus, "Profil berhasil diperbarui.", "success");
      notify({
        title: "Profil tersimpan",
        message: "Data akun portal berhasil diperbarui.",
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
      await window.PortalAuth.apiJson("/api/auth/me/password", {
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
        await window.PortalAuth.logoutCurrentSession();
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
      await window.PortalAuth.apiJson("/api/auth/me/pin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, pin })
      });

      accountPinForm.reset();
      const nextUser = {
        ...(currentUser || window.PortalAuth.getState()?.user || {}),
        hasPin: true
      };
      const nextState = {
        ...window.PortalAuth.getState(),
        user: nextUser
      };
      window.PortalAuth.saveState(nextState);
      currentUser = nextUser;
      fillDashboardForms(nextUser);
      setStatus(accountPinStatusMessage, "PIN berhasil disimpan.", "success");
      notify({
        title: "PIN tersimpan",
        message: "PIN akun portal berhasil diperbarui.",
        variant: "success"
      });
    } catch (err) {
      setStatus(accountPinStatusMessage, err.message || "Gagal menyimpan PIN.", "error");
    }
  }

  async function onLogout() {
    await window.PortalAuth.logoutCurrentSession();
    renderGuestState();
    notify({
      title: "Logout berhasil",
      message: "Anda sudah keluar dari Portal PrintOrder.",
      variant: "success"
    });
  }

  function renderInstallerCatalog() {
    const current = installerCatalog.current;
    if (downloadClientBtnLabel) {
      downloadClientBtnLabel.textContent = current?.version ? `Klien Desktop v${current.version}` : "Klien Desktop";
    }

    if (downloadClientPrimaryLink) {
      if (current?.downloadUrl) {
        downloadClientPrimaryLink.href = current.downloadUrl;
        downloadClientPrimaryLink.classList.remove("is-disabled");
        downloadClientPrimaryLink.setAttribute("aria-disabled", "false");
      } else {
        downloadClientPrimaryLink.removeAttribute("href");
        downloadClientPrimaryLink.classList.add("is-disabled");
        downloadClientPrimaryLink.setAttribute("aria-disabled", "true");
      }
    }

    if (downloadClientPrimaryTitle) {
      downloadClientPrimaryTitle.textContent = current?.label || "Installer belum tersedia";
    }
    if (downloadClientPrimaryNotes) {
      downloadClientPrimaryNotes.textContent = current?.notes || "Windows installer";
    }
    if (downloadClientPrimarySize) {
      downloadClientPrimarySize.textContent = current?.fileSizeLabel || "-";
    }

    const others = Array.isArray(installerCatalog.otherInstallers)
      ? installerCatalog.otherInstallers
      : [];
    if (otherInstallersList) {
      if (installerCatalogLoading && !installerCatalogLoaded) {
        otherInstallersList.innerHTML = '<p class="muted-cell">Memuat installer...</p>';
      } else if (!others.length) {
        otherInstallersList.innerHTML = '<p class="muted-cell">Belum ada versi lain yang tersedia.</p>';
      } else {
        otherInstallersList.innerHTML = others.map(installer => `
          <a class="download-client-card" href="${escapeHtml(installer.downloadUrl)}">
            <span class="windows-logo-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M3 5.2 10.8 4v7.5H3V5.2Z"></path>
                <path d="M12 3.8 21 2.5v9H12V3.8Z"></path>
                <path d="M3 12.7h7.8v7.4L3 18.9v-6.2Z"></path>
                <path d="M12 12.7h9v8.8l-9-1.3v-7.5Z"></path>
              </svg>
            </span>
            <span class="download-client-copy">
              <strong>${escapeHtml(installer.label || `PrintOrder Installer v${installer.version}`)}</strong>
              <small>${escapeHtml(installer.notes || "Windows installer")}</small>
            </span>
            <span class="download-client-size">${escapeHtml(installer.fileSizeLabel || `v${installer.version}`)}</span>
          </a>
        `).join("");
      }
    }

    if (otherInstallersBtn) {
      otherInstallersBtn.hidden = false;
    }
    if (downloadClientOtherVersionsBtn) {
      downloadClientOtherVersionsBtn.hidden = false;
    }
  }

  async function loadInstallerCatalog({ silent = false } = {}) {
    if (installerCatalogLoading) {
      return installerCatalog;
    }
    installerCatalogLoading = true;
    if (!silent) {
      setStatus(downloadClientStatus, "Memuat installer...");
    }
    renderInstallerCatalog();
    try {
      const body = await window.PortalAuth.apiJson("/api/installers", { method: "GET" });
      installerCatalog = {
        current: body.current || null,
        installers: Array.isArray(body.installers) ? body.installers : [],
        otherInstallers: Array.isArray(body.otherInstallers) ? body.otherInstallers : []
      };
      installerCatalogLoaded = true;
      setStatus(downloadClientStatus, "");
    } catch (err) {
      installerCatalogLoaded = true;
      setStatus(downloadClientStatus, err.message || "Gagal memuat installer.", "error");
    } finally {
      installerCatalogLoading = false;
      renderInstallerCatalog();
    }
    return installerCatalog;
  }

  function showDownloadInfo() {
    loadInstallerCatalog({ silent: true });
    if (downloadClientModalBackdrop) {
      openModal(downloadClientModalBackdrop);
      return;
    }
    if (installerCatalog.current?.downloadUrl) {
      window.location.href = installerCatalog.current.downloadUrl;
    }
  }

  function showOtherInstallers() {
    loadInstallerCatalog({ silent: true });
    if (otherInstallersModalBackdrop) {
      openModal(otherInstallersModalBackdrop);
    }
  }

  function showConnectClientInfo() {
    if (window.PrintOrderAlert?.ok) {
      window.PrintOrderAlert.ok({
        title: "Hubungkan Client Baru",
        message: "Install aplikasi desktop PrintOrder, login dengan akun portal ini, lalu pilih printer aktif dari aplikasi client.",
        variant: "info"
      });
      return;
    }
    window.alert("Install aplikasi desktop PrintOrder dan login dengan akun portal ini.");
  }

  function showHelpInfo(action) {
    if (action === "download") {
      showDownloadInfo();
      return;
    }
    const messages = {
      install: ["Panduan instalasi", "Install client desktop, login dengan akun portal, pilih printer, lalu pastikan status client online."],
      troubleshoot: ["Troubleshooting", "Pastikan server aktif, client desktop login, printer terpilih, dan koneksi jaringan stabil."]
    };
    const [title, message] = messages[action] || messages.troubleshoot;

    if (window.PrintOrderAlert?.ok) {
      window.PrintOrderAlert.ok({ title, message, variant: "info" });
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

    openForgotPasswordBtn.addEventListener("click", () => {
      forgotPasswordForm.reset();
      setStatus(forgotPasswordStatus, "");
      openModal(forgotPasswordModalBackdrop);
      forgotPasswordForm.elements.email?.focus();
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
        fillAccountProfileForm(currentUser || window.PortalAuth.getState()?.user);
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

    [registerModalBackdrop, forgotPasswordModalBackdrop, downloadClientModalBackdrop, otherInstallersModalBackdrop, allJobsModalBackdrop, jobsReportDownloadModalBackdrop, fundEstimateModalBackdrop, jobsFilterModalBackdrop, ordersModalBackdrop, orderDetailModalBackdrop, paymentProofModalBackdrop, operationalHoursModalBackdrop, profilePhotoCropModalBackdrop, profileModalBackdrop, passwordModalBackdrop, pinModalBackdrop].forEach(modal => {
      if (!modal) return;
      modal.addEventListener("click", event => {
        if (event.target === modal) {
          closeModal(modal);
        }
      });
    });
  }

  function bindActionHandlers() {
    dashboardNavLinks.forEach(link => {
      link.addEventListener("click", event => {
        event.preventDefault();
        activateDashboardPanel(link.getAttribute("data-dashboard-target"), { closeSidebar: true });
      });
    });

    dashboardSidebarToggle?.addEventListener("click", openDashboardSidebar);
    dashboardSidebarClose?.addEventListener("click", closeDashboardSidebar);
    dashboardSidebarBackdrop?.addEventListener("click", closeDashboardSidebar);
    window.addEventListener("hashchange", () => {
      if (document.body.classList.contains("portal-dashboard-active")) {
        activateDashboardPanel(getDashboardTargetFromHash(), { updateHash: false, closeSidebar: true });
      }
    });
    window.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeDashboardSidebar();
        closeDashboardUserMenu();
      }
    });
    dashboardUserMenuBtn?.addEventListener("click", event => {
      event.stopPropagation();
      toggleDashboardUserMenu();
    });
    document.addEventListener("click", event => {
      if (!dashboardUserMenu?.contains(event.target) && !dashboardUserMenuBtn?.contains(event.target)) {
        closeDashboardUserMenu();
      }
    });

    loginForm.addEventListener("submit", submitLogin);
    registerForm.addEventListener("submit", submitRegister);
    forgotPasswordForm.addEventListener("submit", submitForgotPassword);
    accountProfileForm.addEventListener("submit", submitAccountProfile);
    accountPasswordForm.addEventListener("submit", submitAccountPassword);
    accountPinForm.addEventListener("submit", submitAccountPin);
    storeSettingsForm.elements.storeStatus.addEventListener("change", onStoreStatusChange);
    saveOperationalHoursBtn.addEventListener("click", onSaveOperationalHours);
    pickStoreProfilePhotoBtn.addEventListener("click", () => storeProfilePhotoInput.click());
    storeProfilePhotoInput.addEventListener("change", () => {
      const file = storeProfilePhotoInput.files?.[0];
      if (file) {
        openProfilePhotoCrop(file);
      }
      storeProfilePhotoInput.value = "";
    });
    profileCropZoom.addEventListener("input", () => {
      profileCropState.zoom = Number(profileCropZoom.value || 1);
      updateProfileCropTransform();
    });
    profileCropStage.addEventListener("pointerdown", event => {
      profileCropState.dragging = true;
      profileCropState.pointerId = event.pointerId;
      profileCropState.startX = event.clientX;
      profileCropState.startY = event.clientY;
      profileCropState.dragStartX = profileCropState.x;
      profileCropState.dragStartY = profileCropState.y;
      profileCropStage.setPointerCapture(event.pointerId);
    });
    profileCropStage.addEventListener("pointermove", event => {
      if (!profileCropState.dragging || profileCropState.pointerId !== event.pointerId) {
        return;
      }
      profileCropState.x = profileCropState.dragStartX + event.clientX - profileCropState.startX;
      profileCropState.y = profileCropState.dragStartY + event.clientY - profileCropState.startY;
      updateProfileCropTransform();
    });
    profileCropStage.addEventListener("pointerup", event => {
      profileCropState.dragging = false;
      if (profileCropStage.hasPointerCapture(event.pointerId)) {
        profileCropStage.releasePointerCapture(event.pointerId);
      }
    });
    profileCropStage.addEventListener("pointercancel", () => {
      profileCropState.dragging = false;
    });
    saveProfilePhotoBtn.addEventListener("click", uploadProfilePhoto);
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
    refreshBillingBtn.addEventListener("click", loadDashboardData);
    refreshOrdersBtn.addEventListener("click", loadDashboardData);
    creditServiceBillingBtn?.addEventListener("click", () => {
      activateDashboardPanel("creditSection", { closeSidebar: true, resetScroll: false });
      plansGrid?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    openOrdersModalBtn.addEventListener("click", () => {
      renderOrders();
      openModal(ordersModalBackdrop);
    });
    ordersStatusFilter?.addEventListener("change", () => {
      orderTableState.status = ordersStatusFilter.value || "all";
      orderTableState.currentPage = 1;
      renderOrders();
    });
    ordersSearchInput?.addEventListener("input", () => {
      orderTableState.search = ordersSearchInput.value || "";
      orderTableState.currentPage = 1;
      renderOrders();
    });
    ordersPageSizeSelect?.addEventListener("change", () => {
      orderTableState.pageSize = ordersPageSizeSelect.value === "all" ? "all" : Number(ordersPageSizeSelect.value || 20);
      orderTableState.currentPage = 1;
      renderOrders();
    });
    ordersFirstPageBtn?.addEventListener("click", () => {
      orderTableState.currentPage = 1;
      renderOrders();
    });
    ordersPrevPageBtn?.addEventListener("click", () => {
      orderTableState.currentPage -= 1;
      renderOrders();
    });
    ordersNextPageBtn?.addEventListener("click", () => {
      orderTableState.currentPage += 1;
      renderOrders();
    });
    ordersLastPageBtn?.addEventListener("click", () => {
      orderTableState.currentPage = Number.MAX_SAFE_INTEGER;
      renderOrders();
    });
    paymentProofForm.addEventListener("submit", submitPaymentProof);
    plansGrid.addEventListener("click", event => {
      const button = event.target instanceof Element ? event.target.closest("[data-select-plan]") : null;
      if (!button) {
        return;
      }
      selectPlan(button.getAttribute("data-select-plan"));
    });
    ordersTableBody.addEventListener("click", event => {
      const detailButton = event.target instanceof Element ? event.target.closest("[data-order-detail]") : null;
      if (detailButton) {
        openOrderDetailModal(detailButton.getAttribute("data-order-detail"));
        return;
      }
      const button = event.target instanceof Element ? event.target.closest("[data-upload-proof-order]") : null;
      if (button) {
        openPaymentProofModal(button.getAttribute("data-upload-proof-order"));
        return;
      }
      const cancelButton = event.target instanceof Element ? event.target.closest("[data-cancel-order]") : null;
      if (cancelButton) {
        cancelOrder(cancelButton.getAttribute("data-cancel-order"));
      }
    });
    orderDetailBody?.addEventListener("click", event => {
      const uploadButton = event.target instanceof Element ? event.target.closest("[data-upload-proof-order]") : null;
      if (uploadButton) {
        closeModal(orderDetailModalBackdrop);
        openPaymentProofModal(uploadButton.getAttribute("data-upload-proof-order"));
        return;
      }
      const downloadButton = event.target instanceof Element ? event.target.closest("[data-download-order-proof]") : null;
      if (downloadButton) {
        downloadOrderProof(downloadButton.getAttribute("data-download-order-proof"));
      }
    });
    orderProofPreview?.addEventListener("click", event => {
      const downloadButton = event.target instanceof Element ? event.target.closest("[data-download-order-proof]") : null;
      if (downloadButton) {
        downloadOrderProof(downloadButton.getAttribute("data-download-order-proof"));
      }
    });
    openFundEstimateModalBtn.addEventListener("click", () => {
      syncFundEstimateInputs();
      renderFundEstimate();
      openModal(fundEstimateModalBackdrop);
    });
    openAllJobsModalBtn.addEventListener("click", () => {
      renderAllJobsTable();
      openModal(allJobsModalBackdrop);
    });
    openJobsReportDownloadBtn.addEventListener("click", () => {
      setStatus(jobsReportDownloadStatus, "");
      syncReportDownloadInputs();
      openModal(jobsReportDownloadModalBackdrop);
    });
    openJobsFilterBtn.addEventListener("click", () => {
      syncJobsFilterInputs();
      openModal(jobsFilterModalBackdrop);
    });
    refreshAllJobsBtn.addEventListener("click", loadDashboardData);
    resetJobsFilterBtn.addEventListener("click", resetJobsFilters);
    resetJobsFilterModalBtn.addEventListener("click", resetJobsFilters);
    applyJobsFilterBtn.addEventListener("click", () => {
      readJobsFilterInputs();
      renderAllJobsTable();
      closeModal(jobsFilterModalBackdrop);
    });
    document.querySelectorAll('input[name="jobsDateMode"]').forEach(input => {
      input.addEventListener("change", () => {
        syncDateModeInputs(getSelectedDateMode("jobsDateMode", "day"), jobsDateDayInput, jobsDateStartInput, jobsDateEndInput);
      });
    });
    document.querySelectorAll('input[name="fundEstimateMode"]').forEach(input => {
      input.addEventListener("change", () => {
        readFundEstimateInputs();
        syncFundEstimateInputs();
        renderFundEstimate();
      });
    });
    document.querySelectorAll('input[name="jobsReportDownloadMode"]').forEach(input => {
      input.addEventListener("change", () => {
        readReportDownloadInputs();
        syncReportDownloadInputs();
      });
    });
    [fundEstimateDayInput, fundEstimateStartInput, fundEstimateEndInput].forEach(input => {
      input.addEventListener("input", () => {
        readFundEstimateInputs();
        renderFundEstimate();
      });
    });
    [jobsReportDownloadDayInput, jobsReportDownloadStartInput, jobsReportDownloadEndInput].forEach(input => {
      input.addEventListener("input", readReportDownloadInputs);
    });
    document.querySelectorAll("[data-report-format]").forEach(button => {
      button.addEventListener("click", () => downloadJobsReport(button.getAttribute("data-report-format")));
    });
    jobsSearchInput.addEventListener("input", () => {
      jobTableState.search = jobsSearchInput.value;
      jobTableState.currentPage = 1;
      renderAllJobsTable();
    });
    jobsPageSizeSelect.addEventListener("change", () => {
      jobTableState.pageSize = jobsPageSizeSelect.value === "all" ? "all" : Number(jobsPageSizeSelect.value || 20);
      jobTableState.currentPage = 1;
      renderAllJobsTable();
    });
    jobsFirstPageBtn.addEventListener("click", () => {
      jobTableState.currentPage = 1;
      renderAllJobsTable();
    });
    jobsPrevPageBtn.addEventListener("click", () => {
      jobTableState.currentPage -= 1;
      renderAllJobsTable();
    });
    jobsNextPageBtn.addEventListener("click", () => {
      jobTableState.currentPage += 1;
      renderAllJobsTable();
    });
    jobsLastPageBtn.addEventListener("click", () => {
      jobTableState.currentPage = Number.MAX_SAFE_INTEGER;
      renderAllJobsTable();
    });
    document.querySelectorAll("[data-job-sort]").forEach(button => {
      button.addEventListener("click", () => {
        const key = button.getAttribute("data-job-sort") || "createdAt";
        if (jobTableState.sortKey === key) {
          jobTableState.sortDirection = jobTableState.sortDirection === "asc" ? "desc" : "asc";
        } else {
          jobTableState.sortKey = key;
          jobTableState.sortDirection = key === "createdAt" || key === "price" ? "desc" : "asc";
        }
        jobTableState.currentPage = 1;
        renderAllJobsTable();
      });
    });
    connectClientBtn.addEventListener("click", showConnectClientInfo);
    downloadClientBtn.addEventListener("click", showDownloadInfo);
    otherInstallersBtn?.addEventListener("click", showOtherInstallers);
    downloadClientOtherVersionsBtn?.addEventListener("click", showOtherInstallers);
    downloadClientPrimaryLink?.addEventListener("click", event => {
      if (!installerCatalog.current?.downloadUrl) {
        event.preventDefault();
        setStatus(downloadClientStatus, "Installer belum tersedia.", "error");
      }
    });

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

  initializeDateStates();
  bindModalHandlers();
  bindActionHandlers();
  loadTurnstileConfig();
  window.PortalAuth.startSessionWatcher({
    idleTimeoutMs: 2 * 60 * 60 * 1000,
    loginPath: "/portal/",
    scope: "mitra"
  });
  renderAuthState();
  setInterval(() => {
    updateOperationalUi({ autoCloseOutsideHours: true });
  }, 60000);
})();

function waitForTurnstileApi() {
  if (window.turnstile?.render) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const timer = setInterval(() => {
      if (window.turnstile?.render) {
        clearInterval(timer);
        resolve();
        return;
      }

      if (Date.now() - startedAt > 8000) {
        clearInterval(timer);
        reject(new Error("Widget verifikasi gagal dimuat. Periksa koneksi internet Anda."));
      }
    }, 100);
  });
}

async function loadTurnstileConfig() {
  try {
    const body = await window.PortalAuth.apiJson("/api/auth/turnstile-config", {
      method: "GET"
    }, { retry: false });

    turnstileState.enabled = Boolean(body.enabled && body.siteKey);
    turnstileState.siteKey = body.siteKey || "";

    [registerTurnstile, forgotPasswordTurnstile].forEach(slot => {
      if (!slot) return;
      slot.classList.toggle("is-hidden", !turnstileState.enabled);
    });

    if (turnstileState.enabled) {
      await waitForTurnstileApi();
      turnstileState.scriptReady = true;
      renderTurnstileWidget("register");
      renderTurnstileWidget("forgotPassword");
    }
  } catch (err) {
    turnstileState.enabled = false;
    [registerTurnstile, forgotPasswordTurnstile].forEach(slot => {
      if (!slot) return;
      slot.classList.add("is-hidden");
    });
    console.warn("Turnstile config load failed:", err?.message || err);
  }
}

function getTurnstileContainer(name) {
  if (name === "register") return registerTurnstile;
  if (name === "forgotPassword") return forgotPasswordTurnstile;
  return null;
}

function renderTurnstileWidget(name) {
  if (!turnstileState.enabled || !turnstileState.siteKey || !window.turnstile?.render) {
    return;
  }

  const container = getTurnstileContainer(name);
  if (!container || turnstileState.widgets[name]) {
    return;
  }

  turnstileState.widgets[name] = window.turnstile.render(container, {
    sitekey: turnstileState.siteKey,
    theme: "light",
    action: name === "register" ? "register" : "forgot_password",
    callback: token => {
      turnstileState.tokens[name] = token || "";
    },
    "expired-callback": () => {
      turnstileState.tokens[name] = "";
    },
    "error-callback": () => {
      turnstileState.tokens[name] = "";
    }
  });
}

function resetTurnstileWidget(name) {
  turnstileState.tokens[name] = "";

  const widgetId = turnstileState.widgets[name];
  if (turnstileState.enabled && widgetId && window.turnstile?.reset) {
    window.turnstile.reset(widgetId);
  }
}

function getTurnstileTokenOrFocus(name, statusEl) {
  if (!turnstileState.enabled) {
    return "";
  }

  renderTurnstileWidget(name);

  const token = turnstileState.tokens[name];
  if (!token) {
    setStatus(statusEl, "Selesaikan verifikasi keamanan terlebih dahulu.", "error");

    const container = getTurnstileContainer(name);
    container?.scrollIntoView({ behavior: "smooth", block: "center" });

    return null;
  }

  return token;
}
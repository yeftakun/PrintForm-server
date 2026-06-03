(() => {
  const adminWelcomeText = document.getElementById("adminWelcomeText");
  const adminUserChip = document.getElementById("adminUserChip");
  const adminUserMenuBtn = document.getElementById("adminUserMenuBtn");
  const adminUserMenu = document.getElementById("adminUserMenu");
  const openAdminProfileBtn = document.getElementById("openAdminProfileBtn");
  const adminLogoutBtn = document.getElementById("adminLogoutBtn");
  const adminStatus = document.getElementById("adminStatus");
  const adminNavLinks = Array.from(document.querySelectorAll("[data-admin-target]"));
  const adminPanels = Array.from(document.querySelectorAll("[data-admin-panel]"));
  const adminStatsGrid = document.getElementById("adminStatsGrid");
  const adminActionQueue = document.getElementById("adminActionQueue");
  const adminSignalsList = document.getElementById("adminSignalsList");
  const adminOverviewSync = document.getElementById("adminOverviewSync");
  const refreshOverviewBtn = document.getElementById("refreshOverviewBtn");

  const adminPaymentsTable = document.getElementById("adminPaymentsTable");
  const refreshAdminPaymentsBtn = document.getElementById("refreshAdminPaymentsBtn");
  const openAdminPaymentFilterBtn = document.getElementById("openAdminPaymentFilterBtn");
  const resetAdminPaymentFilterBtn = document.getElementById("resetAdminPaymentFilterBtn");
  const adminPaymentSearchInput = document.getElementById("adminPaymentSearchInput");
  const adminPaymentFilterSummary = document.getElementById("adminPaymentFilterSummary");
  const adminPaymentReviewModalBackdrop = document.getElementById("adminPaymentReviewModalBackdrop");
  const adminPaymentReviewDetail = document.getElementById("adminPaymentReviewDetail");
  const adminProofName = document.getElementById("adminProofName");
  const adminProofDownloadLink = document.getElementById("adminProofDownloadLink");
  const adminProofPreview = document.getElementById("adminProofPreview");
  const adminRejectReasonInput = document.getElementById("adminRejectReasonInput");
  const adminRejectPaymentBtn = document.getElementById("adminRejectPaymentBtn");
  const adminApprovePaymentBtn = document.getElementById("adminApprovePaymentBtn");
  const adminPaymentReviewStatus = document.getElementById("adminPaymentReviewStatus");
  const adminPaymentFilterModalBackdrop = document.getElementById("adminPaymentFilterModalBackdrop");
  const resetAdminPaymentFilterModalBtn = document.getElementById("resetAdminPaymentFilterModalBtn");
  const applyAdminPaymentFilterBtn = document.getElementById("applyAdminPaymentFilterBtn");
  const adminPaymentDateDayInput = document.getElementById("adminPaymentDateDayInput");
  const adminPaymentDateStartInput = document.getElementById("adminPaymentDateStartInput");
  const adminPaymentDateEndInput = document.getElementById("adminPaymentDateEndInput");

  const adminBillingTabButtons = Array.from(document.querySelectorAll("[data-admin-billing-tab]"));
  const adminBillingPanels = Array.from(document.querySelectorAll("[data-admin-billing-panel]"));
  const refreshAdminBillingBtn = document.getElementById("refreshAdminBillingBtn");
  const adminPlansTable = document.getElementById("adminPlansTable");
  const adminCouponsTable = document.getElementById("adminCouponsTable");
  const openPlanModalBtn = document.getElementById("openPlanModalBtn");
  const openCouponModalBtn = document.getElementById("openCouponModalBtn");
  const adminPlanModalBackdrop = document.getElementById("adminPlanModalBackdrop");
  const adminCouponModalBackdrop = document.getElementById("adminCouponModalBackdrop");
  const adminPlanForm = document.getElementById("adminPlanForm");
  const adminCouponForm = document.getElementById("adminCouponForm");
  const adminCouponPlanSelect = document.getElementById("adminCouponPlanSelect");
  const adminPlanStatus = document.getElementById("adminPlanStatus");
  const adminCouponStatus = document.getElementById("adminCouponStatus");

  const adminStoresTable = document.getElementById("adminStoresTable");
  const adminStoreSearchInput = document.getElementById("adminStoreSearchInput");
  const adminStoreFilterSummary = document.getElementById("adminStoreFilterSummary");
  const openStoreFilterBtn = document.getElementById("openStoreFilterBtn");
  const resetStoreFilterBtn = document.getElementById("resetStoreFilterBtn");
  const refreshStoresBtn = document.getElementById("refreshStoresBtn");
  const adminStoreFilterModalBackdrop = document.getElementById("adminStoreFilterModalBackdrop");
  const resetStoreFilterModalBtn = document.getElementById("resetStoreFilterModalBtn");
  const applyStoreFilterBtn = document.getElementById("applyStoreFilterBtn");
  const adminStoreDetailModalBackdrop = document.getElementById("adminStoreDetailModalBackdrop");
  const adminStoreDetailTitle = document.getElementById("adminStoreDetailTitle");
  const adminStoreDetailBody = document.getElementById("adminStoreDetailBody");
  const adminToggleStoreSuspendBtn = document.getElementById("adminToggleStoreSuspendBtn");

  const adminJobsTable = document.getElementById("adminJobsTable");
  const adminJobSearchInput = document.getElementById("adminJobSearchInput");
  const adminJobFilterSummary = document.getElementById("adminJobFilterSummary");
  const openJobFilterBtn = document.getElementById("openJobFilterBtn");
  const resetJobFilterBtn = document.getElementById("resetJobFilterBtn");
  const refreshJobsBtn = document.getElementById("refreshJobsBtn");
  const adminJobFilterModalBackdrop = document.getElementById("adminJobFilterModalBackdrop");
  const resetJobFilterModalBtn = document.getElementById("resetJobFilterModalBtn");
  const applyJobFilterBtn = document.getElementById("applyJobFilterBtn");
  const adminJobDateDayInput = document.getElementById("adminJobDateDayInput");
  const adminJobDetailModalBackdrop = document.getElementById("adminJobDetailModalBackdrop");
  const adminJobDetailTitle = document.getElementById("adminJobDetailTitle");
  const adminJobDetailBody = document.getElementById("adminJobDetailBody");

  const adminAuditSearchInput = document.getElementById("adminAuditSearchInput");
  const adminAuditDateInput = document.getElementById("adminAuditDateInput");
  const refreshAuditBtn = document.getElementById("refreshAuditBtn");
  const adminAuditList = document.getElementById("adminAuditList");
  const adminAuditPageSizeSelect = document.getElementById("adminAuditPageSizeSelect");
  const adminAuditFirstPageBtn = document.getElementById("adminAuditFirstPageBtn");
  const adminAuditPrevPageBtn = document.getElementById("adminAuditPrevPageBtn");
  const adminAuditNextPageBtn = document.getElementById("adminAuditNextPageBtn");
  const adminAuditLastPageBtn = document.getElementById("adminAuditLastPageBtn");
  const adminAuditPageText = document.getElementById("adminAuditPageText");
  const adminProfileModalBackdrop = document.getElementById("adminProfileModalBackdrop");
  const adminProfileForm = document.getElementById("adminProfileForm");
  const adminPasswordForm = document.getElementById("adminPasswordForm");
  const adminProfileStatus = document.getElementById("adminProfileStatus");
  const adminPasswordStatus = document.getElementById("adminPasswordStatus");

  let adminCurrentUser = null;
  let adminPaymentOrders = [];
  let adminOverviewSummary = null;
  let adminOverviewLoading = false;
  let adminOverviewError = "";
  let adminStoresLoaded = false;
  let adminStoresLoading = false;
  let adminStoresError = "";
  let adminBillingLoaded = false;
  let adminBillingLoading = false;
  let adminBillingError = "";
  let adminJobsLoaded = false;
  let adminJobsLoading = false;
  let adminJobsError = "";
  let adminAuditRows = [];
  let adminAuditLoading = false;
  let adminAuditError = "";
  let adminAuditTotal = 0;
  let adminAuditTotalPages = 1;
  let activeReviewOrderId = null;
  let activeProofObjectUrl = "";
  let activeStoreId = null;
  const paymentFilterState = {
    search: "",
    statusFilters: new Set(),
    proofFilters: new Set(),
    dateMode: "all",
    date: "",
    startDate: "",
    endDate: ""
  };
  const storeFilterState = {
    search: "",
    suspend: "all",
    signals: new Set()
  };
  const jobFilterState = {
    search: "",
    statusFilters: new Set(),
    dateMode: "all",
    date: ""
  };
  const auditFilterState = {
    search: "",
    date: "",
    page: 1,
    perPage: "20"
  };

  let plans = [];
  let coupons = [];

  let stores = [
    {
      id: "store_printaja",
      name: "Print Aja",
      username: "printaja",
      email: "owner@printaja.test",
      code: "PRTAJA",
      role: "mitra",
      createdAt: "2026-05-18T04:10:00Z",
      address: "Jl. Pendidikan No. 12",
      operatingHours: "08:00 - 21:00",
      status: "Aktif",
      is_suspend: false,
      credit: 2430,
      lastOrder: "Pro · hari ini",
      clients: [
        { name: "Kasir Depan", status: "online", lastSeen: "2 menit lalu", printer: "Canon G1030" },
        { name: "Laptop Admin", status: "offline", lastSeen: "Kemarin", printer: "Epson L3210" }
      ],
      payments: ["ORD-2405-1081 · Menunggu verifikasi", "ORD-2405-1062 · Paid"],
      recentJobs: ["JOB-8F21 · done", "JOB-8F10 · sent"]
    },
    {
      id: "store_kopiprint",
      name: "Kopi Print",
      username: "yefta",
      email: "yefta@example.test",
      code: "KOPI01",
      role: "mitra",
      createdAt: "2026-05-20T05:30:00Z",
      address: "Jl. Veteran No. 8",
      operatingHours: "09:00 - 20:00",
      status: "Aktif",
      is_suspend: false,
      credit: 875,
      lastOrder: "Starter · 28 Mei",
      clients: [
        { name: "Desktop Toko", status: "online", lastSeen: "baru saja", printer: "HP LaserJet" }
      ],
      payments: ["ORD-2405-1078 · Menunggu verifikasi"],
      recentJobs: ["JOB-8F0C · pending", "JOB-8EFD · done"]
    },
    {
      id: "store_snapdoc",
      name: "Snapdoc",
      username: "snapdoc",
      email: "admin@snapdoc.test",
      code: "SNAP12",
      role: "mitra",
      createdAt: "2026-05-22T03:25:00Z",
      address: "Jl. Kampus Baru",
      operatingHours: "08:30 - 18:00",
      status: "Perlu kredit",
      is_suspend: true,
      credit: 0,
      lastOrder: "Pending",
      clients: [
        { name: "PC Operator", status: "offline", lastSeen: "3 jam lalu", printer: "-" }
      ],
      payments: ["ORD-2405-1073 · Menunggu bayar"],
      recentJobs: ["JOB-8EFE · canceled"]
    },
    {
      id: "store_kampuscopy",
      name: "Kampus Copy",
      username: "kampuscopy",
      email: "kasir@kampuscopy.test",
      code: "KAMPUS",
      role: "mitra",
      createdAt: "2026-05-12T11:15:00Z",
      address: "Area Fakultas Teknik",
      operatingHours: "07:00 - 22:00",
      status: "Aktif",
      is_suspend: false,
      credit: 4180,
      lastOrder: "Top up · 27 Mei",
      clients: [
        { name: "Kasir 1", status: "online", lastSeen: "1 menit lalu", printer: "Brother DCP" },
        { name: "Kasir 2", status: "online", lastSeen: "4 menit lalu", printer: "Canon G2010" },
        { name: "Backoffice", status: "online", lastSeen: "8 menit lalu", printer: "Epson L565" }
      ],
      payments: ["ORD-2405-1067 · Paid"],
      recentJobs: ["JOB-8F17 · sent", "JOB-8EFF · done"]
    }
  ];

  let jobs = [
    {
      id: "JOB-8F21",
      storeId: "store_printaja",
      store: "Print Aja",
      session: "SES-54A2",
      file: "skripsi.pdf",
      mimeType: "application/pdf",
      size: "2.4 MB",
      price: 7000,
      status: "done",
      time: "09:42",
      createdAt: "2026-06-02T09:31:00+08:00",
      updatedAt: "2026-06-02T09:42:00+08:00",
      targetClient: "Kasir Depan",
      printConfig: "A4, BW, 35 halaman",
      creditUsage: 70,
      timeline: ["created 09:31", "sent 09:33", "claimed 09:34", "done 09:42"]
    },
    {
      id: "JOB-8F17",
      storeId: "store_kampuscopy",
      store: "Kampus Copy",
      session: "SES-549B",
      file: "materi-uts.pdf",
      mimeType: "application/pdf",
      size: "4.9 MB",
      price: 12000,
      status: "sent",
      time: "09:35",
      createdAt: "2026-06-02T09:28:00+08:00",
      updatedAt: "2026-06-02T09:35:00+08:00",
      targetClient: "Kasir 1",
      printConfig: "A4, Color, 20 halaman",
      creditUsage: 120,
      timeline: ["created 09:28", "sent 09:35"]
    },
    {
      id: "JOB-8F0C",
      storeId: "store_kopiprint",
      store: "Kopi Print",
      session: "SES-5481",
      file: "proposal.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      size: "880 KB",
      price: 4000,
      status: "pending",
      time: "09:11",
      createdAt: "2026-06-02T09:11:00+08:00",
      updatedAt: "2026-06-02T09:11:00+08:00",
      targetClient: "-",
      printConfig: "A4, BW, 12 halaman",
      creditUsage: 40,
      timeline: ["created 09:11"]
    },
    {
      id: "JOB-8EFE",
      storeId: "store_snapdoc",
      store: "Snapdoc",
      session: "SES-5403",
      file: "not-available",
      mimeType: "-",
      size: "-",
      price: 0,
      status: "canceled",
      time: "08:58",
      createdAt: "2026-06-02T08:46:00+08:00",
      updatedAt: "2026-06-02T08:58:00+08:00",
      targetClient: "-",
      printConfig: "-",
      creditUsage: 0,
      timeline: ["created 08:46", "session timeout 08:58", "canceled 08:58"]
    }
  ];

  const audits = [
    { time: "09:45", actor: "system", action: "job.status.updated", target: "JOB-8F21", detail: "done", group: "Job" },
    { time: "09:39", actor: "admin", action: "billing.order.reviewed", target: "ORD-2405-1081", detail: "menunggu verifikasi", group: "Payment" },
    { time: "09:14", actor: "printaja", action: "client.heartbeat", target: "Canon G1030", detail: "online", group: "Client" },
    { time: "08:59", actor: "system", action: "session.timeout", target: "SES-5403", detail: "job dibatalkan", group: "Job" },
    { time: "08:20", actor: "yefta", action: "auth.password_reset.requested", target: "user_yefta", detail: "email sent", group: "Auth" },
    { time: "07:50", actor: "system", action: "billing.coupon.applied", target: "LAUNCH10", detail: "10% discount", group: "Billing" }
  ];

  const fallbackPayments = [
    { id: "ORD-2405-1081", user: { username: "printaja", email: "owner@printaja.test", storeName: "Print Aja", kodeToko: "PRTAJA" }, plan: { name: "Pro" }, couponCode: "LAUNCH10", subtotalIdr: 20000, discountIdr: 2000, totalIdr: 18000, status: "waiting_verification", paymentProof: { originalName: "bukti-transfer.jpg" }, createdAt: "2026-06-02T09:18:00+08:00" },
    { id: "ORD-2405-1078", user: { username: "yefta", email: "yefta@example.test", storeName: "Kopi Print", kodeToko: "KOPI01" }, plan: { name: "Starter" }, couponCode: "", subtotalIdr: 13000, discountIdr: 0, totalIdr: 13000, status: "waiting_verification", paymentProof: { originalName: "transfer.pdf" }, createdAt: "2026-06-02T08:55:00+08:00" },
    { id: "ORD-2405-1073", user: { username: "snapdoc", email: "admin@snapdoc.test", storeName: "Snapdoc", kodeToko: "SNAP12" }, plan: { name: "Buy Credit" }, couponCode: "MITRA5K", subtotalIdr: 5000, discountIdr: 0, totalIdr: 5000, status: "pending_payment", paymentProof: null, createdAt: "2026-06-02T07:45:00+08:00" },
    { id: "ORD-2405-1067", user: { username: "kampuscopy", email: "kasir@kampuscopy.test", storeName: "Kampus Copy", kodeToko: "KAMPUS" }, plan: { name: "Pro" }, couponCode: "", subtotalIdr: 20000, discountIdr: 0, totalIdr: 20000, status: "paid", paymentProof: { originalName: "paid.png" }, createdAt: "2026-06-01T16:20:00+08:00" }
  ];

  function setStatus(text, kind = "") {
    adminStatus.textContent = text || "";
    adminStatus.className = kind ? `status admin-status ${kind}` : "status admin-status";
  }

  function setInlineStatus(el, text, kind = "") {
    if (!el) return;
    el.textContent = text || "";
    el.className = kind ? `status ${kind}` : "status";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function openModal(backdrop) {
    backdrop?.classList.add("open");
    backdrop?.setAttribute("aria-hidden", "false");
  }

  function closeModal(backdrop) {
    if (backdrop === adminPaymentReviewModalBackdrop) {
      clearActiveProofObjectUrl();
    }
    backdrop?.classList.remove("open");
    backdrop?.setAttribute("aria-hidden", "true");
  }

  function clearActiveProofObjectUrl() {
    if (activeProofObjectUrl) {
      URL.revokeObjectURL(activeProofObjectUrl);
      activeProofObjectUrl = "";
    }
    adminProofDownloadLink?.removeAttribute("download");
  }

  function setCurrentAdminUser(user) {
    adminCurrentUser = user || null;
    const username = adminCurrentUser?.username || "-";
    adminWelcomeText.textContent = `Login admin ${username}`;
    adminUserChip.textContent = adminCurrentUser?.username ? `@${adminCurrentUser.username}` : "Admin";
  }

  function closeAdminUserMenu() {
    if (!adminUserMenu || !adminUserMenuBtn) return;
    adminUserMenu.hidden = true;
    adminUserMenuBtn.setAttribute("aria-expanded", "false");
  }

  function toggleAdminUserMenu(forceOpen = null) {
    if (!adminUserMenu || !adminUserMenuBtn) return;
    const shouldOpen = forceOpen === null ? adminUserMenu.hidden : Boolean(forceOpen);
    adminUserMenu.hidden = !shouldOpen;
    adminUserMenuBtn.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
  }

  function openAdminProfileModal() {
    closeAdminUserMenu();
    setInlineStatus(adminProfileStatus, "");
    setInlineStatus(adminPasswordStatus, "");
    if (adminProfileForm) {
      adminProfileForm.elements.namedItem("username").value = adminCurrentUser?.username || "";
      adminProfileForm.elements.namedItem("email").value = adminCurrentUser?.email || "";
    }
    adminPasswordForm?.reset();
    openModal(adminProfileModalBackdrop);
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(Number(value || 0));
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("id-ID").format(Number(value || 0));
  }

  function formatDateTime(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  function todayInputValue() {
    const date = new Date();
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
  }

  function dateInputValue(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
  }

  function planTypeLabel(type) {
    const labels = {
      free: "Free",
      subscription: "Subscription",
      credit_pack: "Credit Pack"
    };
    return labels[String(type || "").toLowerCase()] || type || "-";
  }

  function discountTypeLabel(type) {
    const labels = {
      percent: "Persen",
      fixed_amount: "Nominal",
      free: "Gratis"
    };
    return labels[String(type || "").toLowerCase()] || type || "-";
  }

  function discountValueLabel(coupon) {
    if (coupon.discountType === "free") return "Gratis";
    if (coupon.discountType === "percent") {
      const max = coupon.maxDiscountIdr ? ` maks ${formatCurrency(coupon.maxDiscountIdr)}` : "";
      return `${formatNumber(coupon.discountValue)}%${max}`;
    }
    return formatCurrency(coupon.discountValue);
  }

  function nullableNumberFormValue(value) {
    return value === null || value === undefined ? "" : String(value);
  }

  function getPlanName(planId) {
    const plan = plans.find(item => item.id === planId);
    return plan ? `${plan.name} (${plan.code})` : "Semua plan";
  }

  function getSelectedRadio(name, fallback) {
    return document.querySelector(`input[name="${name}"]:checked`)?.value || fallback;
  }

  function setSelectedRadio(name, value) {
    document.querySelectorAll(`input[name="${name}"]`).forEach(input => {
      input.checked = input.value === value;
    });
  }

  function statusClass(status) {
    const normalized = String(status || "").toLowerCase();
    if (["paid", "done", "sent", "aktif", "normal", "active", "online", "ready"].includes(normalized)) return "online";
    if (["waiting_verification", "pending", "dipantau", "pending_payment", "printing", "claimed", "client belum siap"].includes(normalized)) return "warning";
    if (["canceled", "cancelled", "rejected", "perlu kredit", "perlu cek", "perlu tindak", "suspended", "offline"].includes(normalized)) return "offline";
    return "";
  }

  function statusLabel(status) {
    const labels = {
      waiting_verification: "Menunggu verifikasi",
      pending_payment: "Menunggu bayar",
      pending: "Menunggu",
      paid: "Paid",
      ready: "Ready",
      printing: "Printing",
      claimed: "Claimed",
      done: "Selesai",
      sent: "Terkirim",
      canceled: "Batal",
      cancelled: "Dibatalkan",
      rejected: "Ditolak"
    };
    return labels[String(status || "").toLowerCase()] || status || "-";
  }

  function getPaymentSource() {
    return adminPaymentOrders.length ? adminPaymentOrders : fallbackPayments;
  }

  function activatePanel(panelId) {
    const targetId = panelId || "adminOverview";
    adminPanels.forEach(panel => {
      panel.classList.toggle("hidden", panel.id !== targetId);
    });
    adminNavLinks.forEach(link => {
      link.classList.toggle("active", link.dataset.adminTarget === targetId);
    });
  }

  function activateBillingTab(tab) {
    adminBillingTabButtons.forEach(button => {
      button.classList.toggle("active", button.dataset.adminBillingTab === tab);
    });
    adminBillingPanels.forEach(panel => {
      panel.classList.toggle("hidden", panel.dataset.adminBillingPanel !== tab);
    });
  }

  function setOverviewSyncText(text, kind = "") {
    if (!adminOverviewSync) return;
    adminOverviewSync.textContent = text || "";
    adminOverviewSync.className = kind ? `admin-sync-text ${kind}` : "admin-sync-text";
  }

  function renderStats() {
    if (adminOverviewLoading && !adminOverviewSummary) {
      adminStatsGrid.innerHTML = '<div class="admin-empty">Memuat ringkasan operasional...</div>';
      return;
    }

    const stats = adminOverviewSummary?.stats;
    const statItems = stats ? [
      {
        label: "Verifikasi",
        value: formatNumber(stats.payments?.waitingVerification),
        tone: Number(stats.payments?.waitingVerification || 0) ? "warning" : "success",
        caption: "Pembayaran menunggu review"
      },
      {
        label: "Paid Bulan Ini",
        value: formatCurrency(stats.payments?.paidThisMonth),
        tone: "accent",
        caption: "Total order paid bulan berjalan"
      },
      {
        label: "Toko Ready",
        value: `${formatNumber(stats.stores?.ready)}/${formatNumber(stats.stores?.total)}`,
        tone: Number(stats.stores?.ready || 0) ? "success" : "warning",
        caption: "Kios siap menerima job"
      },
      {
        label: "Client Online",
        value: `${formatNumber(stats.clients?.online)}/${formatNumber(stats.clients?.total)}`,
        tone: Number(stats.clients?.online || 0) ? "info" : "warning",
        caption: "Client terhubung"
      },
      {
        label: "Job Hari Ini",
        value: formatNumber(stats.jobs?.today),
        tone: "neutral",
        caption: `${formatNumber(stats.jobs?.active)} job masih aktif`
      },
      {
        label: "Perlu Tindak",
        value: formatNumber(stats.actionCount),
        tone: Number(stats.actionCount || 0) ? "warning" : "success",
        caption: "Pembayaran dan toko offline"
      }
    ] : (() => {
      const paymentSource = getPaymentSource();
      const waitingPayments = paymentSource.filter(order => order.status === "waiting_verification").length;
      const paidThisMonth = paymentSource
        .filter(order => order.status === "paid")
        .reduce((sum, order) => sum + Number(order.totalIdr || 0), 0);
      const suspendedStores = stores.filter(store => store.is_suspend).length;
      const onlineClients = stores.reduce((sum, store) => sum + store.clients.filter(client => client.status === "online").length, 0);
      return [
        { label: "Verifikasi", value: String(waitingPayments), tone: "warning", caption: "Pembayaran menunggu review" },
        { label: "Paid Bulan Ini", value: formatCurrency(paidThisMonth), tone: "accent", caption: "Total order paid" },
        { label: "Toko Aktif", value: String(stores.length - suspendedStores), tone: "success", caption: "Tidak suspended" },
        { label: "Suspended", value: String(suspendedStores), tone: suspendedStores ? "warning" : "neutral", caption: "Toko dibatasi" },
        { label: "Client Online", value: String(onlineClients), tone: "info", caption: "Siap menerima job" },
        { label: "Job Hari Ini", value: String(jobs.length), tone: "neutral", caption: "Aktivitas lintas toko" }
      ];
    })();

    adminStatsGrid.innerHTML = statItems.map(item => `
      <article class="admin-stat-card ${escapeHtml(item.tone)}">
        <span>${escapeHtml(item.label)}</span>
        <strong>${escapeHtml(item.value)}</strong>
        <small>${escapeHtml(item.caption)}</small>
      </article>
    `).join("");
  }

  function renderActionQueue() {
    if (adminOverviewLoading && !adminOverviewSummary) {
      adminActionQueue.innerHTML = '<div class="admin-empty">Memuat antrean tindakan...</div>';
      return;
    }

    const queue = adminOverviewSummary ? (Array.isArray(adminOverviewSummary.actionQueue) ? adminOverviewSummary.actionQueue : []) : [
      ...getPaymentSource()
        .filter(order => order.status === "waiting_verification")
        .slice(0, 3)
        .map(order => ({
          title: order.user?.storeName || order.user?.username || order.id,
          detail: `${order.id} · ${order.plan?.name || "-"} · ${formatCurrency(order.totalIdr)}`,
          value: "Review",
          target: "adminPayments"
        })),
      ...stores
        .filter(store => store.is_suspend || Number(store.credit || 0) <= 0)
        .slice(0, 3)
        .map(store => ({
          title: store.name,
          detail: store.is_suspend ? "Toko suspended" : "Kredit habis",
          value: store.is_suspend ? "Suspended" : "Kredit",
          target: "adminStores"
        }))
    ];

    adminActionQueue.innerHTML = queue.length ? queue.map(item => `
      <button class="admin-queue-item admin-queue-button" type="button" data-admin-jump="${escapeHtml(item.target || "adminOverview")}">
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(item.detail)}</span>
        </div>
        <b>${escapeHtml(item.value)}</b>
      </button>
    `).join("") : '<div class="admin-empty">Tidak ada antrean tindakan.</div>';
  }

  function renderSignals() {
    if (adminOverviewLoading && !adminOverviewSummary) {
      adminSignalsList.innerHTML = '<div class="admin-empty">Memuat sinyal operasional...</div>';
      return;
    }

    const fallbackSignals = (() => {
      const offlineClients = stores.reduce((sum, store) => sum + store.clients.filter(client => client.status !== "online").length, 0);
      const pendingLong = getPaymentSource().filter(order => order.status === "pending_payment").length;
      return [
        { title: "Mode SMTP", value: "Sesuai konfigurasi .env", status: "Dipantau" },
        { title: "Client offline", value: `${offlineClients} client`, status: offlineClients ? "Perlu cek" : "Normal" },
        { title: "Order pending", value: `${pendingLong} order`, status: pendingLong ? "Perlu tindak" : "Normal" },
        { title: "Storage file job", value: "Pantau cleanup scheduler", status: "Normal" }
      ];
    })();
    const signals = adminOverviewSummary
      ? (Array.isArray(adminOverviewSummary.signals) ? adminOverviewSummary.signals : [])
      : adminOverviewError
        ? [{ title: "Ringkasan", value: adminOverviewError, status: "Perlu cek" }, ...fallbackSignals]
        : fallbackSignals;

    adminSignalsList.innerHTML = signals.map(item => `
      <div class="admin-signal-item">
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(item.value)}</span>
        </div>
        <span class="status-pill ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
      </div>
    `).join("");
  }

  function syncPaymentDateInputs() {
    const mode = getSelectedRadio("adminPaymentDateMode", "all");
    if (adminPaymentDateDayInput) adminPaymentDateDayInput.disabled = mode !== "day";
    if (adminPaymentDateStartInput) adminPaymentDateStartInput.disabled = mode !== "range";
    if (adminPaymentDateEndInput) adminPaymentDateEndInput.disabled = mode !== "range";
  }

  function getOrderText(order) {
    return [
      order.id,
      order.user?.username,
      order.user?.email,
      order.user?.storeName,
      order.user?.kodeToko,
      order.plan?.name,
      order.couponCode
    ].filter(Boolean).join(" ").toLowerCase();
  }

  function getProofGroup(order) {
    return order.paymentProof ? "available" : "not-available";
  }

  function isOrderWithinDateFilter(order) {
    const mode = paymentFilterState.dateMode;
    if (mode === "all") return true;
    const dateValue = dateInputValue(order.createdAt);
    if (!dateValue) return false;
    if (mode === "day") {
      return dateValue === paymentFilterState.date;
    }
    const start = paymentFilterState.startDate || "0000-01-01";
    const end = paymentFilterState.endDate || "9999-12-31";
    return dateValue >= start && dateValue <= end;
  }

  function getFilteredPaymentOrders() {
    const search = String(paymentFilterState.search || "").trim().toLowerCase();
    return getPaymentSource()
      .filter(order => paymentFilterState.statusFilters.size === 0 || paymentFilterState.statusFilters.has(String(order.status || "").toLowerCase()))
      .filter(order => paymentFilterState.proofFilters.size === 0 || paymentFilterState.proofFilters.has(getProofGroup(order)))
      .filter(order => !search || getOrderText(order).includes(search))
      .filter(isOrderWithinDateFilter);
  }

  function updatePaymentFilterSummary(filteredCount = null) {
    const pieces = [];
    if (paymentFilterState.statusFilters.size) pieces.push(`${paymentFilterState.statusFilters.size} status`);
    if (paymentFilterState.proofFilters.size) pieces.push(`${paymentFilterState.proofFilters.size} bukti`);
    if (paymentFilterState.dateMode === "day") pieces.push(paymentFilterState.date || "hari ini");
    if (paymentFilterState.dateMode === "range") pieces.push("rentang tanggal");
    if (paymentFilterState.search) pieces.push("pencarian aktif");
    const countText = filteredCount === null ? "" : `${filteredCount} order`;
    adminPaymentFilterSummary.textContent = pieces.length
      ? `${countText}${countText ? " · " : ""}${pieces.join(" · ")}`
      : `${countText || "Semua order"}`;
  }

  function renderPayments() {
    const rows = getFilteredPaymentOrders();
    updatePaymentFilterSummary(rows.length);
    if (!rows.length) {
      adminPaymentsTable.innerHTML = '<tr><td colspan="8" class="muted-cell">Tidak ada order sesuai filter.</td></tr>';
      return;
    }
    adminPaymentsTable.innerHTML = rows.map(item => `
      <tr>
        <td><strong>${escapeHtml(item.id)}</strong><span>${escapeHtml(formatDateTime(item.createdAt))}</span></td>
        <td><strong>${escapeHtml(item.user?.storeName || item.user?.username || "-")}</strong><span>@${escapeHtml(item.user?.username || "-")} · ${escapeHtml(item.user?.kodeToko || "-")}</span></td>
        <td>${escapeHtml(item.plan?.name || "-")}</td>
        <td>${escapeHtml(item.couponCode || "-")}</td>
        <td>${escapeHtml(formatCurrency(item.totalIdr))}<span>Diskon ${escapeHtml(formatCurrency(item.discountIdr))}</span></td>
        <td><span class="status-pill ${statusClass(item.status)}">${escapeHtml(statusLabel(item.status))}</span></td>
        <td>${item.paymentProof ? escapeHtml(item.paymentProof.originalName || "Ada bukti") : "not-available"}</td>
        <td>
          <div class="admin-row-actions">
            <button class="btn btn-primary btn-compact" type="button" data-review-order-id="${escapeHtml(item.id)}">Review</button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  function syncPaymentFilterInputs() {
    document.querySelectorAll('input[name="adminPaymentStatusFilters"]').forEach(input => {
      input.checked = paymentFilterState.statusFilters.has(input.value);
    });
    document.querySelectorAll('input[name="adminPaymentProofFilters"]').forEach(input => {
      input.checked = paymentFilterState.proofFilters.has(input.value);
    });
    setSelectedRadio("adminPaymentDateMode", paymentFilterState.dateMode || "all");
    if (adminPaymentDateDayInput) adminPaymentDateDayInput.value = paymentFilterState.date || todayInputValue();
    if (adminPaymentDateStartInput) adminPaymentDateStartInput.value = paymentFilterState.startDate || "";
    if (adminPaymentDateEndInput) adminPaymentDateEndInput.value = paymentFilterState.endDate || "";
    syncPaymentDateInputs();
  }

  function readPaymentFilterInputs() {
    paymentFilterState.statusFilters = new Set(
      Array.from(document.querySelectorAll('input[name="adminPaymentStatusFilters"]:checked')).map(input => input.value)
    );
    paymentFilterState.proofFilters = new Set(
      Array.from(document.querySelectorAll('input[name="adminPaymentProofFilters"]:checked')).map(input => input.value)
    );
    paymentFilterState.dateMode = getSelectedRadio("adminPaymentDateMode", "all");
    paymentFilterState.date = adminPaymentDateDayInput?.value || todayInputValue();
    paymentFilterState.startDate = adminPaymentDateStartInput?.value || "";
    paymentFilterState.endDate = adminPaymentDateEndInput?.value || "";
  }

  function resetPaymentFilters() {
    paymentFilterState.search = "";
    paymentFilterState.statusFilters = new Set();
    paymentFilterState.proofFilters = new Set();
    paymentFilterState.dateMode = "all";
    paymentFilterState.date = todayInputValue();
    paymentFilterState.startDate = "";
    paymentFilterState.endDate = "";
    if (adminPaymentSearchInput) adminPaymentSearchInput.value = "";
    syncPaymentFilterInputs();
    renderPayments();
  }

  function refreshOverview() {
    renderStats();
    renderActionQueue();
    renderSignals();
  }

  async function loadOverviewSummary({ silent = false } = {}) {
    adminOverviewLoading = true;
    adminOverviewError = "";
    if (!silent) {
      setStatus("Memuat ringkasan admin...");
      setOverviewSyncText("Memuat data...");
    }
    refreshOverview();

    try {
      const body = await window.PortalAuth.apiJson("/api/admin/summary", { method: "GET" });
      adminOverviewSummary = body && typeof body === "object" ? body : null;
      adminOverviewError = "";
      const errorCount = Array.isArray(body?.errors) ? body.errors.length : 0;
      const syncText = body?.generatedAt ? `Sinkron ${formatDateTime(body.generatedAt)}` : "Sinkron";
      setOverviewSyncText(errorCount ? `${syncText} · ${errorCount} sumber gagal` : syncText, errorCount ? "warning" : "");
      if (!silent) setStatus("");
    } catch (err) {
      adminOverviewError = err.message || "Gagal memuat ringkasan.";
      setOverviewSyncText("Ringkasan gagal dimuat", "error");
      if (!silent) setStatus(adminOverviewError, "error");
    } finally {
      adminOverviewLoading = false;
      refreshOverview();
    }
  }

  async function loadAdminPayments({ silent = false } = {}) {
    if (!silent) setStatus("Memuat data pembayaran...");
    try {
      const body = await window.PortalAuth.apiJson("/api/billing/admin/orders", { method: "GET" });
      adminPaymentOrders = Array.isArray(body.orders) ? body.orders : [];
      renderPayments();
      refreshOverview();
      if (!silent) setStatus("");
    } catch (err) {
      if (!silent) setStatus(`${err.message || "Gagal memuat pembayaran."} Data contoh UI tetap ditampilkan.`, "error");
      adminPaymentOrders = [];
      renderPayments();
      refreshOverview();
    }
  }

  function setReviewStatus(text, kind = "") {
    adminPaymentReviewStatus.textContent = text || "";
    adminPaymentReviewStatus.className = kind ? `status ${kind}` : "status";
  }

  async function fetchProofBlob(url) {
    const response = await window.PortalAuth.apiFetch(url, { method: "GET" });
    if (!response.ok) {
      let message = `Gagal memuat bukti pembayaran (${response.status}).`;
      try {
        const body = await response.json();
        message = body?.error || message;
      } catch {
        const text = await response.text().catch(() => "");
        message = text || message;
      }
      throw new Error(message);
    }
    const blob = await response.blob();
    return {
      blob,
      objectUrl: URL.createObjectURL(blob)
    };
  }

  async function renderProofPreview(order) {
    const proof = order.paymentProof;
    clearActiveProofObjectUrl();
    adminProofName.textContent = proof?.originalName || "Belum ada bukti";
    if (!proof?.previewUrl) {
      adminProofDownloadLink.classList.add("hidden");
      adminProofDownloadLink.href = "#";
      adminProofPreview.innerHTML = '<div class="admin-proof-empty">Bukti pembayaran belum diupload.</div>';
      return;
    }

    adminProofDownloadLink.classList.add("hidden");
    adminProofDownloadLink.href = "#";
    adminProofPreview.innerHTML = '<div class="admin-proof-empty">Memuat bukti pembayaran...</div>';
    const renderOrderId = order.id;

    try {
      const { blob, objectUrl } = await fetchProofBlob(proof.previewUrl);
      if (activeReviewOrderId !== renderOrderId) {
        URL.revokeObjectURL(objectUrl);
        return;
      }

      activeProofObjectUrl = objectUrl;
      adminProofDownloadLink.classList.remove("hidden");
      adminProofDownloadLink.href = objectUrl;
      adminProofDownloadLink.download = proof.originalName || "payment-proof";
      adminProofDownloadLink.removeAttribute("target");

      const mime = String(proof.mimeType || blob.type || "").toLowerCase();
      if (mime.startsWith("image/")) {
        adminProofPreview.innerHTML = `<img src="${escapeHtml(objectUrl)}" alt="Preview bukti pembayaran">`;
        return;
      }
      if (mime === "application/pdf") {
        adminProofPreview.innerHTML = `<iframe src="${escapeHtml(objectUrl)}" title="Preview bukti pembayaran"></iframe>`;
        return;
      }
      adminProofPreview.innerHTML = '<div class="admin-proof-empty">Preview tidak tersedia untuk tipe file ini. Gunakan tombol download.</div>';
    } catch (err) {
      adminProofPreview.innerHTML = `<div class="admin-proof-empty">${escapeHtml(err.message || "Gagal memuat bukti pembayaran.")}</div>`;
    }
  }

  function renderPaymentReviewDetail(order) {
    adminPaymentReviewDetail.innerHTML = `
      <dl class="admin-review-list">
        <div><dt>Order ID</dt><dd>${escapeHtml(order.id)}</dd></div>
        <div><dt>Status</dt><dd><span class="status-pill ${statusClass(order.status)}">${escapeHtml(statusLabel(order.status))}</span></dd></div>
        <div><dt>Akun</dt><dd>${escapeHtml(order.user?.username || "-")} · ${escapeHtml(order.user?.email || "-")}</dd></div>
        <div><dt>Toko</dt><dd>${escapeHtml(order.user?.storeName || "-")} · ${escapeHtml(order.user?.kodeToko || "-")}</dd></div>
        <div><dt>Plan</dt><dd>${escapeHtml(order.plan?.name || "-")} × ${escapeHtml(order.quantity || 1)}</dd></div>
        <div><dt>Kupon</dt><dd>${escapeHtml(order.couponCode || "-")}</dd></div>
        <div><dt>Subtotal</dt><dd>${escapeHtml(formatCurrency(order.subtotalIdr))}</dd></div>
        <div><dt>Diskon</dt><dd>${escapeHtml(formatCurrency(order.discountIdr))}</dd></div>
        <div><dt>Total Bayar</dt><dd><strong>${escapeHtml(formatCurrency(order.totalIdr))}</strong></dd></div>
        <div><dt>Dibuat</dt><dd>${escapeHtml(formatDateTime(order.createdAt))}</dd></div>
        <div><dt>Bukti Masuk</dt><dd>${escapeHtml(formatDateTime(order.paymentProof?.submittedAt))}</dd></div>
        ${order.rejectedReason ? `<div><dt>Alasan Ditolak</dt><dd>${escapeHtml(order.rejectedReason)}</dd></div>` : ""}
      </dl>
    `;
    const canReview = order.status === "waiting_verification";
    adminApprovePaymentBtn.disabled = !canReview;
    adminRejectPaymentBtn.disabled = !canReview;
    adminRejectReasonInput.disabled = !canReview;
    adminRejectReasonInput.value = "";
  }

  async function openPaymentReview(orderId) {
    activeReviewOrderId = orderId;
    setReviewStatus("Memuat detail order...");
    openModal(adminPaymentReviewModalBackdrop);
    adminPaymentReviewDetail.innerHTML = "";
    adminProofPreview.innerHTML = "";
    const fallbackOrder = fallbackPayments.find(item => item.id === orderId);
    try {
      const body = await window.PortalAuth.apiJson(`/api/billing/admin/orders/${encodeURIComponent(orderId)}`, { method: "GET" });
      const order = body.order;
      renderPaymentReviewDetail(order);
      await renderProofPreview(order);
      setReviewStatus("");
    } catch (err) {
      if (fallbackOrder) {
        renderPaymentReviewDetail(fallbackOrder);
        await renderProofPreview(fallbackOrder);
        setReviewStatus("Detail contoh UI ditampilkan karena backend order belum tersedia.", "error");
        return;
      }
      setReviewStatus(err.message || "Gagal memuat detail order.", "error");
    }
  }

  async function submitPaymentReview(action) {
    if (!activeReviewOrderId) return;
    const isReject = action === "reject";
    setReviewStatus(isReject ? "Menolak pembayaran..." : "Menyetujui pembayaran...");
    adminApprovePaymentBtn.disabled = true;
    adminRejectPaymentBtn.disabled = true;
    try {
      await window.PortalAuth.apiJson(`/api/billing/admin/orders/${encodeURIComponent(activeReviewOrderId)}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isReject ? "reject" : "approve",
          rejectedReason: isReject ? String(adminRejectReasonInput.value || "").trim() : ""
        })
      });
      setReviewStatus(isReject ? "Pembayaran ditolak." : "Pembayaran disetujui dan kredit diaktifkan.", "success");
      await loadAdminPayments();
      await loadOverviewSummary({ silent: true });
      setTimeout(() => closeModal(adminPaymentReviewModalBackdrop), 500);
    } catch (err) {
      setReviewStatus(err.message || "Gagal menyimpan review.", "error");
      adminApprovePaymentBtn.disabled = false;
      adminRejectPaymentBtn.disabled = false;
    }
  }

  function renderPlans() {
    if (adminBillingLoading && !adminBillingLoaded) {
      adminPlansTable.innerHTML = '<tr><td colspan="7" class="muted-cell">Memuat data plan...</td></tr>';
      return;
    }
    if (adminBillingError) {
      adminPlansTable.innerHTML = `<tr><td colspan="7" class="muted-cell">${escapeHtml(adminBillingError)}</td></tr>`;
      return;
    }
    if (!plans.length) {
      adminPlansTable.innerHTML = '<tr><td colspan="7" class="muted-cell">Belum ada plan.</td></tr>';
      return;
    }
    adminPlansTable.innerHTML = plans.map(plan => `
      <tr>
        <td><strong>${escapeHtml(plan.name)}</strong><span>${escapeHtml(plan.code)} · ${escapeHtml(planTypeLabel(plan.planType))} · ${escapeHtml(plan.description || "-")}</span></td>
        <td>${escapeHtml(formatCurrency(plan.priceIdr))}</td>
        <td>${escapeHtml(formatNumber(plan.creditsPerUnit))} kredit</td>
        <td>${escapeHtml(formatNumber(plan.durationMonths))} bulan</td>
        <td><span class="status-pill ${plan.isActive ? "online" : "offline"}">${plan.isActive ? "Aktif" : "Nonaktif"}</span></td>
        <td>${escapeHtml(formatDateTime(plan.updatedAt))}</td>
        <td>
          <div class="admin-row-actions">
            <button class="btn btn-outline btn-compact" type="button" data-edit-plan-id="${escapeHtml(plan.id)}">Edit</button>
            <button class="btn btn-ghost btn-compact" type="button" data-toggle-plan-id="${escapeHtml(plan.id)}">${plan.isActive ? "Nonaktifkan" : "Aktifkan"}</button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  function renderCoupons() {
    if (adminBillingLoading && !adminBillingLoaded) {
      adminCouponsTable.innerHTML = '<tr><td colspan="7" class="muted-cell">Memuat data kupon...</td></tr>';
      return;
    }
    if (adminBillingError) {
      adminCouponsTable.innerHTML = `<tr><td colspan="7" class="muted-cell">${escapeHtml(adminBillingError)}</td></tr>`;
      return;
    }
    if (!coupons.length) {
      adminCouponsTable.innerHTML = '<tr><td colspan="7" class="muted-cell">Belum ada kupon.</td></tr>';
      return;
    }
    adminCouponsTable.innerHTML = coupons.map(coupon => `
      <tr>
        <td><strong>${escapeHtml(coupon.code)}</strong><span>${escapeHtml(coupon.name || getPlanName(coupon.appliesToPlanId))}</span></td>
        <td>${escapeHtml(discountValueLabel(coupon))}<span>${escapeHtml(discountTypeLabel(coupon.discountType))}</span></td>
        <td>${escapeHtml(formatCurrency(coupon.minOrderAmountIdr))}</td>
        <td>${escapeHtml(formatNumber(coupon.used))} / ${escapeHtml(coupon.usageLimit ? formatNumber(coupon.usageLimit) : "Tidak dibatasi")}</td>
        <td>${escapeHtml(dateInputValue(coupon.startsAt) || "-")} - ${escapeHtml(dateInputValue(coupon.expiresAt) || "-")}</td>
        <td><span class="status-pill ${coupon.isActive ? "online" : "offline"}">${coupon.isActive ? "Aktif" : "Nonaktif"}</span></td>
        <td>
          <div class="admin-row-actions">
            <button class="btn btn-outline btn-compact" type="button" data-edit-coupon-id="${escapeHtml(coupon.id)}">Edit</button>
            <button class="btn btn-ghost btn-compact" type="button" data-toggle-coupon-id="${escapeHtml(coupon.id)}">${coupon.isActive ? "Nonaktifkan" : "Aktifkan"}</button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  function renderBilling() {
    renderPlans();
    renderCoupons();
  }

  function syncCouponPlanOptions(selectedPlanId = "") {
    if (!adminCouponPlanSelect) return;
    adminCouponPlanSelect.innerHTML = [
      '<option value="">Semua plan</option>',
      ...plans.map(plan => `<option value="${escapeHtml(plan.id)}">${escapeHtml(plan.name)} (${escapeHtml(plan.code)})</option>`)
    ].join("");
    adminCouponPlanSelect.value = selectedPlanId || "";
  }

  function openPlanModal(planId = "") {
    const plan = plans.find(item => item.id === planId);
    adminPlanForm.reset();
    adminPlanForm.elements.namedItem("id").value = plan?.id || "";
    adminPlanForm.elements.namedItem("code").value = plan?.code || "";
    adminPlanForm.elements.namedItem("planType").value = plan?.planType || "credit_pack";
    adminPlanForm.elements.namedItem("name").value = plan?.name || "";
    adminPlanForm.elements.namedItem("description").value = plan?.description || "";
    adminPlanForm.elements.namedItem("price").value = plan?.priceIdr ?? "";
    adminPlanForm.elements.namedItem("credits").value = plan?.creditsPerUnit ?? "";
    adminPlanForm.elements.namedItem("durationMonths").value = plan?.durationMonths ?? 1;
    adminPlanForm.elements.namedItem("sortOrder").value = plan?.sortOrder ?? 0;
    adminPlanForm.elements.namedItem("active").checked = plan ? plan.isActive : true;
    document.getElementById("adminPlanModalTitle").textContent = plan ? "Edit Plan" : "Tambah Plan";
    setInlineStatus(adminPlanStatus, "");
    openModal(adminPlanModalBackdrop);
  }

  function openCouponModal(couponId = "") {
    const coupon = coupons.find(item => item.id === couponId);
    adminCouponForm.reset();
    syncCouponPlanOptions(coupon?.appliesToPlanId || "");
    adminCouponForm.elements.namedItem("id").value = coupon?.id || "";
    adminCouponForm.elements.namedItem("code").value = coupon?.code || "";
    adminCouponForm.elements.namedItem("name").value = coupon?.name || "";
    adminCouponForm.elements.namedItem("type").value = coupon?.discountType || "percent";
    adminCouponForm.elements.namedItem("value").value = coupon?.discountValue ?? "";
    adminCouponForm.elements.namedItem("maxDiscountIdr").value = nullableNumberFormValue(coupon?.maxDiscountIdr);
    adminCouponForm.elements.namedItem("minOrder").value = coupon?.minOrderAmountIdr ?? 0;
    adminCouponForm.elements.namedItem("usageLimit").value = nullableNumberFormValue(coupon?.usageLimit);
    adminCouponForm.elements.namedItem("usageLimitPerUser").value = nullableNumberFormValue(coupon?.usageLimitPerUser);
    adminCouponForm.elements.namedItem("appliesToPlanId").value = coupon?.appliesToPlanId || "";
    adminCouponForm.elements.namedItem("startsAt").value = dateInputValue(coupon?.startsAt) || todayInputValue();
    adminCouponForm.elements.namedItem("endsAt").value = dateInputValue(coupon?.expiresAt) || todayInputValue();
    adminCouponForm.elements.namedItem("active").checked = coupon ? coupon.isActive : true;
    document.getElementById("adminCouponModalTitle").textContent = coupon ? "Edit Kupon" : "Tambah Kupon";
    setInlineStatus(adminCouponStatus, "");
    openModal(adminCouponModalBackdrop);
  }

  async function loadAdminBilling({ silent = false } = {}) {
    adminBillingLoading = true;
    adminBillingError = "";
    if (!silent) setStatus("Memuat konfigurasi billing...");
    renderBilling();
    try {
      const [plansBody, couponsBody] = await Promise.all([
        window.PortalAuth.apiJson("/api/billing/admin/plans", { method: "GET" }),
        window.PortalAuth.apiJson("/api/billing/admin/coupons", { method: "GET" })
      ]);
      plans = Array.isArray(plansBody.plans) ? plansBody.plans : [];
      coupons = Array.isArray(couponsBody.coupons) ? couponsBody.coupons : [];
      adminBillingLoaded = true;
      adminBillingError = "";
      syncCouponPlanOptions();
      renderBilling();
      if (!silent) setStatus("");
    } catch (err) {
      plans = [];
      coupons = [];
      adminBillingLoaded = true;
      adminBillingError = err.message || "Gagal memuat konfigurasi billing.";
      renderBilling();
      if (!silent) setStatus(adminBillingError, "error");
    } finally {
      adminBillingLoading = false;
    }
  }

  function buildPlanPayload() {
    return {
      code: adminPlanForm.elements.namedItem("code").value.trim(),
      planType: adminPlanForm.elements.namedItem("planType").value,
      name: adminPlanForm.elements.namedItem("name").value.trim(),
      description: adminPlanForm.elements.namedItem("description").value.trim(),
      priceIdr: Number(adminPlanForm.elements.namedItem("price").value || 0),
      creditsPerUnit: Number(adminPlanForm.elements.namedItem("credits").value || 0),
      durationMonths: Number(adminPlanForm.elements.namedItem("durationMonths").value || 0),
      sortOrder: Number(adminPlanForm.elements.namedItem("sortOrder").value || 0),
      isActive: adminPlanForm.elements.namedItem("active").checked
    };
  }

  function buildCouponPayload() {
    const maxDiscountValue = adminCouponForm.elements.namedItem("maxDiscountIdr").value;
    const usageLimitValue = adminCouponForm.elements.namedItem("usageLimit").value;
    const usageLimitPerUserValue = adminCouponForm.elements.namedItem("usageLimitPerUser").value;
    return {
      code: adminCouponForm.elements.namedItem("code").value.trim().toUpperCase(),
      name: adminCouponForm.elements.namedItem("name").value.trim(),
      discountType: adminCouponForm.elements.namedItem("type").value,
      discountValue: Number(adminCouponForm.elements.namedItem("value").value || 0),
      maxDiscountIdr: String(maxDiscountValue || "").trim() ? Number(maxDiscountValue) : null,
      minOrderAmountIdr: Number(adminCouponForm.elements.namedItem("minOrder").value || 0),
      usageLimit: String(usageLimitValue || "").trim() ? Number(usageLimitValue) : null,
      usageLimitPerUser: String(usageLimitPerUserValue || "").trim() ? Number(usageLimitPerUserValue) : null,
      appliesToPlanId: adminCouponForm.elements.namedItem("appliesToPlanId").value || null,
      startsAt: adminCouponForm.elements.namedItem("startsAt").value,
      expiresAt: adminCouponForm.elements.namedItem("endsAt").value,
      isActive: adminCouponForm.elements.namedItem("active").checked
    };
  }

  async function submitPlanForm(event) {
    event.preventDefault();
    const submitButton = adminPlanForm.querySelector('button[type="submit"]');
    const id = adminPlanForm.elements.namedItem("id").value;
    submitButton.disabled = true;
    setInlineStatus(adminPlanStatus, "Menyimpan plan...");
    try {
      await window.PortalAuth.apiJson(id ? `/api/billing/admin/plans/${encodeURIComponent(id)}` : "/api/billing/admin/plans", {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPlanPayload())
      });
      await loadAdminBilling({ silent: true });
      setInlineStatus(adminPlanStatus, "Plan berhasil disimpan.", "success");
      setTimeout(() => closeModal(adminPlanModalBackdrop), 450);
    } catch (err) {
      setInlineStatus(adminPlanStatus, err.message || "Gagal menyimpan plan.", "error");
    } finally {
      submitButton.disabled = false;
    }
  }

  async function submitCouponForm(event) {
    event.preventDefault();
    const submitButton = adminCouponForm.querySelector('button[type="submit"]');
    const id = adminCouponForm.elements.namedItem("id").value;
    submitButton.disabled = true;
    setInlineStatus(adminCouponStatus, "Menyimpan kupon...");
    try {
      await window.PortalAuth.apiJson(id ? `/api/billing/admin/coupons/${encodeURIComponent(id)}` : "/api/billing/admin/coupons", {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildCouponPayload())
      });
      await loadAdminBilling({ silent: true });
      setInlineStatus(adminCouponStatus, "Kupon berhasil disimpan.", "success");
      setTimeout(() => closeModal(adminCouponModalBackdrop), 450);
    } catch (err) {
      setInlineStatus(adminCouponStatus, err.message || "Gagal menyimpan kupon.", "error");
    } finally {
      submitButton.disabled = false;
    }
  }

  async function togglePlanActive(planId) {
    const plan = plans.find(item => item.id === planId);
    if (!plan) return;
    setStatus(plan.isActive ? "Menonaktifkan plan..." : "Mengaktifkan plan...");
    try {
      const body = await window.PortalAuth.apiJson(`/api/billing/admin/plans/${encodeURIComponent(planId)}/active`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !plan.isActive })
      });
      if (body.plan) {
        plans = plans.map(item => item.id === body.plan.id ? body.plan : item);
      }
      renderBilling();
      setStatus(body.plan?.isActive ? "Plan diaktifkan." : "Plan dinonaktifkan.", "success");
    } catch (err) {
      setStatus(err.message || "Gagal mengubah status plan.", "error");
    }
  }

  async function toggleCouponActive(couponId) {
    const coupon = coupons.find(item => item.id === couponId);
    if (!coupon) return;
    setStatus(coupon.isActive ? "Menonaktifkan kupon..." : "Mengaktifkan kupon...");
    try {
      const body = await window.PortalAuth.apiJson(`/api/billing/admin/coupons/${encodeURIComponent(couponId)}/active`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive })
      });
      if (body.coupon) {
        coupons = coupons.map(item => item.id === body.coupon.id ? body.coupon : item);
      }
      renderBilling();
      setStatus(body.coupon?.isActive ? "Kupon diaktifkan." : "Kupon dinonaktifkan.", "success");
    } catch (err) {
      setStatus(err.message || "Gagal mengubah status kupon.", "error");
    }
  }

  function getStoreText(store) {
    return [store.name, store.username, store.email, store.code, store.address, store.status].join(" ").toLowerCase();
  }

  function getFilteredStores() {
    const search = storeFilterState.search.trim().toLowerCase();
    if (!adminStoresLoaded) return [];
    return stores
      .filter(store => !search || getStoreText(store).includes(search))
      .filter(store => {
        if (storeFilterState.suspend === "suspended") return store.is_suspend;
        if (storeFilterState.suspend === "active") return !store.is_suspend;
        return true;
      })
      .filter(store => {
        if (!storeFilterState.signals.size) return true;
        const hasOnline = store.clients.some(client => client.status === "online");
        const hasOffline = store.clients.some(client => client.status !== "online");
        const noCredit = Number(store.credit || 0) <= 0;
        if (storeFilterState.signals.has("client_online") && !hasOnline) return false;
        if (storeFilterState.signals.has("client_offline") && !hasOffline) return false;
        if (storeFilterState.signals.has("no_credit") && !noCredit) return false;
        return true;
      });
  }

  function updateStoreFilterSummary(count) {
    const pieces = [];
    if (storeFilterState.suspend !== "all") pieces.push(storeFilterState.suspend === "suspended" ? "suspended" : "tidak suspended");
    if (storeFilterState.signals.size) pieces.push(`${storeFilterState.signals.size} sinyal`);
    if (storeFilterState.search) pieces.push("pencarian aktif");
    adminStoreFilterSummary.textContent = pieces.length ? `${count} toko · ${pieces.join(" · ")}` : `${count} toko`;
  }

  function renderStores() {
    if (adminStoresLoading && !adminStoresLoaded) {
      adminStoresTable.innerHTML = '<tr><td colspan="8" class="muted-cell">Memuat data toko...</td></tr>';
      updateStoreFilterSummary(0);
      return;
    }
    if (adminStoresError) {
      adminStoresTable.innerHTML = `<tr><td colspan="8" class="muted-cell">${escapeHtml(adminStoresError)}</td></tr>`;
      updateStoreFilterSummary(0);
      return;
    }
    const rows = getFilteredStores();
    updateStoreFilterSummary(rows.length);
    if (!rows.length) {
      adminStoresTable.innerHTML = '<tr><td colspan="8" class="muted-cell">Tidak ada toko sesuai filter.</td></tr>';
      return;
    }
    adminStoresTable.innerHTML = rows.map(store => {
      const online = store.onlineClientCount ?? store.clients.filter(client => client.status === "online").length;
      return `
        <tr>
          <td><strong>${escapeHtml(store.name)}</strong><span>${escapeHtml(store.code)} · ${escapeHtml(store.address)}</span></td>
          <td>${escapeHtml(store.username)}<span>${escapeHtml(store.email)}</span></td>
          <td>${escapeHtml(online)} online<span>${escapeHtml(store.clientCount ?? store.clients.length)} total client</span></td>
          <td>${escapeHtml(formatNumber(store.credit))} kredit<span>${escapeHtml(formatNumber(store.scheduledCredit || 0))} terjadwal</span></td>
          <td>${escapeHtml(store.lastOrder)}</td>
          <td><span class="status-pill ${statusClass(store.status)}">${escapeHtml(store.status)}</span></td>
          <td><span class="status-pill ${store.is_suspend ? "offline" : "online"}">${store.is_suspend ? "Ya" : "Tidak"}</span></td>
          <td>
            <div class="admin-row-actions">
              <button class="btn btn-outline btn-compact" type="button" data-store-detail-id="${escapeHtml(store.id)}">Detail</button>
              <button class="btn btn-ghost btn-compact" type="button" data-toggle-store-suspend-id="${escapeHtml(store.id)}">${store.is_suspend ? "Unsuspend" : "Suspend"}</button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  function syncStoreFilterInputs() {
    setSelectedRadio("adminStoreSuspendFilter", storeFilterState.suspend);
    document.querySelectorAll('input[name="adminStoreSignalFilters"]').forEach(input => {
      input.checked = storeFilterState.signals.has(input.value);
    });
  }

  function readStoreFilterInputs() {
    storeFilterState.suspend = getSelectedRadio("adminStoreSuspendFilter", "all");
    storeFilterState.signals = new Set(
      Array.from(document.querySelectorAll('input[name="adminStoreSignalFilters"]:checked')).map(input => input.value)
    );
  }

  function resetStoreFilters() {
    storeFilterState.search = "";
    storeFilterState.suspend = "all";
    storeFilterState.signals = new Set();
    if (adminStoreSearchInput) adminStoreSearchInput.value = "";
    syncStoreFilterInputs();
    renderStores();
  }

  async function loadAdminStores({ silent = false } = {}) {
    adminStoresLoading = true;
    adminStoresError = "";
    if (!silent) setStatus("Memuat data toko...");
    renderStores();
    try {
      const body = await window.PortalAuth.apiJson("/api/admin/stores", { method: "GET" });
      stores = Array.isArray(body.stores) ? body.stores : [];
      adminStoresLoaded = true;
      adminStoresError = "";
      renderStores();
      if (!silent) setStatus("");
    } catch (err) {
      stores = [];
      adminStoresLoaded = true;
      adminStoresError = err.message || "Gagal memuat data toko.";
      renderStores();
      if (!silent) setStatus(adminStoresError, "error");
    } finally {
      adminStoresLoading = false;
    }
  }

  function renderKeyValueList(items) {
    return `<dl class="admin-review-list">${items.map(item => `
      <div><dt>${escapeHtml(item[0])}</dt><dd>${escapeHtml(item[1])}</dd></div>
    `).join("")}</dl>`;
  }

  async function openStoreDetail(storeId) {
    let store = stores.find(item => item.id === storeId);
    if (!store) return;
    activeStoreId = store.id;
    adminStoreDetailTitle.textContent = "Memuat detail toko...";
    adminStoreDetailBody.innerHTML = '<div class="admin-empty">Memuat detail toko...</div>';
    openModal(adminStoreDetailModalBackdrop);
    try {
      const body = await window.PortalAuth.apiJson(`/api/admin/stores/${encodeURIComponent(storeId)}`, { method: "GET" });
      if (body.store) {
        store = body.store;
        stores = stores.map(item => item.id === store.id ? store : item);
        renderStores();
      }
    } catch (err) {
      adminStoreDetailBody.innerHTML = `<div class="admin-empty">${escapeHtml(err.message || "Gagal memuat detail toko.")}</div>`;
      return;
    }
    adminStoreDetailTitle.textContent = `Detail Toko · ${store.name}`;
    adminToggleStoreSuspendBtn.textContent = store.is_suspend ? "Unsuspend Toko" : "Suspend Toko";
    adminStoreDetailBody.innerHTML = `
      <section class="admin-detail-card">
        <h3>Profil Akun</h3>
        ${renderKeyValueList([
          ["Username", store.username],
          ["Email", store.email],
          ["Role", store.role],
          ["Tanggal Daftar", formatDateTime(store.createdAt)]
        ])}
      </section>
      <section class="admin-detail-card">
        <h3>Profil Toko</h3>
        ${renderKeyValueList([
          ["Nama", store.name],
          ["Kode", store.code],
          ["Alamat", store.address],
          ["Jam Operasional", store.operatingHours],
          ["Status", `${store.status}${store.is_suspend ? " · suspended" : ""}`]
        ])}
      </section>
      <section class="admin-detail-card">
        <h3>Client</h3>
        <div class="admin-mini-list">${store.clients.length ? store.clients.map(client => `
          <div><strong>${escapeHtml(client.name)}</strong><span>${escapeHtml(client.status)} · ${escapeHtml(formatDateTime(client.lastSeen))} · ${escapeHtml(client.printer)}</span></div>
        `).join("") : '<div><strong>Belum ada client</strong><span>Client print belum terhubung.</span></div>'}</div>
      </section>
      <section class="admin-detail-card">
        <h3>Billing Ringkas</h3>
        <div class="admin-mini-list">
          <div><strong>${escapeHtml(formatNumber(store.credit))} kredit bisa dipakai</strong><span>${escapeHtml(formatNumber(store.scheduledCredit || 0))} kredit terjadwal · total hak ${escapeHtml(formatNumber(store.totalEntitledCredit ?? store.credit ?? 0))}</span></div>
          <div><strong>Order terakhir</strong><span>${escapeHtml(store.lastOrder)}</span></div>
          ${store.payments.length ? store.payments.map(item => `<div><strong>${escapeHtml(item.label || item.id)}</strong><span>${escapeHtml(item.planName || "-")} · ${escapeHtml(formatCurrency(item.totalIdr))} · ${escapeHtml(formatDateTime(item.createdAt))}</span></div>`).join("") : '<div><strong>Belum ada pembayaran</strong><span>Riwayat pembayaran kosong.</span></div>'}
        </div>
      </section>
      <section class="admin-detail-card admin-detail-card-wide">
        <h3>Job Terbaru</h3>
        <div class="admin-mini-list">${store.recentJobs.length ? store.recentJobs.map(item => `<div><strong>${escapeHtml(item.label || item.id)}</strong><span>${escapeHtml(item.originalName || "-")} · ${escapeHtml(formatDateTime(item.createdAt))}</span></div>`).join("") : '<div><strong>Belum ada job</strong><span>Job terbaru kosong.</span></div>'}</div>
      </section>
    `;
  }

  async function toggleStoreSuspend(storeId) {
    const store = stores.find(item => item.id === storeId);
    if (!store) return;
    setStatus(store.is_suspend ? "Mengaktifkan toko..." : "Men-suspend toko...");
    try {
      const body = await window.PortalAuth.apiJson(`/api/admin/stores/${encodeURIComponent(storeId)}/suspend`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_suspend: !store.is_suspend })
      });
      const updatedStore = body.store;
      if (updatedStore) {
        stores = stores.map(item => item.id === updatedStore.id ? updatedStore : item);
      }
      renderStores();
      await loadOverviewSummary({ silent: true });
      setStatus(updatedStore?.is_suspend ? "Toko disuspend." : "Toko diaktifkan kembali.", "success");
    } catch (err) {
      setStatus(err.message || "Gagal mengubah status suspend toko.", "error");
      return;
    }
    if (activeStoreId === storeId) {
      await openStoreDetail(storeId);
    }
  }

  function getJobText(job) {
    return [job.id, job.store, job.username, job.code, job.session, job.file, job.targetClient, job.status].join(" ").toLowerCase();
  }

  function getFilteredJobs() {
    const search = jobFilterState.search.trim().toLowerCase();
    if (!adminJobsLoaded) return [];
    return jobs
      .filter(job => !search || getJobText(job).includes(search))
      .filter(job => jobFilterState.statusFilters.size === 0 || jobFilterState.statusFilters.has(job.status))
      .filter(job => {
        if (jobFilterState.dateMode !== "day") return true;
        return dateInputValue(job.createdAt) === jobFilterState.date;
      });
  }

  function updateJobFilterSummary(count) {
    const pieces = [];
    if (jobFilterState.statusFilters.size) pieces.push(`${jobFilterState.statusFilters.size} status`);
    if (jobFilterState.dateMode === "day") pieces.push(jobFilterState.date || "hari ini");
    if (jobFilterState.search) pieces.push("pencarian aktif");
    adminJobFilterSummary.textContent = pieces.length ? `${count} job · ${pieces.join(" · ")}` : `${count} job`;
  }

  function renderJobs() {
    if (adminJobsLoading && !adminJobsLoaded) {
      adminJobsTable.innerHTML = '<tr><td colspan="8" class="muted-cell">Memuat data job...</td></tr>';
      updateJobFilterSummary(0);
      return;
    }
    if (adminJobsError) {
      adminJobsTable.innerHTML = `<tr><td colspan="8" class="muted-cell">${escapeHtml(adminJobsError)}</td></tr>`;
      updateJobFilterSummary(0);
      return;
    }
    const rows = getFilteredJobs();
    updateJobFilterSummary(rows.length);
    if (!rows.length) {
      adminJobsTable.innerHTML = '<tr><td colspan="8" class="muted-cell">Tidak ada job sesuai filter.</td></tr>';
      return;
    }
    adminJobsTable.innerHTML = rows.map(job => `
      <tr>
        <td><strong>${escapeHtml(job.id)}</strong><span>${escapeHtml(formatDateTime(job.createdAt))}</span></td>
        <td>${escapeHtml(job.store)}</td>
        <td>${escapeHtml(job.session)}</td>
        <td>${escapeHtml(job.file)}<span>${escapeHtml(job.size)}</span></td>
        <td>${escapeHtml(formatCurrency(job.price))}</td>
        <td><span class="status-pill ${statusClass(job.status)}">${escapeHtml(statusLabel(job.status))}</span></td>
        <td>${escapeHtml(job.time)}<span>${escapeHtml(formatDateTime(job.updatedAt))}</span></td>
        <td><button class="btn btn-outline btn-compact" type="button" data-job-detail-id="${escapeHtml(job.id)}">Detail</button></td>
      </tr>
    `).join("");
  }

  function syncJobFilterInputs() {
    document.querySelectorAll('input[name="adminJobStatusFilters"]').forEach(input => {
      input.checked = jobFilterState.statusFilters.has(input.value);
    });
    setSelectedRadio("adminJobDateMode", jobFilterState.dateMode);
    if (adminJobDateDayInput) {
      adminJobDateDayInput.value = jobFilterState.date || todayInputValue();
      adminJobDateDayInput.disabled = jobFilterState.dateMode !== "day";
    }
  }

  function readJobFilterInputs() {
    jobFilterState.statusFilters = new Set(
      Array.from(document.querySelectorAll('input[name="adminJobStatusFilters"]:checked')).map(input => input.value)
    );
    jobFilterState.dateMode = getSelectedRadio("adminJobDateMode", "all");
    jobFilterState.date = adminJobDateDayInput?.value || todayInputValue();
  }

  function resetJobFilters() {
    jobFilterState.search = "";
    jobFilterState.statusFilters = new Set();
    jobFilterState.dateMode = "all";
    jobFilterState.date = todayInputValue();
    if (adminJobSearchInput) adminJobSearchInput.value = "";
    syncJobFilterInputs();
    renderJobs();
  }

  async function loadAdminJobs({ silent = false } = {}) {
    adminJobsLoading = true;
    adminJobsError = "";
    if (!silent) setStatus("Memuat data job...");
    renderJobs();
    try {
      const body = await window.PortalAuth.apiJson("/api/admin/jobs", { method: "GET" });
      jobs = Array.isArray(body.jobs) ? body.jobs : [];
      adminJobsLoaded = true;
      adminJobsError = "";
      renderJobs();
      if (!silent) setStatus("");
    } catch (err) {
      jobs = [];
      adminJobsLoaded = true;
      adminJobsError = err.message || "Gagal memuat data job.";
      renderJobs();
      if (!silent) setStatus(adminJobsError, "error");
    } finally {
      adminJobsLoading = false;
    }
  }

  async function openJobDetail(jobId) {
    let job = jobs.find(item => item.id === jobId);
    if (!job) return;
    adminJobDetailTitle.textContent = "Memuat detail job...";
    adminJobDetailBody.innerHTML = '<div class="admin-empty">Memuat detail job...</div>';
    openModal(adminJobDetailModalBackdrop);
    try {
      const body = await window.PortalAuth.apiJson(`/api/admin/jobs/${encodeURIComponent(jobId)}`, { method: "GET" });
      if (body.job) {
        job = body.job;
        jobs = jobs.map(item => item.id === job.id ? job : item);
        renderJobs();
      }
    } catch (err) {
      adminJobDetailBody.innerHTML = `<div class="admin-empty">${escapeHtml(err.message || "Gagal memuat detail job.")}</div>`;
      return;
    }
    adminJobDetailTitle.textContent = `Detail Job · ${job.id}`;
    adminJobDetailBody.innerHTML = `
      <section class="admin-detail-card">
        <h3>Metadata</h3>
        ${renderKeyValueList([
          ["Job ID", job.id],
          ["Status", statusLabel(job.status)],
          ["Toko", job.store],
          ["Session", job.session],
          ["Client", job.targetClient]
        ])}
      </section>
      <section class="admin-detail-card">
        <h3>File</h3>
        ${renderKeyValueList([
          ["Nama File", job.file],
          ["Status File", job.fileStatus || job.mimeType],
          ["Ukuran", job.size]
        ])}
      </section>
      <section class="admin-detail-card">
        <h3>Pricing</h3>
        ${renderKeyValueList([
          ["Harga", formatCurrency(job.price)],
          ["Konfigurasi", job.printConfig],
          ["Kredit", `${job.creditUsage} kredit`]
        ])}
      </section>
      <section class="admin-detail-card">
        <h3>Waktu</h3>
        ${renderKeyValueList([
          ["Created", formatDateTime(job.createdAt)],
          ["Updated", formatDateTime(job.updatedAt)]
        ])}
      </section>
      <section class="admin-detail-card admin-detail-card-wide">
        <h3>Timeline</h3>
        <div class="admin-mini-list">${job.timeline.map(item => `<div><strong>${escapeHtml(item)}</strong><span>Read-only event</span></div>`).join("")}</div>
      </section>
    `;
  }

  function formatAuditDetail(detail) {
    if (!detail) return "-";
    if (typeof detail === "string") return detail;
    try {
      return JSON.stringify(detail);
    } catch {
      return "-";
    }
  }

  function renderAuditPagination() {
    const isAll = auditFilterState.perPage === "all";
    const currentPage = isAll ? 1 : Number(auditFilterState.page || 1);
    const totalPages = isAll ? 1 : Math.max(1, Number(adminAuditTotalPages || 1));
    if (adminAuditPageText) {
      adminAuditPageText.textContent = isAll
        ? `Semua (${formatNumber(adminAuditTotal)} aktivitas)`
        : `Page ${formatNumber(currentPage)} / ${formatNumber(totalPages)} · ${formatNumber(adminAuditTotal)} aktivitas`;
    }
    [adminAuditFirstPageBtn, adminAuditPrevPageBtn].forEach(button => {
      if (button) button.disabled = isAll || currentPage <= 1 || adminAuditLoading;
    });
    [adminAuditNextPageBtn, adminAuditLastPageBtn].forEach(button => {
      if (button) button.disabled = isAll || currentPage >= totalPages || adminAuditLoading;
    });
  }

  function renderAudit() {
    if (adminAuditLoading && !adminAuditRows.length) {
      adminAuditList.innerHTML = '<div class="admin-empty">Memuat audit...</div>';
      renderAuditPagination();
      return;
    }
    if (adminAuditError) {
      adminAuditList.innerHTML = `<div class="admin-empty">${escapeHtml(adminAuditError)}</div>`;
      renderAuditPagination();
      return;
    }
    adminAuditList.innerHTML = adminAuditRows.length ? adminAuditRows.map(item => `
      <article class="admin-audit-item">
        <time>${escapeHtml(formatDateTime(item.createdAt))}</time>
        <div>
          <strong>${escapeHtml(item.action)}</strong>
          <span>${escapeHtml(item.actorType || "-")} · ${escapeHtml(item.actorId || "-")} · ${escapeHtml(item.targetType || "-")} · ${escapeHtml(item.targetId || "-")} · ${escapeHtml(formatAuditDetail(item.detail))}</span>
        </div>
      </article>
    `).join("") : '<div class="admin-empty">Tidak ada aktivitas sesuai filter.</div>';
    renderAuditPagination();
  }

  async function loadAdminAudit({ silent = false } = {}) {
    adminAuditLoading = true;
    adminAuditError = "";
    if (!silent) setStatus("Memuat audit...");
    renderAudit();
    const params = new URLSearchParams();
    params.set("page", String(auditFilterState.page || 1));
    params.set("perPage", auditFilterState.perPage || "20");
    if (auditFilterState.search) params.set("search", auditFilterState.search);
    if (auditFilterState.date) params.set("date", auditFilterState.date);
    try {
      const body = await window.PortalAuth.apiJson(`/api/admin/audit?${params.toString()}`, { method: "GET" });
      adminAuditRows = Array.isArray(body.logs) ? body.logs : [];
      adminAuditTotal = Number(body.total || 0);
      adminAuditTotalPages = Number(body.totalPages || 1);
      auditFilterState.page = Number(body.page || auditFilterState.page || 1);
      auditFilterState.perPage = String(body.perPage || auditFilterState.perPage || "20");
      if (adminAuditPageSizeSelect) adminAuditPageSizeSelect.value = auditFilterState.perPage;
      adminAuditError = "";
      renderAudit();
      if (!silent) setStatus("");
    } catch (err) {
      adminAuditRows = [];
      adminAuditTotal = 0;
      adminAuditTotalPages = 1;
      adminAuditError = err.message || "Gagal memuat audit.";
      renderAudit();
      if (!silent) setStatus(adminAuditError, "error");
    } finally {
      adminAuditLoading = false;
      renderAuditPagination();
    }
  }

  function setAuditPage(page) {
    const totalPages = Math.max(1, Number(adminAuditTotalPages || 1));
    auditFilterState.page = Math.min(Math.max(Number(page) || 1, 1), totalPages);
    loadAdminAudit();
  }

  function renderAllUi() {
    refreshOverview();
    renderPayments();
    renderBilling();
    renderStores();
    renderJobs();
    renderAudit();
  }

  async function loadAdminPortal() {
    const state = window.PortalAuth.getState();
    if (!state?.accessToken) {
      window.location.href = "/portal/";
      return;
    }

    try {
      const body = await window.PortalAuth.apiJson("/api/auth/me", { method: "GET" });
      const user = body.user || null;
      window.PortalAuth.saveState({ ...state, user });
      if (String(user?.role || "").toLowerCase() !== "admin") {
        window.location.href = "/portal/";
        return;
      }

      setCurrentAdminUser(user);
      renderAllUi();
      activatePanel("adminOverview");
      await loadOverviewSummary();
      await Promise.all([
        loadAdminPayments({ silent: true }),
        loadAdminBilling({ silent: true }),
        loadAdminStores({ silent: true }),
        loadAdminJobs({ silent: true }),
        loadAdminAudit({ silent: true })
      ]);
      setStatus("");
    } catch {
      window.PortalAuth.clearState();
      window.location.href = "/portal/";
    }
  }

  async function submitAdminProfile(event) {
    event.preventDefault();
    const submitButton = adminProfileForm.querySelector('button[type="submit"]');
    const username = String(adminProfileForm.elements.namedItem("username").value || "").trim();
    const email = String(adminProfileForm.elements.namedItem("email").value || "").trim();
    if (!username) {
      setInlineStatus(adminProfileStatus, "Username wajib diisi.", "error");
      return;
    }

    submitButton.disabled = true;
    setInlineStatus(adminProfileStatus, "Menyimpan profil...");
    try {
      const body = await window.PortalAuth.apiJson("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email })
      });
      const updatedUser = body.user || null;
      if (updatedUser) {
        const state = window.PortalAuth.getState();
        window.PortalAuth.saveState({ ...state, user: updatedUser });
        setCurrentAdminUser(updatedUser);
      }
      setInlineStatus(adminProfileStatus, "Profil berhasil diperbarui.", "success");
    } catch (err) {
      setInlineStatus(adminProfileStatus, err.message || "Gagal memperbarui profil.", "error");
    } finally {
      submitButton.disabled = false;
    }
  }

  async function submitAdminPassword(event) {
    event.preventDefault();
    const submitButton = adminPasswordForm.querySelector('button[type="submit"]');
    const currentPassword = String(adminPasswordForm.elements.namedItem("currentPassword").value || "");
    const newPassword = String(adminPasswordForm.elements.namedItem("newPassword").value || "");
    const newPasswordConfirm = String(adminPasswordForm.elements.namedItem("newPasswordConfirm").value || "");

    if (newPassword.length < 8) {
      setInlineStatus(adminPasswordStatus, "Password baru minimal 8 karakter.", "error");
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setInlineStatus(adminPasswordStatus, "Konfirmasi password baru tidak sama.", "error");
      return;
    }

    submitButton.disabled = true;
    setInlineStatus(adminPasswordStatus, "Menyimpan password...");
    try {
      await window.PortalAuth.apiJson("/api/auth/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      adminPasswordForm.reset();
      setInlineStatus(adminPasswordStatus, "Password berhasil diperbarui.", "success");
    } catch (err) {
      setInlineStatus(adminPasswordStatus, err.message || "Gagal mengganti password.", "error");
    } finally {
      submitButton.disabled = false;
    }
  }

  adminNavLinks.forEach(link => {
    link.addEventListener("click", () => activatePanel(link.dataset.adminTarget));
  });

  document.addEventListener("click", event => {
    if (!event.target.closest(".admin-account-menu")) {
      closeAdminUserMenu();
    }

    const jumpButton = event.target.closest("[data-admin-jump]");
    if (jumpButton) {
      activatePanel(jumpButton.dataset.adminJump);
      return;
    }

    const planEdit = event.target.closest("[data-edit-plan-id]");
    if (planEdit) {
      openPlanModal(planEdit.dataset.editPlanId);
      return;
    }
    const planToggle = event.target.closest("[data-toggle-plan-id]");
    if (planToggle) {
      togglePlanActive(planToggle.dataset.togglePlanId);
      return;
    }

    const couponEdit = event.target.closest("[data-edit-coupon-id]");
    if (couponEdit) {
      openCouponModal(couponEdit.dataset.editCouponId);
      return;
    }
    const couponToggle = event.target.closest("[data-toggle-coupon-id]");
    if (couponToggle) {
      toggleCouponActive(couponToggle.dataset.toggleCouponId);
      return;
    }

    const storeDetail = event.target.closest("[data-store-detail-id]");
    if (storeDetail) {
      openStoreDetail(storeDetail.dataset.storeDetailId);
      return;
    }
    const storeToggle = event.target.closest("[data-toggle-store-suspend-id]");
    if (storeToggle) {
      toggleStoreSuspend(storeToggle.dataset.toggleStoreSuspendId);
      return;
    }

    const jobDetail = event.target.closest("[data-job-detail-id]");
    if (jobDetail) {
      openJobDetail(jobDetail.dataset.jobDetailId);
    }
  });

  adminBillingTabButtons.forEach(button => {
    button.addEventListener("click", () => activateBillingTab(button.dataset.adminBillingTab));
  });

  adminUserMenuBtn.addEventListener("click", event => {
    event.stopPropagation();
    toggleAdminUserMenu();
  });
  openAdminProfileBtn.addEventListener("click", openAdminProfileModal);
  adminProfileForm.addEventListener("submit", submitAdminProfile);
  adminPasswordForm.addEventListener("submit", submitAdminPassword);

  refreshOverviewBtn.addEventListener("click", () => loadOverviewSummary());
  refreshAdminPaymentsBtn.addEventListener("click", loadAdminPayments);
  refreshAdminBillingBtn.addEventListener("click", () => loadAdminBilling());
  openAdminPaymentFilterBtn.addEventListener("click", () => {
    syncPaymentFilterInputs();
    openModal(adminPaymentFilterModalBackdrop);
  });
  resetAdminPaymentFilterBtn.addEventListener("click", resetPaymentFilters);
  resetAdminPaymentFilterModalBtn.addEventListener("click", resetPaymentFilters);
  applyAdminPaymentFilterBtn.addEventListener("click", () => {
    readPaymentFilterInputs();
    renderPayments();
    closeModal(adminPaymentFilterModalBackdrop);
  });
  adminPaymentSearchInput.addEventListener("input", () => {
    paymentFilterState.search = adminPaymentSearchInput.value || "";
    renderPayments();
  });
  document.querySelectorAll('input[name="adminPaymentDateMode"]').forEach(input => {
    input.addEventListener("change", syncPaymentDateInputs);
  });
  adminPaymentsTable.addEventListener("click", event => {
    const button = event.target.closest("[data-review-order-id]");
    if (!button) return;
    openPaymentReview(button.getAttribute("data-review-order-id"));
  });
  adminApprovePaymentBtn.addEventListener("click", () => submitPaymentReview("approve"));
  adminRejectPaymentBtn.addEventListener("click", () => submitPaymentReview("reject"));

  openPlanModalBtn.addEventListener("click", () => openPlanModal());
  openCouponModalBtn.addEventListener("click", () => openCouponModal());
  adminPlanForm.addEventListener("submit", submitPlanForm);
  adminCouponForm.addEventListener("submit", submitCouponForm);

  openStoreFilterBtn.addEventListener("click", () => {
    syncStoreFilterInputs();
    openModal(adminStoreFilterModalBackdrop);
  });
  resetStoreFilterBtn.addEventListener("click", resetStoreFilters);
  resetStoreFilterModalBtn.addEventListener("click", resetStoreFilters);
  applyStoreFilterBtn.addEventListener("click", () => {
    readStoreFilterInputs();
    renderStores();
    closeModal(adminStoreFilterModalBackdrop);
  });
  refreshStoresBtn.addEventListener("click", () => loadAdminStores());
  adminStoreSearchInput.addEventListener("input", () => {
    storeFilterState.search = adminStoreSearchInput.value || "";
    renderStores();
  });
  adminToggleStoreSuspendBtn.addEventListener("click", () => {
    if (activeStoreId) toggleStoreSuspend(activeStoreId);
  });

  openJobFilterBtn.addEventListener("click", () => {
    syncJobFilterInputs();
    openModal(adminJobFilterModalBackdrop);
  });
  resetJobFilterBtn.addEventListener("click", resetJobFilters);
  resetJobFilterModalBtn.addEventListener("click", resetJobFilters);
  applyJobFilterBtn.addEventListener("click", () => {
    readJobFilterInputs();
    renderJobs();
    closeModal(adminJobFilterModalBackdrop);
  });
  refreshJobsBtn.addEventListener("click", () => loadAdminJobs());
  adminJobSearchInput.addEventListener("input", () => {
    jobFilterState.search = adminJobSearchInput.value || "";
    renderJobs();
  });
  document.querySelectorAll('input[name="adminJobDateMode"]').forEach(input => {
    input.addEventListener("change", () => {
      jobFilterState.dateMode = getSelectedRadio("adminJobDateMode", "all");
      syncJobFilterInputs();
    });
  });

  adminAuditSearchInput.addEventListener("input", () => {
    auditFilterState.search = adminAuditSearchInput.value || "";
    auditFilterState.page = 1;
    loadAdminAudit();
  });
  adminAuditDateInput.addEventListener("change", () => {
    auditFilterState.date = adminAuditDateInput.value || "";
    auditFilterState.page = 1;
    loadAdminAudit();
  });
  adminAuditPageSizeSelect.addEventListener("change", () => {
    auditFilterState.perPage = adminAuditPageSizeSelect.value || "20";
    auditFilterState.page = 1;
    loadAdminAudit();
  });
  adminAuditFirstPageBtn.addEventListener("click", () => setAuditPage(1));
  adminAuditPrevPageBtn.addEventListener("click", () => setAuditPage(Number(auditFilterState.page || 1) - 1));
  adminAuditNextPageBtn.addEventListener("click", () => setAuditPage(Number(auditFilterState.page || 1) + 1));
  adminAuditLastPageBtn.addEventListener("click", () => setAuditPage(adminAuditTotalPages));
  refreshAuditBtn.addEventListener("click", () => {
    loadAdminAudit();
  });

  document.querySelectorAll("[data-admin-close]").forEach(button => {
    button.addEventListener("click", () => closeModal(document.getElementById(button.dataset.adminClose)));
  });
  [
    adminPaymentReviewModalBackdrop,
    adminPaymentFilterModalBackdrop,
    adminPlanModalBackdrop,
    adminCouponModalBackdrop,
    adminStoreFilterModalBackdrop,
    adminStoreDetailModalBackdrop,
    adminJobFilterModalBackdrop,
    adminJobDetailModalBackdrop,
    adminProfileModalBackdrop
  ].forEach(backdrop => {
    backdrop.addEventListener("click", event => {
      if (event.target === backdrop) closeModal(backdrop);
    });
  });

  adminLogoutBtn.addEventListener("click", async () => {
    setStatus("Logout...");
    await window.PortalAuth.logoutCurrentSession();
    window.location.href = "/portal/";
  });

  paymentFilterState.date = todayInputValue();
  storeFilterState.suspend = "all";
  jobFilterState.date = todayInputValue();
  window.PortalAuth.startSessionWatcher({
    idleTimeoutMs: 10 * 60 * 1000,
    loginPath: "/portal/",
    scope: "admin"
  });
  activateBillingTab("plans");
  renderAllUi();
  loadAdminPortal();
})();

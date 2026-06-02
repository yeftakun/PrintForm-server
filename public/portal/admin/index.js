(() => {
  const adminWelcomeText = document.getElementById("adminWelcomeText");
  const adminUserChip = document.getElementById("adminUserChip");
  const adminLogoutBtn = document.getElementById("adminLogoutBtn");
  const adminStatus = document.getElementById("adminStatus");
  const adminNavLinks = Array.from(document.querySelectorAll("[data-admin-target]"));
  const adminPanels = Array.from(document.querySelectorAll("[data-admin-panel]"));
  const adminStatsGrid = document.getElementById("adminStatsGrid");
  const adminActionQueue = document.getElementById("adminActionQueue");
  const adminSignalsList = document.getElementById("adminSignalsList");

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
  const adminPlansTable = document.getElementById("adminPlansTable");
  const adminCouponsTable = document.getElementById("adminCouponsTable");
  const openPlanModalBtn = document.getElementById("openPlanModalBtn");
  const openCouponModalBtn = document.getElementById("openCouponModalBtn");
  const adminPlanModalBackdrop = document.getElementById("adminPlanModalBackdrop");
  const adminCouponModalBackdrop = document.getElementById("adminCouponModalBackdrop");
  const adminPlanForm = document.getElementById("adminPlanForm");
  const adminCouponForm = document.getElementById("adminCouponForm");
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
  const refreshAuditBtn = document.getElementById("refreshAuditBtn");
  const adminAuditList = document.getElementById("adminAuditList");

  let adminPaymentOrders = [];
  let activeReviewOrderId = null;
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
    search: ""
  };

  let plans = [
    { id: "plan_free", name: "Free", description: "Trial akun mitra", price: 0, credits: 25, validDays: 14, active: true, updatedAt: "2026-05-29T08:10:00Z" },
    { id: "plan_starter", name: "Starter", description: "Paket awal toko kecil", price: 13000, credits: 500, validDays: 30, active: true, updatedAt: "2026-05-30T09:20:00Z" },
    { id: "plan_pro", name: "Pro", description: "Paket operasional harian", price: 20000, credits: 1000, validDays: 30, active: true, updatedAt: "2026-05-31T10:30:00Z" },
    { id: "plan_topup", name: "Buy Credit", description: "Top up kredit fleksibel", price: 5000, credits: 250, validDays: 60, active: true, updatedAt: "2026-06-01T07:45:00Z" }
  ];

  let coupons = [
    { id: "coupon_launch10", code: "LAUNCH10", type: "percent", value: 10, minOrder: 10000, usageLimit: 100, used: 18, startsAt: "2026-06-01", endsAt: "2026-06-30", active: true },
    { id: "coupon_mitra5k", code: "MITRA5K", type: "amount", value: 5000, minOrder: 20000, usageLimit: 40, used: 7, startsAt: "2026-06-01", endsAt: "2026-06-15", active: true },
    { id: "coupon_old", code: "TRIAL2026", type: "percent", value: 15, minOrder: 0, usageLimit: 25, used: 25, startsAt: "2026-05-01", endsAt: "2026-05-31", active: false }
  ];

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

  const jobs = [
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
    backdrop?.classList.remove("open");
    backdrop?.setAttribute("aria-hidden", "true");
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
    if (["paid", "done", "sent", "aktif", "normal", "active", "online"].includes(normalized)) return "online";
    if (["waiting_verification", "pending", "dipantau", "pending_payment"].includes(normalized)) return "warning";
    if (["canceled", "cancelled", "rejected", "perlu kredit", "perlu cek", "perlu tindak", "suspended", "offline"].includes(normalized)) return "offline";
    return "";
  }

  function statusLabel(status) {
    const labels = {
      waiting_verification: "Menunggu verifikasi",
      pending_payment: "Menunggu bayar",
      pending: "Menunggu",
      paid: "Paid",
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

  function renderStats() {
    const paymentSource = getPaymentSource();
    const waitingPayments = paymentSource.filter(order => order.status === "waiting_verification").length;
    const paidThisMonth = paymentSource
      .filter(order => order.status === "paid")
      .reduce((sum, order) => sum + Number(order.totalIdr || 0), 0);
    const suspendedStores = stores.filter(store => store.is_suspend).length;
    const onlineClients = stores.reduce((sum, store) => sum + store.clients.filter(client => client.status === "online").length, 0);
    const jobsToday = jobs.length;
    const statItems = [
      { label: "Verifikasi", value: String(waitingPayments), tone: "warning", caption: "Pembayaran menunggu review" },
      { label: "Paid Bulan Ini", value: formatCurrency(paidThisMonth), tone: "accent", caption: "Total order paid" },
      { label: "Toko Aktif", value: String(stores.length - suspendedStores), tone: "success", caption: "Tidak suspended" },
      { label: "Suspended", value: String(suspendedStores), tone: suspendedStores ? "warning" : "neutral", caption: "Toko dibatasi" },
      { label: "Client Online", value: String(onlineClients), tone: "info", caption: "Siap menerima job" },
      { label: "Job Hari Ini", value: String(jobsToday), tone: "neutral", caption: "Aktivitas lintas toko" }
    ];
    adminStatsGrid.innerHTML = statItems.map(item => `
      <article class="admin-stat-card ${escapeHtml(item.tone)}">
        <span>${escapeHtml(item.label)}</span>
        <strong>${escapeHtml(item.value)}</strong>
        <small>${escapeHtml(item.caption)}</small>
      </article>
    `).join("");
  }

  function renderActionQueue() {
    const paymentSource = getPaymentSource();
    const queue = [
      ...paymentSource
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
        })),
      ...jobs
        .filter(job => ["canceled", "rejected"].includes(job.status))
        .slice(0, 2)
        .map(job => ({
          title: job.id,
          detail: `${job.store} · ${statusLabel(job.status)}`,
          value: "Cek",
          target: "adminJobs"
        }))
    ];

    adminActionQueue.innerHTML = queue.length ? queue.map(item => `
      <button class="admin-queue-item admin-queue-button" type="button" data-admin-jump="${escapeHtml(item.target)}">
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(item.detail)}</span>
        </div>
        <b>${escapeHtml(item.value)}</b>
      </button>
    `).join("") : '<div class="admin-empty">Tidak ada antrean tindakan.</div>';
  }

  function renderSignals() {
    const offlineClients = stores.reduce((sum, store) => sum + store.clients.filter(client => client.status !== "online").length, 0);
    const pendingLong = getPaymentSource().filter(order => order.status === "pending_payment").length;
    const signals = [
      { title: "Mode SMTP", value: "Sesuai konfigurasi .env", status: "Dipantau" },
      { title: "Client offline", value: `${offlineClients} client`, status: offlineClients ? "Perlu cek" : "Normal" },
      { title: "Order pending", value: `${pendingLong} order`, status: pendingLong ? "Perlu tindak" : "Normal" },
      { title: "Storage file job", value: "Pantau cleanup scheduler", status: "Normal" }
    ];
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

  async function loadAdminPayments() {
    setStatus("Memuat data pembayaran...");
    try {
      const body = await window.PortalAuth.apiJson("/api/billing/admin/orders", { method: "GET" });
      adminPaymentOrders = Array.isArray(body.orders) ? body.orders : [];
      renderPayments();
      refreshOverview();
      setStatus("");
    } catch (err) {
      setStatus(`${err.message || "Gagal memuat pembayaran."} Data contoh UI tetap ditampilkan.`, "error");
      adminPaymentOrders = [];
      renderPayments();
      refreshOverview();
    }
  }

  function setReviewStatus(text, kind = "") {
    adminPaymentReviewStatus.textContent = text || "";
    adminPaymentReviewStatus.className = kind ? `status ${kind}` : "status";
  }

  function renderProofPreview(order) {
    const proof = order.paymentProof;
    adminProofName.textContent = proof?.originalName || "Belum ada bukti";
    if (!proof?.previewUrl) {
      adminProofDownloadLink.classList.add("hidden");
      adminProofDownloadLink.href = "#";
      adminProofPreview.innerHTML = '<div class="admin-proof-empty">Bukti pembayaran belum diupload.</div>';
      return;
    }

    adminProofDownloadLink.classList.remove("hidden");
    adminProofDownloadLink.href = proof.downloadUrl || proof.previewUrl;
    const mime = String(proof.mimeType || "").toLowerCase();
    if (mime.startsWith("image/")) {
      adminProofPreview.innerHTML = `<img src="${escapeHtml(proof.previewUrl)}" alt="Preview bukti pembayaran">`;
      return;
    }
    if (mime === "application/pdf") {
      adminProofPreview.innerHTML = `<iframe src="${escapeHtml(proof.previewUrl)}" title="Preview bukti pembayaran"></iframe>`;
      return;
    }
    adminProofPreview.innerHTML = '<div class="admin-proof-empty">Preview tidak tersedia untuk tipe file ini. Gunakan tombol download.</div>';
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
      renderProofPreview(order);
      setReviewStatus("");
    } catch (err) {
      if (fallbackOrder) {
        renderPaymentReviewDetail(fallbackOrder);
        renderProofPreview(fallbackOrder);
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
      setTimeout(() => closeModal(adminPaymentReviewModalBackdrop), 500);
    } catch (err) {
      setReviewStatus(err.message || "Gagal menyimpan review.", "error");
      adminApprovePaymentBtn.disabled = false;
      adminRejectPaymentBtn.disabled = false;
    }
  }

  function renderPlans() {
    adminPlansTable.innerHTML = plans.map(plan => `
      <tr>
        <td><strong>${escapeHtml(plan.name)}</strong><span>${escapeHtml(plan.description)}</span></td>
        <td>${escapeHtml(formatCurrency(plan.price))}</td>
        <td>${escapeHtml(formatNumber(plan.credits))} kredit</td>
        <td>${escapeHtml(plan.validDays)} hari</td>
        <td><span class="status-pill ${plan.active ? "online" : "offline"}">${plan.active ? "Aktif" : "Nonaktif"}</span></td>
        <td>${escapeHtml(formatDateTime(plan.updatedAt))}</td>
        <td>
          <div class="admin-row-actions">
            <button class="btn btn-outline btn-compact" type="button" data-edit-plan-id="${escapeHtml(plan.id)}">Edit</button>
            <button class="btn btn-ghost btn-compact" type="button" data-toggle-plan-id="${escapeHtml(plan.id)}">${plan.active ? "Nonaktifkan" : "Aktifkan"}</button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  function renderCoupons() {
    adminCouponsTable.innerHTML = coupons.map(coupon => `
      <tr>
        <td><strong>${escapeHtml(coupon.code)}</strong></td>
        <td>${coupon.type === "percent" ? `${escapeHtml(coupon.value)}%` : escapeHtml(formatCurrency(coupon.value))}</td>
        <td>${escapeHtml(formatCurrency(coupon.minOrder))}</td>
        <td>${escapeHtml(coupon.used)} / ${escapeHtml(coupon.usageLimit)}</td>
        <td>${escapeHtml(coupon.startsAt)} - ${escapeHtml(coupon.endsAt)}</td>
        <td><span class="status-pill ${coupon.active ? "online" : "offline"}">${coupon.active ? "Aktif" : "Nonaktif"}</span></td>
        <td>
          <div class="admin-row-actions">
            <button class="btn btn-outline btn-compact" type="button" data-edit-coupon-id="${escapeHtml(coupon.id)}">Edit</button>
            <button class="btn btn-ghost btn-compact" type="button" data-toggle-coupon-id="${escapeHtml(coupon.id)}">${coupon.active ? "Nonaktifkan" : "Aktifkan"}</button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  function openPlanModal(planId = "") {
    const plan = plans.find(item => item.id === planId);
    adminPlanForm.reset();
    adminPlanForm.elements.namedItem("id").value = plan?.id || "";
    adminPlanForm.elements.namedItem("name").value = plan?.name || "";
    adminPlanForm.elements.namedItem("description").value = plan?.description || "";
    adminPlanForm.elements.namedItem("price").value = plan?.price ?? "";
    adminPlanForm.elements.namedItem("credits").value = plan?.credits ?? "";
    adminPlanForm.elements.namedItem("validDays").value = plan?.validDays ?? 30;
    adminPlanForm.elements.namedItem("active").checked = plan ? plan.active : true;
    document.getElementById("adminPlanModalTitle").textContent = plan ? "Edit Plan" : "Tambah Plan";
    setInlineStatus(adminPlanStatus, "");
    openModal(adminPlanModalBackdrop);
  }

  function openCouponModal(couponId = "") {
    const coupon = coupons.find(item => item.id === couponId);
    adminCouponForm.reset();
    adminCouponForm.elements.namedItem("id").value = coupon?.id || "";
    adminCouponForm.elements.namedItem("code").value = coupon?.code || "";
    adminCouponForm.elements.namedItem("type").value = coupon?.type || "percent";
    adminCouponForm.elements.namedItem("value").value = coupon?.value ?? "";
    adminCouponForm.elements.namedItem("minOrder").value = coupon?.minOrder ?? 0;
    adminCouponForm.elements.namedItem("usageLimit").value = coupon?.usageLimit ?? 1;
    adminCouponForm.elements.namedItem("startsAt").value = coupon?.startsAt || todayInputValue();
    adminCouponForm.elements.namedItem("endsAt").value = coupon?.endsAt || todayInputValue();
    adminCouponForm.elements.namedItem("active").checked = coupon ? coupon.active : true;
    document.getElementById("adminCouponModalTitle").textContent = coupon ? "Edit Kupon" : "Tambah Kupon";
    setInlineStatus(adminCouponStatus, "");
    openModal(adminCouponModalBackdrop);
  }

  function getStoreText(store) {
    return [store.name, store.username, store.email, store.code, store.address].join(" ").toLowerCase();
  }

  function getFilteredStores() {
    const search = storeFilterState.search.trim().toLowerCase();
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
    const rows = getFilteredStores();
    updateStoreFilterSummary(rows.length);
    if (!rows.length) {
      adminStoresTable.innerHTML = '<tr><td colspan="8" class="muted-cell">Tidak ada toko sesuai filter.</td></tr>';
      return;
    }
    adminStoresTable.innerHTML = rows.map(store => {
      const online = store.clients.filter(client => client.status === "online").length;
      return `
        <tr>
          <td><strong>${escapeHtml(store.name)}</strong><span>${escapeHtml(store.code)} · ${escapeHtml(store.address)}</span></td>
          <td>${escapeHtml(store.username)}<span>${escapeHtml(store.email)}</span></td>
          <td>${escapeHtml(online)} online<span>${escapeHtml(store.clients.length)} total client</span></td>
          <td>${escapeHtml(formatNumber(store.credit))} kredit</td>
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

  function renderKeyValueList(items) {
    return `<dl class="admin-review-list">${items.map(item => `
      <div><dt>${escapeHtml(item[0])}</dt><dd>${escapeHtml(item[1])}</dd></div>
    `).join("")}</dl>`;
  }

  function openStoreDetail(storeId) {
    const store = stores.find(item => item.id === storeId);
    if (!store) return;
    activeStoreId = store.id;
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
        <div class="admin-mini-list">${store.clients.map(client => `
          <div><strong>${escapeHtml(client.name)}</strong><span>${escapeHtml(client.status)} · ${escapeHtml(client.lastSeen)} · ${escapeHtml(client.printer)}</span></div>
        `).join("")}</div>
      </section>
      <section class="admin-detail-card">
        <h3>Billing Ringkas</h3>
        <div class="admin-mini-list">
          <div><strong>${escapeHtml(formatNumber(store.credit))} kredit aktif</strong><span>${escapeHtml(store.lastOrder)}</span></div>
          ${store.payments.map(item => `<div><strong>${escapeHtml(item)}</strong><span>Riwayat pembayaran terbaru</span></div>`).join("")}
        </div>
      </section>
      <section class="admin-detail-card admin-detail-card-wide">
        <h3>Job Terbaru</h3>
        <div class="admin-mini-list">${store.recentJobs.map(item => `<div><strong>${escapeHtml(item)}</strong><span>Read-only monitoring</span></div>`).join("")}</div>
      </section>
    `;
    openModal(adminStoreDetailModalBackdrop);
  }

  function toggleStoreSuspend(storeId) {
    const store = stores.find(item => item.id === storeId);
    if (!store) return;
    store.is_suspend = !store.is_suspend;
    renderStores();
    refreshOverview();
    if (activeStoreId === storeId) {
      openStoreDetail(storeId);
    }
  }

  function getJobText(job) {
    return [job.id, job.store, job.session, job.file, job.targetClient, job.status].join(" ").toLowerCase();
  }

  function getFilteredJobs() {
    const search = jobFilterState.search.trim().toLowerCase();
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

  function openJobDetail(jobId) {
    const job = jobs.find(item => item.id === jobId);
    if (!job) return;
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
          ["MIME", job.mimeType],
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
    openModal(adminJobDetailModalBackdrop);
  }

  function renderAudit() {
    const search = auditFilterState.search.trim().toLowerCase();
    const rows = audits.filter(item => !search || [item.actor, item.action, item.target, item.detail, item.group].join(" ").toLowerCase().includes(search));
    adminAuditList.innerHTML = rows.length ? rows.map(item => `
      <article class="admin-audit-item">
        <time>${escapeHtml(item.time)}</time>
        <div>
          <strong>${escapeHtml(item.action)}</strong>
          <span>${escapeHtml(item.group)} · ${escapeHtml(item.actor)} · ${escapeHtml(item.target)} · ${escapeHtml(item.detail)}</span>
        </div>
      </article>
    `).join("") : '<div class="admin-empty">Tidak ada aktivitas sesuai pencarian.</div>';
  }

  function renderAllUi() {
    refreshOverview();
    renderPayments();
    renderPlans();
    renderCoupons();
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

      adminWelcomeText.textContent = `Login admin ${user.username || "-"}`;
      adminUserChip.textContent = user.username ? `@${user.username}` : "Admin";
      renderAllUi();
      activatePanel("adminOverview");
      await loadAdminPayments();
      setStatus("");
    } catch {
      window.PortalAuth.clearState();
      window.location.href = "/portal/";
    }
  }

  adminNavLinks.forEach(link => {
    link.addEventListener("click", () => activatePanel(link.dataset.adminTarget));
  });

  document.addEventListener("click", event => {
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
      const plan = plans.find(item => item.id === planToggle.dataset.togglePlanId);
      if (plan) {
        plan.active = !plan.active;
        plan.updatedAt = new Date().toISOString();
        renderPlans();
        refreshOverview();
      }
      return;
    }

    const couponEdit = event.target.closest("[data-edit-coupon-id]");
    if (couponEdit) {
      openCouponModal(couponEdit.dataset.editCouponId);
      return;
    }
    const couponToggle = event.target.closest("[data-toggle-coupon-id]");
    if (couponToggle) {
      const coupon = coupons.find(item => item.id === couponToggle.dataset.toggleCouponId);
      if (coupon) {
        coupon.active = !coupon.active;
        renderCoupons();
      }
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

  refreshAdminPaymentsBtn.addEventListener("click", loadAdminPayments);
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
  adminPlanForm.addEventListener("submit", event => {
    event.preventDefault();
    const id = adminPlanForm.elements.namedItem("id").value || `plan_${Date.now()}`;
    const nextPlan = {
      id,
      name: adminPlanForm.elements.namedItem("name").value.trim(),
      description: adminPlanForm.elements.namedItem("description").value.trim(),
      price: Number(adminPlanForm.elements.namedItem("price").value || 0),
      credits: Number(adminPlanForm.elements.namedItem("credits").value || 0),
      validDays: Number(adminPlanForm.elements.namedItem("validDays").value || 1),
      active: adminPlanForm.elements.namedItem("active").checked,
      updatedAt: new Date().toISOString()
    };
    plans = plans.some(plan => plan.id === id)
      ? plans.map(plan => plan.id === id ? nextPlan : plan)
      : [nextPlan, ...plans];
    renderPlans();
    refreshOverview();
    setInlineStatus(adminPlanStatus, "Plan disimpan di UI konsep.", "success");
    setTimeout(() => closeModal(adminPlanModalBackdrop), 450);
  });
  adminCouponForm.addEventListener("submit", event => {
    event.preventDefault();
    const id = adminCouponForm.elements.namedItem("id").value || `coupon_${Date.now()}`;
    const existing = coupons.find(coupon => coupon.id === id);
    const nextCoupon = {
      id,
      code: adminCouponForm.elements.namedItem("code").value.trim().toUpperCase(),
      type: adminCouponForm.elements.namedItem("type").value,
      value: Number(adminCouponForm.elements.namedItem("value").value || 0),
      minOrder: Number(adminCouponForm.elements.namedItem("minOrder").value || 0),
      usageLimit: Number(adminCouponForm.elements.namedItem("usageLimit").value || 1),
      used: existing?.used || 0,
      startsAt: adminCouponForm.elements.namedItem("startsAt").value,
      endsAt: adminCouponForm.elements.namedItem("endsAt").value,
      active: adminCouponForm.elements.namedItem("active").checked
    };
    coupons = coupons.some(coupon => coupon.id === id)
      ? coupons.map(coupon => coupon.id === id ? nextCoupon : coupon)
      : [nextCoupon, ...coupons];
    renderCoupons();
    setInlineStatus(adminCouponStatus, "Kupon disimpan di UI konsep.", "success");
    setTimeout(() => closeModal(adminCouponModalBackdrop), 450);
  });

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
  refreshStoresBtn.addEventListener("click", () => {
    renderStores();
    refreshOverview();
    setStatus("Data toko UI disegarkan.");
  });
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
  refreshJobsBtn.addEventListener("click", () => {
    renderJobs();
    refreshOverview();
    setStatus("Data job UI disegarkan.");
  });
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
    renderAudit();
  });
  refreshAuditBtn.addEventListener("click", () => {
    renderAudit();
    setStatus("Audit UI disegarkan.");
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
    adminJobDetailModalBackdrop
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
  activateBillingTab("plans");
  renderAllUi();
  loadAdminPortal();
})();

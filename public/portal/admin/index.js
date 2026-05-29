(() => {
  const adminWelcomeText = document.getElementById("adminWelcomeText");
  const adminUserChip = document.getElementById("adminUserChip");
  const adminLogoutBtn = document.getElementById("adminLogoutBtn");
  const adminStatus = document.getElementById("adminStatus");
  const adminNavLinks = Array.from(document.querySelectorAll("[data-admin-target]"));
  const adminPanels = Array.from(document.querySelectorAll("[data-admin-panel]"));
  const adminStatsGrid = document.getElementById("adminStatsGrid");
  const adminVerificationQueue = document.getElementById("adminVerificationQueue");
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
  const adminStoresTable = document.getElementById("adminStoresTable");
  const adminJobsTable = document.getElementById("adminJobsTable");
  const adminBillingGrid = document.getElementById("adminBillingGrid");
  const adminAuditList = document.getElementById("adminAuditList");

  let adminPaymentOrders = [];
  let activeReviewOrderId = null;
  const paymentFilterState = {
    search: "",
    statusFilters: new Set(),
    proofFilters: new Set(),
    dateMode: "all",
    date: "",
    startDate: "",
    endDate: ""
  };

  const stats = [
    { label: "Menunggu Verifikasi", value: "8", tone: "warning", caption: "Order dengan bukti pembayaran" },
    { label: "Toko Aktif", value: "124", tone: "success", caption: "Memiliki kredit atau client aktif" },
    { label: "Client Online", value: "72", tone: "info", caption: "Siap menerima tugas" },
    { label: "Job Hari Ini", value: "318", tone: "neutral", caption: "Dari seluruh toko" },
    { label: "Estimasi Dana", value: "Rp 2,8 jt", tone: "accent", caption: "Order paid bulan ini" }
  ];

  const payments = [
    { id: "ORD-2405-1081", account: "printaja", store: "Print Aja", plan: "Pro", total: "Rp 20.000", status: "waiting_verification", proof: "jpg", age: "12 menit" },
    { id: "ORD-2405-1078", account: "yefta", store: "Kopi Print", plan: "Starter", total: "Rp 13.000", status: "waiting_verification", proof: "pdf", age: "36 menit" },
    { id: "ORD-2405-1073", account: "snapdoc", store: "Snapdoc", plan: "Buy Credit", total: "Rp 5.000", status: "pending_payment", proof: "-", age: "2 jam" },
    { id: "ORD-2405-1067", account: "kampuscopy", store: "Kampus Copy", plan: "Pro", total: "Rp 20.000", status: "paid", proof: "png", age: "Kemarin" }
  ];

  const stores = [
    { name: "Print Aja", code: "PRTAJA", client: "2 online", credit: "2.430", lastOrder: "Pro · hari ini", status: "Aktif" },
    { name: "Kopi Print", code: "KOPI01", client: "1 online", credit: "875", lastOrder: "Starter · 28 Mei", status: "Aktif" },
    { name: "Snapdoc", code: "SNAP12", client: "offline", credit: "0", lastOrder: "Pending", status: "Perlu kredit" },
    { name: "Kampus Copy", code: "KAMPUS", client: "3 online", credit: "4.180", lastOrder: "Top up · 27 Mei", status: "Aktif" }
  ];

  const jobs = [
    { id: "JOB-8F21", store: "Print Aja", session: "SES-54A2", file: "skripsi.pdf", price: "Rp 7.000", status: "done", time: "09:42" },
    { id: "JOB-8F17", store: "Kampus Copy", session: "SES-549B", file: "materi-uts.pdf", price: "Rp 12.000", status: "sent", time: "09:35" },
    { id: "JOB-8F0C", store: "Kopi Print", session: "SES-5481", file: "proposal.docx", price: "Rp 4.000", status: "pending", time: "09:11" },
    { id: "JOB-8EFE", store: "Snapdoc", session: "SES-5403", file: "not-available", price: "Rp 0", status: "canceled", time: "08:58" }
  ];

  const signals = [
    { title: "Storage file job", value: "68%", status: "Normal" },
    { title: "Session timeout", value: "11 batal otomatis", status: "Dipantau" },
    { title: "Client tanpa owner", value: "3 client", status: "Perlu cek" },
    { title: "Order pending > 24 jam", value: "5 order", status: "Perlu tindak" }
  ];

  const billingItems = [
    { title: "Plan Aktif", value: "Free, Starter, Pro, Buy Credit", caption: "Harga dan kredit mengikuti tabel plans." },
    { title: "Kupon Aktif", value: "6 kupon", caption: "Validasi usage limit, expired date, dan plan scope." },
    { title: "Credit Batch", value: "184 batch", caption: "Dipakai FIFO berdasarkan source dan masa berlaku." },
    { title: "Credit Usage", value: "1.942 pemakaian", caption: "Terikat ke job saat tugas dieksekusi." }
  ];

  const audits = [
    { time: "09:45", actor: "system", action: "job.status.updated", target: "JOB-8F21", detail: "done" },
    { time: "09:39", actor: "admin", action: "order.review.placeholder", target: "ORD-2405-1081", detail: "menunggu verifikasi" },
    { time: "09:14", actor: "printaja", action: "client.heartbeat", target: "Canon G1030", detail: "online" },
    { time: "08:59", actor: "system", action: "session.timeout", target: "SES-5403", detail: "job dibatalkan" }
  ];

  function setStatus(text, kind = "") {
    adminStatus.textContent = text || "";
    adminStatus.className = kind ? `status admin-status ${kind}` : "status admin-status";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setReviewStatus(text, kind = "") {
    adminPaymentReviewStatus.textContent = text || "";
    adminPaymentReviewStatus.className = kind ? `status ${kind}` : "status";
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

  function statusClass(status) {
    const normalized = String(status || "").toLowerCase();
    if (["paid", "done", "sent", "aktif", "normal"].includes(normalized)) return "online";
    if (["waiting_verification", "pending", "dipantau"].includes(normalized)) return "warning";
    if (["canceled", "rejected", "perlu kredit", "perlu cek", "perlu tindak"].includes(normalized)) return "offline";
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
      canceled: "Batal"
    };
    return labels[String(status || "").toLowerCase()] || status || "-";
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

  function renderStats() {
    adminStatsGrid.innerHTML = stats.map(item => `
      <article class="admin-stat-card ${escapeHtml(item.tone)}">
        <span>${escapeHtml(item.label)}</span>
        <strong>${escapeHtml(item.value)}</strong>
        <small>${escapeHtml(item.caption)}</small>
      </article>
    `).join("");
  }

  function renderVerificationQueue() {
    const source = adminPaymentOrders.length ? adminPaymentOrders : payments;
    adminVerificationQueue.innerHTML = source
      .filter(item => item.status === "waiting_verification")
      .map(item => `
        <div class="admin-queue-item">
          <div>
            <strong>${escapeHtml(item.user?.storeName || item.store || item.user?.username || "-")}</strong>
            <span>${escapeHtml(item.id)} · ${escapeHtml(item.plan?.name || item.plan || "-")} · ${escapeHtml(item.age || formatDateTime(item.createdAt))}</span>
          </div>
          <b>${escapeHtml(item.total || formatCurrency(item.totalIdr))}</b>
        </div>
      `).join("");
  }

  function renderSignals() {
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

  function getFilteredPaymentOrders() {
    const search = String(paymentFilterState.search || "").trim().toLowerCase();
    return adminPaymentOrders
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
      adminPaymentsTable.innerHTML = '<tr><td colspan="7" class="muted-cell">Tidak ada order sesuai filter.</td></tr>';
      return;
    }
    adminPaymentsTable.innerHTML = rows.map(item => `
      <tr>
        <td><strong>${escapeHtml(item.id)}</strong><span>${escapeHtml(formatDateTime(item.createdAt))}</span></td>
        <td><strong>${escapeHtml(item.user?.storeName || item.user?.username || "-")}</strong><span>@${escapeHtml(item.user?.username || "-")} · ${escapeHtml(item.user?.kodeToko || "-")}</span></td>
        <td>${escapeHtml(item.plan?.name || "-")}</td>
        <td>${escapeHtml(formatCurrency(item.totalIdr))}</td>
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

  function renderStores() {
    adminStoresTable.innerHTML = stores.map(item => `
      <tr>
        <td><strong>${escapeHtml(item.name)}</strong></td>
        <td>${escapeHtml(item.code)}</td>
        <td>${escapeHtml(item.client)}</td>
        <td>${escapeHtml(item.credit)} kredit</td>
        <td>${escapeHtml(item.lastOrder)}</td>
        <td><span class="status-pill ${statusClass(item.status)}">${escapeHtml(item.status)}</span></td>
      </tr>
    `).join("");
  }

  function renderJobs() {
    adminJobsTable.innerHTML = jobs.map(item => `
      <tr>
        <td><strong>${escapeHtml(item.id)}</strong></td>
        <td>${escapeHtml(item.store)}</td>
        <td>${escapeHtml(item.session)}</td>
        <td>${escapeHtml(item.file)}</td>
        <td>${escapeHtml(item.price)}</td>
        <td><span class="status-pill ${statusClass(item.status)}">${escapeHtml(statusLabel(item.status))}</span></td>
        <td>${escapeHtml(item.time)}</td>
      </tr>
    `).join("");
  }

  function renderBilling() {
    adminBillingGrid.innerHTML = billingItems.map(item => `
      <article class="admin-billing-card">
        <span>${escapeHtml(item.title)}</span>
        <strong>${escapeHtml(item.value)}</strong>
        <p>${escapeHtml(item.caption)}</p>
      </article>
    `).join("");
  }

  function renderAudit() {
    adminAuditList.innerHTML = audits.map(item => `
      <article class="admin-audit-item">
        <time>${escapeHtml(item.time)}</time>
        <div>
          <strong>${escapeHtml(item.action)}</strong>
          <span>${escapeHtml(item.actor)} · ${escapeHtml(item.target)} · ${escapeHtml(item.detail)}</span>
        </div>
      </article>
    `).join("");
  }

  function renderDummyDashboard() {
    renderStats();
    renderVerificationQueue();
    renderSignals();
    renderPayments();
    renderStores();
    renderJobs();
    renderBilling();
    renderAudit();
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

  function renderPaymentStats() {
    if (!adminPaymentOrders.length) return;
    const waitingCount = adminPaymentOrders.filter(order => order.status === "waiting_verification").length;
    const paidOrders = adminPaymentOrders.filter(order => order.status === "paid");
    const paidTotal = paidOrders.reduce((sum, order) => sum + Number(order.totalIdr || 0), 0);
    stats[0].value = String(waitingCount);
    stats[4].value = formatCurrency(paidTotal).replace(",00", "");
    renderStats();
    renderVerificationQueue();
  }

  async function loadAdminPayments() {
    setStatus("Memuat data pembayaran...");
    try {
      const body = await window.PortalAuth.apiJson("/api/billing/admin/orders", { method: "GET" });
      adminPaymentOrders = Array.isArray(body.orders) ? body.orders : [];
      renderPayments();
      renderPaymentStats();
      setStatus("");
    } catch (err) {
      setStatus(err.message || "Gagal memuat pembayaran.", "error");
      adminPaymentOrders = [];
      renderPayments();
    }
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
        <div><dt>Subtotal</dt><dd>${escapeHtml(formatCurrency(order.subtotalIdr))}</dd></div>
        <div><dt>Diskon</dt><dd>${escapeHtml(formatCurrency(order.discountIdr))}${order.couponCode ? ` · ${escapeHtml(order.couponCode)}` : ""}</dd></div>
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
    try {
      const body = await window.PortalAuth.apiJson(`/api/billing/admin/orders/${encodeURIComponent(orderId)}`, { method: "GET" });
      const order = body.order;
      renderPaymentReviewDetail(order);
      renderProofPreview(order);
      setReviewStatus("");
    } catch (err) {
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
      renderDummyDashboard();
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

  document.querySelectorAll("[data-admin-jump]").forEach(button => {
    button.addEventListener("click", () => activatePanel(button.dataset.adminJump));
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
  document.querySelectorAll("[data-admin-close]").forEach(button => {
    button.addEventListener("click", () => closeModal(document.getElementById(button.dataset.adminClose)));
  });
  [adminPaymentReviewModalBackdrop, adminPaymentFilterModalBackdrop].forEach(backdrop => {
    backdrop.addEventListener("click", event => {
      if (event.target === backdrop) closeModal(backdrop);
    });
  });

  adminLogoutBtn.addEventListener("click", async () => {
    setStatus("Logout...");
    await window.PortalAuth.logoutCurrentSession();
    window.location.href = "/portal/";
  });

  loadAdminPortal();
})();

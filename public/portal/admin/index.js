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
  const adminStoresTable = document.getElementById("adminStoresTable");
  const adminJobsTable = document.getElementById("adminJobsTable");
  const adminBillingGrid = document.getElementById("adminBillingGrid");
  const adminAuditList = document.getElementById("adminAuditList");

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
    adminVerificationQueue.innerHTML = payments
      .filter(item => item.status === "waiting_verification")
      .map(item => `
        <div class="admin-queue-item">
          <div>
            <strong>${escapeHtml(item.store)}</strong>
            <span>${escapeHtml(item.id)} · ${escapeHtml(item.plan)} · ${escapeHtml(item.age)}</span>
          </div>
          <b>${escapeHtml(item.total)}</b>
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

  function renderPayments() {
    adminPaymentsTable.innerHTML = payments.map(item => `
      <tr>
        <td><strong>${escapeHtml(item.id)}</strong><span>${escapeHtml(item.age)}</span></td>
        <td><strong>${escapeHtml(item.store)}</strong><span>@${escapeHtml(item.account)}</span></td>
        <td>${escapeHtml(item.plan)}</td>
        <td>${escapeHtml(item.total)}</td>
        <td><span class="status-pill ${statusClass(item.status)}">${escapeHtml(statusLabel(item.status))}</span></td>
        <td>${escapeHtml(item.proof)}</td>
        <td>
          <div class="admin-row-actions">
            <button class="btn btn-outline btn-compact" type="button">Detail</button>
            <button class="btn btn-primary btn-compact" type="button">Review</button>
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

  adminLogoutBtn.addEventListener("click", async () => {
    setStatus("Logout...");
    await window.PortalAuth.logoutCurrentSession();
    window.location.href = "/portal/";
  });

  loadAdminPortal();
})();

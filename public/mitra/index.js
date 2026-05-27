(() => {
  const authShell = document.querySelector(".auth-shell");
  const dashboardShell = document.getElementById("dashboardShell");
  const dashboardUserChip = document.getElementById("dashboardUserChip");
  const dashboardStoreCode = document.getElementById("dashboardStoreCode");
  const dashboardLastSync = document.getElementById("dashboardLastSync");

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
  const statFilesDeleted = document.getElementById("statFilesDeleted");

  const storeSettingsForm = document.getElementById("storeSettingsForm");
  const serviceSettingsForm = document.getElementById("serviceSettingsForm");
  const storeSettingsStatus = document.getElementById("storeSettingsStatus");
  const serviceSettingsStatus = document.getElementById("serviceSettingsStatus");

  const accountUsername = document.getElementById("accountUsername");
  const accountPinStatus = document.getElementById("accountPinStatus");
  const activityList = document.getElementById("activityList");

  const registerModalBackdrop = document.getElementById("registerModalBackdrop");
  const openRegisterBtn = document.getElementById("openRegisterBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const toLoginBtn = document.getElementById("toLoginBtn");

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  const loginStatus = document.getElementById("loginStatus");
  const registerStatus = document.getElementById("registerStatus");

  const unbindInProgress = new Set();
  let currentUser = null;
  let latestClients = [];
  let latestJobs = [];

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
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal(modal) {
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
    const deletedFiles = jobs.filter(job => Boolean(job.fileDeleted || job.fileRemoved || job.removedFileAt));

    statClientOnline.textContent = onlineClients.length;
    statJobsToday.textContent = jobsToday.length;
    statJobsDone.textContent = doneJobs.length;
    statJobsFailed.textContent = failedJobs.length;
    statFilesDeleted.textContent = deletedFiles.length;
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
    const paperTypes = Array.isArray(service.jenisKertas)
      ? service.jenisKertas.join(", ")
      : "A4, A5, F4";

    storeSettingsForm.elements.storeName.value = config.namaToko || user?.username || "";
    storeSettingsForm.elements.kodeToko.value = user?.kodeToko || "";
    storeSettingsForm.elements.storeStatus.value = config.statusToko || "open";
    storeSettingsForm.elements.storeHours.value = config.jamOperasional || "Setiap hari 08.00 - 21.00";
    storeSettingsForm.elements.storeContact.value = config.kontak || "";
    storeSettingsForm.elements.storeAddress.value = user?.alamat || "";

    serviceSettingsForm.elements.paperTypes.value = paperTypes;
    serviceSettingsForm.elements.colorMode.value = service.modeWarna || "both";
    serviceSettingsForm.elements.basePrice.value = Number.isFinite(Number(service.hargaDasar))
      ? String(Number(service.hargaDasar))
      : "";
    serviceSettingsForm.elements.fileLimitMb.value = Number.isFinite(Number(service.batasFileMb))
      ? String(Number(service.batasFileMb))
      : "25";

    dashboardUserChip.textContent = user?.username ? `@${user.username}` : "Akun Mitra";
    dashboardStoreCode.textContent = `Kode toko: ${user?.kodeToko || "-"}`;
    accountUsername.textContent = user?.username ? `@${user.username}` : "-";
    accountPinStatus.textContent = user?.hasPin ? "Aktif" : "Belum diatur";
  }

  function buildSettingsPayload() {
    const paperTypes = String(serviceSettingsForm.elements.paperTypes.value || "")
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);

    return {
      storeName: String(storeSettingsForm.elements.storeName.value || "").trim(),
      kodeToko: String(storeSettingsForm.elements.kodeToko.value || "").trim(),
      statusToko: String(storeSettingsForm.elements.storeStatus.value || "open"),
      jamOperasional: String(storeSettingsForm.elements.storeHours.value || "").trim(),
      kontak: String(storeSettingsForm.elements.storeContact.value || "").trim(),
      alamat: String(storeSettingsForm.elements.storeAddress.value || "").trim(),
      layanan: {
        jenisKertas: paperTypes,
        modeWarna: String(serviceSettingsForm.elements.colorMode.value || "both"),
        hargaDasar: Number(serviceSettingsForm.elements.basePrice.value || 0),
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

    document.querySelectorAll("[data-close]").forEach(button => {
      button.addEventListener("click", () => {
        const targetId = button.getAttribute("data-close");
        const target = document.getElementById(targetId);
        if (target) {
          closeModal(target);
        }
      });
    });

    [registerModalBackdrop].forEach(modal => {
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
    storeSettingsForm.addEventListener("submit", event => {
      event.preventDefault();
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
})();

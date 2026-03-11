(() => {
  const guestActions = document.getElementById("guestActions");
  const userActions = document.getElementById("userActions");
  const userChip = document.getElementById("userChip");
  const heroText = document.getElementById("heroText");
  const heroStatus = document.getElementById("heroStatus");
  const linkedClientsSection = document.getElementById("linkedClientsSection");
  const linkedClientsStatus = document.getElementById("linkedClientsStatus");
  const linkedClientsBody = document.getElementById("linkedClientsBody");
  const refreshLinkedClientsBtn = document.getElementById("refreshLinkedClientsBtn");

  const loginModalBackdrop = document.getElementById("loginModalBackdrop");
  const registerModalBackdrop = document.getElementById("registerModalBackdrop");

  const openLoginBtn = document.getElementById("openLoginBtn");
  const openRegisterBtn = document.getElementById("openRegisterBtn");
  const openAccountBtn = document.getElementById("openAccountBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const toRegisterBtn = document.getElementById("toRegisterBtn");
  const toLoginBtn = document.getElementById("toLoginBtn");

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  const loginStatus = document.getElementById("loginStatus");
  const registerStatus = document.getElementById("registerStatus");

  const unbindInProgress = new Set();

  function setStatus(el, text, kind = "") {
    if (!el) {
      return;
    }
    el.textContent = text || "";
    el.className = kind ? `status ${kind}` : "status";
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
    if (normalized === "not_ready") {
      return "belum login";
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

    return timestamp.toLocaleString();
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
      const unbindLabel = disableUnbind ? "Unbind..." : "Unbind";

      return `
        <tr>
          <td>${escapeHtml(client.name || "-")}</td>
          <td><code>${escapeHtml(client.id || "-")}</code></td>
          <td>${escapeHtml(status)} / ${escapeHtml(readiness)}</td>
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

  async function loadLinkedClients() {
    const authState = window.MitraAuth.getState();
    if (!authState?.accessToken) {
      setLinkedClientsEmpty("Silakan login untuk melihat daftar client.");
      setStatus(linkedClientsStatus, "");
      return;
    }

    setStatus(linkedClientsStatus, "Memuat daftar client terhubung...");

    try {
      const clients = await window.MitraAuth.apiJson("/api/clients", { method: "GET" });
      const ownedClients = Array.isArray(clients)
        ? clients.filter(client => Boolean(client?.recognized))
        : [];

      renderLinkedClients(ownedClients);

      if (ownedClients.length === 0) {
        setStatus(linkedClientsStatus, "Belum ada client yang terhubung.");
        return;
      }

      setStatus(linkedClientsStatus, `${ownedClients.length} client terhubung ditemukan.`, "success");
    } catch (err) {
      setLinkedClientsEmpty("Gagal memuat daftar client terhubung.");
      setStatus(linkedClientsStatus, err.message || "Gagal memuat daftar client.", "error");
    }
  }

  async function unbindClient(clientId, clientName) {
    const safeClientId = String(clientId || "").trim();
    if (!safeClientId) {
      return;
    }

    const confirmed = window.confirm(`Lepas binding client \"${clientName || "client"}\" dari akun ini?`);
    if (!confirmed) {
      return;
    }

    unbindInProgress.add(safeClientId);
    await loadLinkedClients();
    setStatus(linkedClientsStatus, `Melepas binding ${clientName || "client"}...`);

    try {
      await window.MitraAuth.apiJson(`/api/clients/${encodeURIComponent(safeClientId)}/unbind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      setStatus(heroStatus, `Client ${clientName || "client"} berhasil di-unbind.`, "success");
      setStatus(linkedClientsStatus, `Client ${clientName || "client"} berhasil di-unbind.`, "success");
    } catch (err) {
      setStatus(linkedClientsStatus, err.message || "Gagal melakukan unbind client.", "error");
    } finally {
      unbindInProgress.delete(safeClientId);
      await loadLinkedClients();
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

  function renderAuthedState(user) {
    guestActions.classList.add("hidden");
    userActions.classList.remove("hidden");
    linkedClientsSection.classList.remove("hidden");
    userChip.textContent = user?.username ? `@${user.username}` : "Akun Mitra";
    heroText.textContent = "Akun sudah aktif. Gunakan tombol Akun untuk mengubah data profil atau password.";
  }

  function renderGuestState() {
    guestActions.classList.remove("hidden");
    userActions.classList.add("hidden");
    linkedClientsSection.classList.add("hidden");
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

    const user = state.user || await syncMe();
    if (!user) {
      renderGuestState();
      return;
    }

    renderAuthedState(user);
    await loadLinkedClients();
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
      setStatus(heroStatus, "Selamat datang kembali.", "success");
      closeModal(loginModalBackdrop);
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
      setStatus(heroStatus, "Akun aktif. Anda sekarang login sebagai mitra.", "success");
      closeModal(registerModalBackdrop);
      registerForm.reset();
      await renderAuthState();
    } catch (err) {
      setStatus(registerStatus, err.message || "Daftar gagal.", "error");
    }
  }

  async function onLogout() {
    await window.MitraAuth.logoutCurrentSession();
    setStatus(heroStatus, "Anda sudah logout.", "success");
    renderGuestState();
  }

  function bindModalHandlers() {
    openLoginBtn.addEventListener("click", () => {
      setStatus(loginStatus, "");
      openModal(loginModalBackdrop);
    });

    openRegisterBtn.addEventListener("click", () => {
      setStatus(registerStatus, "");
      openModal(registerModalBackdrop);
    });

    toRegisterBtn.addEventListener("click", () => {
      closeModal(loginModalBackdrop);
      setStatus(registerStatus, "");
      openModal(registerModalBackdrop);
    });

    toLoginBtn.addEventListener("click", () => {
      closeModal(registerModalBackdrop);
      setStatus(loginStatus, "");
      openModal(loginModalBackdrop);
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

    [loginModalBackdrop, registerModalBackdrop].forEach(modal => {
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

    refreshLinkedClientsBtn.addEventListener("click", loadLinkedClients);

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

    openAccountBtn.addEventListener("click", () => {
      window.location.href = "/mitra/account/";
    });

    logoutBtn.addEventListener("click", onLogout);
  }

  bindModalHandlers();
  bindActionHandlers();
  renderAuthState();
})();

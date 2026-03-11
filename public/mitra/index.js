(() => {
  const guestActions = document.getElementById("guestActions");
  const userActions = document.getElementById("userActions");
  const userChip = document.getElementById("userChip");
  const heroText = document.getElementById("heroText");
  const heroStatus = document.getElementById("heroStatus");

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
    userChip.textContent = user?.username ? `@${user.username}` : "Akun Mitra";
    heroText.textContent = "Akun sudah aktif. Gunakan tombol Akun untuk mengubah data profil atau password.";
  }

  function renderGuestState() {
    guestActions.classList.remove("hidden");
    userActions.classList.add("hidden");
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

    openAccountBtn.addEventListener("click", () => {
      window.location.href = "/mitra/account/";
    });

    logoutBtn.addEventListener("click", onLogout);
  }

  bindModalHandlers();
  bindActionHandlers();
  renderAuthState();
})();

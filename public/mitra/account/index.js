(() => {
  const logoutBtn = document.getElementById("logoutBtn");
  const authRequiredPanel = document.getElementById("authRequiredPanel");
  const accountGrid = document.getElementById("accountGrid");

  const profileForm = document.getElementById("profileForm");
  const passwordForm = document.getElementById("passwordForm");
  const pinForm = document.getElementById("pinForm");

  const profileStatus = document.getElementById("profileStatus");
  const passwordStatus = document.getElementById("passwordStatus");
  const pinStatus = document.getElementById("pinStatus");

  function setStatus(el, text, kind = "") {
    if (!el) {
      return;
    }

    el.textContent = text || "";
    el.className = kind ? `status ${kind}` : "status";
  }

  function fillProfileForm(user) {
    if (!user) {
      return;
    }

    profileForm.elements.username.value = user.username || "";
    profileForm.elements.email.value = user.email || "";
  }

  function showGuestView() {
    authRequiredPanel.classList.remove("hidden");
    accountGrid.classList.add("hidden");
  }

  function showAccountView() {
    authRequiredPanel.classList.add("hidden");
    accountGrid.classList.remove("hidden");
  }

  async function loadCurrentUser() {
    const state = window.MitraAuth.getState();
    if (!state?.accessToken) {
      showGuestView();
      return null;
    }

    try {
      const res = await window.MitraAuth.apiJson("/api/auth/me", {
        method: "GET"
      });

      const nextState = {
        ...window.MitraAuth.getState(),
        user: res.user
      };
      window.MitraAuth.saveState(nextState);
      showAccountView();
      fillProfileForm(res.user);
      return res.user;
    } catch {
      window.MitraAuth.clearState();
      showGuestView();
      return null;
    }
  }

  async function onProfileSubmit(event) {
    event.preventDefault();
    setStatus(profileStatus, "Menyimpan profil...");

    const username = String(profileForm.elements.username.value || "").trim();
    const email = String(profileForm.elements.email.value || "").trim();

    try {
      const body = await window.MitraAuth.apiJson("/api/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          email
        })
      });

      const nextState = {
        ...window.MitraAuth.getState(),
        user: body.user
      };
      window.MitraAuth.saveState(nextState);
      fillProfileForm(body.user);
      setStatus(profileStatus, "Profil berhasil diperbarui.", "success");
    } catch (err) {
      setStatus(profileStatus, err.message || "Gagal memperbarui profil.", "error");
    }
  }

  async function onPasswordSubmit(event) {
    event.preventDefault();
    setStatus(passwordStatus, "Memperbarui password...");

    const currentPassword = String(passwordForm.elements.currentPassword.value || "");
    const newPassword = String(passwordForm.elements.newPassword.value || "");
    const confirmPassword = String(passwordForm.elements.confirmPassword.value || "");

    if (newPassword !== confirmPassword) {
      setStatus(passwordStatus, "Konfirmasi password tidak sama.", "error");
      return;
    }

    try {
      await window.MitraAuth.apiJson("/api/auth/me/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      passwordForm.reset();
      setStatus(passwordStatus, "Password berhasil diubah. Anda akan logout otomatis.", "success");

      setTimeout(async () => {
        await window.MitraAuth.logoutCurrentSession();
        window.location.href = "/mitra/";
      }, 900);
    } catch (err) {
      setStatus(passwordStatus, err.message || "Gagal memperbarui password.", "error");
    }
  }

  async function onPinSubmit(event) {
    event.preventDefault();
    setStatus(pinStatus, "Menyimpan PIN...");

    const currentPassword = String(pinForm.elements.currentPassword.value || "");
    const pin = String(pinForm.elements.pin.value || "").trim();
    const confirmPin = String(pinForm.elements.confirmPin.value || "").trim();

    if (!/^\d{4,8}$/.test(pin)) {
      setStatus(pinStatus, "PIN harus 4-8 digit angka.", "error");
      return;
    }

    if (pin !== confirmPin) {
      setStatus(pinStatus, "Konfirmasi PIN tidak sama.", "error");
      return;
    }

    try {
      await window.MitraAuth.apiJson("/api/auth/me/pin", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          currentPassword,
          pin
        })
      });

      pinForm.reset();
      setStatus(pinStatus, "PIN berhasil disimpan.", "success");
    } catch (err) {
      setStatus(pinStatus, err.message || "Gagal menyimpan PIN.", "error");
    }
  }

  async function onLogout() {
    await window.MitraAuth.logoutCurrentSession();
    window.location.href = "/mitra/";
  }

  logoutBtn.addEventListener("click", onLogout);
  profileForm.addEventListener("submit", onProfileSubmit);
  passwordForm.addEventListener("submit", onPasswordSubmit);
  pinForm.addEventListener("submit", onPinSubmit);

  loadCurrentUser();
})();

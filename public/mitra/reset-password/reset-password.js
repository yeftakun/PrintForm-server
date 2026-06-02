(() => {
  const params = new URLSearchParams(window.location.search);
  const token = String(params.get("token") || "").trim();

  const resetPasswordCopy = document.getElementById("resetPasswordCopy");
  const resetPasswordStatus = document.getElementById("resetPasswordStatus");
  const resetPasswordForm = document.getElementById("resetPasswordForm");
  const backToLoginBtn = document.getElementById("backToLoginBtn");
  const saveResetPasswordBtn = document.getElementById("saveResetPasswordBtn");

  function setStatus(text, kind = "") {
    resetPasswordStatus.textContent = text || "";
    resetPasswordStatus.className = kind ? `status ${kind}` : "status";
  }

  function showInvalidToken() {
    resetPasswordCopy.textContent = "Tautan reset password tidak valid atau sudah kedaluwarsa.";
    setStatus("Tautan reset password tidak valid atau sudah kedaluwarsa.", "error");
    resetPasswordForm.classList.add("hidden");
    backToLoginBtn.classList.remove("hidden");
  }

  function showValidToken() {
    resetPasswordCopy.textContent = "Masukkan password baru untuk akun mitra Anda.";
    setStatus("");
    resetPasswordForm.classList.remove("hidden");
    backToLoginBtn.classList.add("hidden");
    resetPasswordForm.elements.password?.focus();
  }

  function showSuccess() {
    resetPasswordCopy.textContent = "Password Anda sudah diperbarui.";
    setStatus("Password berhasil direset. Silakan login dengan password baru.", "success");
    resetPasswordForm.classList.add("hidden");
    backToLoginBtn.classList.remove("hidden");
  }

  async function requestJson(input, init = {}) {
    const response = await fetch(input, init);
    let body = null;

    try {
      body = await response.json();
    } catch {
      body = null;
    }

    if (!response.ok) {
      throw new Error(body?.error || body?.message || `Request failed (${response.status})`);
    }

    return body;
  }

  async function validateToken() {
    if (!token) {
      showInvalidToken();
      return;
    }

    try {
      const body = await requestJson(`/api/auth/reset-password/validate?token=${encodeURIComponent(token)}`);
      if (body?.valid) {
        showValidToken();
        return;
      }
      showInvalidToken();
    } catch {
      showInvalidToken();
    }
  }

  async function submitResetPassword(event) {
    event.preventDefault();

    const password = String(resetPasswordForm.elements.password.value || "");
    const passwordConfirm = String(resetPasswordForm.elements.passwordConfirm.value || "");

    if (password !== passwordConfirm) {
      setStatus("Konfirmasi password tidak sama.", "error");
      resetPasswordForm.elements.passwordConfirm?.focus();
      return;
    }

    saveResetPasswordBtn.disabled = true;
    setStatus("Menyimpan password baru...");

    try {
      await requestJson("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, passwordConfirm })
      });
      resetPasswordForm.reset();
      showSuccess();
    } catch (err) {
      setStatus(err.message || "Gagal mereset password.", "error");
    } finally {
      saveResetPasswordBtn.disabled = false;
    }
  }

  document.querySelectorAll("[data-password-toggle]").forEach(button => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.target);
      if (!target) {
        return;
      }

      const shouldShow = target.type === "password";
      target.type = shouldShow ? "text" : "password";
      button.classList.toggle("is-visible", shouldShow);
      button.setAttribute("aria-label", shouldShow ? "Sembunyikan password" : "Tampilkan password");
    });
  });

  resetPasswordForm.addEventListener("submit", submitResetPassword);
  validateToken();
})();

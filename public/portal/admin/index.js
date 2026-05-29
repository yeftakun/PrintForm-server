(() => {
  const adminWelcomeText = document.getElementById("adminWelcomeText");
  const adminLogoutBtn = document.getElementById("adminLogoutBtn");
  const adminStatus = document.getElementById("adminStatus");

  function setStatus(text, kind = "") {
    adminStatus.textContent = text || "";
    adminStatus.className = kind ? `status ${kind}` : "status";
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

      adminWelcomeText.textContent = `Login admin ${user.username || "-"}.`;
      setStatus("");
    } catch {
      window.PortalAuth.clearState();
      window.location.href = "/portal/";
    }
  }

  adminLogoutBtn.addEventListener("click", async () => {
    setStatus("Logout...");
    await window.PortalAuth.logoutCurrentSession();
    window.location.href = "/portal/";
  });

  loadAdminPortal();
})();

(() => {
  const STORAGE_KEY = "printorderPortalAuth";
  const LAST_ACTIVITY_KEY = "printorderPortalLastActivityAt";
  const LAST_ACTIVITY_SCOPES = ["portal", "admin", "mitra"];
  const EXPIRED_REASON_KEY = "printorderPortalAuthExpiredReason";
  const DEFAULT_LOGIN_PATH = "/portal/";
  const DEFAULT_CHECK_INTERVAL_MS = 15000;
  const ACTIVITY_THROTTLE_MS = 1000;
  let sessionWatcher = null;
  let lastActivityWriteAt = 0;

  function safeParse(value) {
    if (!value || typeof value !== "string") {
      return null;
    }

    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  }

  function getState() {
    return safeParse(localStorage.getItem(STORAGE_KEY));
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (state?.accessToken) {
      writeLastActivityAt(Date.now(), sessionWatcher?.scope);
    }
  }

  function clearState() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    LAST_ACTIVITY_SCOPES.forEach(scope => {
      localStorage.removeItem(getActivityKey(scope));
    });
  }

  function getRequestPath(input) {
    try {
      return new URL(input, window.location.origin).pathname;
    } catch {
      return "";
    }
  }

  function isPublicAuthEndpoint(input) {
    const path = getRequestPath(input);
    return [
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/forgot-password",
      "/api/auth/reset-password"
    ].some(endpoint => path === endpoint || path.startsWith(`${endpoint}/`));
  }

  function normalizePath(path) {
    try {
      return new URL(path || DEFAULT_LOGIN_PATH, window.location.origin).pathname;
    } catch {
      return DEFAULT_LOGIN_PATH;
    }
  }

  function redirectToLogin(loginPath = DEFAULT_LOGIN_PATH) {
    const targetPath = normalizePath(loginPath);
    if (window.location.pathname === targetPath) {
      window.location.reload();
      return;
    }

    window.location.href = targetPath;
  }

  function writeExpiredReason(reason) {
    try {
      sessionStorage.setItem(EXPIRED_REASON_KEY, reason);
    } catch {
      // Session storage can be unavailable in strict browser modes.
    }
  }

  function getActivityKey(scope = "portal") {
    return `${LAST_ACTIVITY_KEY}:${scope || "portal"}`;
  }

  function writeLastActivityAt(value = Date.now(), scope = "portal") {
    localStorage.setItem(getActivityKey(scope), String(value));
  }

  function getLastActivityAt(scope = "portal") {
    const value = Number(localStorage.getItem(getActivityKey(scope)));
    if (Number.isFinite(value) && value > 0) {
      return value;
    }

    const current = Date.now();
    writeLastActivityAt(current, scope);
    return current;
  }

  function isRefreshTokenExpired(state) {
    if (!state?.refreshTokenExpiresAt) {
      return false;
    }

    const expiresAt = Date.parse(state.refreshTokenExpiresAt);
    return Number.isFinite(expiresAt) && expiresAt <= Date.now();
  }

  function revokeRefreshToken(state) {
    if (!state?.refreshToken) {
      return;
    }

    try {
      fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ refreshToken: state.refreshToken }),
        keepalive: true
      });
    } catch {
      // Best-effort session revocation.
    }
  }

  function expireSession(reason = "expired", options = {}) {
    const state = getState();
    const loginPath = options.loginPath || sessionWatcher?.loginPath || DEFAULT_LOGIN_PATH;
    const shouldRedirect = options.redirect !== false;

    revokeRefreshToken(state);
    clearState();
    writeExpiredReason(reason);

    if (shouldRedirect) {
      redirectToLogin(loginPath);
    }
  }

  async function refreshAccessToken() {
    const current = getState();
    const refreshToken = current?.refreshToken;
    if (!refreshToken) {
      return null;
    }

    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ refreshToken })
    });

    if (!res.ok) {
      clearState();
      return null;
    }

    const body = await res.json();
    const next = {
      accessToken: body.accessToken,
      refreshToken: body.refreshToken,
      accessTokenTtl: body.accessTokenTtl,
      refreshTokenExpiresAt: body.refreshTokenExpiresAt,
      user: body.user || current?.user || null
    };

    saveState(next);
    return next;
  }

  async function apiFetch(input, init = {}, { retry = true } = {}) {
    const state = getState();
    const headers = new Headers(init.headers || {});
    const publicAuthRequest = isPublicAuthEndpoint(input);

    if (state?.accessToken && !headers.has("Authorization") && !publicAuthRequest) {
      headers.set("Authorization", `Bearer ${state.accessToken}`);
    }

    const hadAuth = headers.has("Authorization");
    const response = await fetch(input, {
      ...init,
      headers
    });

    if (response.status !== 401 || !retry || publicAuthRequest) {
      return response;
    }

    const refreshed = await refreshAccessToken();
    if (!refreshed?.accessToken) {
      if (hadAuth) {
        expireSession("expired");
      }
      return response;
    }

    const retryHeaders = new Headers(init.headers || {});
    retryHeaders.set("Authorization", `Bearer ${refreshed.accessToken}`);
    const retryResponse = await fetch(input, {
      ...init,
      headers: retryHeaders
    });

    if (retryResponse.status === 401 && hadAuth) {
      expireSession("expired");
    }

    return retryResponse;
  }

  async function apiJson(input, init = {}, options = {}) {
    const response = await apiFetch(input, init, options);
    let body = null;

    try {
      body = await response.json();
    } catch {
      body = null;
    }

    if (!response.ok) {
      const errorMessage = body?.error || body?.message || `Request failed (${response.status})`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.body = body;
      throw error;
    }

    return body;
  }

  async function logoutCurrentSession() {
    const state = getState();
    if (!state?.refreshToken) {
      clearState();
      return;
    }

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ refreshToken: state.refreshToken })
      });
    } catch {
      // Best-effort logout.
    }

    clearState();
  }

  function stopSessionWatcher() {
    if (!sessionWatcher) {
      return;
    }

    sessionWatcher.events.forEach(eventName => {
      window.removeEventListener(eventName, sessionWatcher.markActivity, sessionWatcher.listenerOptions);
    });
    window.removeEventListener("storage", sessionWatcher.handleStorage);
    clearInterval(sessionWatcher.intervalId);
    sessionWatcher = null;
  }

  function startSessionWatcher(options = {}) {
    const idleTimeoutMs = Number(options.idleTimeoutMs || 0);
    if (!Number.isFinite(idleTimeoutMs) || idleTimeoutMs <= 0) {
      return;
    }

    stopSessionWatcher();

    const loginPath = normalizePath(options.loginPath || DEFAULT_LOGIN_PATH);
    const checkIntervalMs = Number(options.checkIntervalMs || DEFAULT_CHECK_INTERVAL_MS);
    const scope = options.scope || "portal";
    const listenerOptions = { passive: true };
    const activityEvents = ["click", "keydown", "mousemove", "mousedown", "touchstart", "scroll"];

    if (!localStorage.getItem(getActivityKey(scope))) {
      writeLastActivityAt(Date.now(), scope);
    }

    const expireIfIdle = () => {
      const state = getState();
      if (!state?.accessToken) {
        return false;
      }

      if (isRefreshTokenExpired(state)) {
        expireSession("expired", { loginPath });
        return true;
      }

      if (Date.now() - getLastActivityAt(scope) >= idleTimeoutMs) {
        expireSession("idle", { loginPath });
        return true;
      }

      return false;
    };

    const markActivity = () => {
      const state = getState();
      if (!state?.accessToken || expireIfIdle()) {
        return;
      }

      const current = Date.now();
      if (current - lastActivityWriteAt < ACTIVITY_THROTTLE_MS) {
        return;
      }

      lastActivityWriteAt = current;
      writeLastActivityAt(current, scope);
    };

    const handleStorage = event => {
      if (event.key === STORAGE_KEY && !event.newValue) {
        redirectToLogin(loginPath);
      }
    };

    activityEvents.forEach(eventName => {
      window.addEventListener(eventName, markActivity, listenerOptions);
    });
    window.addEventListener("storage", handleStorage);

    sessionWatcher = {
      events: activityEvents,
      handleStorage,
      intervalId: setInterval(expireIfIdle, Math.max(checkIntervalMs, 1000)),
      listenerOptions,
      loginPath,
      markActivity,
      scope
    };

    expireIfIdle();
  }

  function requireActiveSession(options = {}) {
    const state = getState();
    if (state?.accessToken && !isRefreshTokenExpired(state)) {
      return true;
    }

    expireSession("expired", {
      loginPath: options.loginPath || DEFAULT_LOGIN_PATH,
      redirect: options.redirect !== false
    });
    return false;
  }

  window.PortalAuth = {
    getState,
    saveState,
    clearState,
    expireSession,
    apiFetch,
    apiJson,
    logoutCurrentSession,
    requireActiveSession,
    startSessionWatcher,
    stopSessionWatcher
  };
})();

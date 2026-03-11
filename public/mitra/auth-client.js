(() => {
  const STORAGE_KEY = "printformMitraAuth";

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
  }

  function clearState() {
    localStorage.removeItem(STORAGE_KEY);
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

    if (state?.accessToken && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${state.accessToken}`);
    }

    const response = await fetch(input, {
      ...init,
      headers
    });

    if (response.status !== 401 || !retry) {
      return response;
    }

    const refreshed = await refreshAccessToken();
    if (!refreshed?.accessToken) {
      return response;
    }

    const retryHeaders = new Headers(init.headers || {});
    retryHeaders.set("Authorization", `Bearer ${refreshed.accessToken}`);
    return fetch(input, {
      ...init,
      headers: retryHeaders
    });
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

  window.MitraAuth = {
    getState,
    saveState,
    clearState,
    apiFetch,
    apiJson,
    logoutCurrentSession
  };
})();

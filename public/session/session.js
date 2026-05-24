import { apiFetch } from "./api.js";

const endSessionBtn = document.getElementById("endSessionBtn");
const sessionStatus = document.getElementById("sessionStatus");
const sessionClientName = document.getElementById("sessionClientName");
const sessionIdText = document.getElementById("sessionIdText");
const sessionAliasText = document.getElementById("sessionAliasText");
const sessionInactive = document.getElementById("sessionInactive");
const sessionActive = document.getElementById("sessionActive");
const realtimeStatus = document.getElementById("realtimeStatus");
const requiresSessionSections = document.querySelectorAll(".requires-session");

let sessionId = sessionStorage.getItem("printformSessionId") || "";
let sessionClient = sessionStorage.getItem("printformSessionClientName") || "";
let sessionAlias = sessionStorage.getItem("printformSessionAlias") || "";
let sessionHeartbeatFailures = 0;
let realtimeSocket = null;
let realtimeReconnectTimer = null;
let realtimeReconnectAttempt = 0;
let realtimeManualClose = false;
let callbacks = {
  loadJobs: async () => {},
  scheduleLoadJobs: () => {},
  resetPreviewState: () => {}
};

export function getSessionId() {
  return sessionId;
}

function isRealtimeConnected() {
  return Boolean(realtimeSocket && realtimeSocket.readyState === WebSocket.OPEN);
}

function setRealtimeStatus(text, isError = false) {
  if (!realtimeStatus) {
    return;
  }

  realtimeStatus.textContent = text;
  realtimeStatus.className = isError ? "status error" : "muted";
}

function setSessionUi(active) {
  if (sessionInactive) {
    sessionInactive.classList.toggle("hidden", active);
  }
  if (sessionActive) {
    sessionActive.classList.toggle("hidden", !active);
  }
  requiresSessionSections.forEach(section => {
    section.classList.toggle("hidden", !active);
  });
  if (active) {
    sessionClientName.textContent = sessionClient || "kios";
    sessionIdText.textContent = sessionId ? `Session ID: ${sessionId}` : "";
    sessionAliasText.textContent = sessionAlias ? `Alias: ${sessionAlias}` : "Alias: -";
  } else {
    sessionAliasText.textContent = "";
  }
}

function clearSessionState() {
  sessionId = "";
  sessionClient = "";
  sessionAlias = "";
  sessionHeartbeatFailures = 0;
  sessionStorage.removeItem("printformSessionId");
  sessionStorage.removeItem("printformSessionClientName");
  sessionStorage.removeItem("printformSessionAlias");
  setSessionUi(false);
  callbacks.resetPreviewState();
}

async function closeSessionRemote() {
  if (!sessionId) {
    return;
  }

  try {
    await apiFetch("/api/sessions/close", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId })
    });
  } catch (err) {
    // Abaikan jika server tidak bisa dihubungi
  }
}

async function heartbeatSession() {
  if (!sessionId) {
    return;
  }

  try {
    const res = await apiFetch("/api/sessions/heartbeat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId })
    });
    if (res.ok) {
      sessionHeartbeatFailures = 0;
      return;
    }

    if (res.status === 404) {
      await closeSessionRemote();
      clearSessionState();
      await callbacks.loadJobs();
      return;
    }

    sessionHeartbeatFailures += 1;
    if (sessionHeartbeatFailures >= 3) {
      await closeSessionRemote();
      clearSessionState();
      await callbacks.loadJobs();
    }
  } catch (err) {
    sessionHeartbeatFailures += 1;
    if (sessionHeartbeatFailures >= 3) {
      await closeSessionRemote();
      clearSessionState();
      await callbacks.loadJobs();
    }
  }
}

function scheduleRealtimeReconnect() {
  if (realtimeReconnectTimer) {
    return;
  }

  const delayMs = Math.min(15000, 1000 * (2 ** Math.min(realtimeReconnectAttempt, 4)));
  realtimeReconnectAttempt += 1;
  setRealtimeStatus(`Realtime: reconnect dalam ${Math.ceil(delayMs / 1000)} detik...`, true);

  realtimeReconnectTimer = setTimeout(() => {
    realtimeReconnectTimer = null;
    connectRealtime();
  }, delayMs);
}

async function getRealtimeUrl() {
  let realtimePath = "/ws";
  try {
    const res = await apiFetch("/api/health", { cache: "no-store" }, { retry: false });
    if (res.ok) {
      const health = await res.json();
      if (typeof health?.realtime?.path === "string" && health.realtime.path.trim().length > 0) {
        realtimePath = health.realtime.path.trim();
      }
    }
  } catch {
    // fallback ke default /ws
  }

  if (!realtimePath.startsWith("/")) {
    realtimePath = `/${realtimePath}`;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}${realtimePath}`;
}

function shouldRefreshJobsFromEvent(message) {
  if (!sessionId) {
    return false;
  }

  const payload = message?.payload || {};
  if (message.type === "session.closed") {
    return payload.sessionId === sessionId;
  }

  if (message.type === "sessions.expired") {
    return Array.isArray(payload.sessionIds) && payload.sessionIds.includes(sessionId);
  }

  if (payload.job && payload.job.sessionId) {
    return payload.job.sessionId === sessionId;
  }

  if (Array.isArray(payload.jobIds)) {
    return true;
  }

  return true;
}

function handleRealtimeMessage(rawMessage) {
  let message = null;
  try {
    message = JSON.parse(rawMessage);
  } catch {
    return;
  }

  const type = message?.type;
  if (!type) {
    return;
  }

  switch (type) {
    case "realtime.connected":
    case "realtime.subscribed":
      setRealtimeStatus("Realtime: tersambung");
      return;
    case "clients.snapshot":
    case "client.upserted":
    case "client.status.changed":
    case "client.removed":
      return;
    case "job.created":
    case "job.status.changed":
    case "job.file.removed":
    case "jobs.removed":
      if (shouldRefreshJobsFromEvent(message)) {
        callbacks.scheduleLoadJobs(120);
      }
      return;
    case "session.closed":
      if (shouldRefreshJobsFromEvent(message)) {
        clearSessionState();
        sessionStatus.textContent = "Session ditutup dari sisi server.";
        sessionStatus.className = "status";
        window.location.replace("/");
      }
      return;
    case "sessions.expired":
      if (shouldRefreshJobsFromEvent(message)) {
        clearSessionState();
        sessionStatus.textContent = "Session expired dari sisi server.";
        sessionStatus.className = "status";
        window.location.replace("/");
      }
      return;
  }
}

async function connectRealtime() {
  if (realtimeReconnectTimer) {
    clearTimeout(realtimeReconnectTimer);
    realtimeReconnectTimer = null;
  }

  if (realtimeSocket) {
    try {
      realtimeSocket.__manualClose = true;
      realtimeSocket.close();
    } catch {
      // ignore close error
    }
    realtimeSocket = null;
  }

  const wsUrl = await getRealtimeUrl();
  setRealtimeStatus("Realtime: menghubungkan...");

  let socket = null;
  try {
    socket = new WebSocket(wsUrl);
  } catch {
    setRealtimeStatus("Realtime: gagal membuka koneksi (fallback polling aktif)", true);
    scheduleRealtimeReconnect();
    return;
  }

  socket.__manualClose = false;
  realtimeSocket = socket;

  socket.addEventListener("open", () => {
    realtimeReconnectAttempt = 0;
    setRealtimeStatus("Realtime: tersambung");
    socket.send(JSON.stringify({ action: "subscribe", channels: ["jobs", "sessions"] }));
    callbacks.scheduleLoadJobs(0);
  });

  socket.addEventListener("message", event => {
    handleRealtimeMessage(event.data);
  });

  socket.addEventListener("error", () => {
    setRealtimeStatus("Realtime: error (fallback polling aktif)", true);
  });

  socket.addEventListener("close", () => {
    if (realtimeSocket === socket) {
      realtimeSocket = null;
    }
    if (socket.__manualClose || realtimeManualClose) {
      return;
    }
    scheduleRealtimeReconnect();
  });
}

window.addEventListener("beforeunload", () => {
  realtimeManualClose = true;
  if (realtimeSocket) {
    try {
      realtimeSocket.__manualClose = true;
      realtimeSocket.close();
    } catch {
      // ignore close error
    }
  }
});

export function initSession(nextCallbacks = {}) {
  callbacks = { ...callbacks, ...nextCallbacks };

  if (!sessionId) {
    window.location.replace("/");
    return;
  }

  if (endSessionBtn) {
    endSessionBtn.addEventListener("click", async () => {
      await closeSessionRemote();
      clearSessionState();
      window.location.replace("/");
    });
  }

  setSessionUi(true);
  callbacks.resetPreviewState();
  heartbeatSession();
  callbacks.loadJobs();
  connectRealtime();
  setInterval(heartbeatSession, 10000);
  setInterval(() => {
    if (!isRealtimeConnected()) {
      callbacks.loadJobs();
    }
  }, 5000);
}

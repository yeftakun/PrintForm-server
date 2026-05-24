import { apiFetch } from "./api.js";

const clientSelect = document.getElementById("clientSelect");
const realtimeStatus = document.getElementById("realtimeStatus");
const clientsBody = document.getElementById("clientsBody");
const clientsStatus = document.getElementById("clientsStatus");

let realtimeSocket = null;
let realtimeReconnectTimer = null;
let realtimeReconnectAttempt = 0;
let loadClientsTimer = null;
let realtimeManualClose = false;

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

export function scheduleLoadClients(delayMs = 200) {
  if (loadClientsTimer) {
    clearTimeout(loadClientsTimer);
  }
  loadClientsTimer = setTimeout(() => {
    loadClients().catch(() => {
      // Fallback interval will retry.
    });
  }, delayMs);
}

function toReadinessLabel(readiness) {
  switch (String(readiness || "").toLowerCase()) {
    case "ready":
      return "siap";
    case "owned":
      return "online (desktop belum login)";
    case "offline":
      return "offline";
    default:
      return "tidak diketahui";
  }
}

export function getSelectedKiosk() {
  const selectedOption = clientSelect.options[clientSelect.selectedIndex] || null;
  return {
    id: clientSelect.value,
    name: selectedOption?.dataset?.kioskName || ""
  };
}

export async function loadClients() {
  const previousSelection = clientSelect.value;
  try {
    const res = await apiFetch("/api/clients/kiosks");
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        clientSelect.innerHTML = '<option value="">Daftar kios tidak tersedia</option>';
        clientsBody.innerHTML = '<tr><td colspan="6" class="muted">Daftar kios tidak bisa diakses saat ini.</td></tr>';
        clientsStatus.textContent = "Gagal memuat daftar kios.";
        clientsStatus.className = "status error";
        return;
      }
      throw new Error("failed to fetch kiosks");
    }

    const kiosks = await res.json();
    if (!Array.isArray(kiosks) || kiosks.length === 0) {
      clientSelect.innerHTML = '<option value="">Belum ada kios terdaftar</option>';
      clientsBody.innerHTML = '<tr><td colspan="6" class="muted">Belum ada kios terdaftar.</td></tr>';
      clientsStatus.textContent = "";
      clientsStatus.className = "status";
      return;
    }

    clientSelect.innerHTML = kiosks.map(kiosk => {
      const canSelect = Boolean(kiosk.canStartSession);
      const readinessLabel = toReadinessLabel(kiosk.readiness);
      const label = `${kiosk.displayName} (${readinessLabel}; ${kiosk.readyClientCount}/${kiosk.clientCount} client siap)`;
      return `<option value="${kiosk.id}" data-kiosk-name="${kiosk.displayName}"${canSelect ? "" : " disabled"}>${label}</option>`;
    }).join("");

    const selectableKiosks = kiosks.filter(kiosk => Boolean(kiosk.canStartSession));
    if (selectableKiosks.length === 1) {
      clientSelect.value = selectableKiosks[0].id;
    } else {
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Pilih kios";
      placeholder.disabled = true;
      placeholder.selected = true;
      clientSelect.prepend(placeholder);
      if (previousSelection) {
        clientSelect.value = previousSelection;
      }

      if (!clientSelect.value && selectableKiosks.length > 0) {
        clientSelect.value = selectableKiosks[0].id;
      }
    }

    clientsBody.innerHTML = kiosks.map(kiosk => `
      <tr>
        <td>${kiosk.displayName}</td>
        <td>${toReadinessLabel(kiosk.readiness)}</td>
        <td>${kiosk.clientCount}</td>
        <td>${kiosk.onlineClientCount}</td>
        <td>${kiosk.readyClientCount}</td>
        <td>${kiosk.canStartSession ? "Ya" : "Belum"}</td>
      </tr>
    `).join("");
    clientsStatus.textContent = "";
    clientsStatus.className = "status";
  } catch {
    clientsStatus.textContent = "Gagal memuat daftar kios.";
    clientsStatus.className = "status error";
  }
}

async function getRealtimeUrl() {
  let realtimePath = "/ws";
  try {
    const res = await apiFetch("/api/health", { cache: "no-store" });
    if (res.ok) {
      const health = await res.json();
      if (typeof health?.realtime?.path === "string" && health.realtime.path.trim().length > 0) {
        realtimePath = health.realtime.path.trim();
      }
    }
  } catch {
    // Fallback to default /ws.
  }

  if (!realtimePath.startsWith("/")) {
    realtimePath = `/${realtimePath}`;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}${realtimePath}`;
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

function handleRealtimeMessage(rawMessage) {
  let message = null;
  try {
    message = JSON.parse(rawMessage);
  } catch {
    return;
  }

  switch (message?.type) {
    case "realtime.connected":
    case "realtime.subscribed":
      setRealtimeStatus("Realtime: tersambung");
      return;
    case "clients.snapshot":
    case "client.upserted":
    case "client.status.changed":
    case "client.removed":
      scheduleLoadClients(120);
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
      // Ignore close error.
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
    socket.send(JSON.stringify({ action: "subscribe", channels: ["clients"] }));
    scheduleLoadClients(0);
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
      // Ignore close error.
    }
  }
});

export function initClients() {
  loadClients();
  connectRealtime();
  setInterval(() => {
    if (!isRealtimeConnected()) {
      loadClients();
    }
  }, 10000);
}

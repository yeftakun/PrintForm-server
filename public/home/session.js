import { apiFetch } from "./api.js";
import { getSelectedKiosk, scheduleLoadClients } from "./clients.js";

const aliasInput = document.getElementById("aliasInput");
const saveAliasBtn = document.getElementById("saveAliasBtn");
const clearAliasBtn = document.getElementById("clearAliasBtn");
const startSessionBtn = document.getElementById("startSessionBtn");
const sessionStatus = document.getElementById("sessionStatus");

const aliasStorageKey = "printformAlias";
let senderAlias = localStorage.getItem(aliasStorageKey) || "";

function saveAlias(value) {
  senderAlias = value.trim();
  if (senderAlias) {
    localStorage.setItem(aliasStorageKey, senderAlias);
  } else {
    localStorage.removeItem(aliasStorageKey);
  }
  aliasInput.value = senderAlias;
}

async function startSession() {
  const kiosk = getSelectedKiosk();
  if (!kiosk.id) {
    sessionStatus.textContent = "Pilih kios terlebih dahulu.";
    sessionStatus.className = "status error";
    return;
  }

  saveAlias(aliasInput.value);
  sessionStatus.textContent = "Membuat session...";
  sessionStatus.className = "status";
  startSessionBtn.disabled = true;

  try {
    const res = await apiFetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kioskId: kiosk.id, alias: senderAlias })
    });
    const body = await res.json();
    if (!res.ok) {
      sessionStatus.textContent = res.status === 401 || res.status === 403
        ? "Session tidak bisa dibuat untuk kios ini."
        : body.error || "Gagal membuat session.";
      sessionStatus.className = "status error";
      startSessionBtn.disabled = false;
      if (body.code === "CLIENT_UNAVAILABLE" || body.code === "KIOSK_UNAVAILABLE" || body.code === "KIOSK_NOT_READY") {
        scheduleLoadClients(0);
      }
      return;
    }

    sessionStorage.setItem("printformSessionId", body.id);
    sessionStorage.setItem("printformSessionClientName", kiosk.name || body.clientName || "kios");
    sessionStorage.setItem("printformSessionAlias", body.alias || senderAlias || "");
    window.location.href = "/session/";
  } catch {
    sessionStatus.textContent = "Gagal terhubung ke server.";
    sessionStatus.className = "status error";
    startSessionBtn.disabled = false;
  }
}

export function initHomeSession() {
  if (sessionStorage.getItem("printformSessionId")) {
    window.location.replace("/session/");
    return false;
  }

  aliasInput.value = senderAlias;
  saveAliasBtn.addEventListener("click", () => saveAlias(aliasInput.value));
  clearAliasBtn.addEventListener("click", () => saveAlias(""));
  startSessionBtn.addEventListener("click", startSession);
  return true;
}

import { apiFetch } from "/shared/api.js";

const storeName = document.getElementById("storeName");
const storeNameSummary = document.getElementById("storeNameSummary");
const storeCodeText = document.getElementById("storeCodeText");
const storeCodeValue = document.getElementById("storeCodeValue");
const storeAddress = document.getElementById("storeAddress");
const storeHours = document.getElementById("storeHours");
const storeStatus = document.getElementById("storeStatus");
const storeStatusBadge = document.getElementById("storeStatusBadge");
const storeSummaryStatusIcon = document.getElementById("storeSummaryStatusIcon");
const confirmStoreBtn = document.getElementById("confirmStoreBtn");
const storePageStatus = document.getElementById("storePageStatus");
const aliasStorageKey = "printformAlias";

let currentStore = null;

function getStoreCodeFromPath() {
  return decodeURIComponent(window.location.pathname.replace(/^\/+|\/+$/g, ""));
}

function setPageStatus(text, kind = "") {
  storePageStatus.textContent = text;
  storePageStatus.className = kind
    ? `status store-page-status ${kind}`
    : "status store-page-status";
}

function renderStore(store) {
  currentStore = store;
  const displayName = store.displayName || "Toko Percetakan";
  const isReady = store.status === "online" && store.canStartSession;
  const statusText = isReady ? "Siap menerima tugas" : "Belum siap menerima tugas";

  storeName.textContent = displayName;
  storeNameSummary.textContent = displayName;
  storeCodeText.textContent = store.kodeToko || "-";
  storeCodeValue.textContent = store.kodeToko || "-";
  storeAddress.textContent = store.alamat || "Alamat belum diatur";
  storeHours.textContent = store.jamOperasional || "Setiap hari 08.00 - 21.00";
  storeStatus.textContent = statusText;
  storeStatusBadge.textContent = isReady ? "Tersedia / Siap menerima tugas" : "Offline / Belum siap";
  storeStatusBadge.className = isReady
    ? "store-status-badge online"
    : "store-status-badge offline";
  storeSummaryStatusIcon.className = isReady
    ? "store-summary-status-icon online"
    : "store-summary-status-icon offline";
  confirmStoreBtn.disabled = !isReady;
  setPageStatus(
    confirmStoreBtn.disabled
      ? "Toko sedang offline. Halaman tetap dapat dilihat, tetapi sesi belum bisa dibuat."
      : ""
  );
}

async function loadStore({ silent = false } = {}) {
  const kodeToko = getStoreCodeFromPath();
  if (!kodeToko) {
    setPageStatus("Kode toko tidak valid.", "error");
    confirmStoreBtn.disabled = true;
    return;
  }

  storeCodeText.textContent = kodeToko;
  storeCodeValue.textContent = kodeToko;
  if (!silent) {
    setPageStatus("Memuat data toko...");
  }
  confirmStoreBtn.disabled = true;

  try {
    const res = await apiFetch(`/api/clients/stores/${encodeURIComponent(kodeToko)}`);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setPageStatus(body.error || "Toko tidak ditemukan.", "error");
      return;
    }
    renderStore(body);
  } catch {
    setPageStatus("Gagal terhubung ke server.", "error");
  }
}

confirmStoreBtn.addEventListener("click", async () => {
  if (!currentStore?.kodeToko) {
    return;
  }

  setPageStatus("Membuat session...");
  confirmStoreBtn.disabled = true;
  try {
    const alias = localStorage.getItem(aliasStorageKey) || "";
    const res = await apiFetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kodeToko: currentStore.kodeToko, alias })
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setPageStatus(body.error || "Session belum bisa dibuat untuk toko ini.", "error");
      confirmStoreBtn.disabled = currentStore.status !== "online" || !currentStore.canStartSession;
      return;
    }

    sessionStorage.setItem("printformSessionId", body.id);
    sessionStorage.setItem("printformSessionClientName", currentStore.displayName || "toko");
    sessionStorage.setItem("printformSessionStoreCode", currentStore.kodeToko || "");
    sessionStorage.setItem("printformSessionStoreAddress", currentStore.alamat || "");
    sessionStorage.setItem("printformSessionStoreHours", currentStore.jamOperasional || "");
    sessionStorage.setItem("printformSessionAlias", body.alias || alias || "");
    window.location.href = "/session/";
  } catch {
    setPageStatus("Gagal terhubung ke server.", "error");
    confirmStoreBtn.disabled = currentStore.status !== "online" || !currentStore.canStartSession;
  }
});

loadStore();
setInterval(() => {
  loadStore({ silent: true });
}, 10000);

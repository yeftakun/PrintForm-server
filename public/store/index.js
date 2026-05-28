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
const storeServiceChips = document.getElementById("storeServiceChips");
const confirmStoreBtn = document.getElementById("confirmStoreBtn");
const storePageStatus = document.getElementById("storePageStatus");
const storeLayout = document.querySelector(".store-layout");
const storeNotFound = document.getElementById("storeNotFound");
const notFoundStoreCode = document.getElementById("notFoundStoreCode");
const aliasStorageKey = "printformAlias";

let currentStore = null;

function getStoreCodeFromPath() {
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  if (pathParts[0] !== "p" || !pathParts[1]) {
    return "";
  }
  return decodeURIComponent(pathParts[1]);
}

function setPageStatus(text, kind = "") {
  storePageStatus.textContent = text;
  storePageStatus.className = kind
    ? `status store-page-status ${kind}`
    : "status store-page-status";
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderServiceChips(layanan) {
  const service = layanan && typeof layanan === "object" ? layanan : {};
  const paperTypes = Array.isArray(service.jenisKertas) && service.jenisKertas.length > 0
    ? service.jenisKertas
    : ["A4", "F4"];
  const colorModes = Array.isArray(service.modeWarnaPilihan) && service.modeWarnaPilihan.length > 0
    ? service.modeWarnaPilihan
    : String(service.modeWarna || "both") === "color"
      ? ["color"]
      : String(service.modeWarna || "both") === "bw"
        ? ["bw"]
        : ["bw", "color"];
  const chips = [
    "Cetak PDF",
    ...(colorModes.includes("bw") ? ["Hitam Putih"] : []),
    ...(colorModes.includes("color") ? ["Warna"] : []),
    ...paperTypes
  ];

  storeServiceChips.innerHTML = chips
    .map(item => `<span>${escapeHtml(item)}</span>`)
    .join("");
}

function renderStore(store) {
  currentStore = store;
  storeLayout?.classList.remove("hidden");
  storeNotFound?.classList.add("hidden");
  document.body.classList.remove("store-not-found-mode");
  const displayName = store.displayName || "Toko Percetakan";
  const isClosed = store.operationalStatus === "closed" || store.status === "closed";
  const isReady = !isClosed && store.status === "online" && store.canStartSession;
  const statusText = isClosed
    ? "Toko sedang tutup"
    : isReady
      ? "Siap menerima tugas"
      : "Belum siap menerima tugas";

  storeName.textContent = displayName;
  storeNameSummary.textContent = displayName;
  storeCodeText.textContent = store.kodeToko || "-";
  storeCodeValue.textContent = store.kodeToko || "-";
  storeAddress.textContent = store.alamat || "Alamat belum diatur";
  storeHours.textContent = store.jamOperasional || "Setiap hari 08.00 - 21.00";
  storeStatus.textContent = statusText;
  renderServiceChips(store.layanan);
  storeStatusBadge.textContent = isClosed
    ? "Tutup"
    : isReady
      ? "Tersedia / Siap menerima tugas"
      : "Offline / Belum siap";
  storeStatusBadge.className = isReady
    ? "store-status-badge online"
    : "store-status-badge offline";
  storeSummaryStatusIcon.className = isReady
    ? "store-summary-status-icon online"
    : "store-summary-status-icon offline";
  confirmStoreBtn.disabled = !isReady;
  setPageStatus(
    isClosed
      ? "Toko sedang tutup. Halaman tetap dapat dilihat, tetapi sesi belum bisa dibuat."
      : confirmStoreBtn.disabled
        ? "Toko sedang offline. Halaman tetap dapat dilihat, tetapi sesi belum bisa dibuat."
      : ""
  );
}

function renderStoreNotFound(kodeToko, message = "") {
  currentStore = null;
  storeLayout?.classList.add("hidden");
  storeNotFound?.classList.remove("hidden");
  document.body.classList.add("store-not-found-mode");
  if (notFoundStoreCode) {
    notFoundStoreCode.textContent = kodeToko || "-";
  }
  confirmStoreBtn.disabled = true;
  setPageStatus(message || "Toko tidak ditemukan.", "error");
}

async function loadStore({ silent = false } = {}) {
  const kodeToko = getStoreCodeFromPath();
  if (!kodeToko) {
    renderStoreNotFound("", "Kode toko tidak valid.");
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
      if (res.status === 404) {
        renderStoreNotFound(kodeToko, body.error || "Toko tidak ditemukan.");
        return;
      }
      renderStoreNotFound(kodeToko, body.error || "Toko tidak ditemukan.");
      return;
    }
    renderStore(body);
  } catch {
    renderStoreNotFound(kodeToko, "Gagal terhubung ke server.");
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

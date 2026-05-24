import { apiFetch } from "/shared/api.js";

const storeName = document.getElementById("storeName");
const storeCodeText = document.getElementById("storeCodeText");
const storeCodeValue = document.getElementById("storeCodeValue");
const storeAddress = document.getElementById("storeAddress");
const storeHours = document.getElementById("storeHours");
const storeStatus = document.getElementById("storeStatus");
const confirmStoreBtn = document.getElementById("confirmStoreBtn");
const storePageStatus = document.getElementById("storePageStatus");
const aliasStorageKey = "printformAlias";

let currentStore = null;

function getStoreCodeFromPath() {
  return decodeURIComponent(window.location.pathname.replace(/^\/+|\/+$/g, ""));
}

function setPageStatus(text, kind = "") {
  storePageStatus.textContent = text;
  storePageStatus.className = kind ? `status ${kind}` : "status";
}

function renderStore(store) {
  currentStore = store;
  storeName.textContent = store.displayName || "Toko Percetakan";
  storeCodeText.textContent = `Kode toko: ${store.kodeToko || "-"}`;
  storeCodeValue.textContent = store.kodeToko || "-";
  storeAddress.textContent = store.alamat || "Alamat belum diatur";
  storeHours.textContent = store.jamOperasional || "Setiap hari 08.00 - 21.00";
  storeStatus.textContent = store.status === "online" ? "Online" : "Offline";
  confirmStoreBtn.disabled = store.status !== "online" || !store.canStartSession;
  setPageStatus(
    confirmStoreBtn.disabled
      ? "Toko sedang offline. Halaman tetap dapat dilihat, tetapi session belum bisa dibuat."
      : "Toko online. Tekan konfirmasi untuk mulai session."
  );
}

async function loadStore({ silent = false } = {}) {
  const kodeToko = getStoreCodeFromPath();
  if (!kodeToko) {
    setPageStatus("Kode toko tidak valid.", "error");
    confirmStoreBtn.disabled = true;
    return;
  }

  storeCodeText.textContent = `Kode toko: ${kodeToko}`;
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

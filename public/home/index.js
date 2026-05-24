const storeSearchForm = document.getElementById("storeSearchForm");
const aliasInput = document.getElementById("aliasInput");
const saveAliasBtn = document.getElementById("saveAliasBtn");
const clearAliasBtn = document.getElementById("clearAliasBtn");
const storeCodeInput = document.getElementById("storeCodeInput");
const scanQrBtn = document.getElementById("scanQrBtn");
const storeSearchStatus = document.getElementById("storeSearchStatus");
const qrScannerCard = document.getElementById("qrScannerCard");
const qrVideo = document.getElementById("qrVideo");
const closeQrBtn = document.getElementById("closeQrBtn");
const qrStatus = document.getElementById("qrStatus");
const aliasStorageKey = "printformAlias";

let qrStream = null;
let qrDetector = null;
let qrCanvas = null;
let qrCanvasContext = null;
let qrScanning = false;
let qrLookupPending = false;
let lastInvalidQrText = "";

function saveAlias(value) {
  const alias = String(value || "").trim();
  if (alias) {
    localStorage.setItem(aliasStorageKey, alias);
  } else {
    localStorage.removeItem(aliasStorageKey);
  }
  aliasInput.value = alias;
}

function normalizeStoreCode(value) {
  return String(value || "").trim();
}

function getStoreCodeFromQrText(value) {
  const text = normalizeStoreCode(value);
  if (!text) {
    return "";
  }

  try {
    const url = new URL(text);
    const pathParts = url.pathname.split("/").filter(Boolean);
    return normalizeStoreCode(pathParts[0] || "");
  } catch {
    return text;
  }
}

function setSearchStatus(text, kind = "") {
  storeSearchStatus.textContent = text;
  storeSearchStatus.className = kind ? `status ${kind}` : "status";
}

function setQrStatus(text, kind = "") {
  qrStatus.textContent = text;
  qrStatus.className = kind ? `status ${kind}` : "status";
}

function openStorePage(kodeToko) {
  const normalizedKodeToko = normalizeStoreCode(kodeToko);
  if (!normalizedKodeToko) {
    setSearchStatus("Masukkan kode toko terlebih dahulu.", "error");
    return;
  }

  window.location.href = `/${encodeURIComponent(normalizedKodeToko)}`;
}

async function storeExists(kodeToko) {
  const res = await fetch(`/api/clients/stores/${encodeURIComponent(kodeToko)}`, {
    cache: "no-store"
  });
  if (res.ok) {
    return true;
  }
  if (res.status === 404) {
    return false;
  }
  throw new Error("Gagal memvalidasi toko.");
}

function stopQrScanner() {
  qrScanning = false;
  qrLookupPending = false;
  qrScannerCard.classList.add("hidden");
  if (qrStream) {
    qrStream.getTracks().forEach(track => track.stop());
    qrStream = null;
  }
  qrVideo.srcObject = null;
}

async function handleQrText(rawText) {
  const kodeToko = getStoreCodeFromQrText(rawText);
  if (!kodeToko || qrLookupPending) {
    return;
  }

  qrLookupPending = true;
  setQrStatus(`Mengecek toko ${kodeToko}...`);
  try {
    if (await storeExists(kodeToko)) {
      saveAlias(aliasInput.value);
      stopQrScanner();
      openStorePage(kodeToko);
      return;
    }

    if (lastInvalidQrText !== kodeToko) {
      lastInvalidQrText = kodeToko;
      alert("Toko tidak ditemukan.");
    }
    setQrStatus("Toko tidak ditemukan. Arahkan kamera ke QR kode toko lain.", "error");
  } catch {
    setQrStatus("Gagal mengecek toko. Kamera tetap aktif, coba scan lagi.", "error");
  } finally {
    qrLookupPending = false;
  }
}

async function scanQrFrame() {
  if (!qrScanning) {
    return;
  }

  if (qrVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && !qrLookupPending) {
    try {
      let firstCode = "";
      if (qrDetector) {
        const codes = await qrDetector.detect(qrVideo);
        firstCode = codes[0]?.rawValue || "";
      } else if (window.jsQR) {
        if (!qrCanvas) {
          qrCanvas = document.createElement("canvas");
          qrCanvasContext = qrCanvas.getContext("2d", { willReadFrequently: true });
        }
        qrCanvas.width = qrVideo.videoWidth;
        qrCanvas.height = qrVideo.videoHeight;
        qrCanvasContext.drawImage(qrVideo, 0, 0, qrCanvas.width, qrCanvas.height);
        const imageData = qrCanvasContext.getImageData(0, 0, qrCanvas.width, qrCanvas.height);
        const result = window.jsQR(imageData.data, imageData.width, imageData.height);
        firstCode = result?.data || "";
      }

      if (firstCode) {
        await handleQrText(firstCode);
      }
    } catch {
      setQrStatus("Gagal membaca QR. Pastikan QR terlihat jelas.", "error");
    }
  }

  if (qrScanning) {
    window.requestAnimationFrame(scanQrFrame);
  }
}

async function startQrScanner() {
  const hasNativeScanner = "BarcodeDetector" in window;
  const hasJsQrScanner = typeof window.jsQR === "function";
  if (!hasNativeScanner && !hasJsQrScanner) {
    setSearchStatus("QR scanner belum tersedia. Periksa koneksi internet atau gunakan input kode toko manual.", "error");
    return;
  }

  try {
    qrDetector = hasNativeScanner
      ? new window.BarcodeDetector({ formats: ["qr_code"] })
      : null;
    qrStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });
    qrVideo.srcObject = qrStream;
    qrScannerCard.classList.remove("hidden");
    setQrStatus("Arahkan kamera ke QR kode toko.");
    lastInvalidQrText = "";
    qrScanning = true;
    await qrVideo.play();
    window.requestAnimationFrame(scanQrFrame);
  } catch {
    stopQrScanner();
    setSearchStatus("Kamera tidak bisa dibuka. Periksa izin kamera browser.", "error");
  }
}

storeSearchForm.addEventListener("submit", event => {
  event.preventDefault();
  saveAlias(aliasInput.value);
  openStorePage(storeCodeInput.value);
});

saveAliasBtn.addEventListener("click", () => {
  saveAlias(aliasInput.value);
});

clearAliasBtn.addEventListener("click", () => {
  saveAlias("");
});

scanQrBtn.addEventListener("click", () => {
  saveAlias(aliasInput.value);
  startQrScanner();
});

closeQrBtn.addEventListener("click", stopQrScanner);

window.addEventListener("beforeunload", stopQrScanner);

if (sessionStorage.getItem("printformSessionId")) {
  window.location.replace("/session/");
}

aliasInput.value = localStorage.getItem(aliasStorageKey) || "";

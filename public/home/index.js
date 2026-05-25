const storeSearchForm = document.getElementById("storeSearchForm");
const aliasInput = document.getElementById("aliasInput");
const saveAliasBtn = document.getElementById("saveAliasBtn");
const clearAliasBtn = document.getElementById("clearAliasBtn");
const storeCodeInput = document.getElementById("storeCodeInput");
const scanQrBtn = document.getElementById("scanQrBtn");
const mobileScanQrBtn = document.getElementById("mobileScanQrBtn");
const storeSearchStatus = document.getElementById("storeSearchStatus");
const qrScannerCard = document.getElementById("qrScannerCard");
const qrVideo = document.getElementById("qrVideo");
const closeQrBtn = document.getElementById("closeQrBtn");
const qrStatus = document.getElementById("qrStatus");
const toastStack = document.getElementById("toastStack");
const mobileIntroCarousel = document.querySelector(".home-mobile-intro-card");
const mobileIntroItems = Array.from(document.querySelectorAll(".home-mobile-intro-main, .home-mobile-benefit"));
const aliasStorageKey = "printformAlias";

let qrStream = null;
let qrDetector = null;
let qrCanvas = null;
let qrCanvasContext = null;
let qrScanning = false;
let qrLookupPending = false;
let lastInvalidQrText = "";
let toastId = 0;
let mobileIntroIndex = 0;
let mobileIntroTimer = null;
let mobileIntroAnimationTimer = null;

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
  if (text && (kind === "error" || kind === "success")) {
    showToast(text, kind);
  }
}

function setQrStatus(text, kind = "") {
  qrStatus.textContent = text;
  qrStatus.className = kind ? `status ${kind}` : "status";
}

function showToast(message, kind = "") {
  if (!toastStack || !message) {
    return;
  }

  const toast = document.createElement("div");
  const currentToastId = String(++toastId);
  toast.className = kind ? `toast ${kind}` : "toast";
  toast.dataset.toastId = currentToastId;
  toast.textContent = message;
  toastStack.appendChild(toast);

  window.setTimeout(() => {
    toast.classList.add("is-leaving");
    window.setTimeout(() => {
      toast.remove();
    }, 180);
  }, 2800);
}

function showMobileIntroItem(index) {
  if (!mobileIntroItems.length) {
    return;
  }

  mobileIntroIndex = (index + mobileIntroItems.length) % mobileIntroItems.length;
  mobileIntroItems.forEach((item, itemIndex) => {
    item.classList.remove("is-sliding-in");
    item.hidden = itemIndex !== mobileIntroIndex;
  });
  const activeItem = mobileIntroItems[mobileIntroIndex];
  activeItem.classList.add("is-sliding-in");
  if (mobileIntroAnimationTimer) {
    window.clearTimeout(mobileIntroAnimationTimer);
  }
  mobileIntroAnimationTimer = window.setTimeout(() => {
    activeItem.classList.remove("is-sliding-in");
  }, 360);
}

function scheduleMobileIntroRotation() {
  if (mobileIntroTimer) {
    window.clearInterval(mobileIntroTimer);
  }
  if (mobileIntroItems.length <= 1) {
    return;
  }
  mobileIntroTimer = window.setInterval(() => {
    showMobileIntroItem(mobileIntroIndex + 1);
  }, 4000);
}

function advanceMobileIntro() {
  showMobileIntroItem(mobileIntroIndex + 1);
  scheduleMobileIntroRotation();
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
      showToast("Toko tidak ditemukan.", "error");
    }
    setQrStatus("Toko tidak ditemukan. Arahkan kamera ke QR kode toko lain.", "error");
  } catch {
    showToast("Gagal mengecek toko. Kamera tetap aktif, coba scan lagi.", "error");
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

if (mobileScanQrBtn) {
  mobileScanQrBtn.addEventListener("click", () => {
    saveAlias(aliasInput.value);
    startQrScanner();
  });
}

closeQrBtn.addEventListener("click", stopQrScanner);

if (mobileIntroCarousel && mobileIntroItems.length) {
  mobileIntroCarousel.setAttribute("role", "button");
  mobileIntroCarousel.setAttribute("tabindex", "0");
  mobileIntroCarousel.addEventListener("click", advanceMobileIntro);
  mobileIntroCarousel.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      advanceMobileIntro();
    }
  });
  showMobileIntroItem(0);
  scheduleMobileIntroRotation();
}

window.addEventListener("beforeunload", stopQrScanner);

if (sessionStorage.getItem("printformSessionId")) {
  window.location.replace("/session/");
}

aliasInput.value = localStorage.getItem(aliasStorageKey) || "";

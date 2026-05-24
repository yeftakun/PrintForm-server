const storeSearchForm = document.getElementById("storeSearchForm");
const aliasInput = document.getElementById("aliasInput");
const saveAliasBtn = document.getElementById("saveAliasBtn");
const clearAliasBtn = document.getElementById("clearAliasBtn");
const storeCodeInput = document.getElementById("storeCodeInput");
const scanQrBtn = document.getElementById("scanQrBtn");
const storeSearchStatus = document.getElementById("storeSearchStatus");
const aliasStorageKey = "printformAlias";

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

function openStorePage(kodeToko) {
  const normalizedKodeToko = normalizeStoreCode(kodeToko);
  if (!normalizedKodeToko) {
    storeSearchStatus.textContent = "Masukkan kode toko terlebih dahulu.";
    storeSearchStatus.className = "status error";
    return;
  }

  window.location.href = `/${encodeURIComponent(normalizedKodeToko)}`;
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
  storeSearchStatus.textContent = "QR scanner dummy aktif. Masukkan kode toko manual terlebih dahulu.";
  storeSearchStatus.className = "status";
  storeCodeInput.focus();
});

if (sessionStorage.getItem("printformSessionId")) {
  window.location.replace("/session/");
}

aliasInput.value = localStorage.getItem(aliasStorageKey) || "";

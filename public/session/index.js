import { initPreview, resetPreviewState } from "./preview.js";
import { initJobs, loadJobs, scheduleLoadJobs } from "./jobs.js";
import { initSession } from "./session.js";

initPreview();
initJobs();
initSession({ loadJobs, scheduleLoadJobs, resetPreviewState });

const changeDocumentBtn = document.getElementById("changeDocumentBtn");
const chooseDocumentBtn = document.getElementById("chooseDocumentBtn");
const selectedDocumentName = document.getElementById("selectedDocumentName");
const uploadForm = document.getElementById("uploadForm");
const uploadFileInput = document.querySelector('#uploadForm input[name="document"]');

if (changeDocumentBtn && uploadFileInput) {
  changeDocumentBtn.addEventListener("click", () => {
    uploadFileInput.click();
  });
}

if (chooseDocumentBtn && uploadFileInput) {
  chooseDocumentBtn.addEventListener("click", () => {
    uploadFileInput.click();
  });
}

if (selectedDocumentName && uploadFileInput) {
  uploadFileInput.addEventListener("change", () => {
    selectedDocumentName.textContent = uploadFileInput.files?.[0]?.name || "Belum ada dokumen";
  });
}

if (selectedDocumentName && uploadForm) {
  uploadForm.addEventListener("reset", () => {
    window.setTimeout(() => {
      selectedDocumentName.textContent = "Belum ada dokumen";
    }, 0);
  });
}

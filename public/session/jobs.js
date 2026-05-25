import { apiFetch } from "./api.js";
import { getSessionId } from "./session.js";
import { getPreviewSubmission, resetPreviewState } from "./preview.js";

const uploadForm = document.getElementById("uploadForm");
const uploadStatus = document.getElementById("uploadStatus");
const jobsBody = document.getElementById("jobsBody");
const jobsStatus = document.getElementById("jobsStatus");
const refreshBtn = document.getElementById("refreshBtn");
let loadJobsTimer = null;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function scheduleLoadJobs(delayMs = 200) {
  if (!getSessionId()) {
    return;
  }
  if (loadJobsTimer) {
    clearTimeout(loadJobsTimer);
  }
  loadJobsTimer = setTimeout(() => {
    loadJobs().catch(() => {
      // Fallback interval will retry.
    });
  }, delayMs);
}

export async function loadJobs() {
  const sessionId = getSessionId();
  if (!sessionId) {
    jobsBody.innerHTML = '<tr><td colspan="8" class="muted">Session belum aktif.</td></tr>';
    jobsStatus.textContent = "";
    return;
  }

  try {
    const res = await apiFetch(`/api/jobs?sessionId=${encodeURIComponent(sessionId)}`);
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        jobsStatus.textContent = "Akses job untuk session ini ditolak.";
        jobsStatus.className = "status error";
        return;
      }
      throw new Error("failed to fetch jobs");
    }

    const jobs = await res.json();
    if (!Array.isArray(jobs) || jobs.length === 0) {
      jobsBody.innerHTML = '<tr><td colspan="8" class="muted">Belum ada tugas cetak.</td></tr>';
      jobsStatus.textContent = "";
      return;
    }

    const formatStatus = (value = "") => {
      const status = String(value || "").toLowerCase();
      if (status === "ready") return "Ready";
      if (status === "processing" || status === "claimed") return "Diproses";
      if (status === "done" || status === "sent") return "Selesai";
      if (status === "canceled") return "Batal";
      return value || "-";
    };

    const getStatusClass = (value = "") => {
      const status = String(value || "").toLowerCase();
      if (status === "ready" || status === "done" || status === "sent") return "success";
      if (status === "processing" || status === "claimed") return "warning";
      if (status === "canceled") return "error";
      return "";
    };

    jobsBody.innerHTML = jobs.map(job => {
      const isReady = job.status === "ready";
      const cancelDisabled = isReady ? "" : "disabled";
      
      const configParts = [
        job.printConfig.paperSize,
        job.printConfig.colorMode === "bw" ? "BW" : "Col",
        job.printConfig.orientation === "landscape" ? "L" : "P",
        job.printConfig.copies ? String(job.printConfig.copies) : "",
        job.printConfig.pageRange ? `(${job.printConfig.pageRange})` : "",
        job.printConfig.contentScale !== 100 ? `${job.printConfig.contentScale}%` : ""
      ].filter(Boolean).join(" ");
      const statusClass = getStatusClass(job.status);
      const claimedBy = job.claimedByClientName || job.claimedByClientId || "-";
      const originalName = job.originalName || "-";

      return `
      <tr>
        <td>${escapeHtml(job.id)}</td>
        <td><span class="session-doc-cell"><span aria-hidden="true">▧</span>${escapeHtml(originalName)}</span></td>
        <td>${escapeHtml(job.alias || "-")}</td>
        <td>${escapeHtml(claimedBy)}</td>
        <td>${escapeHtml(configParts || "-")}</td>
        <td><span class="session-status-pill ${statusClass}">${escapeHtml(formatStatus(job.status))}</span></td>
        <td>${escapeHtml(new Date(job.createdAt).toLocaleString())}</td>
        <td class="session-job-actions">
          <button type="button" data-job-id="${escapeHtml(job.id)}" data-action="clone">Buat Lagi</button>
          <button type="button" data-job-id="${escapeHtml(job.id)}" data-action="cancel" ${cancelDisabled}>Batal</button>
        </td>
      </tr>`;
    }).join("");
  } catch {
    jobsStatus.textContent = "Gagal memuat daftar job.";
    jobsStatus.className = "status error";
  }
}

function bindUploadForm() {
  uploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    uploadStatus.textContent = "Mengirim...";
    uploadStatus.className = "status";

    const preview = getPreviewSubmission();
    if (preview.pending) {
      uploadStatus.textContent = "Konversi masih berjalan. Mohon tunggu.";
      uploadStatus.className = "status error";
      return;
    }

    if (preview.error) {
      uploadStatus.textContent = preview.error;
      uploadStatus.className = "status error";
      return;
    }

    const formData = new FormData(uploadForm);
    if (preview.convertedFile) {
      if (preview.conversionId) {
        formData.set("previewId", preview.conversionId);
        formData.delete("document");
      } else {
        formData.set("document", preview.convertedFile, preview.convertedFile.name);
      }
    }
    const sessionId = getSessionId();
    if (sessionId) {
      formData.append("sessionId", sessionId);
    }
    try {
      const res = await apiFetch("/api/jobs", {
        method: "POST",
        body: formData
      });
      const body = await res.json();
      if (!res.ok) {
        uploadStatus.textContent = body.error || "Gagal mengirim job.";
        uploadStatus.className = "status error";
        return;
      }
      uploadStatus.textContent = "Job berhasil dikirim.";
      uploadStatus.className = "status success";
      uploadForm.reset();
      resetPreviewState();
      await loadJobs();
    } catch (err) {
      uploadStatus.textContent = "Gagal terhubung ke server.";
      uploadStatus.className = "status error";
    }
  });
}

function bindJobActions() {
  jobsBody.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const jobId = target.dataset.jobId;
  const action = target.dataset.action;
  if (!jobId) {
    return;
  }

  if (action === "clone") {
    jobsStatus.textContent = "Membuat ulang job...";
    jobsStatus.className = "status";
    try {
      const res = await apiFetch(`/api/jobs/${encodeURIComponent(jobId)}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: getSessionId() })
      });
      const body = await res.json();
      if (!res.ok) {
        jobsStatus.textContent = body.error || "Gagal membuat ulang job.";
        jobsStatus.className = "status error";
        return;
      }
      jobsStatus.textContent = "Job baru berhasil dibuat.";
      jobsStatus.className = "status success";
      await loadJobs();
    } catch (err) {
      jobsStatus.textContent = "Gagal terhubung ke server.";
      jobsStatus.className = "status error";
    }
    return;
  }

  if (action === "cancel") {
    if (target.disabled) {
      return;
    }
    jobsStatus.textContent = "Membatalkan job...";
    jobsStatus.className = "status";
    try {
      const res = await apiFetch(`/api/jobs/${encodeURIComponent(jobId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "canceled", sessionId: getSessionId() })
      });
      const body = await res.json();
      if (!res.ok) {
        jobsStatus.textContent = body.error || "Gagal membatalkan job.";
        jobsStatus.className = "status error";
        return;
      }
      jobsStatus.textContent = "Job dibatalkan.";
      jobsStatus.className = "status success";
      await loadJobs();
    } catch (err) {
      jobsStatus.textContent = "Gagal terhubung ke server.";
      jobsStatus.className = "status error";
    }
  }
  });
}

export function initJobs() {
  bindUploadForm();
  refreshBtn.addEventListener("click", loadJobs);
  bindJobActions();
}

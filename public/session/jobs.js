import { apiFetch } from "./api.js";
import { getSessionId } from "./session.js";
import { getPreviewSubmission, resetPreviewState } from "./preview.js";

const uploadForm = document.getElementById("uploadForm");
const uploadStatus = document.getElementById("uploadStatus");
const jobsBody = document.getElementById("jobsBody");
const jobsStatus = document.getElementById("jobsStatus");
const refreshBtn = document.getElementById("refreshBtn");
const downloadAllProofBtn = document.getElementById("downloadAllProofBtn");
let loadJobsTimer = null;
let latestJobs = [];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isCompletedJob(job) {
  const status = String(job?.status || "").toLowerCase();
  return status === "done" || status === "sent";
}

function formatStatus(value = "") {
  const status = String(value || "").toLowerCase();
  if (status === "ready") return "Ready";
  if (status === "processing" || status === "claimed") return "Diproses";
  if (status === "done" || status === "sent") return "Selesai";
  if (status === "canceled") return "Batal";
  return value || "-";
}

function getStatusClass(value = "") {
  const status = String(value || "").toLowerCase();
  if (status === "ready" || status === "done" || status === "sent") return "success";
  if (status === "processing" || status === "claimed") return "warning";
  if (status === "canceled") return "error";
  return "";
}

function getJobConfigText(job) {
  const contentScale = Number(job.printConfig?.contentScale || 100);
  return [
    job.printConfig?.paperSize,
    job.printConfig?.colorMode === "bw" ? "BW" : "Col",
    job.printConfig?.orientation === "landscape" ? "L" : "P",
    job.printConfig?.copies ? String(job.printConfig.copies) : "",
    job.printConfig?.pageRange ? `(${job.printConfig.pageRange})` : "",
    contentScale !== 100 ? `${contentScale}%` : ""
  ].filter(Boolean).join(" - ");
}

function getReceiptContext() {
  return {
    storeName: sessionStorage.getItem("printformSessionClientName") || "Toko Percetakan",
    storeCode: sessionStorage.getItem("printformSessionStoreCode") || "-",
    storeAddress: sessionStorage.getItem("printformSessionStoreAddress") || "Alamat toko belum tersedia",
    storeHours: sessionStorage.getItem("printformSessionStoreHours") || "Jam operasional belum tersedia",
    sessionId: getSessionId() || "-",
    alias: sessionStorage.getItem("printformSessionAlias") || "-"
  };
}

function wrapCanvasText(ctx, text, maxWidth) {
  const words = String(text || "-").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }

  if (line) {
    lines.push(line);
  }

  return lines.length ? lines : ["-"];
}

function drawReceiptText(ctx, text, x, y, options = {}) {
  ctx.font = `${options.weight || "400"} ${options.size || 24}px "Courier New", monospace`;
  ctx.fillStyle = options.color || "#111111";
  ctx.textAlign = options.align || "left";
  ctx.textBaseline = "top";
  ctx.fillText(String(text ?? ""), x, y);
}

function drawDivider(ctx, y, width, margin) {
  ctx.save();
  ctx.strokeStyle = "#111111";
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(margin, y);
  ctx.lineTo(width - margin, y);
  ctx.stroke();
  ctx.restore();
}

function drawKeyValue(ctx, label, value, x, y, maxWidth) {
  drawReceiptText(ctx, label, x, y, { size: 20, weight: "700" });
  const lines = wrapCanvasText(ctx, value, maxWidth - 160);
  lines.forEach((line, index) => {
    drawReceiptText(ctx, line, x + 160, y + (index * 25), { size: 20 });
  });
  return y + Math.max(1, lines.length) * 25;
}

function buildReceiptCanvas(jobs, { title = "BUKTI CETAK" } = {}) {
  const completedJobs = jobs.filter(isCompletedJob);
  const context = getReceiptContext();
  const width = 576;
  const margin = 34;
  const contentWidth = width - (margin * 2);
  const height = Math.max(820, 720 + (completedJobs.length * 360));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  let y = 28;
  drawReceiptText(ctx, "PrintForm", width / 2, y, { size: 38, weight: "700", align: "center" });
  y += 46;
  drawReceiptText(ctx, title, width / 2, y, { size: 22, weight: "700", align: "center" });
  y += 34;
  wrapCanvasText(ctx, context.storeName, contentWidth).forEach(line => {
    drawReceiptText(ctx, line, width / 2, y, { size: 24, weight: "700", align: "center" });
    y += 29;
  });
  wrapCanvasText(ctx, context.storeAddress, contentWidth).forEach(line => {
    drawReceiptText(ctx, line, width / 2, y, { size: 18, align: "center" });
    y += 23;
  });
  drawReceiptText(ctx, context.storeHours, width / 2, y, { size: 18, align: "center" });
  y += 32;
  drawDivider(ctx, y, width, margin);
  y += 22;

  y = drawKeyValue(ctx, "Kode", context.storeCode, margin, y, contentWidth);
  y = drawKeyValue(ctx, "Alias", context.alias, margin, y + 6, contentWidth);
  y = drawKeyValue(ctx, "Sesi", context.sessionId, margin, y + 6, contentWidth);
  y = drawKeyValue(ctx, "Tanggal", new Date().toLocaleString(), margin, y + 6, contentWidth);
  y += 18;
  drawDivider(ctx, y, width, margin);
  y += 22;

  completedJobs.forEach((job, index) => {
    drawReceiptText(ctx, `${index + 1}. ${job.id}`, margin, y, { size: 20, weight: "700" });
    y += 28;
    wrapCanvasText(ctx, job.originalName || "-", contentWidth - 18).forEach(line => {
      drawReceiptText(ctx, line, margin + 18, y, { size: 20 });
      y += 25;
    });
    y = drawKeyValue(ctx, "Config", getJobConfigText(job) || "-", margin + 18, y + 4, contentWidth - 18);
    y = drawKeyValue(ctx, "Status", formatStatus(job.status), margin + 18, y + 4, contentWidth - 18);
    y = drawKeyValue(ctx, "Waktu", new Date(job.createdAt).toLocaleString(), margin + 18, y + 4, contentWidth - 18);
    y += 16;
    drawDivider(ctx, y, width, margin);
    y += 22;
  });

  drawReceiptText(ctx, `Total tugas selesai: ${completedJobs.length}`, margin, y, { size: 22, weight: "700" });
  y += 36;
  drawReceiptText(ctx, "Simpan bukti ini untuk pengecekan tugas cetak.", width / 2, y, { size: 18, align: "center" });
  y += 28;
  drawReceiptText(ctx, "Terima kasih", width / 2, y, { size: 22, weight: "700", align: "center" });

  return canvas;
}

function downloadCanvas(canvas, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function slugify(value) {
  return String(value || "bukti")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "bukti";
}

function downloadProofForJobs(jobs, filenamePrefix = "bukti-cetak") {
  const completedJobs = jobs.filter(isCompletedJob);
  if (completedJobs.length === 0) {
    jobsStatus.textContent = "Belum ada tugas selesai untuk diunduh buktinya.";
    jobsStatus.className = "status";
    return;
  }

  const canvas = buildReceiptCanvas(completedJobs, {
    title: completedJobs.length > 1 ? "BUKTI CETAK GABUNGAN" : "BUKTI CETAK"
  });
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, "");
  downloadCanvas(canvas, `${slugify(filenamePrefix)}-${timestamp}.png`);
  jobsStatus.textContent = "Bukti cetak berhasil dibuat.";
  jobsStatus.className = "status success";
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
    latestJobs = [];
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
    latestJobs = Array.isArray(jobs) ? jobs : [];
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
      const status = String(job.status || "").toLowerCase();
      const isReady = status === "ready";
      const isFinal = status === "done" || status === "sent" || status === "canceled";
      const isCompleted = isCompletedJob(job);
      const cloneDisabled = isFinal ? "disabled" : "";
      const cancelDisabled = isReady ? "" : "disabled";
      
      const configParts = [
        job.printConfig.paperSize,
        job.printConfig.colorMode === "bw" ? "BW" : "Col",
        job.printConfig.orientation === "landscape" ? "L" : "P",
        job.printConfig.copies ? String(job.printConfig.copies) : "",
        job.printConfig.pageRange ? `(${job.printConfig.pageRange})` : "",
        job.printConfig.contentScale !== 100 ? `${job.printConfig.contentScale}%` : ""
      ].filter(Boolean).join(" - ");
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
          <button type="button" data-job-id="${escapeHtml(job.id)}" data-action="clone" ${cloneDisabled}>Buat Lagi</button>
          <button type="button" data-job-id="${escapeHtml(job.id)}" data-action="cancel" ${cancelDisabled}>Batal</button>
          ${isCompleted ? `<button class="session-proof-btn" type="button" data-job-id="${escapeHtml(job.id)}" data-action="download-proof">↓ Bukti</button>` : ""}
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
    if (target.disabled) {
      return;
    }
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

  if (action === "download-proof") {
    const job = latestJobs.find(item => item.id === jobId);
    if (!job || !isCompletedJob(job)) {
      jobsStatus.textContent = "Bukti hanya tersedia untuk tugas selesai.";
      jobsStatus.className = "status";
      return;
    }
    downloadProofForJobs([job], `bukti-${job.id}`);
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
  downloadAllProofBtn?.addEventListener("click", () => {
    downloadProofForJobs(latestJobs, "bukti-semua-tugas-selesai");
  });
  bindJobActions();
}

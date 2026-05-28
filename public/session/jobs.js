import { apiFetch } from "./api.js";
import { getSessionId } from "./session.js";
import { getPreviewSubmission, resetPreviewState } from "./preview.js";

const uploadForm = document.getElementById("uploadForm");
const uploadStatus = document.getElementById("uploadStatus");
const jobsBody = document.getElementById("jobsBody");
const jobsStatus = document.getElementById("jobsStatus");
const refreshBtn = document.getElementById("refreshBtn");
const downloadAllProofBtn = document.getElementById("downloadAllProofBtn");
const jobDetailModal = document.getElementById("jobDetailModal");
const closeJobDetailBtn = document.getElementById("closeJobDetailBtn");
const jobDetailContent = document.getElementById("jobDetailContent");
const jobDetailSubtitle = document.getElementById("jobDetailSubtitle");
const detailCloneBtn = document.getElementById("detailCloneBtn");
const detailCancelBtn = document.getElementById("detailCancelBtn");
let loadJobsTimer = null;
let latestJobs = [];
let selectedDetailJobId = "";

function notify(variant, title, message) {
  window.PrintFormAlert?.notify({ variant, title, message });
}

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

function getClaimedBy(job) {
  return job.claimedByClientName || job.claimedByClientId || "-";
}

function formatJobTime(value) {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleString();
}

function formatCurrency(value) {
  if (!Number.isFinite(Number(value))) {
    return "-";
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(value));
}

function getJobEstimatedPrice(job) {
  const price = Number(job?.printConfig?.estimatedPrice);
  return Number.isFinite(price) && price > 0 ? price : 0;
}

function formatEstimatedPrice(job) {
  const price = getJobEstimatedPrice(job);
  return price > 0 ? formatCurrency(price) : "-";
}

function setJobDetailOpen(isOpen) {
  if (!jobDetailModal) {
    return;
  }

  jobDetailModal.classList.toggle("hidden", !isOpen);
  document.body.classList.toggle("session-modal-open", isOpen || !document.getElementById("jobsModal")?.classList.contains("hidden"));
}

function renderDetailRow(label, value, className = "") {
  const extraClass = className ? ` ${className}` : "";
  return `
    <div class="session-detail-row${extraClass}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value || "-")}</strong>
    </div>`;
}

function openJobDetail(jobId) {
  const job = latestJobs.find(item => item.id === jobId);
  if (!job || !jobDetailContent) {
    return;
  }

  selectedDetailJobId = job.id;
  const status = String(job.status || "").toLowerCase();
  const isReady = status === "ready";
  const isFinal = status === "done" || status === "sent" || status === "canceled";

  if (jobDetailSubtitle) {
    jobDetailSubtitle.textContent = job.originalName || "Informasi lengkap tugas cetak";
  }

  jobDetailContent.innerHTML = [
    renderDetailRow("ID", job.id),
    renderDetailRow("Nama Dokumen", job.originalName, "session-detail-wide-row"),
    renderDetailRow("Alias", job.alias || "-"),
    renderDetailRow("Diklaim Oleh", getClaimedBy(job)),
    renderDetailRow("Konfigurasi", getJobConfigText(job) || "-", "session-detail-wide-row"),
    renderDetailRow("Estimasi Harga", formatEstimatedPrice(job), "session-detail-price-row"),
    renderDetailRow("Status", formatStatus(job.status)),
    renderDetailRow("Waktu", formatJobTime(job.createdAt))
  ].join("");

  if (detailCloneBtn) {
    detailCloneBtn.disabled = isFinal;
  }
  if (detailCancelBtn) {
    detailCancelBtn.disabled = !isReady;
  }

  setJobDetailOpen(true);
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
  ctx.font = `${options.weight || "400"} ${options.size || 24}px Arial, "Helvetica Neue", sans-serif`;
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
  const totalPrice = completedJobs.reduce((sum, job) => sum + getJobEstimatedPrice(job), 0);
  const width = 576;
  const margin = 34;
  const contentWidth = width - (margin * 2);
  const estimatedHeight = Math.max(860, 700 + (completedJobs.length * 255));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = estimatedHeight;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, estimatedHeight);

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
    y = drawKeyValue(ctx, "Harga", formatEstimatedPrice(job), margin + 18, y + 4, contentWidth - 18);
    y = drawKeyValue(ctx, "Status", formatStatus(job.status), margin + 18, y + 4, contentWidth - 18);
    y = drawKeyValue(ctx, "Waktu", new Date(job.createdAt).toLocaleString(), margin + 18, y + 4, contentWidth - 18);
    y += 16;
    drawDivider(ctx, y, width, margin);
    y += 22;
  });

  drawReceiptText(ctx, `Total tugas selesai: ${completedJobs.length}`, margin, y, { size: 22, weight: "700" });
  y += 36;
  drawReceiptText(ctx, `Total harga: ${formatCurrency(totalPrice)}`, margin, y, { size: 26, weight: "700" });
  y += 42;
  drawReceiptText(ctx, "Simpan bukti ini untuk pengecekan tugas cetak.", width / 2, y, { size: 18, align: "center" });
  y += 28;
  drawReceiptText(ctx, "Terima kasih", width / 2, y, { size: 22, weight: "700", align: "center" });
  y += 42;

  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = width;
  finalCanvas.height = Math.ceil(y);
  const finalCtx = finalCanvas.getContext("2d");
  finalCtx.fillStyle = "#ffffff";
  finalCtx.fillRect(0, 0, width, finalCanvas.height);
  finalCtx.drawImage(canvas, 0, 0);

  return finalCanvas;
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
    notify("warning", "Bukti Belum Tersedia", "Belum ada tugas selesai untuk diunduh buktinya.");
    return false;
  }

  const canvas = buildReceiptCanvas(completedJobs, {
    title: completedJobs.length > 1 ? "BUKTI CETAK GABUNGAN" : "BUKTI CETAK"
  });
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, "");
  downloadCanvas(canvas, `${slugify(filenamePrefix)}-${timestamp}.png`);
  jobsStatus.textContent = "Bukti cetak berhasil dibuat.";
  jobsStatus.className = "status success";
  notify("success", "Bukti Cetak Diunduh", "Bukti cetak berhasil dibuat dan diunduh.");
  return true;
}

export function downloadAllCompletedProofs() {
  return downloadProofForJobs(latestJobs, "bukti-semua-tugas-selesai");
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
    jobsBody.innerHTML = '<p class="muted">Session belum aktif.</p>';
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
      jobsBody.innerHTML = '<p class="muted">Belum ada tugas cetak.</p>';
      jobsStatus.textContent = "";
      return;
    }

    jobsBody.innerHTML = jobs.map(job => {
      const status = String(job.status || "").toLowerCase();
      const isCompleted = isCompletedJob(job);
      const statusClass = getStatusClass(job.status);
      const originalName = job.originalName || "-";

      return `
      <article class="session-job-card" data-job-id="${escapeHtml(job.id)}" tabindex="0" role="button" aria-label="Lihat detail ${escapeHtml(originalName)}">
        <div class="session-job-file-icon" aria-hidden="true">PDF</div>
        <div class="session-job-card-main">
          <div class="session-job-card-top">
            <h3>${escapeHtml(originalName)}</h3>
            <span class="session-status-pill ${statusClass}">${escapeHtml(formatStatus(job.status))}</span>
          </div>
          <div class="session-job-card-actions">
            <span class="session-job-time">${escapeHtml(formatJobTime(job.createdAt))}</span>
            ${isCompleted ? `<button class="session-proof-btn" type="button" data-job-id="${escapeHtml(job.id)}" data-action="download-proof">↓ Bukti</button>` : ""}
          </div>
        </div>
      </article>`;
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
    notify("info", "Mengirim Tugas", "Tugas cetak sedang dikirim ke toko.");

    const preview = getPreviewSubmission();
    if (preview.pending) {
      uploadStatus.textContent = "Konversi masih berjalan. Mohon tunggu.";
      uploadStatus.className = "status error";
      notify("warning", "Konversi Masih Berjalan", "Mohon tunggu sampai preview selesai diproses.");
      return;
    }

    if (preview.error) {
      uploadStatus.textContent = preview.error;
      uploadStatus.className = "status error";
      notify("error", "Tugas Gagal Dikirim", preview.error);
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
    if (preview.colorDetection) {
      formData.set("colorDetection", JSON.stringify(preview.colorDetection));
      if (Number.isFinite(Number(preview.colorDetection.estimatedPrice))) {
        formData.set("estimatedPrice", String(preview.colorDetection.estimatedPrice));
      }
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
        notify("error", "Tugas Gagal Dikirim", body.error || "Gagal mengirim tugas cetak.");
        return;
      }
      uploadStatus.textContent = "Job berhasil dikirim.";
      uploadStatus.className = "status success";
      notify("success", "Tugas Dikirim", "Tugas cetak berhasil dikirim.");
      uploadForm.reset();
      resetPreviewState();
      await loadJobs();
    } catch (err) {
      uploadStatus.textContent = "Gagal terhubung ke server.";
      uploadStatus.className = "status error";
      notify("error", "Tugas Gagal Dikirim", "Gagal terhubung ke server.");
    }
  });
}

async function cloneJob(jobId) {
  jobsStatus.textContent = "Membuat ulang job...";
  jobsStatus.className = "status";
  notify("info", "Membuat Tugas Baru", "Tugas baru sedang dibuat dari tugas sebelumnya.");
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
      notify("error", "Gagal Membuat Tugas", body.error || "Gagal membuat tugas baru.");
      return;
    }
    jobsStatus.textContent = "Job baru berhasil dibuat.";
    jobsStatus.className = "status success";
    notify("success", "Tugas Baru Dibuat", "Tugas baru berhasil dibuat.");
    setJobDetailOpen(false);
    await loadJobs();
  } catch (err) {
    jobsStatus.textContent = "Gagal terhubung ke server.";
    jobsStatus.className = "status error";
    notify("error", "Gagal Membuat Tugas", "Gagal terhubung ke server.");
  }
}

async function cancelJob(jobId) {
  jobsStatus.textContent = "Membatalkan job...";
  jobsStatus.className = "status";
  notify("info", "Membatalkan Tugas", "Permintaan pembatalan tugas sedang dikirim.");
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
      notify("error", "Gagal Membatalkan Tugas", body.error || "Gagal membatalkan tugas.");
      return;
    }
    jobsStatus.textContent = "Job dibatalkan.";
    jobsStatus.className = "status success";
    notify("success", "Tugas Dibatalkan", "Tugas cetak berhasil dibatalkan.");
    setJobDetailOpen(false);
    await loadJobs();
  } catch (err) {
    jobsStatus.textContent = "Gagal terhubung ke server.";
    jobsStatus.className = "status error";
    notify("error", "Gagal Membatalkan Tugas", "Gagal terhubung ke server.");
  }
}

function downloadProof(jobId) {
  const job = latestJobs.find(item => item.id === jobId);
  if (!job || !isCompletedJob(job)) {
    jobsStatus.textContent = "Bukti hanya tersedia untuk tugas selesai.";
    jobsStatus.className = "status";
    notify("warning", "Bukti Belum Tersedia", "Bukti hanya tersedia untuk tugas selesai.");
    return;
  }
  downloadProofForJobs([job], `bukti-${job.id}`);
}

function bindJobActions() {
  jobsBody.addEventListener("click", async (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }
    const button = event.target.closest("button");
    if (button) {
      event.stopPropagation();
      if (button.disabled) {
        return;
      }
      const jobId = button.dataset.jobId;
      if (button.dataset.action === "download-proof" && jobId) {
        downloadProof(jobId);
      }
      return;
    }

    const card = event.target.closest(".session-job-card");
    if (card?.dataset.jobId) {
      openJobDetail(card.dataset.jobId);
    }
  });

  jobsBody.addEventListener("keydown", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    const card = event.target.closest(".session-job-card");
    if (card?.dataset.jobId) {
      event.preventDefault();
      openJobDetail(card.dataset.jobId);
    }
  });

  detailCloneBtn?.addEventListener("click", () => {
    const job = latestJobs.find(item => item.id === selectedDetailJobId);
    const status = String(job?.status || "").toLowerCase();
    if (!job || status === "done" || status === "sent" || status === "canceled") {
      return;
    }
    cloneJob(job.id);
  });

  detailCancelBtn?.addEventListener("click", () => {
    const job = latestJobs.find(item => item.id === selectedDetailJobId);
    if (!job || String(job.status || "").toLowerCase() !== "ready") {
      return;
    }
    cancelJob(job.id);
  });

  closeJobDetailBtn?.addEventListener("click", () => {
    setJobDetailOpen(false);
  });

  jobDetailModal?.addEventListener("click", (event) => {
    if (event.target === jobDetailModal) {
      setJobDetailOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setJobDetailOpen(false);
    }
  });
}

export function initJobs() {
  bindUploadForm();
  refreshBtn.addEventListener("click", loadJobs);
  downloadAllProofBtn?.addEventListener("click", () => {
    downloadAllCompletedProofs();
  });
  bindJobActions();
}

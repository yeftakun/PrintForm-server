import { apiFetch } from "./api.js";

if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

const uploadForm = document.getElementById("uploadForm");
const printPreviewPanel = document.getElementById("printPreviewPanel");
const previewFileName = document.getElementById("previewFileName");
const previewFileSize = document.getElementById("previewFileSize");
const previewPriceEstimate = document.getElementById("previewPriceEstimate");
const previewPaperSize = document.getElementById("previewPaperSize");
const previewColorMode = document.getElementById("previewColorMode");
const previewOrientation = document.getElementById("previewOrientation");
const previewPageRange = document.getElementById("previewPageRange");
const previewContentScale = document.getElementById("previewContentScale");
const previewCopies = document.getElementById("previewCopies");
const previewImpressions = document.getElementById("previewImpressions");
const previewWarning = document.getElementById("previewWarning");
const uploadFileInput = uploadForm.querySelector('input[name="document"]');
const uploadPaperSizeInput = uploadForm.querySelector('select[name="paperSize"]');
const uploadCopiesInput = uploadForm.querySelector('input[name="copies"]');
const uploadColorModeInput = uploadForm.querySelector('select[name="colorMode"]');
const uploadOrientationInput = uploadForm.querySelector('select[name="orientation"]');
const uploadPageRangeInput = uploadForm.querySelector('input[name="pageRange"]');
const uploadContentScaleInput = uploadForm.querySelector('[name="contentScale"]');
let previewDebounceTimer = null;

const previewState = {
  fileName: "",
  fileSizeBytes: 0,
  paperSize: "A4",
  copies: 1,
  colorMode: "color",
  orientation: "portrait",
  pageRange: "",
  contentScale: 100,
  hasFile: false
};
let previewConvertedFile = null;
let previewConversionPending = false;
let previewConversionSeq = 0;
let previewConversionError = "";
let previewConversionNotice = "";
let previewDocxActive = false;
let previewDocxUrl = "";
let previewPollTimer = null;
let previewPollAttempts = 0;
let previewConversionId = null;

function formatPreviewFileSize(bytes) {
  const safeBytes = Number(bytes) || 0;
  if (safeBytes <= 0) {
    return "-";
  }

  const kb = safeBytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  return `${(kb / 1024).toFixed(1)} MB`;
}

let currentVisualPreviewFile = null;
let currentPdfDocument = null;

let previewZoom = 1;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

function setPreviewZoom(newZoom) {
  previewZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
  const visualArea = document.getElementById("visualPreviewArea");
  if (!visualArea) return;
  visualArea.style.setProperty('--preview-zoom', previewZoom);
}

function handlePreviewWheel(e) {
  if (e.ctrlKey) {
    e.preventDefault();
    if (e.deltaY < 0) {
      setPreviewZoom(previewZoom + ZOOM_STEP);
    } else if (e.deltaY > 0) {
      setPreviewZoom(previewZoom - ZOOM_STEP);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const visualArea = document.getElementById("visualPreviewArea");
  if (visualArea) {
    visualArea.addEventListener('wheel', handlePreviewWheel, { passive: false });
  }
  setPreviewZoom(1);
});

let lastRenderedFile = null;
let lastTotalPages = 1;
let colorAnalysisState = {
  status: "idle",
  pages: [],
  bwPages: 0,
  colorPages: 0,
  estimatedPrice: null
};

function safeParseJson(value) {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function getStoreServiceConfig() {
  return safeParseJson(sessionStorage.getItem("printformSessionStoreServices")) || {};
}

function getPrintPrices() {
  const service = getStoreServiceConfig();
  const prices = service.hargaModeWarna && typeof service.hargaModeWarna === "object"
    ? service.hargaModeWarna
    : {};
  const fallback = Number.isFinite(Number(service.hargaDasar)) && Number(service.hargaDasar) > 0
    ? Number(service.hargaDasar)
    : 1000;

  return {
    bw: Number.isFinite(Number(prices.bw)) && Number(prices.bw) > 0 ? Number(prices.bw) : fallback,
    color: Number.isFinite(Number(prices.color)) && Number(prices.color) > 0 ? Number(prices.color) : Math.max(2000, fallback)
  };
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

function parsePageRange(range, totalPages) {
  const allPages = Array.from({ length: Math.max(0, totalPages) }, (_, index) => index + 1);
  const text = String(range || "").trim();
  if (!text) {
    return allPages;
  }

  const selected = new Set();
  text.split(",").forEach(part => {
    const token = part.trim();
    if (!token) return;
    const rangeMatch = token.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      const start = Math.max(1, Number(rangeMatch[1]));
      const end = Math.min(totalPages, Number(rangeMatch[2]));
      for (let page = Math.min(start, end); page <= Math.max(start, end); page += 1) {
        if (page >= 1 && page <= totalPages) selected.add(page);
      }
      return;
    }
    const pageNumber = Number(token);
    if (Number.isInteger(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      selected.add(pageNumber);
    }
  });

  return selected.size > 0 ? [...selected].sort((a, b) => a - b) : allPages;
}

function resetColorAnalysis(status = "idle") {
  colorAnalysisState = {
    status,
    pages: [],
    bwPages: 0,
    colorPages: 0,
    estimatedPrice: null
  };
}

function isColoredCanvas(canvas) {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const width = canvas.width;
  const height = canvas.height;
  if (!context || width <= 0 || height <= 0) {
    return { mode: "bw", colorRatio: 0 };
  }

  const data = context.getImageData(0, 0, width, height).data;
  const stride = Math.max(1, Math.floor(Math.sqrt((width * height) / 90000)));
  let sampled = 0;
  let colorPixels = 0;

  for (let y = 0; y < height; y += stride) {
    for (let x = 0; x < width; x += stride) {
      const index = (y * width + x) * 4;
      const alpha = data[index + 3];
      if (alpha < 32) continue;

      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const brightness = (r + g + b) / 3;
      if (brightness > 245 && max - min < 12) continue;

      sampled += 1;
      const chroma = max - min;
      const saturation = max === 0 ? 0 : chroma / max;
      const colorLike = brightness < 45
        ? chroma > 42 && saturation > 0.45
        : chroma > 24 && saturation > 0.12;
      if (colorLike) {
        colorPixels += 1;
      }
    }
  }

  const colorRatio = sampled > 0 ? colorPixels / sampled : 0;
  return {
    mode: colorRatio >= 0.012 ? "color" : "bw",
    colorRatio
  };
}

function updateColorAnalysisEstimate() {
  const totalPages = Math.max(1, lastTotalPages || 1);
  const selectedPages = parsePageRange(previewState.pageRange, totalPages);
  const copies = Math.max(1, Number(previewState.copies || 1));
  const prices = getPrintPrices();
  const analyzedPages = new Map(colorAnalysisState.pages.map(page => [page.page, page]));
  let bwPages = 0;
  let colorPages = 0;

  selectedPages.forEach(pageNumber => {
    const page = analyzedPages.get(pageNumber);
    if (previewState.colorMode !== "bw" && page?.mode === "color") {
      colorPages += 1;
    } else {
      bwPages += 1;
    }
  });

  colorAnalysisState = {
    ...colorAnalysisState,
    bwPages,
    colorPages,
    estimatedPrice: ((bwPages * prices.bw) + (colorPages * prices.color)) * copies
  };
}

function updatePreviewSummary() {
  previewFileName.textContent = previewState.fileName || "-";
  previewFileSize.textContent = formatPreviewFileSize(previewState.fileSizeBytes);
  previewPaperSize.textContent = previewState.paperSize || "-";
  previewCopies.textContent = String(previewState.copies || "-");
  previewColorMode.textContent = previewState.colorMode === "bw" ? "Hitam Putih" : "Warna";
  previewOrientation.textContent = previewState.orientation === "landscape" ? "Landscape" : "Portrait";
  previewPageRange.textContent = previewState.pageRange || "Semua";
  previewContentScale.textContent = previewState.contentScale + "%";
  previewImpressions.textContent = previewState.hasFile ? `${Math.max(1, lastTotalPages || 1)} halaman` : "-";

  if (previewPriceEstimate) {
    if (!previewState.hasFile || !Number.isFinite(Number(colorAnalysisState.estimatedPrice))) {
      previewPriceEstimate.textContent = "-";
    } else {
      previewPriceEstimate.textContent = `Estimasi ${formatCurrency(colorAnalysisState.estimatedPrice)}`;
    }
  }
}

function updatePageRangeInput(totalPages) {
  lastTotalPages = totalPages;
  const pageRangeInput = document.getElementById("pageRange");
  if (!pageRangeInput) return;
  
  const pageRangeContainer = pageRangeInput.closest(".field");
  if (pageRangeContainer) {
     if (totalPages <= 1) {
       pageRangeInput.disabled = true;
       pageRangeInput.placeholder = "Semua (hanya 1 halaman)";
       pageRangeInput.value = ""; // clear value if disabled
       pageRangeContainer.style.opacity = "0.5";
     } else {
       pageRangeInput.disabled = false;
       pageRangeInput.placeholder = `Contoh: 1, 3-${Math.min(5, totalPages)}`;
       pageRangeContainer.style.opacity = "1";
     }
  }
  updateColorAnalysisEstimate();
  updatePreviewSummary();
}

function isOfficeDocument(file) {
  const name = String(file?.name || "");
  const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
  return ext === ".doc" || ext === ".docx" || ext === ".ppt" || ext === ".pptx";
}

function buildPdfFileName(file) {
  const name = String(file?.name || "document");
  const baseName = name.replace(/\.[^/.]+$/, "");
  return `${baseName || "document"}.pdf`;
}

function setVisualPreviewMessage(text, isError = false) {
  const visualArea = document.getElementById("visualPreviewArea");
  if (!visualArea) {
    return;
  }
  const color = isError ? "#b91c1c" : "#666";
  visualArea.innerHTML = `<div class="visual-preview-placeholder" style="color:${color}">${text}</div>`;
}

function getDocxRenderer() {
  if (window.docx && typeof window.docx.renderAsync === "function") {
    return window.docx.renderAsync;
  }
  if (window.docxPreview && typeof window.docxPreview.renderAsync === "function") {
    return window.docxPreview.renderAsync;
  }
  return null;
}

async function renderDocxPreviewFromUrl(sourceUrl, expectedSeq) {
  const visualArea = document.getElementById("visualPreviewArea");
  if (!visualArea) {
    return;
  }

  if (expectedSeq && expectedSeq !== previewConversionSeq) {
    return;
  }

  const renderAsync = getDocxRenderer();
  if (!renderAsync) {
    setVisualPreviewMessage("Docx preview belum siap.", true);
    return;
  }

  const res = await apiFetch(sourceUrl);
  if (!res.ok) {
    throw new Error("Gagal memuat dokumen untuk preview");
  }

  const buffer = await res.arrayBuffer();
  if (expectedSeq && expectedSeq !== previewConversionSeq) {
    return;
  }
  visualArea.innerHTML = "";

  const container = document.createElement("div");
  container.className = "docx-preview-container";
  visualArea.appendChild(container);

  await renderAsync(buffer, container, null, {
    inWrapper: false,
    ignoreWidth: false,
    ignoreHeight: false
  });

  if (expectedSeq && expectedSeq !== previewConversionSeq) {
    return;
  }

  updatePageRangeInput(1);
}

function clearPreviewPoll() {
  if (previewPollTimer) {
    clearTimeout(previewPollTimer);
    previewPollTimer = null;
  }
  previewPollAttempts = 0;
}

function toPdfStatusUrl(pdfUrl) {
  const marker = "/api/jobs/preview/file/";
  if (typeof pdfUrl !== "string" || !pdfUrl.includes(marker)) {
    return "";
  }

  const encodedName = pdfUrl.split(marker)[1] || "";
  if (!encodedName) {
    return "";
  }

  return `/api/jobs/preview/status/${encodedName}`;
}

function startPdfPolling(pdfUrl, pdfStatusUrl, sourceFile, maxAttempts = 30, delayMs = 2000) {
  clearPreviewPoll();

  const statusUrl = pdfStatusUrl || toPdfStatusUrl(pdfUrl);
  if (!statusUrl) {
    previewConversionError = "URL status konversi tidak valid.";
    renderPreviewState();
    return;
  }

  const currentSeq = previewConversionSeq;
  const attemptFetch = async () => {
    if (currentSeq !== previewConversionSeq) {
      return;
    }
    previewPollAttempts += 1;

    try {
      const statusRes = await apiFetch(statusUrl);
      if (!statusRes.ok) {
        throw new Error("Gagal mengecek status konversi");
      }

      const statusPayload = await statusRes.json();
      if (statusPayload?.ready) {
        const finalPdfUrl = String(statusPayload.url || pdfUrl || "");
        const pdfRes = await apiFetch(finalPdfUrl);
        if (!pdfRes.ok) {
          throw new Error("Gagal mengambil PDF hasil konversi");
        }

        const blob = await pdfRes.blob();
        if (currentSeq !== previewConversionSeq) {
          return;
        }

        const pdfName = buildPdfFileName(sourceFile);
        previewConvertedFile = new File([blob], pdfName, { type: "application/pdf" });
        previewConversionPending = false;
        previewConversionNotice = "";
        previewDocxActive = false;
        previewDocxUrl = "";
        renderPreviewState();
        return;
      }
    } catch (err) {
      if (currentSeq !== previewConversionSeq) {
        return;
      }
      previewConversionError = "Konversi ke PDF gagal. Silakan coba lagi.";
      setVisualPreviewMessage("Gagal mengonversi dokumen.", true);
      renderPreviewState();
      return;
    }

    if (previewPollAttempts >= maxAttempts) {
      previewConversionError = "Konversi PDF terlalu lama. Silakan coba lagi.";
      renderPreviewState();
      return;
    }

    previewPollTimer = setTimeout(attemptFetch, delayMs);
  };

  previewPollTimer = setTimeout(attemptFetch, delayMs);
}

function getPreviewFile() {
  return previewConvertedFile || uploadFileInput?.files?.[0] || null;
}

async function convertFileForPreview(file) {
  const currentSeq = ++previewConversionSeq;
  previewConversionPending = true;
  previewConversionError = "";
  previewConversionNotice = "";
  previewConvertedFile = null;
  previewDocxActive = false;
  previewDocxUrl = "";
  clearPreviewPoll();
  setVisualPreviewMessage("Menyiapkan preview...");

  try {
    const formData = new FormData();
    formData.append("document", file);

    const res = await apiFetch("/api/jobs/preview", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Konversi gagal");
    }

    const contentType = res.headers.get("Content-Type") || "";
    let blob = null;

    if (contentType.includes("application/json")) {
      const payload = await res.json();
      if (currentSeq !== previewConversionSeq) {
        return;
      }

      if (payload.sourceUrl) {
        previewConversionPending = false;
        previewDocxUrl = payload.sourceUrl;
        previewConversionNotice = "PDF sedang diproses di server.";

        const ext = String(file?.name || "").toLowerCase();
        if (ext.endsWith(".docx")) {
          try {
            previewDocxActive = true;
            await renderDocxPreviewFromUrl(payload.sourceUrl, currentSeq);
          } catch (docxErr) {
            // Fallback to PDF polling when instant DOCX render fails.
            previewDocxActive = false;
            previewConversionNotice = "Preview instan DOCX gagal, menunggu PDF dari server.";
            setVisualPreviewMessage("Preview instan gagal. Menunggu PDF...");
          }
        } else {
          setVisualPreviewMessage("Preview instan belum tersedia. Menunggu PDF...");
        }

        if (payload.pdfUrl) {
          startPdfPolling(payload.pdfUrl, payload.pdfStatusUrl, file);
        }

        renderPreviewState();
        return;
      } else if (payload.pdfUrl) {
        previewConversionId = payload.previewId || null;
        const pdfRes = await apiFetch(payload.pdfUrl);
        if (!pdfRes.ok) {
          throw new Error("Gagal mengambil PDF hasil konversi");
        }
        blob = await pdfRes.blob();
      } else {
        throw new Error("Respons konversi tidak dikenali");
      }
    } else {
      blob = await res.blob();
    }

    if (currentSeq !== previewConversionSeq) {
      return;
    }

    const pdfName = buildPdfFileName(file);
    previewConvertedFile = new File([blob], pdfName, { type: "application/pdf" });
    previewConversionPending = false;
    previewState.fileName = previewConvertedFile.name;
    previewState.fileSizeBytes = previewConvertedFile.size;
    renderPreviewState();
  } catch (err) {
    if (currentSeq !== previewConversionSeq) {
      return;
    }
    previewConversionPending = false;
    previewConvertedFile = null;
    previewConversionError = "Konversi ke PDF gagal. Silakan coba lagi.";
    previewConversionId = null;
    setVisualPreviewMessage("Gagal mengonversi dokumen.", true);
    renderPreviewState();
  }
}

async function renderVisualPreview(file) {
  const visualArea = document.getElementById("visualPreviewArea");
  
  if (!file) {
    visualArea.innerHTML = '<div class="visual-preview-placeholder">Preview dokumen akan muncul di sini</div>';
    lastRenderedFile = null;
    resetColorAnalysis();
    updatePageRangeInput(1);
    return;
  }

  const isNewFile = file !== lastRenderedFile;
  // Logic to clear existing if new file
  if (isNewFile) {
    lastRenderedFile = file;
    visualArea.innerHTML = '<div class="visual-preview-placeholder">Memuat preview...</div>';

    try {
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const analyzedPages = [];
        updatePageRangeInput(pdf.numPages);

        visualArea.innerHTML = '';
        
        const pagesToRender = Math.min(pdf.numPages, 20);
        const scale = 1.5; // High resolution base
        
        for (let pageNum = 1; pageNum <= pagesToRender; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale });
          
          // Determine container size based on paper size aspect ratio?
          // Actually, for visual preview of PDF, we render the PDF as is, 
          // but we should wrapper it to simulate "Paper".
          
          const container = document.createElement('div');
          container.className = `preview-page-container`;
          
          // Add inner wrapper for content scaling
          const wrapper = document.createElement('div');
          wrapper.className = 'preview-content-wrapper';

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          // Avoid stretching/distortion by fitting within wrapper
          canvas.style.maxWidth = "100%";
          canvas.style.maxHeight = "100%";
          canvas.style.objectFit = "contain";
          
          wrapper.appendChild(canvas);
          container.appendChild(wrapper);
          visualArea.appendChild(container);

          // Initialize zoom to fit width relative to A4
          if (pageNum === 1) {
            const availableWidth = visualArea.clientWidth - 40;
            const availableHeight = visualArea.clientHeight - 40;
            // Approx A4 ratio
            const targetRatio = 210/297;
            if (availableWidth > 0 && availableHeight > 0) {
                const fitZoom = (availableWidth) / (availableHeight * targetRatio); 
                // Normalize zoom based on rendered viewport width vs "Paper Width" logic
                // Simplified: just ensure it fits nicely
                setPreviewZoom(fitZoom < 0.5 ? 0.6 : fitZoom);
            }
          }

          await page.render({ canvasContext: context, viewport: viewport }).promise;
          const colorResult = isColoredCanvas(canvas);
          analyzedPages.push({
            page: pageNum,
            mode: colorResult.mode,
            colorRatio: Number(colorResult.colorRatio.toFixed(4))
          });
        }

        colorAnalysisState = {
          ...colorAnalysisState,
          status: pagesToRender >= pdf.numPages ? "ready" : "partial",
          pages: analyzedPages
        };
        updateColorAnalysisEstimate();
        updatePreviewSummary();
        
        if (pdf.numPages > 20) {
          const note = document.createElement('div');
          note.className = "visual-preview-placeholder";
          note.textContent = `(+ ${pdf.numPages - 20} halaman lainnya...)`;
          visualArea.appendChild(note);
        }

      } else if (file.type.startsWith("image/")) {
        updatePageRangeInput(1);
        visualArea.innerHTML = '';
        const container = document.createElement('div');
        container.className = `preview-page-container`;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'preview-content-wrapper';

        const img = document.createElement('img');
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;
        img.onload = () => {
            const analysisCanvas = document.createElement("canvas");
            const maxSide = 1200;
            const scale = Math.min(1, maxSide / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
            analysisCanvas.width = Math.max(1, Math.round((img.naturalWidth || 1) * scale));
            analysisCanvas.height = Math.max(1, Math.round((img.naturalHeight || 1) * scale));
            const analysisContext = analysisCanvas.getContext("2d");
            analysisContext.drawImage(img, 0, 0, analysisCanvas.width, analysisCanvas.height);
            const colorResult = isColoredCanvas(analysisCanvas);
            colorAnalysisState = {
              ...colorAnalysisState,
              status: "ready",
              pages: [{
                page: 1,
                mode: colorResult.mode,
                colorRatio: Number(colorResult.colorRatio.toFixed(4))
              }]
            };
            updateColorAnalysisEstimate();
            updatePreviewSummary();
            URL.revokeObjectURL(objectUrl);
        };
        wrapper.appendChild(img);
        container.appendChild(wrapper);
        visualArea.appendChild(container);

      } else if (file.type === "text/plain") {
        updatePageRangeInput(1);
        colorAnalysisState = {
          ...colorAnalysisState,
          status: "ready",
          pages: [{ page: 1, mode: "bw", colorRatio: 0 }]
        };
        updateColorAnalysisEstimate();
        const text = await file.text();
        visualArea.innerHTML = '';
        const container = document.createElement('div');
        container.className = `preview-page-container`;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'preview-content-wrapper';
        
        const pre = document.createElement('pre');
        pre.textContent = text.slice(0, 5000) + (text.length > 5000 ? "\n...(terpotong)" : "");
        wrapper.appendChild(pre);
        container.appendChild(wrapper);
        visualArea.appendChild(container);
      } else {
        updatePageRangeInput(1);
        resetColorAnalysis("unknown");
        visualArea.innerHTML = '<div class="visual-preview-placeholder">Preview tidak didukung.</div>';
      }
    } catch (e) {
      console.error(e);
      visualArea.innerHTML = '<div class="visual-preview-placeholder" style="color:red">Error memuat preview.</div>';
    }
  }

  // UPDATE STYLES (Run every time)
  const containers = visualArea.querySelectorAll('.preview-page-container');
  containers.forEach(container => {
     // Color Mode
     if (previewState.colorMode === 'bw') {
         container.classList.add('preview-bw');
     } else {
         container.classList.remove('preview-bw');
     }

     // Orientation (CSS Rotate) - Moved to transform for robust layout
     // Actually, changing Paper Size should change aspect ratio.
     // Orientation "Landscape" should rotate the PAPER, not just the content.
     
     // Calculate Aspect Ratio
     let widthMm = 210;
     let heightMm = 297; // A4
     
     if (previewState.paperSize === 'A5') {
         widthMm = 148;
         heightMm = 210;
     } else if (previewState.paperSize === 'F4') {
         widthMm = 215;
         heightMm = 330;
     }
     
     if (previewState.orientation === 'landscape') {
         // Swap
         [widthMm, heightMm] = [heightMm, widthMm];
     }

     const ratio = widthMm / heightMm;
     container.style.aspectRatio = String(ratio);

     // Content Scale logic
     const wrapper = container.querySelector('.preview-content-wrapper');
     if (wrapper) {
         const scaleVal = (previewState.contentScale || 100) / 100;
         wrapper.style.transform = `scale(${scaleVal})`;
         wrapper.style.transformOrigin = "center center";
         wrapper.style.width = "100%";
         wrapper.style.height = "100%";
         wrapper.style.display = "flex";
         wrapper.style.justifyContent = "center";
         wrapper.style.alignItems = "center";
         wrapper.style.overflow = "hidden";
     }
  });
}

function renderPreviewState() {
  updateColorAnalysisEstimate();
  updatePreviewSummary();

  printPreviewPanel.classList.toggle("print-preview-empty", !previewState.hasFile);

  const showCopiesWarning = previewState.hasFile && previewState.copies > 100;
  if (previewConversionError) {
    previewWarning.textContent = previewConversionError;
    previewWarning.classList.remove("hidden");
  } else if (previewConversionNotice) {
    previewWarning.textContent = previewConversionNotice;
    previewWarning.classList.remove("hidden");
  } else if (previewState.hasFile && colorAnalysisState.status === "partial") {
    previewWarning.textContent = "Estimasi warna hanya menganalisis 20 halaman pertama.";
    previewWarning.classList.remove("hidden");
  } else if (showCopiesWarning) {
    previewWarning.textContent = "Perhatian: jumlah salinan sangat besar. Pastikan konfigurasi sudah benar.";
    previewWarning.classList.remove("hidden");
  } else {
    previewWarning.textContent = "";
    previewWarning.classList.add("hidden");
  }

  if (previewConversionError) {
    setVisualPreviewMessage("Gagal mengonversi dokumen.", true);
    return;
  }

  if (previewConversionPending) {
    setVisualPreviewMessage("Menyiapkan preview...");
    return;
  }

  if (previewDocxActive) {
    return;
  }

  const selectedFile = getPreviewFile();
  renderVisualPreview(selectedFile);
}

export function resetPreviewState() {
  previewState.fileName = "";
  previewState.fileSizeBytes = 0;
  lastTotalPages = 1;
  resetColorAnalysis();
  previewConversionId = null;
  previewState.paperSize = uploadPaperSizeInput?.value || "A4";
  previewState.copies = Math.max(1, Number.parseInt(uploadCopiesInput?.value || "1", 10) || 1);
  previewState.colorMode = uploadColorModeInput?.value || "color";
  previewState.orientation = uploadOrientationInput?.value || "portrait";
  previewState.pageRange = uploadPageRangeInput?.value || "";
  previewState.contentScale = Number(uploadContentScaleInput?.value || 100);
  previewState.hasFile = false;
  previewConversionSeq += 1;
  previewConvertedFile = null;
  previewConversionPending = false;
  previewConversionError = "";
  previewConversionNotice = "";
  previewDocxActive = false;
  previewDocxUrl = "";
  clearPreviewPoll();
  renderPreviewState();
}

function updatePreviewStateFromForm() {
  const selectedFile = uploadFileInput?.files?.[0] || null;
  const fileForPreview = previewConvertedFile || selectedFile;
  previewState.hasFile = Boolean(fileForPreview);
  previewState.fileName = fileForPreview?.name || "";
  previewState.fileSizeBytes = Number(fileForPreview?.size || 0);
  previewState.paperSize = uploadPaperSizeInput?.value || "A4";
  previewState.copies = Math.max(1, Number.parseInt(uploadCopiesInput?.value || "1", 10) || 1);
  previewState.colorMode = uploadColorModeInput?.value || "color";
  previewState.orientation = uploadOrientationInput?.value || "portrait";
  previewState.pageRange = uploadPageRangeInput?.value || "";
  previewState.contentScale = Number(uploadContentScaleInput?.value || 100);
  updateColorAnalysisEstimate();
  renderPreviewState();
}

function schedulePreviewStateUpdate() {
  if (previewDebounceTimer) {
    clearTimeout(previewDebounceTimer);
  }

  previewDebounceTimer = setTimeout(() => {
    updatePreviewStateFromForm();
  }, 80);
}

function handleFileSelection() {
  previewConversionSeq += 1;
  previewConvertedFile = null;
  previewConversionPending = false;
  previewConversionError = "";
  previewConversionNotice = "";
  previewDocxActive = false;
  previewDocxUrl = "";
  clearPreviewPoll();
  resetColorAnalysis("analyzing");

  const selectedFile = uploadFileInput?.files?.[0] || null;
  if (!selectedFile) {
    resetPreviewState();
    return;
  }

  if (isOfficeDocument(selectedFile)) {
    previewConversionPending = true;
    updatePreviewStateFromForm();
    convertFileForPreview(selectedFile);
    return;
  }

  updatePreviewStateFromForm();
}

export function getPreviewSubmission() {
  return {
    pending: previewConversionPending,
    error: previewConversionError,
    convertedFile: previewConvertedFile,
    conversionId: previewConversionId,
    colorDetection: {
      status: colorAnalysisState.status,
      totalPages: lastTotalPages,
      bwPages: colorAnalysisState.bwPages,
      colorPages: colorAnalysisState.colorPages,
      estimatedPrice: colorAnalysisState.estimatedPrice,
      pages: colorAnalysisState.pages
    }
  };
}

export function initPreview() {
  if (uploadFileInput) {
    uploadFileInput.addEventListener("change", handleFileSelection);
  }
  if (uploadPaperSizeInput) {
    uploadPaperSizeInput.addEventListener("change", schedulePreviewStateUpdate);
  }
  if (uploadCopiesInput) {
    uploadCopiesInput.addEventListener("input", schedulePreviewStateUpdate);
    uploadCopiesInput.addEventListener("change", schedulePreviewStateUpdate);
  }
  if (uploadColorModeInput) {
    uploadColorModeInput.addEventListener("change", schedulePreviewStateUpdate);
  }
  if (uploadOrientationInput) {
    uploadOrientationInput.addEventListener("change", schedulePreviewStateUpdate);
  }
  if (uploadPageRangeInput) {
    uploadPageRangeInput.addEventListener("input", schedulePreviewStateUpdate);
  }
  if (uploadContentScaleInput) {
    uploadContentScaleInput.addEventListener("input", schedulePreviewStateUpdate);
  }
}

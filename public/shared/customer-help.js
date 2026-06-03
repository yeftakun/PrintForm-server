(() => {
  const HINT_URL = "/hint.md";
  const FALLBACK_HINT = `1. Masukkan nama anda & Temukan percetakan dengan memasukkan kode toko atau scan barcode pada percetakan.
2. Konfirmasi percetakan yang ditemukan, dan anda akan membuat sesi cetak.
3. Di dalam sesi cetak, anda bisa mengunggah file untuk dicetak dan mengatur atribut cetak seperti jumlah salinan, warna, dan lainnya.
4. Submit tugas cetak anda dan percetakan akan menerima tugas tersebut untuk langsung dicetak.
5. Anda bisa memantau status tugas cetak di dalam sesi tugas cetak.
6. Bukti cetak tersedia setelah tugas berhasil dicetak dan dapat diunduh untuk keperluan pengambilan dokumen anda di percetakan.


Jika anda memiliki pertanyaan atau masalah terkait proses cetak, jangan ragu untuk menghubungi layanan pelanggan percetakan untuk bantuan lebih lanjut.`;

  let backdrop = null;
  let contentEl = null;
  let lastFocus = null;
  let loadedHint = "";

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function parseHint(markdown) {
    const lines = String(markdown || "")
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);
    const steps = [];
    const notes = [];

    lines.forEach(line => {
      const match = line.match(/^\d+\.\s*(.+)$/);
      if (match) {
        steps.push(match[1]);
        return;
      }
      notes.push(line);
    });

    return { steps, notes };
  }

  function renderHint(markdown) {
    const { steps, notes } = parseHint(markdown);
    const stepHtml = steps.length
      ? `<ol>${steps.map(step => `<li>${escapeHtml(step)}</li>`).join("")}</ol>`
      : "";
    const noteHtml = notes.map(note => `<p>${escapeHtml(note)}</p>`).join("");
    return stepHtml || noteHtml
      ? `${stepHtml}${noteHtml}`
      : '<p class="customer-help-loading">Panduan belum tersedia.</p>';
  }

  async function loadHint() {
    if (loadedHint) {
      return loadedHint;
    }
    try {
      const response = await fetch(HINT_URL, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Hint fetch failed: ${response.status}`);
      }
      loadedHint = await response.text();
    } catch {
      loadedHint = FALLBACK_HINT;
    }
    return loadedHint;
  }

  function closeHelp() {
    if (!backdrop) {
      return;
    }
    backdrop.classList.remove("open");
    backdrop.setAttribute("aria-hidden", "true");
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  }

  async function openHelp() {
    if (!backdrop || !contentEl) {
      return;
    }
    lastFocus = document.activeElement;
    backdrop.classList.add("open");
    backdrop.setAttribute("aria-hidden", "false");
    contentEl.innerHTML = '<p class="customer-help-loading">Memuat panduan...</p>';
    backdrop.querySelector(".customer-help-close")?.focus();
    const hint = await loadHint();
    contentEl.innerHTML = renderHint(hint);
  }

  function buildHelp() {
    if (document.querySelector(".customer-help-fab")) {
      return;
    }

    const button = document.createElement("button");
    button.className = "customer-help-fab";
    button.type = "button";
    button.setAttribute("aria-label", "Buka panduan cetak");
    button.textContent = "?";

    backdrop = document.createElement("div");
    backdrop.className = "customer-help-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    backdrop.innerHTML = `
      <section class="customer-help-modal" role="dialog" aria-modal="true" aria-labelledby="customerHelpTitle">
        <div class="customer-help-head">
          <div>
            <h2 id="customerHelpTitle">Panduan Cetak</h2>
            <p>Ikuti alur singkat ini untuk menggunakan PrintOrder.</p>
          </div>
          <button class="customer-help-close" type="button" aria-label="Tutup panduan">x</button>
        </div>
        <div class="customer-help-content"></div>
      </section>
    `;
    contentEl = backdrop.querySelector(".customer-help-content");

    button.addEventListener("click", openHelp);
    backdrop.querySelector(".customer-help-close")?.addEventListener("click", closeHelp);
    backdrop.addEventListener("click", event => {
      if (event.target === backdrop) {
        closeHelp();
      }
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && backdrop?.classList.contains("open")) {
        event.preventDefault();
        closeHelp();
      }
    });

    document.body.appendChild(button);
    document.body.appendChild(backdrop);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildHelp, { once: true });
  } else {
    buildHelp();
  }
})();

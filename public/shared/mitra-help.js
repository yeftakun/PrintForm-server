(() => {
  const MITRA_HINT = `1. Buat akun dan masuk di portal PrintOrder.
2. Sesuaikan pengaturan toko dan layanan anda.
3. Pilih rencana paket yang sesuai. Anda mendapatkan paket gratis 10 token setiap seminggu sekali.
4. Setelah mendapatkan token anda bisa mulai menerima dan mencetak dokumen dari pelanggan.
5. Download dan install aplikasi PrintOrder di komputer percetakan anda, lalu masuk dengan akun yang sudah dibuat.
6. Di aplikasi PrintOrder, anda bisa melihat dan mengelola tugas cetak yang dikirim pelanggan.

Jika anda memiliki pertanyaan atau masalah terkait proses cetak, jangan ragu untuk menghubungi layanan pelanggan percetakan untuk bantuan lebih lanjut.

whatsapp: link ke whatsapp +6285775471308
email: ke yeftakun34@gmail.com`;

  let button = null;
  let backdrop = null;
  let contentEl = null;
  let lastFocus = null;

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
    const contacts = [];

    lines.forEach(line => {
      const match = line.match(/^\d+\.\s*(.+)$/);
      if (match) {
        steps.push(match[1]);
        return;
      }
      if (/^whatsapp:/i.test(line)) {
        contacts.push({
          label: "WhatsApp",
          href: "https://wa.me/6285775471308",
          text: "+6285775471308"
        });
        return;
      }
      if (/^email:/i.test(line)) {
        contacts.push({
          label: "Email",
          href: "mailto:yeftakun34@gmail.com",
          text: "yeftakun34@gmail.com"
        });
        return;
      }
      notes.push(line);
    });

    return { steps, notes, contacts };
  }

  function renderHint(markdown) {
    const { steps, notes, contacts } = parseHint(markdown);
    const stepHtml = steps.length
      ? `<ol>${steps.map(step => `<li>${escapeHtml(step)}</li>`).join("")}</ol>`
      : "";
    const noteHtml = notes.map(note => `<p>${escapeHtml(note)}</p>`).join("");
    const contactHtml = contacts.length
      ? `<div class="customer-help-contact">${contacts.map(contact => `
          <a href="${escapeHtml(contact.href)}" target="_blank" rel="noopener noreferrer">
            <span>${escapeHtml(contact.label)}</span>
            <strong>${escapeHtml(contact.text)}</strong>
          </a>
        `).join("")}</div>`
      : "";
    return stepHtml || noteHtml || contactHtml
      ? `${stepHtml}${noteHtml}${contactHtml}`
      : '<p class="customer-help-loading">Panduan belum tersedia.</p>';
  }

  function getUserRole() {
    const user = window.PortalAuth?.getState?.()?.user;
    return String(user?.role || "").trim().toLowerCase();
  }

  function shouldShowHelp() {
    return getUserRole() === "mitra"
      && document.body.classList.contains("portal-dashboard-active");
  }

  function closeHelp({ restoreFocus = true } = {}) {
    if (!backdrop) {
      return;
    }
    backdrop.classList.remove("open");
    backdrop.setAttribute("aria-hidden", "true");
    if (restoreFocus && lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  }

  function openHelp() {
    if (!backdrop || !contentEl || !shouldShowHelp()) {
      return;
    }
    lastFocus = document.activeElement;
    contentEl.innerHTML = renderHint(MITRA_HINT);
    backdrop.classList.add("open");
    backdrop.setAttribute("aria-hidden", "false");
    backdrop.querySelector(".customer-help-close")?.focus();
  }

  function syncVisibility() {
    if (!button) {
      return;
    }
    const visible = shouldShowHelp();
    button.hidden = !visible;
    if (!visible) {
      closeHelp({ restoreFocus: false });
    }
  }

  function buildHelp() {
    if (document.querySelector(".mitra-help-fab")) {
      return;
    }

    button = document.createElement("button");
    button.className = "customer-help-fab mitra-help-fab";
    button.type = "button";
    button.hidden = true;
    button.setAttribute("aria-label", "Buka panduan mitra");
    button.textContent = "?";

    backdrop = document.createElement("div");
    backdrop.className = "customer-help-backdrop mitra-help-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    backdrop.innerHTML = `
      <section class="customer-help-modal" role="dialog" aria-modal="true" aria-labelledby="mitraHelpTitle">
        <div class="customer-help-head">
          <div>
            <h2 id="mitraHelpTitle">Panduan Mitra</h2>
            <p>Ikuti alur singkat ini untuk mulai menerima layanan cetak.</p>
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

    const observer = new MutationObserver(syncVisibility);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("storage", syncVisibility);
    window.setInterval(syncVisibility, 1000);
    syncVisibility();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildHelp, { once: true });
  } else {
    buildHelp();
  }
})();

(() => {
  const icons = {
    info: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9"></circle>
        <path d="M12 11v5"></path>
        <path d="M12 8h.01"></path>
      </svg>
    `,
    success: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9"></circle>
        <path d="m8 12 3 3 5-6"></path>
      </svg>
    `,
    warning: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 2.5 20h19L12 3Z"></path>
        <path d="M12 9v5"></path>
        <path d="M12 17h.01"></path>
      </svg>
    `,
    error: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9"></circle>
        <path d="m15 9-6 6"></path>
        <path d="m9 9 6 6"></path>
      </svg>
    `
  };

  let toastHost = null;
  let activeDialog = null;

  function normalizeOptions(input, fallbackTitle = "") {
    if (typeof input === "string") {
      return { title: fallbackTitle, message: input };
    }
    return input && typeof input === "object" ? { ...input } : {};
  }

  function getIcon(variant) {
    return icons[variant] || icons.info;
  }

  function ensureToastHost() {
    if (toastHost) {
      return toastHost;
    }

    toastHost = document.createElement("div");
    toastHost.className = "pf-alert-toast-host";
    toastHost.setAttribute("aria-live", "polite");
    toastHost.setAttribute("aria-atomic", "false");
    document.body.appendChild(toastHost);
    return toastHost;
  }

  function removeToast(toast) {
    if (!toast || toast.dataset.removing === "true") {
      return;
    }
    toast.dataset.removing = "true";
    toast.classList.add("is-leaving");
    window.setTimeout(() => toast.remove(), 180);
  }

  function notify(input) {
    const options = normalizeOptions(input, "Notifikasi");
    const variant = options.variant || "info";
    const duration = Number.isFinite(options.duration) ? options.duration : 3000;
    const host = ensureToastHost();
    const toast = document.createElement("div");
    const title = options.title || "Notifikasi";
    const message = options.message || "";

    toast.className = `pf-alert-toast ${variant}`;
    toast.setAttribute("role", variant === "error" ? "alert" : "status");
    toast.innerHTML = `
      <span class="pf-alert-icon">${getIcon(variant)}</span>
      <span>
        <strong class="pf-alert-toast-title"></strong>
        <span class="pf-alert-toast-message"></span>
      </span>
      <button class="pf-alert-close" type="button" aria-label="Tutup">x</button>
    `;
    toast.querySelector(".pf-alert-toast-title").textContent = title;
    toast.querySelector(".pf-alert-toast-message").textContent = message;

    toast.querySelector(".pf-alert-close").addEventListener("click", () => removeToast(toast));
    host.appendChild(toast);

    if (duration > 0) {
      window.setTimeout(() => removeToast(toast), duration);
    }

    return {
      close: () => removeToast(toast),
      element: toast
    };
  }

  function closeActiveDialog(result) {
    if (!activeDialog) {
      return;
    }
    const { backdrop, resolve, restoreFocusTo } = activeDialog;
    activeDialog = null;
    backdrop.classList.remove("open");
    window.setTimeout(() => backdrop.remove(), 160);
    if (restoreFocusTo && typeof restoreFocusTo.focus === "function") {
      restoreFocusTo.focus();
    }
    resolve(result);
  }

  function confirm(input) {
    const options = normalizeOptions(input, "Konfirmasi");
    const mode = options.mode || options.type || "ok-cancel";
    const variant = options.variant || (mode === "ok-cancel" ? "warning" : "info");
    const title = options.title || "Konfirmasi";
    const message = options.message || "";
    const okText = options.okText || "OK";
    const cancelText = options.cancelText || "Batal";
    const closeText = options.closeText || "Tutup";
    const restoreFocusTo = document.activeElement;

    if (activeDialog) {
      closeActiveDialog(null);
    }

    return new Promise(resolve => {
      const backdrop = document.createElement("div");
      backdrop.className = "pf-alert-modal-backdrop";
      backdrop.innerHTML = `
        <section class="pf-alert-modal ${variant}" role="dialog" aria-modal="true" aria-labelledby="pfAlertModalTitle">
          <div class="pf-alert-modal-head">
            <span class="pf-alert-icon">${getIcon(variant)}</span>
            <div>
              <h2 class="pf-alert-modal-title" id="pfAlertModalTitle"></h2>
              <p class="pf-alert-modal-message"></p>
            </div>
          </div>
          <div class="pf-alert-modal-actions"></div>
        </section>
      `;

      const titleEl = backdrop.querySelector(".pf-alert-modal-title");
      const messageEl = backdrop.querySelector(".pf-alert-modal-message");
      const actionsEl = backdrop.querySelector(".pf-alert-modal-actions");
      titleEl.textContent = title;
      messageEl.textContent = message;

      function addButton(text, className, result) {
        const button = document.createElement("button");
        button.className = `pf-alert-btn ${className}`;
        button.type = "button";
        button.textContent = text;
        button.addEventListener("click", () => closeActiveDialog(result));
        actionsEl.appendChild(button);
        return button;
      }

      let focusButton = null;
      const customActions = Array.isArray(options.actions) ? options.actions : [];
      if (customActions.length > 0) {
        customActions.forEach(action => {
          const button = addButton(
            action.text || action.label || "OK",
            action.className || action.variant || "secondary",
            Object.prototype.hasOwnProperty.call(action, "value") ? action.value : true
          );
          if (action.autofocus || !focusButton) {
            focusButton = button;
          }
        });
      } else if (mode === "ok") {
        focusButton = addButton(okText, "primary", true);
      } else if (mode === "close") {
        focusButton = addButton(closeText, "primary", null);
      } else {
        addButton(cancelText, "secondary", false);
        focusButton = addButton(okText, "primary", true);
      }

      backdrop.addEventListener("click", event => {
        if (event.target === backdrop) {
          closeActiveDialog(mode === "ok-cancel" ? false : null);
        }
      });

      const onKeydown = event => {
        if (event.key === "Escape" && activeDialog?.backdrop === backdrop) {
          event.preventDefault();
          document.removeEventListener("keydown", onKeydown);
          closeActiveDialog(mode === "ok-cancel" ? false : null);
        }
      };
      document.addEventListener("keydown", onKeydown);

      activeDialog = {
        backdrop,
        resolve: result => {
          document.removeEventListener("keydown", onKeydown);
          resolve(result);
        },
        restoreFocusTo
      };

      document.body.appendChild(backdrop);
      window.requestAnimationFrame(() => {
        backdrop.classList.add("open");
        focusButton?.focus();
      });
    });
  }

  window.PrintFormAlert = {
    notify,
    confirm,
    ok: options => confirm({ ...normalizeOptions(options), mode: "ok" }),
    choose: options => confirm({ ...normalizeOptions(options), mode: "ok-cancel" }),
    close: options => confirm({ ...normalizeOptions(options), mode: "close" })
  };
})();

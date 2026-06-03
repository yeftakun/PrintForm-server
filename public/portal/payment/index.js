(() => {
  const PORTAL_HOME_PATH = "/portal/";
  const PORTAL_ADMIN_PATH = "/portal/admin/";

  const paymentUserChip = document.getElementById("paymentUserChip");
  const paymentPlanName = document.getElementById("paymentPlanName");
  const paymentQuantityControl = document.getElementById("paymentQuantityControl");
  const paymentQuantityInput = document.getElementById("paymentQuantityInput");
  const paymentSubtotal = document.getElementById("paymentSubtotal");
  const paymentQuantity = document.getElementById("paymentQuantity");
  const paymentCredits = document.getElementById("paymentCredits");
  const paymentDuration = document.getElementById("paymentDuration");
  const paymentDiscount = document.getElementById("paymentDiscount");
  const paymentTotal = document.getElementById("paymentTotal");
  const couponCodeInput = document.getElementById("couponCodeInput");
  const checkCouponBtn = document.getElementById("checkCouponBtn");
  const createOrderBtn = document.getElementById("createOrderBtn");
  const paymentInstructionBox = document.getElementById("paymentInstructionBox");
  const paymentInstructionText = document.getElementById("paymentInstructionText");
  const paymentResultActions = document.getElementById("paymentResultActions");
  const paymentStatus = document.getElementById("paymentStatus");

  let selectedPlan = null;
  let selectedQuantity = 1;
  let selectedPricing = null;
  let hasActiveCredits = false;

  function setStatus(text, kind = "") {
    paymentStatus.textContent = text || "";
    paymentStatus.className = kind ? `status ${kind}` : "status";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
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

  function formatInteger(value) {
    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 0
    }).format(Number(value || 0));
  }

  function getPlanDurationText(plan, quantity = 1, pricing = null) {
    const months = Number(plan?.durationMonths || 0);
    const planType = String(plan?.planType || "").toLowerCase();
    const periodCount = Number(pricing?.validity?.periodCount || quantity || 1);
    if (planType === "subscription" && periodCount > 1) {
      const perPeriod = months > 0 ? `${months} bulan` : "masa berlaku plan";
      return `${periodCount} periode x ${perPeriod}`;
    }
    if (months > 0) {
      return `${months} bulan`;
    }
    if (planType === "free") {
      return "1 minggu";
    }
    return "-";
  }

  function isFreePlan(plan) {
    return String(plan?.planType || "").toLowerCase() === "free";
  }

  function getQuantityInputValue() {
    const quantity = Number.parseInt(paymentQuantityInput.value, 10);
    return Number.isInteger(quantity) && quantity > 0 ? Math.min(quantity, 99) : 1;
  }

  function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const quantity = Number.parseInt(params.get("quantity"), 10);
    return {
      planId: String(params.get("planId") || params.get("planCode") || "").trim(),
      quantity: Number.isInteger(quantity) && quantity > 0 ? Math.min(quantity, 99) : 1
    };
  }

  function renderPricing(pricing) {
    selectedPricing = pricing || null;
    const plan = pricing?.plan || selectedPlan;
    paymentPlanName.textContent = plan?.name || "-";
    paymentSubtotal.textContent = formatCurrency(pricing?.subtotalIdr || 0);
    paymentQuantity.textContent = formatInteger(pricing?.quantity || selectedQuantity);
    paymentCredits.textContent = formatInteger(pricing?.totalCredits || 0);
    paymentDuration.textContent = getPlanDurationText(plan, pricing?.quantity || selectedQuantity, pricing);
    paymentDiscount.textContent = formatCurrency(pricing?.discountIdr || 0);
    paymentTotal.textContent = formatCurrency(pricing?.totalIdr || 0);
  }

  async function quotePayment({ includeCoupon = false } = {}) {
    const couponCode = includeCoupon ? String(couponCodeInput.value || "").trim() : "";
    const body = await window.PortalAuth.apiJson("/api/billing/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId: selectedPlan.id,
        quantity: selectedQuantity,
        couponCode
      })
    });
    renderPricing(body.pricing);
    return body.pricing;
  }

  async function loadPaymentPage() {
    const state = window.PortalAuth.getState();
    if (!state?.accessToken) {
      setStatus("Silakan login melalui Portal PrintOrder terlebih dahulu.", "error");
      createOrderBtn.disabled = true;
      checkCouponBtn.disabled = true;
      return;
    }

    const meBody = await window.PortalAuth.apiJson("/api/auth/me", { method: "GET" });
    const currentUser = meBody.user || state.user || null;
    window.PortalAuth.saveState({ ...state, user: currentUser });
    if (String(currentUser?.role || "").toLowerCase() === "admin") {
      window.location.href = PORTAL_ADMIN_PATH;
      return;
    }

    paymentUserChip.textContent = currentUser?.username ? `@${escapeHtml(currentUser.username)}` : "@user";
    const { planId, quantity } = getQueryParams();
    if (!planId) {
      setStatus("Plan tidak ditemukan dari URL. Silakan pilih plan dari dashboard.", "error");
      createOrderBtn.disabled = true;
      checkCouponBtn.disabled = true;
      return;
    }

    selectedQuantity = quantity;
    setStatus("Memuat rincian pembayaran...");
    const [plansBody, balanceBody] = await Promise.all([
      window.PortalAuth.apiJson("/api/billing/plans", { method: "GET" }),
      window.PortalAuth.apiJson("/api/billing/credits/balance", { method: "GET" })
    ]);
    hasActiveCredits = Number(balanceBody.balance?.totalCredits || 0) > 0;
    selectedPlan = (plansBody.plans || []).find(plan => plan.id === planId || plan.code === planId);
    if (!selectedPlan) {
      setStatus("Plan tidak ditemukan atau tidak aktif.", "error");
      createOrderBtn.disabled = true;
      checkCouponBtn.disabled = true;
      return;
    }

    if (isFreePlan(selectedPlan)) {
      selectedQuantity = 1;
      paymentQuantityInput.value = "1";
      paymentQuantityInput.disabled = true;
      paymentQuantityControl.classList.add("hidden");
      if (hasActiveCredits) {
        setStatus("Plan Free hanya bisa dipilih saat tidak ada plan atau kredit aktif.", "error");
        createOrderBtn.disabled = true;
        checkCouponBtn.disabled = true;
        return;
      }
    } else {
      paymentQuantityInput.disabled = false;
      paymentQuantityInput.value = String(selectedQuantity);
      paymentQuantityControl.classList.remove("hidden");
    }

    renderPricing({
      plan: selectedPlan,
      quantity: selectedQuantity,
      subtotalIdr: (selectedPlan.priceIdr || 0) * selectedQuantity,
      discountIdr: 0,
      totalIdr: (selectedPlan.priceIdr || 0) * selectedQuantity,
      totalCredits: (selectedPlan.creditsPerUnit || 0) * selectedQuantity
    });
    await quotePayment({ includeCoupon: false });
    setStatus("");
  }

  async function checkCoupon() {
    if (!String(couponCodeInput.value || "").trim()) {
      setStatus("Masukkan kode kupon.", "error");
      return;
    }
    setStatus("Memeriksa kupon...");
    try {
      await quotePayment({ includeCoupon: true });
      setStatus("Kupon valid dan perhitungan diperbarui.", "success");
    } catch (err) {
      setStatus(err.message || "Kupon tidak dapat digunakan.", "error");
    }
  }

  async function createOrder() {
    setStatus("Membuat order...");
    createOrderBtn.disabled = true;
    try {
      const result = await window.PortalAuth.apiJson("/api/billing/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan.id,
          quantity: selectedQuantity,
          couponCode: String(couponCodeInput.value || "").trim()
        })
      });

      if (result.order?.paymentInstruction) {
        paymentInstructionText.textContent = result.order.paymentInstruction;
        paymentInstructionBox.classList.remove("hidden");
      } else {
        paymentInstructionBox.classList.add("hidden");
      }
      paymentResultActions.classList.remove("hidden");
      setStatus(
        result.order?.status === "paid"
          ? "Order paid otomatis dan kredit sudah ditambahkan."
          : "Order dibuat. Silakan lakukan pembayaran manual lalu upload bukti dari halaman order.",
        "success"
      );
    } catch (err) {
      createOrderBtn.disabled = false;
      setStatus(err.message || "Gagal membuat order.", "error");
    }
  }

  checkCouponBtn.addEventListener("click", checkCoupon);
  createOrderBtn.addEventListener("click", createOrder);
  paymentQuantityInput.addEventListener("input", () => {
    if (!selectedPlan || isFreePlan(selectedPlan)) {
      return;
    }
    selectedQuantity = getQuantityInputValue();
    paymentQuantityInput.value = String(selectedQuantity);
    quotePayment({ includeCoupon: Boolean(String(couponCodeInput.value || "").trim()) }).catch(err => {
      setStatus(err.message || "Gagal menghitung ulang pembayaran.", "error");
    });
  });
  couponCodeInput.addEventListener("input", () => {
    if (selectedPricing?.coupon && !String(couponCodeInput.value || "").trim()) {
      quotePayment({ includeCoupon: false }).catch(err => {
        setStatus(err.message || "Gagal menghitung ulang pembayaran.", "error");
      });
    }
  });

  window.PortalAuth.startSessionWatcher({
    idleTimeoutMs: 2 * 60 * 60 * 1000,
    loginPath: "/portal/",
    scope: "mitra"
  });

  loadPaymentPage().catch(err => {
    setStatus(err.message || "Gagal memuat payment page.", "error");
    createOrderBtn.disabled = true;
    checkCouponBtn.disabled = true;
  });
})();

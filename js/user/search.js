let searchTimeout;

/* ================= SEARCH ================= */
function handleGlobalSearch() {
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {

    const desktop = document.getElementById("searchInputDesktop");
    const mobile = document.getElementById("searchInput");

    const keyword = (
      (desktop?.value || mobile?.value || "")
    ).toLowerCase().trim();

    let targets = [];

    if (document.querySelector(".promo-card")) {
      targets = document.querySelectorAll(".promo-card");
    }

    if (document.querySelector(".service-item")) {
      targets = document.querySelectorAll(".service-item");
    }

    if (document.querySelector(".info-item")) {
      targets = document.querySelectorAll(".info-item");
    }

    /* ===== FILTER CARD ===== */
    if (targets.length > 0) {
      targets.forEach(el => {
        const text = el.innerText.toLowerCase();
        el.style.display =
          !keyword || text.includes(keyword) ? "" : "none";
      });
    }

    /* ===== TABLE ===== */
    if (document.querySelector("#bookingTable")) {
      document.querySelectorAll("#bookingTable tr")
        .forEach(row => {
          const text = row.innerText.toLowerCase();
          const name = (row.dataset.name || "").toLowerCase();
          const phone = (row.dataset.phone || "").toLowerCase();

          const full = text + " " + name + " " + phone;

          row.style.display =
            !keyword || full.includes(keyword) ? "" : "none";
        });
    }

    /* ===== MOBILE CARD ===== */
    if (document.querySelector(".booking-card")) {
      document.querySelectorAll(".booking-card")
        .forEach(card => {
          const text = card.innerText.toLowerCase();
          const name = (card.dataset.name || "").toLowerCase();
          const phone = (card.dataset.phone || "").toLowerCase();

          const full = text + " " + name + " " + phone;

          card.style.display =
            !keyword || full.includes(keyword) ? "block" : "none";
        });
    }

  }, 250);
}

/* ================= TOGGLE SEARCH ================= */
function toggleSearch(forceClose = false) {
  const overlay = document.getElementById("searchOverlay");
  const input = document.getElementById("searchInput");

  if (!overlay) return;

  // ถ้ามีการสั่ง force close → ปิดอย่างเดียว
  if (forceClose) {
    overlay.classList.remove("active");
    return;
  }

  overlay.classList.toggle("active");

  if (overlay.classList.contains("active")) {
    setTimeout(() => input?.focus(), 200);
  } else {
    // เอาการล้าง input ออก
    // ไม่ต้อง handleGlobalSearch ซ้ำ
  }
}

/* ================= CLICK OUTSIDE ================= */
window.addEventListener("click", (e) => {
  const overlay = document.getElementById("searchOverlay");

  if (overlay?.classList.contains("active") && e.target === overlay) {
    toggleSearch();
  }
});

/* ================= KEYBOARD CONTROL ================= */
document.addEventListener("keydown", (e) => {

  const desktop = document.getElementById("searchInputDesktop");
  const mobile = document.getElementById("searchInput");

  /* ===== ENTER ===== */
  if (e.key === "Enter") {

    // mobile
    if (document.activeElement === mobile) {
      handleGlobalSearch();
      toggleSearch();   // ปิด overlay
      mobile.blur();
    }

    // desktop
    if (document.activeElement === desktop) {
      handleGlobalSearch();
      desktop.blur();
    }
  }

  /* ===== ESC ===== */
  if (e.key === "Escape") {

    if (desktop) desktop.value = "";
    if (mobile) mobile.value = "";

    handleGlobalSearch();

    // ปิด overlay ถ้าเปิดอยู่
    const overlay = document.getElementById("searchOverlay");
    if (overlay?.classList.contains("active")) {
      toggleSearch();
    }
  }

});

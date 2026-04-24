/* =============   SEARCH =============== */
function toggleSearch() {
    const input = document.getElementById("searchInput");
    input.classList.toggle("show");
    input.focus();
  }

  function searchHome() {
    const keyword =
      document.getElementById("searchInput").value.toLowerCase();

    document.querySelectorAll(".promo-card").forEach(card => {
      card.style.display =
        card.innerText.toLowerCase().includes(keyword)
          ? "block"
          : "none";
    });
  }

  function searchHome() {
    const keyword = document
      .getElementById("searchInput")
      .value
      .toLowerCase()
      .trim();

    const sections = document.querySelectorAll(".section");

    sections.forEach(section => {
      const text = section.innerText.toLowerCase();

      if (text.includes(keyword)) {
        section.style.display = "block";
      } else {
        section.style.display = "none";
      }
    });

    // ถ้าไม่พิมพ์อะไร ให้แสดงทั้งหมด
    if (keyword === "") {
      sections.forEach(section => {
        section.style.display = "block";
      });
    }
  }

    const cards = document.querySelectorAll(".service-item");

    cards.forEach(card => {
      const text = card.innerText.toLowerCase();

      if (keyword === "") {
        card.style.display = "";
      } else if (text.includes(keyword)) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });

    /* =============   SEARCH  =============== */
    function toggleSearch() {
      const input = document.getElementById("searchInput");
      input.classList.toggle("show");

      if (input.classList.contains("show")) {
        input.focus();
      } else {
        input.value = "";
        searchHome(); // reset highlight
      }
    }

    function searchHome() {
      const keyword = document
        .getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();

      const fields = document.querySelectorAll(
        ".service-card label, .service-card input, .service-card textarea, .service-card select"
      );

      fields.forEach(field => {
        field.style.outline = "";
        field.style.backgroundColor = "";

        const text =
          (field.innerText || field.value || "")
            .toLowerCase();

        if (keyword && text.includes(keyword)) {
          field.style.outline = "2px solid #2563eb";
          field.style.backgroundColor = "#eef2ff";
        }
      });
    }

    /* =============   SEARCH =============== */
    function toggleSearch() {
      const input = document.getElementById("searchInput");
      input.classList.toggle("show");

      if (input.classList.contains("show")) {
          input.focus();
      } else {
          input.value = "";
          searchHome();
      }
  }

  function searchHome() {
      const keyword = document
          .getElementById("searchInput")
          .value
          .toLowerCase()
          .trim();

      const rows = document.querySelectorAll("#bookingTable tr");

      rows.forEach(row => {
          const text = row.innerText.toLowerCase();

          if (keyword === "") {
              row.style.display = "";
          } else if (text.includes(keyword)) {
              row.style.display = "";
          } else {
              row.style.display = "none";
          }
      });
  }
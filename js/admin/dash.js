import { db } from "../js/admin/firebase.js";
    import {
      collection,
      onSnapshot,
      query,
      orderBy
    } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
    /* ===== SIDEBAR TOGGLE ===== */
    window.toggleSidebar = function () {
      const sidebar = document.querySelector(".sidebar");
      const main = document.querySelector(".main");
      const overlay = document.querySelector(".sidebar-overlay");

      const isMobile = window.innerWidth <= 900;

      if (isMobile) {
        sidebar.classList.toggle("open");

        if (sidebar.classList.contains("open")) {
          const ov = document.createElement("div");
          ov.className = "sidebar-overlay";
          ov.onclick = toggleSidebar;
          document.body.appendChild(ov);
        } else {
          if (overlay) overlay.remove();
        }

      } else {
        sidebar.classList.toggle("closed");
        main.classList.toggle("full");
      }
    }
    /* ===== AUTH ===== */
    function loadAdminProfile() {

      const admin = JSON.parse(localStorage.getItem("adminData"));

      if (!admin) {
        window.location.href = "login.html";
        return;
      }

      const nameElement = document.getElementById("profileName");
      const avatarElement = document.getElementById("profileAvatar");

      nameElement.textContent = admin.username;

      const firstLetter = admin.username.charAt(0).toUpperCase();
      avatarElement.textContent = firstLetter;
    }

    if (localStorage.getItem("adminLoggedIn") !== "true") {
      window.location.href = "login.html";
    }
    window.logout = function () {
      localStorage.removeItem("adminLoggedIn");
      localStorage.removeItem("adminData");
      window.location.href = "login.html";
    }
    window.toggleUserMenu = function () {
      const dropdown = document.getElementById("userDropdown");
      const overlay = document.querySelector(".user-overlay");

      if (overlay) {
        dropdown.style.display = "none";
        overlay.remove();
        return;
      }

      dropdown.style.display = "block";

      const ov = document.createElement("div");
      ov.className = "user-overlay";
      ov.style.position = "fixed";
      ov.style.inset = "0";
      ov.style.zIndex = "999";
      ov.onclick = toggleUserMenu;
      document.body.appendChild(ov);
    }

    /* ===== ACTIVE SIDEBAR ===== */
    document.addEventListener("DOMContentLoaded", () => {
      const page = document.body.dataset.page;
      document.querySelectorAll(".sidebar a, .top-nav-menu a").forEach(link => {
        if (link.dataset.link === page) {
          link.classList.add("active");
        }
      });
      loadAdminProfile();
      loadNotifications();
      listenBookings();
      updateDashboardStats();
      renderDashboardRequests();
    });

    function listenBookings() {
      const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));

      onSnapshot(q, (snapshot) => {
        const bookings = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        localStorage.setItem("bookings", JSON.stringify(bookings));

        updateDashboardStats();
        renderDashboardRequests();
      });
    }

    /* ===== NOTIFICATION ===== */
    const notifySound = new Audio("../sounds/notify.mp3");
    notifySound.volume = 1;

    let audioUnlocked = false;

    function unlockAudio() {
      if (audioUnlocked) return;

      notifySound.play()
        .then(() => {
          notifySound.pause();
          notifySound.currentTime = 0;
          audioUnlocked = true;
          console.log("🔓 Audio unlocked");
        })
        .catch(err => console.log("unlock error", err));
    }

    document.addEventListener("click", unlockAudio, { once: true });

    window.addEventListener("storage", (event) => {
      if (event.key === "notifications") {
        const notifications = JSON.parse(event.newValue || "[]");
        const unread = notifications.filter(n => !n.read);

        if (unread.length > 0 && audioUnlocked) {
          notifySound.currentTime = 0;
          notifySound.play().catch(() => { });
        }

        loadNotifications();
      }

      if (event.key === "bookings") {
        updateDashboardStats();
        renderDashboardRequests();
      }
    });

    function loadNotifications() {
      const notifications =
        JSON.parse(localStorage.getItem("notifications")) || [];

      const unread = notifications.filter(n => !n.read);

      const badge = document.getElementById("notifyCount");
      const list = document.getElementById("notificationList");

      badge.textContent = unread.length;
      badge.style.display = unread.length ? "flex" : "none";
      list.innerHTML = "";

      notifications.forEach((n, i) => {
        const li = document.createElement("li");
        li.textContent = n.message;
        li.className = n.read ? "" : "unread";

        li.onclick = () => {
          notifications[i].read = true;
          localStorage.setItem("notifications", JSON.stringify(notifications));

          loadNotifications();

          document.getElementById("notificationDropdown").style.display = "none";
          const ov = document.querySelector(".notification-overlay");
          if (ov) ov.remove();

          if (n.type === "booking" && n.bookingId) {
            window.location.href = `request.html#${n.bookingId}`;
          }
        };

        list.appendChild(li);
      });
    }

    window.toggleNotification = function (e) {
      if (e) e.stopPropagation();

      const dropdown = document.getElementById("notificationDropdown");
      const overlay = document.querySelector(".notification-overlay");

      if (overlay) {
        dropdown.style.display = "none";
        overlay.remove();
        return;
      }

      dropdown.style.display = "block";

      const ov = document.createElement("div");
      ov.className = "notification-overlay";
      ov.onclick = toggleNotification;
      document.body.appendChild(ov);
    }

    loadNotifications();

    /* ===== SEARCH ===== */
    let currentKeyword = "";

    window.toggleSearch = function () {
      const input = document.getElementById("searchInput");
      input.classList.toggle("show");
      input.focus();
    }
    // ซ่อน search เมื่อคลิกออก (blur)
    document.getElementById("searchInput").addEventListener("blur", function () {
      if (!this.value) {
        this.classList.remove("show");
      }
    });

    window.searchDashboard = function () {
      const keyword = document
        .getElementById("searchInput")
        .value.toLowerCase();

      currentKeyword = keyword;

      const bookings =
        JSON.parse(localStorage.getItem("bookings")) || [];

      const filtered = bookings.filter(b =>
        (b.name || "").toLowerCase().includes(keyword) ||
        (b.phone || "").toLowerCase().includes(keyword) ||
        (b.location || "").toLowerCase().includes(keyword) ||
        (b.status || "").toLowerCase().includes(keyword) ||
        (b.serviceType || "").toLowerCase().includes(keyword) ||
        (b.serviceName || "").toLowerCase().includes(keyword)
      );


      const box = document.getElementById("searchResultBox");

      if (keyword) {
        box.style.display = "block";
        box.textContent = filtered.length
          ? `พบ ${filtered.length} รายการ`
          : "ไม่พบข้อมูล";
      } else {
        box.style.display = "none";
      }

      renderDashboardRequests(filtered);
    };


    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        const input = document.getElementById("searchInput");
        input.classList.remove("show");
        input.value = "";
        currentKeyword = "";
        renderDashboardRequests();
      }
    });

    /* ===== DASHBOARD DATA ===== */
    function updateDashboardStats() {
      const bookings =
        JSON.parse(localStorage.getItem("bookings")) || [];

      document.getElementById("totalBooking").innerText =
        bookings.length;

      document.getElementById("pendingBooking").innerText =
        bookings.filter(b => b.status === "pending").length;

      document.getElementById("assignedBooking").innerText =
        bookings.filter(b => b.status === "assigned").length;

      document.getElementById("rejectedBooking").innerText =
        bookings.filter(b =>
          b.status === "cancelled" && b.cancelType === "rejected"
        ).length;
    }

    function getMapLink(b) {
      // ถ้ามี lat/lng → เปิด Maps App (mobile friendly)
      if (b.lat && b.lng) {
        return `geo:${b.lat},${b.lng}?q=${b.lat},${b.lng}`;
      }

      // fallback → Google Maps Search
      if (b.location) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.location)}`;
      }

      return "#";
    }

    function renderDashboardRequests(data) {
      const bookings =
        data || JSON.parse(localStorage.getItem("bookings") || "[]");
      const tbody = document.getElementById("dashboardRequestTable");

      tbody.innerHTML = "";

      // scroll ไปแถวแรกที่เจอ
      if (currentKeyword) {
        const firstMatch = document.querySelector(".highlight-row");
        if (firstMatch) {
          firstMatch.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }

      // แสดงแค่ 5 รายการล่าสุด 
      bookings
        .sort((a, b) => new Date(b.bookedTime) - new Date(a.bookedTime))
        .slice(0, 5).forEach(b => {
          const tr = document.createElement("tr");

          // check match search 
          const text = JSON.stringify(b).toLowerCase();

          if (currentKeyword && text.includes(currentKeyword)) {
            tr.classList.add("highlight-row");
          }

          tr.innerHTML = `
<td>
  <span class="status ${b.status || "pending"}">
    ${highlight(
            b.status
              ? b.status.charAt(0).toUpperCase() + b.status.slice(1)
              : "Pending",
            currentKeyword
          )}
  </span>
</td>

<td>${highlight(b.name || "-", currentKeyword)}</td>

<td>${highlight(b.phone || "-", currentKeyword)}</td>

<td class="address-cell">
  ${b.location
              ? `<a href="${getMapLink(b)}"
         ${b.lat && b.lng ? "" : "target='_blank'"}
         class="address-link">
         <i class="ri-map-pin-2-line"></i>
         ${highlight(b.location, currentKeyword)}
       </a>`
              : "-"
            }
</td>

<td>
  ${highlight(b.date || "-", currentKeyword)}<br>
  <small>
    ${b.bookedTime
              ? new Date(b.bookedTime).toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit"
              })
              : "-"
            }
  </small>
</td>

<td>
  ${highlight(b.serviceType || b.serviceName || "-", currentKeyword)}
</td>

<td>
  ${highlight(b.note || "-", currentKeyword)}
</td>
`;
          tbody.appendChild(tr);
        });
    }

    function highlight(text, keyword) {
      if (!keyword) return escapeHTML(text);

      const regex = new RegExp(`(${keyword})`, "gi");
      return escapeHTML(text).replace(regex, "<mark>$1</mark>");
    }

    function escapeHTML(str) {
      return String(str).replace(/[&<>"']/g, m => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      })[m]);
    }


    function formatDate(ts) {
      const d = new Date(ts);
      return d.toLocaleDateString("th-TH") + " " +
        d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    }

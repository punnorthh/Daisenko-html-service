
/* ===== SIDEBAR TOGGLE ===== */
function toggleSidebar() {
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

function logout(e) {
    if (e) e.stopPropagation();

    closeAllOverlays();

    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminData");

    window.location.href = "login.html";
}

function closeAllOverlays() {
    document.querySelector(".sidebar-overlay")?.remove();
    document.querySelector(".notification-overlay")?.remove();
    document.querySelector(".user-overlay")?.remove();

    document.getElementById("notificationDropdown").style.display = "none";
    document.getElementById("userDropdown").style.display = "none";
}

function toggleUserMenu() {
    const dropdown = document.getElementById("userDropdown");
    const isOpen = dropdown.style.display === "block";

    // ปิดทุก overlay ก่อน
    closeAllOverlays();

    if (isOpen) return;

    dropdown.style.display = "block";

    const ov = document.createElement("div");
    ov.className = "user-overlay";
    ov.style.position = "fixed";
    ov.style.inset = "0";

    ov.onclick = closeAllOverlays;

    document.body.appendChild(ov);
    document.querySelector(".sidebar")?.classList.remove("open");
    document.querySelector(".sidebar-overlay")?.remove();
}

/* ===== ACTIVE SIDEBAR ===== */
document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;
    document.querySelectorAll(".sidebar a, .top-nav-menu a").forEach(link => {
        if (link.dataset.link === page) {
            link.classList.add("active");
        }
    });

    document.getElementById("userDropdown").addEventListener("click", function (e) {
        e.stopPropagation();
    });

    loadAdminProfile();
    loadNotifications();
    updateDashboardStats();
    renderDashboardRequests();
});

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

function toggleNotification() {
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

function toggleSearch() {
    const input = document.getElementById("searchInput");
    input.classList.toggle("show");
    input.focus();
}

// SEARCH Desktop
function searchDashboard() {
    const keyword =
        document.getElementById("searchInput").value.toLowerCase();

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

    renderDashboardRequests(filtered);
}

// SEARCH Mobile
function searchDashboardMobile() {
    const keyword =
        document.getElementById("searchMobileInput").value.toLowerCase();

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

    renderDashboardRequests(filtered);
}

document.getElementById("searchMobileInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();

        // trigger search อีกรอบ (กันกรณี user ยังไม่ปล่อย key)
        searchDashboardMobile();

        // ปิด overlay
        closeSearchOverlay();
    }
});

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        const input = document.getElementById("searchInput");
        input.classList.remove("show");
        input.value = "";
        currentKeyword = "";
        renderDashboardRequests();
    }
});

function openSearch() {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        document.getElementById("searchOverlay").classList.add("show");
        document.getElementById("searchMobileInput").focus();
    } else {
        toggleSearch(); // desktop ใช้ของเดิม
    }
}

function closeSearchOverlay() {
    const mobileInput = document.getElementById("searchMobileInput");
    const desktopInput = document.getElementById("searchInput");

    // sync keyword ไป desktop
    if (desktopInput && mobileInput) {
        desktopInput.value = mobileInput.value;
    }

    document.getElementById("searchOverlay").classList.remove("show");
}

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        closeSearchOverlay();

        const input = document.getElementById("searchInput");
        input.classList.remove("show");
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

    // แสดงแค่ 5 รายการล่าสุด (คร่าว ๆ)
    bookings.slice(0, 5).forEach(b => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>
            <span class="status ${b.status}">
              ${b.status.charAt(0).toUpperCase() + b.status.slice(1)}
            </span>
          </td>
          <td>${(b.name)}</td>
          <td>${(b.phone)}</td>
          <td class="address-cell">
            ${b.location
                ? `<a 
                    href="${getMapLink(b)}"
                    ${b.lat && b.lng ? "" : "target='_blank'"}
                    rel="noopener"
                    title="เปิดแผนที่"
                    class="address-link"
                  >
                    <i class="ri-map-pin-2-line"></i>
                    ${(b.location)}
                  </a>`
                : "-"}
          </td>

          <td>
            ${b.date || "-"}<br>
            <small>
              ${b.bookedTime
                ? new Date(b.bookedTime).toLocaleTimeString("th-TH")
                : "-"
            }
            </small>
          </td>

          <td>
            ${(b.serviceType || b.serviceName || "บริการ")} 
            ${b.service ? `(${(b.service)})` : ""}
          </td>
        `;

        tbody.appendChild(tr);
    });
}

function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString("th-TH") + " " +
        d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

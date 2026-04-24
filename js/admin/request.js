
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

function logout() {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminData");
    window.location.href = "login.html";
}

function toggleUserMenu() {
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
    document.querySelectorAll(".sidebar a").forEach(link => {
        if (link.dataset.link === page) {
            link.classList.add("active");
        }
    });
    loadAdminProfile();
    loadNotifications();
    updateDashboardStats();
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
    const notifications = JSON.parse(localStorage.getItem("notifications")) || [];
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
                location.hash = `#${n.bookingId}`;
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

    if (input.classList.contains("show")) {
        input.focus();
    }
}

function searchDashboard() {
    const desktopInput = document.getElementById("searchInput");
    const mobileInput = document.getElementById("searchDashboardMobileInput");

    const keyword =
        (desktopInput?.value || mobileInput?.value || "").toLowerCase();

    currentKeyword = keyword;

    render(
        document.querySelector(".filter-btn.active")?.dataset.status || "all"
    );
}

document.addEventListener("DOMContentLoaded", () => {
    const desktopInput = document.getElementById("searchInput");
    const mobileInput = document.getElementById("searchDashboardMobileInput");

    // ===== realtime search =====
    desktopInput?.addEventListener("input", searchDashboard);
    mobileInput?.addEventListener("input", searchDashboard);

    document.addEventListener("keydown", function (e) {

        // ENTER
        if (e.key === "Enter") {
            if (
                document.activeElement === desktopInput ||
                document.activeElement === mobileInput
            ) {
                searchDashboard();

                // ปิด overlay (mobile)
                closeSearchOverlay();

                // ปิด input (desktop)
                desktopInput?.classList.remove("show");

                // optional: blur เอา focus ออก
                document.activeElement.blur();
            }
        }

        // ESC
        if (e.key === "Escape") {
            if (desktopInput) {
                desktopInput.value = "";
                desktopInput.classList.remove("show");
            }
            if (mobileInput) {
                mobileInput.value = "";
            }

            currentKeyword = "";

            render(
                document.querySelector(".filter-btn.active")?.dataset.status || "all"
            );
        }

        // CTRL + F
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
            e.preventDefault();

            desktopInput?.classList.add("show");
            desktopInput?.focus();
            desktopInput?.select();
        }
    });
});

function openSearch() {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        document.getElementById("searchOverlay").classList.add("show");
        document.getElementById("searchDashboardMobileInput").focus();
    } else {
        toggleSearch();
    }
}

function closeSearchOverlay() {
    document.getElementById("searchOverlay").classList.remove("show");
}

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        closeSearchOverlay();

        const input = document.getElementById("searchInput");
        input.classList.remove("show");
    }
});

/* ===== BOOKINGS ===== */
let currentRejectRow = null;
let currentPage = 1;
const rowsPerPage = 10;
let data = JSON.parse(localStorage.getItem("bookings")) || [];

function render(status = "all") {
    const tbody = document.getElementById("bookingTable");
    const noResults = document.getElementById("noResults");

    tbody.innerHTML = "";

    const keyword = currentKeyword?.toLowerCase() || "";

    // ===== FILTER =====
    let filteredData = data
        .map((item, index) => ({ ...item, originalIndex: index })) // เก็บ index จริง
        .filter(d => {

            const statusMatch =
                status === "all" ||
                (status === "rejected" &&
                    d.status === "cancelled" &&
                    d.cancelType === "rejected") ||
                d.status === status;

            const searchMatch =
                !keyword ||
                (d.name || "").toLowerCase().includes(keyword) ||
                (d.phone || "").toLowerCase().includes(keyword) ||
                (d.location || "").toLowerCase().includes(keyword) ||
                (d.serviceType || "").toLowerCase().includes(keyword) ||
                (d.tech || "").toLowerCase().includes(keyword);

            return statusMatch && searchMatch;
        });

    // ===== NO RESULT =====
    noResults.style.display = filteredData.length === 0 ? "block" : "none";

    // ===== PAGINATION =====
    const totalRows = filteredData.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    if (currentPage > totalPages) currentPage = 1;

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    const paginatedData = filteredData.slice(start, end);

    // ===== RENDER TABLE =====
    const cardContainer = document.getElementById("mobileCardContainer");
    cardContainer.innerHTML = "";

    paginatedData.forEach(d => {

        let qty = "-";
        if (d.service) {
            qty = d.service.replace(" เครื่อง", "").replace("ขึ้นไป", " ขึ้นไป");
        }

        const timeText = d.bookedTime
            ? new Date(d.bookedTime).toLocaleTimeString("th-TH")
            : "-";

        /* ===== DESKTOP TABLE ===== */
        tbody.innerHTML += `
                    <tr id="booking-${d.id}">
                        <td>${d.name}</td>
                        <td>${d.phone}</td>
                        <td>${d.location || "-"}</td>
                        <td>${d.serviceType || "ล้างแอร์"}</td>
                        <td>${qty}</td>
                        <td>${d.date || "-"}<br><small>${timeText}</small></td>
                        <td>${d.tech || "-"}</td>
                        <td>
                            <span class="status-badge ${d.status}">
                                ${d.status}
                                ${d.status === "pending"
                ? `<div class="pending-time" 
                                                data-time="${d.bookedTime}">
                                                ${getPendingCountdown(d.bookedTime)}
                                        </div>`
                : ""
            }
                            </span>
                        </td>
                        <td>${d.adminNote || "-"}</td>
                        <td>
                            ${d.status === "pending"
                ? `
                                <div class="action-icons">
                                    <i class="ri-user-add-line"
                                    onclick="assignBooking(${d.originalIndex})"></i>
                                    <i class="ri-close-circle-line reject"
                                    onclick="openReject(${d.originalIndex})"></i>
                                </div>
                                `
                : "-"
            }
                        </td>
                    </tr>
                `;

        /* ===== MOBILE CARD ===== */
        cardContainer.innerHTML += `
                    <div class="booking-card" id="card-${d.id}">
                        <div class="card-top">
                            <div class="card-name">${d.name}</div>
                            <span class="status-badge ${d.status}">
                                ${d.status}
                                ${d.status === "pending"
                ? `<div class="pending-time" data-time="${d.bookedTime}">
                                        ${getPendingCountdown(d.bookedTime)}
                                    </div>`
                : ""
            }
                            </span>
                        </div>

                        <div class="card-grid">
                            <div class="card-section">
                                <div class="card-label">เบอร์</div>
                                <div class="card-value">${d.phone}</div>
                            </div>

                            <div class="card-section">
                                <div class="card-label">บริการ</div>
                                <div class="card-value">${d.serviceType || "ล้างแอร์"}</div>
                            </div>

                            <div class="card-section">
                                <div class="card-label">จำนวน</div>
                                <div class="card-value">${qty}</div>
                            </div>

                            <div class="card-section">
                                <div class="card-label">วันที่</div>
                                <div class="card-value">${d.date || "-"}</div>
                            </div>

                            <div class="card-section">
                                <div class="card-label">เวลา</div>
                                <div class="card-value">${timeText}</div>
                            </div>
                        </div>

                        <div class="card-section">
                            <div class="card-label">Location</div>
                            <div class="card-value">${d.location || "-"}</div>
                        </div>

                        ${d.status === "pending"
                ? `
                                <div class="card-actions">
                                    <button class="card-btn assign"
                                        onclick="assignBooking(${d.originalIndex})">
                                        Assign
                                    </button>
                                    <button class="card-btn reject"
                                        onclick="openReject(${d.originalIndex})">
                                        Reject
                                    </button>
                                </div>
                                `
                : ""
            }
                    </div>
                `;
    });

    renderPagination(totalRows, totalPages, start, end, status);
}

function renderPagination(totalRows, totalPages, start, end, status) {
    const pagination = document.getElementById("pagination");
    const info = document.getElementById("paginationInfo");

    pagination.innerHTML = "";

    if (totalRows === 0) {
        info.innerHTML = "";
        return;
    }

    info.innerHTML = `
        Showing ${start + 1}–${Math.min(end, totalRows)} of ${totalRows}
      `;

    const createBtn = (label, page, disabled = false, active = false) => {
        const btn = document.createElement("button");
        btn.className = "page-btn";
        btn.innerText = label;

        if (disabled) btn.classList.add("disabled");
        if (active) btn.classList.add("active");

        btn.onclick = () => {
            currentPage = page;
            render(status);
        };

        pagination.appendChild(btn);
    };

    createBtn("Previous", currentPage - 1, currentPage === 1);

    for (let i = 1; i <= totalPages; i++) {
        createBtn(i, i, false, i === currentPage);
    }

    createBtn("Next", currentPage + 1, currentPage === totalPages);
}

function pushUserNotification(booking) {
    const userNoti =
        JSON.parse(localStorage.getItem("user_notifications")) || [];

    userNoti.unshift({
        message: `สถานะการจอง ${booking.id} เปลี่ยนเป็น "${booking.status}"`,
        bookingId: booking.id,
        type: "booking",
        read: false,
        time: Date.now()
    });

    localStorage.setItem(
        "user_notifications",
        JSON.stringify(userNoti)
    );
}
function getPendingCountdown(bookedTime) {
    if (!bookedTime) return "-";

    const booked = typeof bookedTime === "number"
        ? bookedTime
        : new Date(bookedTime).getTime();

    if (isNaN(booked)) return "-";

    const LIMIT = 15 * 60 * 1000; // 15 นาที
    const now = Date.now();
    const diff = LIMIT - (now - booked);

    if (diff <= 0) return "หมดเวลา";

    const min = Math.floor(diff / 60000);
    const sec = Math.floor((diff % 60000) / 1000);

    return `เหลือ ${min}:${sec.toString().padStart(2, "0")} นาที`;
}
render();

document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        render(btn.dataset.status);
    }
});

function openReject(index) {
    currentRejectRow = index;
    document.getElementById("rejectModal").classList.add("show");
}

function closeModal() {
    document.getElementById("rejectModal").classList.remove("show");
}

function confirmReject() {
    data[currentRejectRow].status = "cancelled";
    data[currentRejectRow].cancelType = "rejected";
    data[currentRejectRow].adminNote =
        document.getElementById("rejectReason").value || "ปฏิเสธโดยแอดมิน";

    localStorage.setItem("bookings", JSON.stringify(data));

    document.getElementById("rejectReason").value = "";
    closeModal();
    render(document.querySelector(".filter-btn.active").dataset.status);

    const notifications =
        JSON.parse(localStorage.getItem("notifications")) || [];

    const b = data[currentRejectRow];
    pushUserNotification(b);

    notifications.unshift({
        message: `📌 อัปเดตสถานะ: ${b.name}`,
        bookingId: b.id,
        type: "booking",
        read: false,
        time: Date.now()
    });

    localStorage.setItem("notifications", JSON.stringify(notifications));
    loadNotifications();
}

let currentAssignIndex = null;
function assignBooking(index) {
    currentAssignIndex = index;

    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    const technicians = JSON.parse(localStorage.getItem("technicians")) || [];

    const techListDiv = document.getElementById("techList");
    techListDiv.innerHTML = "";

    // หาเฉพาะช่างที่ว่าง
    const availableTechs = technicians.filter(tech => {
        return !bookings.some(
            b => b.tech === tech.name && b.status === "assigned"
        );
    });

    if (availableTechs.length === 0) {
        techListDiv.innerHTML = "<p>ไม่มีช่างว่าง</p>";
    } else {
        availableTechs.forEach(tech => {
            const div = document.createElement("div");
            div.className = "tech-option";
            div.innerText = tech.name;
            div.onclick = () => confirmAssign(tech.name);
            techListDiv.appendChild(div);
        });
    }

    document.getElementById("assignModal").classList.add("show");
}

function closeAssignModal() {
    document.getElementById("assignModal").classList.remove("show");
}

function confirmAssign(techName) {
    data[currentAssignIndex].status = "assigned";
    data[currentAssignIndex].tech = techName;

    localStorage.setItem("bookings", JSON.stringify(data));

    const notifications =
        JSON.parse(localStorage.getItem("notifications")) || [];

    const b = data[currentAssignIndex];
    pushUserNotification(b);

    notifications.unshift({
        message: `✅ จัดช่าง ${techName} ให้ ${b.name}`,
        bookingId: b.id,
        type: "booking",
        read: false,
        time: Date.now()
    });

    localStorage.setItem("notifications", JSON.stringify(notifications));
    loadNotifications();

    closeAssignModal();

    render(
        document.querySelector(".filter-btn.active")?.dataset.status || "all"
    );
}

window.addEventListener("load", () => {
    const bookingId = location.hash.replace("#", "");
    if (!bookingId) return;


    setTimeout(() => {
        const row = document.getElementById(`booking-${bookingId}`);
        if (!row) return;

        row.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        row.style.background = "#eef2ff";
        row.style.transition = "background 0.5s";

        setTimeout(() => {
            row.style.background = "";
        }, 3000);
    }, 300);
});

function scrollToBookingFromHash() {
    const bookingId = location.hash.replace("#", "");
    if (!bookingId) return;

    render(document.querySelector(".filter-btn.active")?.dataset.status || "all");

    setTimeout(() => {
        const row = document.getElementById(`booking-${bookingId}`);
        if (!row) return;

        row.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        row.style.background = "#eef2ff";
        row.style.transition = "background 0.5s";

        setTimeout(() => {
            row.style.background = "";
        }, 3000);
    }, 300);

}

window.addEventListener("load", scrollToBookingFromHash);
window.addEventListener("hashchange", scrollToBookingFromHash);

function updateCountdownOnly() {
    document.querySelectorAll(".pending-time").forEach(el => {
        const time = el.dataset.time;
        el.innerText = getPendingCountdown(time);
    });
}
setInterval(updateCountdownOnly, 1000);

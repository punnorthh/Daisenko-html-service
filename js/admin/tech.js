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
        renderTechnicians();
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

/* ===== SEARCH TECHNICIANS ===== */
let currentKeyword = "";

function searchTechnicians() {
    const desktopInput = document.getElementById("searchInput");
    const mobileInput = document.getElementById("searchMobileInput");

    const keyword =
        (desktopInput?.value || mobileInput?.value || "").toLowerCase();

    currentKeyword = keyword;

    renderTechnicians();
}

/* ===== INIT SEARCH ===== */
document.addEventListener("DOMContentLoaded", () => {
    const desktopInput = document.getElementById("searchInput");
    const mobileInput = document.getElementById("searchMobileInput");

    // realtime search
    desktopInput?.addEventListener("input", searchTechnicians);
    mobileInput?.addEventListener("input", searchTechnicians);

    document.addEventListener("keydown", function (e) {

        // ===== ENTER =====
        if (e.key === "Enter") {
            if (
                document.activeElement === desktopInput ||
                document.activeElement === mobileInput
            ) {
                searchTechnicians();

                // ปิด mobile overlay
                if (window.innerWidth <= 768) {
                    closeSearchOverlay();
                }

                // ปิด desktop input
                desktopInput?.classList.remove("show");

                document.activeElement.blur();
            }
        }

        // ===== ESC =====
        if (e.key === "Escape") {
            if (desktopInput) {
                desktopInput.value = "";
                desktopInput.classList.remove("show");
            }

            if (mobileInput) {
                mobileInput.value = "";
            }

            currentKeyword = "";
            renderTechnicians();

            closeSearchOverlay();
        }

        // ===== CTRL + F =====
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
            e.preventDefault();

            if (window.innerWidth <= 768) {
                openSearch();
            } else {
                desktopInput?.classList.add("show");
                desktopInput?.focus();
                desktopInput?.select();
            }
        }
    });
});

function searchTechnicians() {
    const desktopInput = document.getElementById("searchInput");
    const mobileInput = document.getElementById("searchMobileInput");

    const keyword =
        (desktopInput?.value || mobileInput?.value || "").toLowerCase();

    currentKeyword = keyword;

    renderTechnicians();
}

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        const input = document.getElementById("searchInput");
        input.classList.remove("show");
        input.value = "";
        currentKeyword = "";
        renderTechnicians();
    }
});

function openSearch() {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        document.getElementById("searchOverlay").classList.add("show");
        document.getElementById("searchMobileInput").focus();
    } else {

        const input = document.getElementById("searchInput");
        input.classList.toggle("show");
        input.focus();
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

// ===== TECHNICIANS DATA =====
let technicians =
    JSON.parse(localStorage.getItem("technicians")) ||
    [
        { name: "ช่างเอก" },
        { name: "ช่างบอย" },
        { name: "ช่างตั้ม" }
    ];

localStorage.setItem("technicians", JSON.stringify(technicians));

// ===== TABLE BODY =====
const table = document.getElementById("techTable");

// ===== RENDER FUNCTION =====
function renderTechnicians() {
    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];

    table.innerHTML = "";

    let mobileContainer = document.getElementById("techMobile");

    if (!mobileContainer) {
        mobileContainer = document.createElement("div");
        mobileContainer.id = "techMobile";
        document.querySelector(".table-box").appendChild(mobileContainer);
    }

    mobileContainer.innerHTML = "";

    technicians.forEach(tech => {

        const activeJobs = bookings.filter(
            b => b.tech === tech.name && b.status === "assigned"
        );

        let statusText = "ว่าง";
        let statusClass = "available";
        let jobText = "-";

        if (activeJobs.length > 0) {
            statusText = "ไม่ว่าง";
            statusClass = "busy";
            jobText = `${activeJobs.length} งาน`;
        }

        const searchableText =
            `${tech.name} ${statusText} ${jobText}`.toLowerCase();

        if (currentKeyword &&
            !searchableText.includes(currentKeyword)) {
            return;
        }

        /* ===== DESKTOP TABLE ===== */
        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td>${tech.name}</td>
        <td>
          <span class="status ${statusClass}">
            ${statusText}
          </span>
        </td>
        <td>${jobText}</td>
      `;
        table.appendChild(tr);

        /* ===== MOBILE CARD ===== */
        mobileContainer.innerHTML += `
      <div class="tech-card">
        <div class="tech-row">
          <div class="tech-label">ชื่อช่าง</div>
          <div class="tech-value">${tech.name}</div>
        </div>

        <div class="tech-row">
          <div class="tech-label">สถานะ</div>
          <div class="tech-value">
            <span class="status ${statusClass}">
              ${statusText}
            </span>
          </div>
        </div>

        <div class="tech-row">
          <div class="tech-label">งานที่รับอยู่</div>
          <div class="tech-value">${jobText}</div>
        </div>
      </div>
    `;
    });
}
renderTechnicians();
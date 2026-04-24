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
    localStorage.setItem("adminLoggedIn", "false");
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
    document.querySelectorAll(".sidebar a, .top-nav-menu a").forEach(link => {
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

/* ===== SERVICE SEARCH ===== */
let currentServiceKeyword = "";

function toggleSearch() {
    const input = document.getElementById("searchInput");
    input.classList.toggle("show");
    input.focus();
}

function searchServiceTable() {
    const desktopInput = document.getElementById("searchInput");
    const mobileInput = document.getElementById("searchMobileInput");

    const keyword =
        (desktopInput?.value || mobileInput?.value || "").toLowerCase();

    currentServiceKeyword = keyword;

    const services = loadServices();

    const filtered = services
        .map((s, index) => ({ ...s, realIndex: index }))
        .filter(s =>
            (s.title || "").toLowerCase().includes(keyword) ||
            (s.category || "").toLowerCase().includes(keyword) ||
            (s.desc || "").toLowerCase().includes(keyword) ||
            String(s.price || "").toLowerCase().includes(keyword) ||
            (s.active ? "active" : "inactive").includes(keyword)
        );

    renderFilteredTable(filtered);
    renderMobile(filtered);
}

function renderFilteredTable(data) {
    const tbody = document.getElementById("serviceTable");
    tbody.innerHTML = "";

    data.forEach((s) => {
        tbody.innerHTML += `
                  <tr>
                      <td><input type="checkbox" data-i="${s.realIndex}"></td>
                      <td>
                      ${s.image ? `<img src="${s.image}" style="height:40px;border-radius:8px">` : "-"}
                      </td>
                      <td>${(s.title)}</td>
                      <td>${(s.category)}</td>
                      <td>${(s.desc || "-")}</td>
                      <td>${(String(s.price))} บาท</td>
                      <td>
                      <span class="badge ${s.active ? 'active' : 'inactive'}">
                          ${s.active ? 'Active' : 'Inactive'}
                      </span>
                      </td>
                      <td>
                      ${s.isPromo
                ? `<span style="font-size:12px;color:#dc2626">PROMO</span>`
                : `<button class="btn-edit" onclick="openForm(${s.realIndex})">แก้ไข</button>`
            }
                      </td>
                  </tr>
              `;
    });
}

document.getElementById("searchInput")?.addEventListener("input", searchServiceTable);
document.getElementById("searchMobileInput")?.addEventListener("input", searchServiceTable);
document.addEventListener("keydown", function (e) {
    const desktopInput = document.getElementById("searchInput");
    const mobileInput = document.getElementById("searchMobileInput");

    // ===== ENTER =====
    if (e.key === "Enter") {
        if (document.activeElement === mobileInput) {
            searchServiceTable();
            closeSearchOverlay(); 
            mobileInput.blur();
        }

        if (document.activeElement === desktopInput) {
            searchServiceTable();
            desktopInput.blur();
        }
    }

    // ===== ESC =====
    if (e.key === "Escape") {

        // clear input
        if (desktopInput) {
            desktopInput.value = "";
            desktopInput.classList.remove("show");
        }

        if (mobileInput) {
            mobileInput.value = "";
        }

        // reset keyword
        currentServiceKeyword = "";

        // reset table
        renderTable();

        // ปิด overlay
        closeSearchOverlay();
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
    document.getElementById("searchOverlay").classList.remove("show");
}

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        closeSearchOverlay();

        const input = document.getElementById("searchInput");
        input.classList.remove("show");
    }
});

/* ===== TABLE ===== */
const STORAGE_KEY = "ALL_SERVICES";
const loadServices = () => JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
const saveServices = d => localStorage.setItem(STORAGE_KEY, JSON.stringify(d));

function renderTable() {
    const tbody = document.getElementById("serviceTable");
    tbody.innerHTML = "";
    const data = loadServices();

    loadServices().forEach((s, i) => {
        tbody.innerHTML += `
                  <tr>
                      <td><input type="checkbox" data-i="${i}"></td>
                      <td>
                      ${s.image ? `<img src="${s.image}" style="height:40px;border-radius:8px">` : "-"}
                      </td>
                      <td>${s.title}</td>
                      <td>${s.category}</td>
                      <td>${s.desc || "-"}</td>
                      <td>${s.price} บาท</td>
                      <td>
                      <span class="badge ${s.active ? 'active' : 'inactive'}">
                          ${s.active ? 'Active' : 'Inactive'}
                      </span>
                      </td>
                      <td>
                      ${s.isPromo
                ? `<span style="font-size:12px;color:#dc2626">PROMO</span>`
                : `<button class="btn-edit" onclick="openForm(${i})">แก้ไข</button>`
            }
                      </td>
                  </tr>
              `;
    });
    renderMobile(data);
}

function renderMobile(data = loadServices()) {
    const container = document.getElementById("serviceMobile");
    container.innerHTML = "";

    data.forEach((s, i) => {
        container.innerHTML += `
        <div class="service-card">

            ${s.image ? `<img src="${s.image}">` : ""}

            <div class="service-body">

                <div class="service-category">${s.category}</div>

                <div class="service-title">${s.title}</div>

                <div class="service-sub">ID: ${i + 1000}</div>

                <div class="service-price">${s.price} บาท</div>

                <div class="service-actions">
                    <button class="btn-edit-card" onclick="openForm(${i})">
                        <i class="ri-pencil-line"></i>
                    </button>

                    <button class="btn-delete-card" onclick="deleteSingle(${i})">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>

            </div>
        </div>
        `;
    });
}

function deleteSingle(index) {
    let data = loadServices();

    if (confirm("ลบรายการนี้ใช่ไหม?")) {
        data.splice(index, 1);
        saveServices(data);
        renderTable();
    }
}

function openForm(i = null) {
    serviceModal.style.display = "flex";

    if (i !== null) {
        const s = loadServices()[i];

        if (s.isPromo) {
            alert("ไม่สามารถแก้ไขโปรโมชั่นจากหน้านี้ได้");
            closeForm();
            return;
        }

        serviceIndex.value = i;
        serviceTitle.value = s.title;
        serviceCategory.value = s.category;
        serviceDesc.value = s.desc;
        servicePrice.value = s.price || "";
        serviceActive.checked = s.active;

        if (s.image) {
            imagePreview.src = s.image;
            imagePreview.style.display = "block";
        } else {
            imagePreview.style.display = "none";
        }

        document.querySelector(".form-actions .btn").textContent = "Save";

    } else {
        serviceIndex.value = "";
        serviceTitle.value = "";
        serviceCategory.value = "standard";
        serviceDesc.value = "";
        servicePrice.value = "";
        serviceImage.value = "";
        serviceActive.checked = true;
        imagePreview.style.display = "none";

        document.querySelector(".form-actions .btn").textContent = "Add";
    }

    toggleFormDisabled(serviceActive.checked);
}

function closeForm() {
    serviceModal.style.display = "none";
}

serviceModal.addEventListener("click", e => {
    if (e.target === serviceModal) {
        closeForm();
    }
});

serviceImage.addEventListener("change", () => {
    const file = serviceImage.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        imagePreview.src = e.target.result;
        imagePreview.style.display = "block";
    };
    reader.readAsDataURL(file);
});


function saveService() {
    const data = loadServices();
    const index = serviceIndex.value;
    const file = serviceImage.files[0];

    const saveData = (img = "") => {
        const service = {
            title: serviceTitle.value,
            category: serviceCategory.value,
            desc: serviceDesc.value,
            price: Number(servicePrice.value),
            image: img,
            active: serviceActive.checked
        };

        if (index === "") {
            data.unshift(service);
        } else {
            data[index] = service;
        }

        saveServices(data);
        closeForm();
        renderTable();
    };

    if (file) {
        const reader = new FileReader();
        reader.onload = e => saveData(e.target.result);
        reader.readAsDataURL(file);
    } else {
        const oldImg = index !== "" ? data[index].image : "";
        saveData(oldImg);
    }
}

function deleteSelected() {

    const selected = document.querySelectorAll("#serviceTable input:checked");

    const modal = document.getElementById("deleteConfirmModal");
    const msg = document.getElementById("deleteMessage");

    if (selected.length === 0) {
        msg.textContent = "No services selected.";
    } else {
        msg.textContent = "Are you sure you want to delete selected services?";
    }

    modal.style.display = "flex";
}

function closeDeleteModal() {
    document.getElementById("deleteConfirmModal").style.display = "none";
}

function confirmDelete() {
    let data = loadServices();

    document.querySelectorAll("#serviceTable input:checked")
        .forEach(cb => data[cb.dataset.i] = null);

    saveServices(data.filter(Boolean));
    renderTable();

    closeDeleteModal();
}

const deleteConfirmModal = document.getElementById("deleteConfirmModal");

deleteConfirmModal.addEventListener("click", function (e) {
    if (e.target === deleteConfirmModal) {
        closeDeleteModal();
    }
});

function toggleAll(el) {
    document.querySelectorAll("#serviceTable input")
        .forEach(c => c.checked = el.checked);
}
renderTable();

function toggleFormDisabled(isActive) {
    const fields = document.querySelectorAll(
        '#serviceTitle, #serviceDesc, #serviceCategory, #serviceImage, #servicePrice'
    );

    const btn = document.querySelector('.form-actions .btn');

    fields.forEach(el => el.disabled = !isActive);
    btn.disabled = !isActive;

    btn.style.opacity = isActive ? "1" : ".5";
    btn.style.cursor = isActive ? "pointer" : "not-allowed";
}

serviceActive.addEventListener("change", () => {
    toggleFormDisabled(serviceActive.checked);
});

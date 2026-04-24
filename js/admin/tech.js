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
  //updateDashboardStats();
});

window.addEventListener("load", scrollToBookingFromHash);
window.addEventListener("hashchange", scrollToBookingFromHash);


function scrollToBookingFromHash() {
  const hash = window.location.hash.replace("#", "");

  if (!hash) return;

  setTimeout(() => {
    const target = document.getElementById(`row-${hash}`);

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

      // highlight
      target.style.background = "#fff3cd";

      setTimeout(() => {
        target.style.background = "";
      }, 2000);
    }
  }, 300); // รอ render
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

function toggleServiceSearch() {
  const input = document.getElementById("serviceSearchInput");

  input.classList.toggle("show");

  if (input.classList.contains("show")) {
    input.focus();
  } else {
    input.value = "";
    currentKeyword = "";
    renderTechnicians();
  }
}

function searchTechnicians() {
  const input = document.getElementById("serviceSearchInput");
  currentKeyword = input.value.toLowerCase();
  renderTechnicians();
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    const input = document.getElementById("serviceSearchInput");
    input.classList.remove("show");
    input.value = "";
    currentKeyword = "";
    renderTechnicians();
  }
});

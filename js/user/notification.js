/* =============  NOTIFICATION SYSTEM =============== */
const notifySound = new Audio("../sounds/notify.mp3");
notifySound.volume = 1;

let audioUnlocked = false;
let previousUnread = 0;

function unlockAudio() {
  if (audioUnlocked) return;

  notifySound.play()
    .then(() => {
      notifySound.pause();
      notifySound.currentTime = 0;
      audioUnlocked = true;
    })
    .catch(() => { });
}
document.addEventListener("click", unlockAudio, { once: true });

function loadNotifications(playSound = false) {

  const badge = document.getElementById("notifyCount");
  const list = document.getElementById("notificationList");

  if (!badge || !list) return;

  // ✅ ถ้าไม่ได้ login → ซ่อนทุกอย่าง
  if (!localStorage.getItem("isLoggedIn")) {
    badge.style.display = "none";
    badge.textContent = "0";
    list.innerHTML = "";
    return;
  }

  const notifications = getJSON("user_notifications", []);
  const unread = notifications.filter(n => !n.read);

  badge.textContent = unread.length;
  badge.style.display = unread.length ? "flex" : "none";

  if (playSound && unread.length > previousUnread && audioUnlocked) {
    notifySound.currentTime = 0;
    notifySound.play().catch(() => { });
  }

  previousUnread = unread.length;

  list.innerHTML = "";

  if (!notifications.length) {
    list.innerHTML = `<li class="empty">ไม่มีการแจ้งเตือน</li>`;
    return;
  }

  notifications.forEach((n, i) => {
    const li = document.createElement("li");
    li.textContent = n.message;
    if (!n.read) li.classList.add("unread");

    li.onclick = () => {
      notifications[i].read = true;
      localStorage.setItem("user_notifications", JSON.stringify(notifications));
      loadNotifications();
      toggleNotification(true);

      if (n.type === "booking" && n.bookingId) {
        window.location.href = `history.html#${n.bookingId}`;
      }
    };

    list.appendChild(li);
  });
}

function toggleNotification(forceClose = false) {
  const dropdown =
    document.getElementById("notificationDropdown");
  if (!dropdown) return;

  if (forceClose) {
    dropdown.classList.remove("show");
    return;
  }

  dropdown.classList.toggle("show");
}

document.addEventListener("click", e => {
  const wrapper =
    document.querySelector(".notification-wrapper");
  const dropdown =
    document.getElementById("notificationDropdown");

  if (!wrapper?.contains(e.target)) {
    dropdown?.classList.remove("show");
  }
});

window.addEventListener("storage", e => {
  if (e.key === "user_notifications") {
    loadNotifications(true);
  }
});

loadNotifications();
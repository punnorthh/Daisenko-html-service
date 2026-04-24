 /* ============   AUTH HEADER =============== */
 function getJSON(key, fallback = null) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
 
 function logout() {
    localStorage.removeItem("isLoggedIn");

    const badge = document.getElementById("notifyCount");
    if (badge) {
      badge.style.display = "none";
      badge.textContent = "0";
    }

    const dropdown = document.getElementById("notificationDropdown");
    dropdown?.classList.remove("show");

    window.location.href = "home.html";
  }

  function toggleProfile() {
    const menu = document.getElementById("profileMenu");
    if (!menu) return;
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  }

  function renderHeader() {
    const navAuth = document.getElementById("navAuth");

     if (!navAuth) return;

    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const user = getJSON("user", {});

    if (!isLoggedIn) {
      navAuth.innerHTML =
        `<a href="login.html" class="nav-cta">สมัครสมาชิก / เข้าสู่ระบบ</a>`;
      return;
    }

    navAuth.innerHTML = `
      <div class="profile">
        <button class="avatar-btn" onclick="toggleProfile()">
          <div class="avatar-letter">
            ${user.name?.charAt(0) || "U"}
          </div>
        </button>
  
        <div class="profile-menu" id="profileMenu">
          <div class="profile-info">
            <strong>${user.name || "-"}</strong>
            <span>${user.email || "-"}</span>
          </div>
          <a href="home.html">หน้าหลัก</a>
          <a href="myprofile.html">บัญชีของฉัน</a>
          <a href="servicelist.html">ประเภทการบริการ</a>
          <a href="booking.html">จองบริการ</a>
          <a href="history.html">ประวัติการจอง</a>
          <a href="#" class="logout" onclick="logout()">ออกจากระบบ</a>
        </div>
      </div>
    `;
  }
  renderHeader();

 window.addEventListener("DOMContentLoaded", () => {
  renderHeader();
});

window.addEventListener("scroll", () => {
    document.querySelector("header")
      .classList.toggle("scrolled", window.scrollY > 10);
  });

  document.addEventListener("click", function (e) {
    const menu = document.getElementById("profileMenu");
    const avatarBtn = document.querySelector(".avatar-btn");
  
    if (!menu || !avatarBtn) return;
 
    if (!menu.contains(e.target) && !avatarBtn.contains(e.target)) {
      menu.style.display = "none";
    }
  });

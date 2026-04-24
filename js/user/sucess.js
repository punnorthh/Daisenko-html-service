document.addEventListener("DOMContentLoaded", () => {

  const loading = document.getElementById("loadingScreen");
  const bookingIdEl = document.getElementById("bookingId");

  // mock booking id (จริง ๆ มาจาก backend ได้)
  const bookingId =
    "DSK-" + Math.floor(100000 + Math.random() * 900000);

  bookingIdEl.textContent = bookingId;

  // hide loading
  setTimeout(() => {
    loading.style.display = "none";
  }, 900);

});

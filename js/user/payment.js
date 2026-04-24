document.addEventListener("DOMContentLoaded", function () {

  const slipInput = document.getElementById("slip");
  const confirmBtn = document.getElementById("confirmPayment");
  const statusText = document.getElementById("paymentStatus");

  confirmBtn.addEventListener("click", function () {

    if (!slipInput.files.length) {
      alert("กรุณาอัปโหลดสลิปก่อน");
      return;
    }

    statusText.textContent = "กำลังตรวจสอบการชำระเงิน...";
    statusText.className = "status pending";

    setTimeout(() => {
      statusText.innerHTML =
        "ชำระเงินสำเร็จ ✅<br>ช่างจะติดต่อกลับภายใน 15 นาที";
      statusText.className = "status success";

      // 👉 ไปหน้าขอบคุณ / success
      setTimeout(() => {
        window.location.href = "success.html";
      }, 1500);

    }, 2000);

  });

});

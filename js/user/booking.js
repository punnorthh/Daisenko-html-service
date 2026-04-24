import { db } from "../admin/firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const form = document.getElementById("bookingForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault(); // กันหน้า reload

  const confirmBtn = document.getElementById("confirmBooking");
  confirmBtn.disabled = true;
  confirmBtn.textContent = "กำลังส่งข้อมูล...";

  try {

    const service = JSON.parse(
      localStorage.getItem("SELECTED_SERVICE") || "null"
    );

    const bookingData = {
      code: "DSK" + Date.now(),
      name: document.getElementById("name").value,
      phone: document.getElementById("phone").value,
      serviceType: service?.title || "-",
      amount: document.getElementById("amount").value,
      location: document.getElementById("location").value || "-",
      date: document.getElementById("date").value || "-",
      note: document.getElementById("note").value || "-",
      status: "pending",
      technicianId: null,
      createdAt: serverTimestamp()
    };

    console.log("🔥 sending:", bookingData);

    
    await addDoc(collection(db, "bookings"), bookingData);

    console.log("✅ Firebase success");
    alert("จองสำเร็จ ✅");

  } catch (e) {
    console.error("❌ error:", e);
    alert("error: " + e.message);

    confirmBtn.disabled = false;
    confirmBtn.textContent = "ยืนยันการจอง";
  }
});
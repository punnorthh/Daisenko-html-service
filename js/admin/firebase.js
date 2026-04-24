import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";



const firebaseConfig = {
  apiKey: "AIzaSyCqRDXBWRbUvzFH0M7vp-bRD0WxHX70w1Y",
  authDomain: "air-cleaning-test.firebaseapp.com",
  projectId: "air-cleaning-test",
  storageBucket: "air-cleaning-test.firebasestorage.app",
  messagingSenderId: "408424583515",
  appId: "1:408424583515:web:db90ff6ad722afc3390a7e",
  measurementId: "G-KYE14YHYFH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);


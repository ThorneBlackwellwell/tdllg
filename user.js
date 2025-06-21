import jsQR from "https://cdn.jsdelivr.net/npm/jsqr@1.5.1/dist/jsQR.es6.min.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC1jafyykSj2ZwxixCRGPLiOlRNgbKfBkw",
  authDomain: "mime1-1b107.firebaseapp.com",
  projectId: "mime1-1b107",
  storageBucket: "mime1-1b107.appspot.com",
  messagingSenderId: "483499385793",
  appId: "1:483499385793:web:7fcf1f8b2c2338bdab0540",
  measurementId: "G-G7EQ1PQJC4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ห่อด้วย window.onload เพื่อให้ DOM โหลดเสร็จก่อน
window.onload = () => {
  const video = document.getElementById("video");
  let stream = null;

  document.getElementById('scanBtn')?.addEventListener('click', scanQR);

  async function scanQR() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      video.srcObject = stream;
      video.hidden = false;
      await video.play();

      startScanLoop();
    } catch (err) {
      alert("ไม่สามารถเปิดกล้องได้: " + err.message);
      console.error(err);
    }
  }

  function startScanLoop() {
    const canvasElement = document.createElement("canvas");
    const canvas = canvasElement.getContext("2d");

    async function scanFrame() {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvasElement.width = video.videoWidth;
        canvasElement.height = video.videoHeight;
        canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
        const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);

        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          alert("สแกนได้: " + code.data);
          stopScan();

          const username = document.getElementById("userName").textContent.trim();
          const userDoc = doc(db, "users", username);
          const docSnap = await getDoc(userDoc);

          if (docSnap.exists()) {
            const data = docSnap.data();
            if (code.data === "attend") {
              await updateDoc(userDoc, { attend: (data.attend || 0) + 1 });
            } else if (code.data === "clean") {
              await updateDoc(userDoc, { clean: (data.clean || 0) + 1 });
            } else {
              alert("QR code ไม่ถูกต้อง");
              return;
            }

            alert("อัปเดตกิจกรรมสำเร็จ");
            location.reload();
          }
        }
      }
      requestAnimationFrame(scanFrame);
    }

    requestAnimationFrame(scanFrame);
  }

  function stopScan() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    video.hidden = true;
  }
};

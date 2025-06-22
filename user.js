// user.js

const db = firebase.firestore();

const video = document.getElementById("video");
let stream = null;

// ✅ ดึงชื่อจาก localStorage
const username = localStorage.getItem("currentUser");

// ✅ ถ้าไม่มี username ให้กลับไปหน้า login
if (!username) {
  alert("กรุณาเข้าสู่ระบบก่อนใช้งานหน้านี้");
  window.location.href = "login.html";
}

// ✅ แสดงชื่อผู้ใช้บนหน้าเว็บ
document.getElementById("userName").textContent = username;

// ✅ โหลดข้อมูลกิจกรรมจาก Firestore มาแสดง
loadUserStats();

// ✅ ผูกปุ่มเปิดกล้อง
document.getElementById("scanBtn").addEventListener("click", scanQR);

function scanQR() {
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(mediaStream => {
      stream = mediaStream;
      video.srcObject = stream;
      video.hidden = false;
      video.play();
      startScanLoop();
    })
    .catch(err => {
      alert("ไม่สามารถเปิดกล้องได้: " + err.message);
      console.error(err);
    });
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
        alert("✅ สแกนได้: " + code.data);
        stopScan();

        // ✅ ค้นหาจาก Firestore โดยใช้ username
        const usersRef = db.collection("users");
        const query = usersRef.where("username", "==", username);
        const querySnapshot = await query.get();

        if (querySnapshot.empty) {
          alert("❌ ไม่พบชื่อผู้ใช้ในระบบ");
          return;
        }

        const userDoc = querySnapshot.docs[0];
        const data = userDoc.data();

        // ✅ เพิ่มคะแนนกิจกรรม
        if (code.data === "attend") {
          await userDoc.ref.update({ attend: (data.attend || 0) + 1 });
        } else if (code.data === "clean") {
          await userDoc.ref.update({ clean: (data.clean || 0) + 1 });
        } else {
          alert("❌ QR Code ไม่ถูกต้อง");
          return;
        }

        alert("✅ อัปเดตกิจกรรมสำเร็จ");
        loadUserStats(); // โหลดใหม่
      }
    }
    requestAnimationFrame(scanFrame);
  }

  requestAnimationFrame(scanFrame);
}

function stopScan() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  video.hidden = true;
}

// ✅ โหลดข้อมูลสถิติของผู้ใช้
async function loadUserStats() {
  const usersRef = db.collection("users");
  const query = usersRef.where("username", "==", username);
  const querySnapshot = await query.get();

  if (!querySnapshot.empty) {
    const data = querySnapshot.docs[0].data();
    document.getElementById("attendCount").textContent = data.attend || 0;
    document.getElementById("cleanCount").textContent = data.clean || 0;
    document.getElementById("eventAttendCount").textContent = data.eventAttend || 0;
    document.getElementById("eventCleanCount").textContent = data.eventClean || 0;
  }
}

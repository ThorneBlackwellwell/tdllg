import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const db = getFirestore();

const video = document.getElementById('video');
let stream = null;

export async function scanQR() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    video.srcObject = stream;
    video.hidden = false;
    video.play();

    startScanLoop();
  } catch (err) {
    alert("ไม่สามารถเปิดกล้องได้: " + err.message);
    console.error(err);
  }
}

function startScanLoop() {
  const canvasElement = document.createElement('canvas');
  const canvas = canvasElement.getContext('2d');

  async function scanFrame() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvasElement.height = video.videoHeight;
      canvasElement.width = video.videoWidth;
      canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
      const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);

      // ใช้ jsQR ที่โหลดจาก <script src="https://cdn.jsdelivr.net/npm/jsqr/dist/jsQR.js"></script>
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        alert("สแกนได้: " + code.data);
        stopScan();

        // อัพเดต Firestore ตามข้อมูลที่ได้ (ตัวอย่าง สมมติ code.data คือกิจกรรม)
        const username = document.getElementById('userName').textContent;
        if (username) {
          const userDoc = doc(db, 'users', username);
          const docSnap = await getDoc(userDoc);
          if (docSnap.exists()) {
            const data = docSnap.data();

            // สมมติ QR code เป็น 'attend' หรือ 'clean'
            if (code.data === 'attend') {
              await updateDoc(userDoc, { attend: data.attend + 1 });
            } else if (code.data === 'clean') {
              await updateDoc(userDoc, { clean: data.clean + 1 });
            }

            alert("อัพเดตข้อมูลกิจกรรมสำเร็จ");
            location.reload(); // โหลดหน้าใหม่แสดงข้อมูลล่าสุด
          }
        }
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

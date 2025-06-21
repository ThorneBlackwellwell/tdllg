// user.js
let video = document.getElementById('video');
let stream = null;

export async function scanQR() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    video.srcObject = stream;
    video.hidden = false;

    // เรียกฟังก์ชันตรวจจับ QR (อาจใช้ไลบรารี jsQR หรือ html5-qrcode)
    startScanLoop();
  } catch (err) {
    alert("ไม่สามารถเปิดกล้องได้: " + err.message);
    console.error(err);
  }
}

// ตัวอย่างฟังก์ชันวนอ่านเฟรมกล้องและตรวจจับ QR ด้วย jsQR (ต้องเพิ่มไลบรารี jsQR)
function startScanLoop() {
  const canvasElement = document.createElement('canvas');
  const canvas = canvasElement.getContext('2d');

  function scanFrame() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvasElement.height = video.videoHeight;
      canvasElement.width = video.videoWidth;
      canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
      const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);

      // ใช้ jsQR ในการอ่าน QR code จาก imageData
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        alert("สแกนได้: " + code.data);
        stopScan();
        // อัพเดตฐานข้อมูล Firestore หรืออื่นๆ ตามที่ต้องการ
        return;
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

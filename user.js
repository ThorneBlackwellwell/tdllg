const db = firebase.firestore();

const video = document.getElementById("video");
let stream = null;

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
        alert("สแกนได้: " + code.data);
        stopScan();

        const username = document.getElementById("userName").textContent.trim();
        const userDocRef = db.collection("users").doc(username);
        const docSnap = await userDocRef.get();

        if (docSnap.exists) {
          const data = docSnap.data();
          if (code.data === "attend") {
            await userDocRef.update({ attend: (data.attend || 0) + 1 });
          } else if (code.data === "clean") {
            await userDocRef.update({ clean: (data.clean || 0) + 1 });
          } else {
            alert("QR ไม่ถูกต้อง");
          }

          alert("อัปเดตสำเร็จ");
          location.reload();
        } else {
          alert("ไม่พบชื่อผู้ใช้");
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

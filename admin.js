// admin.js
const db = firebase.firestore();
const usersRef = db.collection('users');

function loadUsers() {
  usersRef.get().then(snapshot => {
    const list = document.getElementById('userList');
    list.innerHTML = '';
    snapshot.forEach(doc => {
      const data = doc.data();
      const li = document.createElement('li');
      li.textContent = data.username;
      list.appendChild(li);
    });
  });
}

function registerUser() {
  const name = document.getElementById('regName').value.trim();
  if (!name) return alert('กรุณากรอกชื่อ');

  usersRef.add({
    username: name,
    password: "123456",
    attend: 0,
    clean: 0,
    eventAttend: 0,
    eventClean: 0
  }).then(() => {
    loadUsers();
  });
}

function createQR() {
  const type = document.getElementById('activity').value;
  const qrDisplay = document.getElementById('qrDisplay');
  qrDisplay.innerHTML = '';

  const canvas = document.createElement('canvas');
  QRCode.toCanvas(canvas, type, error => {
    if (error) {
      console.error("QR Code Error:", error);
      alert("สร้าง QR Code ไม่สำเร็จ");
    } else {
      qrDisplay.appendChild(canvas);
    }
  });
}

function closeQR() {
  const qrDisplay = document.getElementById('qrDisplay');
  qrDisplay.innerHTML = '<p style="color: gray;">QR Code ถูกปิดแล้ว</p>';
}


// เรียกใช้ทันทีเมื่อโหลดหน้า
loadUsers();

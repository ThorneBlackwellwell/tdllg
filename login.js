function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
    document.getElementById('error').textContent = 'กรุณากรอกข้อมูลให้ครบ';
    return;
  }

  const db = firebase.firestore();
  const usersRef = db.collection('users');

  usersRef.where('username', '==', username).where('password', '==', password).get()
    .then(snapshot => {
      if (snapshot.empty) {
        document.getElementById('error').textContent = 'ชื่อหรือรหัสผ่านไม่ถูกต้อง';
        return;
      }
      const userDoc = snapshot.docs[0];
      localStorage.setItem('userId', userDoc.id);
      localStorage.setItem('currentUser', username);
      
      // ไปยังหน้าผู้ใช้หรือแอดมิน
      if (username === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'user.html';
      }
    })
    .catch(error => {
      document.getElementById('error').textContent = 'เกิดข้อผิดพลาด: ' + error.message;
      console.error(error);
    });
}

// ผูกฟังก์ชัน login กับ window เพื่อให้ onclick ใช้งานได้
window.login = login;

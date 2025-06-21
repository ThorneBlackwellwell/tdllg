import { db } from './firebase-config.js';
import { collection, getDocs } from 'firebase/firestore';

window.login = async function () {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);

  let found = false;

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.username === username && data.password === password) {
      found = true;
      localStorage.setItem('userId', doc.id);
      localStorage.setItem('username', data.username);
      window.location.href = username === 'admin' ? 'admin.html' : 'user.html';
    }
  });

  if (!found) {
    document.getElementById('error').textContent = 'ชื่อหรือรหัสผ่านไม่ถูกต้อง';
  }
}

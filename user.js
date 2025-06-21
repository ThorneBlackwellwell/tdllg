import { db } from './firebase-config.js';
import {
  doc, getDoc, updateDoc, onSnapshot
} from 'firebase/firestore';

const userId = localStorage.getItem('userId');
const userRef = doc(db, 'users', userId);

async function loadUser() {
  const snap = await getDoc(userRef);
  const data = snap.data();
  document.getElementById('userName').textContent = data.username;
  document.getElementById('attendCount').textContent = data.attend || 0;
  document.getElementById('cleanCount').textContent = data.clean || 0;
  document.getElementById('eventAttendCount').textContent = data.eventAttend || 0;
  document.getElementById('eventCleanCount').textContent = data.eventClean || 0;
}
loadUser();

window.changeName = async function () {
  const newName = document.getElementById('newName').value.trim();
  if (!newName) return;
  await updateDoc(userRef, { username: newName });
  document.getElementById('userName').textContent = newName;
}

window.scanQR = function () {
  const video = document.getElementById('video');
  video.hidden = false;
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(stream => {
      video.srcObject = stream;
      video.setAttribute('playsinline', true);
      video.play();
      const reader = new BarcodeDetector({ formats: ['qr_code'] });
      const detect = async () => {
        const result = await reader.detect(video);
        if (result.length > 0) {
          const text = result[0].rawValue;
          stream.getTracks().forEach(t => t.stop());
          video.hidden = true;
          handleQR(text);
        } else {
          requestAnimationFrame(detect);
        }
      };
      detect();
    });
}

async function handleQR(text) {
  const snap = await getDoc(userRef);
  const user = snap.data();

  if (text === 'attend') {
    await updateDoc(userRef, { attend: (user.attend || 0) + 1 });
  } else if (text === 'clean') {
    await updateDoc(userRef, { clean: (user.clean || 0) + 1 });
  } else if (text === 'eventAttend') {
    await updateDoc(userRef, { eventAttend: (user.eventAttend || 0) + 1 });
  } else if (text === 'eventClean') {
    await updateDoc(userRef, { eventClean: (user.eventClean || 0) + 1 });
  }
  loadUser();
}
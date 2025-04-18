// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_apiKey,
  authDomain: import.meta.env.VITE_authDomain,
  projectId: import.meta.env.VITE_projectId,
  storageBucket: import.meta.env.VITE_storageBucket,
  messagingSenderId: import.meta.env.VITE_messagingSenderId,
  appId: import.meta.env.VITE_appId,
  measurementId: import.meta.env.VITE_measurementId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
export {db ,storage, auth }


export function initFirebase() {
  const app = initializeApp(firebaseConfig);
  return app;
}

// ฟังก์ชันขอ token สำหรับการแจ้งเตือน
export async function requestNotificationPermission(app) {
  try {
    const messaging = getMessaging(app);
    
    // VAPID key จาก Firebase Console (Project settings > Cloud Messaging)
    const vapidKey = 'BOpqwMjROZUjSv0jI_XQad5CTMN1rjDoyEVLNwdTiW3VNK-Dp8sD1hmwj8E4MvF4fisnNoKwoG1Tb-PewzwpKg4';
    
    // ขอ permission จากผู้ใช้
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // รับ token
      const token = await getToken(messaging, { vapidKey });
      console.log('FCM Token:', token);
      
      // ส่ง token นี้ไปยังเซิร์ฟเวอร์ของคุณ เพื่อเก็บไว้สำหรับส่งการแจ้งเตือน
      saveTokenToServer(token);
      
      return token;
    } else {
      console.log('ไม่ได้รับอนุญาตให้แสดงการแจ้งเตือน');
      return null;
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการขอ token:', error);
    return null;
  }
}

// ฟังก์ชันเก็บ token ไว้ที่เซิร์ฟเวอร์
async function saveTokenToServer(token) {
  // ส่ง token ไปยัง API ของคุณ
  try {
    const response = await fetch('/api/save-notification-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    
    if (response.ok) {
      console.log('บันทึก token สำเร็จ');
    } else {
      console.error('ไม่สามารถบันทึก token ได้');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการบันทึก token:', error);
  }
}

// ฟังก์ชันรับ notifications ในขณะที่แอพเปิดอยู่
export function setupMessageListener(app) {
  const messaging = getMessaging(app);
  
  onMessage(messaging, (payload) => {
    console.log('ได้รับข้อความ:', payload);
    
    // สร้างการแจ้งเตือนเอง
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/path/to/icon.png',
    };
    
    new Notification(notificationTitle, notificationOptions);
  });
}


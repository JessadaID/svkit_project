// ไฟล์: static/firebase-messaging-sw.js
// Service Worker สำหรับ Firebase Cloud Messaging

importScripts("https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js");

// ข้อมูลกำหนดค่า Firebase (ต้องเป็นค่าเดียวกับในแอพของคุณ)
firebase.initializeApp({
  apiKey: import.meta.env.VITE_apiKey,
  authDomain: import.meta.env.VITE_authDomain,
  projectId: import.meta.env.VITE_projectId,
  storageBucket: import.meta.env.VITE_storageBucket,
  messagingSenderId: import.meta.env.VITE_messagingSenderId,
  appId: import.meta.env.VITE_appId,
});

const messaging = firebase.messaging();

// รับการแจ้งเตือนแบบ background
messaging.onBackgroundMessage((payload) => {
  console.log('ได้รับข้อความในพื้นหลัง:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/path/to/icon.png',
    click_action: payload.notification.click_action
  };
  
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// จัดการเมื่อคลิกที่การแจ้งเตือน
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // เปิดหน้าต่างที่ต้องการหรือเปิดแอพ
  event.waitUntil(
    clients.openWindow('/')
  );
});
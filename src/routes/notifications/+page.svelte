<!-- src/routes/notifications/+page.svelte -->
<script>
    import { onMount } from 'svelte';
    import { initFirebase, requestNotificationPermission, setupMessageListener } from '$lib/firebase';
    
    let notificationStatus = 'ยังไม่ได้กำหนด';
    
    onMount(async () => {
      // ตรวจสอบว่า browser รองรับ notifications หรือไม่
      if (!('Notification' in window)) {
        notificationStatus = 'เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน';
        return;
      }
      
      // ตรวจสอบสถานะ permission ปัจจุบัน
      if (Notification.permission === 'granted') {
        notificationStatus = 'อนุญาตแล้ว';
      } else if (Notification.permission === 'denied') {
        notificationStatus = 'ถูกปฏิเสธ';
      } else {
        notificationStatus = 'ยังไม่ได้ขออนุญาต';
      }
      
      // เริ่มต้นการทำงานของ Firebase
      const app = initFirebase();
      
      // ถ้าได้รับอนุญาตแล้ว ให้ตั้งค่า listener สำหรับรับข้อความ
      if (Notification.permission === 'granted') {
        setupMessageListener(app);
      }
    });
    
    async function subscribeToNotifications() {
      const app = initFirebase();
      const token = await requestNotificationPermission(app);
      
      if (token) {
        notificationStatus = 'อนุญาตแล้ว';
        setupMessageListener(app);
      } else {
        if (Notification.permission === 'denied') {
          notificationStatus = 'ถูกปฏิเสธ';
        }
      }
    }
  </script>
  
  <div class="notification-container">
    <h1>การแจ้งเตือน Push</h1>
    
    <div class="status-box">
      <p>สถานะการแจ้งเตือน: <strong>{notificationStatus}</strong></p>
    </div>
    
    {#if notificationStatus !== 'อนุญาตแล้ว' && notificationStatus !== 'ถูกปฏิเสธ'}
      <button on:click={subscribeToNotifications} class="subscribe-button">
        สมัครรับการแจ้งเตือน
      </button>
    {:else if notificationStatus === 'ถูกปฏิเสธ'}
      <p class="warning-text">
        คุณได้ปฏิเสธการแจ้งเตือน โปรดเปลี่ยนการตั้งค่าในเบราว์เซอร์เพื่ออนุญาตการแจ้งเตือน
      </p>
    {:else}
      <p class="success-text">
        คุณได้สมัครรับการแจ้งเตือนเรียบร้อยแล้ว
      </p>
    {/if}
  </div>
  
  <style>
    .notification-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      font-family: sans-serif;
    }
    
    .status-box {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    
    .subscribe-button {
      background-color: #4285f4;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
    }
    
    .subscribe-button:hover {
      background-color: #3367d6;
    }
    
    .warning-text {
      color: #d32f2f;
    }
    
    .success-text {
      color: #388e3c;
    }
  </style>
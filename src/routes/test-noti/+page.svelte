<script lang="ts">
    import { onMount } from 'svelte';
    
    let fcmToken = '';
    let message = 'ทดสอบการแจ้งเตือน';
    let status = '';
    let loading = false;
    
    // ฟังก์ชันสำหรับขอรับ FCM Token
   
    // ฟังก์ชันสำหรับส่งการแจ้งเตือน
    async function sendNotification() {
      if (!fcmToken) {
        status = 'โปรดขอรับ token ก่อน';
        return;
      }
      
      try {
        loading = true;
        status = 'กำลังส่งการแจ้งเตือน...';
        
        const response = await fetch('/api/test-noti', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token: fcmToken,
            message
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          status = '✅ ส่งการแจ้งเตือนสำเร็จ';
        } else {
          status = `❌ ส่งการแจ้งเตือนล้มเหลว: ${result.error}`;
        }
      } catch (error: any) {
        status = `❌ เกิดข้อผิดพลาด: ${error.message}`;
        console.error('Error sending notification:', error);
      } finally {
        loading = false;
      }
    }
    
    onMount(() => {
      // ตรวจสอบว่าเบราว์เซอร์รองรับการแจ้งเตือนหรือไม่
      if (!('Notification' in window)) {
        status = 'เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน';
      }
    });
  </script>
  
  <div class="container">
    <h1>ระบบทดสอบการแจ้งเตือน</h1>
    
    <div class="card">
      <div class="form-group">
        <label for="token">FCM Token:</label>
        <input 
          id="token" 
          type="text" 
          bind:value={fcmToken} 
        />
    
      </div>
      
      <div class="form-group">
        <label for="message">ข้อความ:</label>
        <input 
          id="message" 
          type="text" 
          bind:value={message} 
          placeholder="ใส่ข้อความที่ต้องการส่ง" 
        />
      </div>
      
      <button class="send-btn" on:click={sendNotification} disabled={loading || !fcmToken}>
        {loading ? 'กำลังส่ง...' : '🔔 ส่งการแจ้งเตือน'}
      </button>
      
      {#if status}
        <div class="status" class:error={status.includes('❌')} class:success={status.includes('✅')}>
          {status}
        </div>
      {/if}
    </div>
  </div>
  
  <style>
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem;
      font-family: sans-serif;
    }
    
    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 2rem;
    }
    
    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      padding: 2rem;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: bold;
      color: #555;
    }
    
    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-bottom: 0.5rem;
      font-size: 1rem;
    }
    
    button {
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    button:hover {
      background: #2563eb;
    }
    
    button:disabled {
      background: #94a3b8;
      cursor: not-allowed;
    }
    
    .send-btn {
      background: #10b981;
      width: 100%;
      padding: 1rem;
      font-size: 1.1rem;
      margin-top: 1rem;
    }
    
    .send-btn:hover {
      background: #059669;
    }
    
    .status {
      margin-top: 1.5rem;
      padding: 1rem;
      border-radius: 4px;
      background: #f1f5f9;
      text-align: center;
    }
    
    .error {
      background: #fee2e2;
      color: #b91c1c;
    }
    
    .success {
      background: #dcfce7;
      color: #15803d;
    }
  </style>
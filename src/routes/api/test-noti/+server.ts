import { admin } from '$lib/server/firebase';
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export async function POST(event: RequestEvent) {
  const { request } = event;
  const { token, message } = await request.json();

  console.log('Token:', token); // Log the token for debugging
  console.log('Message:', message); // Log the message for debugging
  
  // ตรวจสอบว่ามี token หรือไม่
  if (!token) {
    return json({ 
      success: false, 
      error: 'FCM Token ไม่ถูกต้อง' 
    }, { status: 400 });
  }

  try {
    // กำหนดข้อมูลการแจ้งเตือน
    const notificationData = {
      token,
      notification: {
        title: '🔥 ทดสอบแจ้งเตือน',
        body: message ?? 'ข้อความจากระบบ',
      },
      // สามารถเพิ่มข้อมูลเพิ่มเติมได้ที่นี่
      data: {
        clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        screen: 'notification_detail',
        time: new Date().toISOString()
      },
      // ตั้งค่าลำดับความสำคัญ
      android: {
        priority: 'high',
        notification: {
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          sound: 'default'
        }
      },
      // ตั้งค่าสำหรับ iOS
      apns: {
        headers: {
          'apns-priority': '10'
        },
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    // ส่งข้อความผ่าน Firebase Admin SDK
    const response = await admin.messaging().send(notificationData);

    console.log('✅ ส่งการแจ้งเตือนสำเร็จ:', response);
    
    return json({ 
      success: true, 
      response,
      messageId: response,
      sentAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ ส่งการแจ้งเตือนล้มเหลว:', error.message);
    
    // ส่งข้อผิดพลาดกลับไป
    return json({ 
      success: false, 
      error: error.message,
      errorCode: error.code || 'unknown_error',
      timestamp: new Date().toISOString()
    }, { 
      status: 500 
    });
  }
}
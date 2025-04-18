// src/routes/api/save-notification-token/+server.js
import { json } from '@sveltejs/kit';

// ในตัวอย่างนี้ เราจะเก็บ token ไว้ในรูปแบบง่ายๆ 
// ในการใช้งานจริง คุณควรเก็บในฐานข้อมูลเช่น MongoDB, Firebase Firestore, etc.
const tokens = new Set();

export async function POST({ request }) {
  try {
    const data = await request.json();
    const { token } = data;
    
    if (!token) {
      return json({ success: false, message: 'ไม่พบ token ในคำขอ' }, { status: 400 });
    }
    
    // เพิ่ม token ลงในรายการ
    tokens.add(token);
    console.log('เก็บ token สำเร็จ:', token);
    console.log('จำนวน tokens ทั้งหมด:', tokens.size);
    
    return json({ success: true, message: 'บันทึก token สำเร็จ' });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการบันทึก token:', error);
    return json({ success: false, message: 'เกิดข้อผิดพลาดในการประมวลผลคำขอ' }, { status: 500 });
  }
}
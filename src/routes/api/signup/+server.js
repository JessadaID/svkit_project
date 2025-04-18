import { json } from '@sveltejs/kit';

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY; // ตั้งใน .env
const FIREBASE_SIGNUP_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`;

export async function POST({ request }) {
  const { email, password, name, prefix, role } = await request.json();

  if (!email || !password || !name || !prefix) {
    return json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
  }

  try {
    // เรียก Firebase REST API เพื่อสมัครสมาชิก
    const res = await fetch(FIREBASE_SIGNUP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true
      })
    });

    const data = await res.json();

    if (data.error) {
      return json({ error: data.error.message }, { status: 400 });
    }

    const uid = data.localId;

    // ✨ สามารถเพิ่ม logic สำหรับบันทึกใน Firestore ที่ client ได้ หรือเรียกอีก API

    return json({ uid, email: data.email, message: 'สมัครสมาชิกสำเร็จ' });
  } catch (err) {
    return json({ error: err.message }, { status: 500 });
  }
}

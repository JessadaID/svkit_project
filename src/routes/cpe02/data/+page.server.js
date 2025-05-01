// src/routes/cpe02/data/+page.server.js
import { db } from "$lib/firebase";
import { collection, getDocs, query} from "firebase/firestore"; // เพิ่ม where

export async function load() {
  try {
    // 1. สร้าง query เพื่อดึงเฉพาะเอกสารที่มี isOpen = true และเรียงตาม createdAt
    const formsRef = collection(db, "forms");
    // *** เปลี่ยน query ให้กรอง isOpen ใน Firestore เลย ***
    const q = query(
      formsRef
    );
    const snapshot = await getDocs(q);

    // 2. ดึงเฉพาะฟิลด์ 'term' จากเอกสารที่ได้มา
    const terms = snapshot.docs
      .map((doc) => doc.data().term) // ดึงค่า term ออกมา
      .filter((term) => term); // กรองค่าที่เป็น null หรือ undefined ออก (ถ้ามี)

    // 3. ส่งข้อมูล array ของ term กลับไป
    //console.log("terms:", terms); // แสดงผลใน console เพื่อตรวจสอบ
    return {
      terms // ส่งกลับเป็น array ของชื่อ term
    };

  } catch (error) {
    console.error("Error loading terms:", error);

    // ส่งค่าว่างและข้อผิดพลาดกลับไป
    return {
      terms: [], // ส่ง array ว่างกลับไปในกรณีเกิดข้อผิดพลาด
      error: "Error loading terms: " + error.message
    };
  }
}

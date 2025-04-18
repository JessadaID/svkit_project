import { db } from "$lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export async function load() {
  try {
    // 1. ดึงข้อมูลทั้งหมดที่เรียงตาม createdAt
    const formsRef = collection(db, "forms");
    const q = query(formsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    // 2. กรองเฉพาะ isOpen = true ใน JavaScript
    const openDocs = snapshot.docs.filter(
      (doc) => doc.data().isOpen === true
    );
    
    let latestTerm = null;
    
    if (openDocs.length > 0) {
      const doc = openDocs[0]; // เอาเฉพาะตัวแรก (ล่าสุด)
      const data = doc.data();
      
      // แปลง Timestamp เป็นรูปแบบที่ serializable
      latestTerm = { 
        id: doc.id,
        ...data,
        // แปลง Timestamp เป็น ISO string หรือ milliseconds
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
        // หากมี Timestamp อื่นๆ ให้แปลงด้วย
        updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : null
      };
    }
    
    // ส่งข้อมูลกลับไปให้ component
    return {
      latestTerm
    };
    
  } catch (error) {
    console.error("Error loading latest term:", error);
    
    return {
      latestTerm: null,
      error: "Error loading latest term: " + error.message
    };
  }
}
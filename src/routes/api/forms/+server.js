// src/routes/api/projects.js
import { db } from "$lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
  try {
    const dataCollection = collection(db, "forms");
    const snapshot = await getDocs(dataCollection);

    const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      return {
        term: docData.term || '',
      };
    });

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
      status: 500,
    });
  }
}

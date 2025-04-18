// src/routes/api/projects.js
import { db } from "$lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
  try {
    const dataCollection = collection(db, "project-approve");
    const snapshot = await getDocs(dataCollection);

    const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      return {
        id: doc.id,
        project_name_th: docData?.project_name_th || '',
        project_name_en: docData?.project_name_en || '',
        status: docData?.status || '',
        members: Array.isArray(docData?.members) ? docData.members : [],
        Tasks: docData?.Tasks || {},
        term: docData?.term || '',
        adviser: Array.isArray(docData?.adviser) ? docData.adviser : [],
        directors: docData?.directors || {},
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

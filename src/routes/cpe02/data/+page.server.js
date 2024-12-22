// src/routes/cpe/data/+page.server.js
import { db } from "$lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function load() {
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
        adviser: Array.isArray(docData?.adviser) ? docData.adviser : []
      };
    });

    return {
      data,
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      data: [],
      error: 'Failed to fetch data'
    };
  }
}
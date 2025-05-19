// src/routes/api/teacher-data/+server.js
import { db } from "$lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore"; // Corrected import order
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
  try {
    const dataCollection = collection(db, "forms");
    let q = query(dataCollection);

    const isOpenParam = url.searchParams.get('isOpen');

    if (isOpenParam !== null) {
      const isOpen = isOpenParam === 'true';  // Convert to boolean
      q = query(dataCollection, where("isOpen", "==", isOpen));
    }

    const snapshot = await getDocs(q);

    const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      return {
        id: doc.id,
        isOpen: docData?.isOpen || false,
        term: docData?.term || '',
      };
    });
    //console.log('Data:', data); // Log the data for debugging
    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('Error processing GET request:', error);
    return json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// src/routes/api/teacher-data/+server.js
import { db } from "$lib/firebase";
import { collection, getDocs, query, where,orderBy } from "firebase/firestore"; // Corrected import order
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
  try {
    const dataCollection = collection(db, "forms");
    let q = query(dataCollection);

    const isOpenParam = url.searchParams.get('isOpen');
    const createdAt = url.searchParams.get('createdAt');

    if (isOpenParam !== null) {
      const isOpen = isOpenParam === 'true';  // Convert to boolean
      q = query(dataCollection, where("isOpen", "==", isOpen));
    }
    if (createdAt !== null) {
      q = query(dataCollection, orderBy("createdAt", createdAt));
    }


    const snapshot = await getDocs(q);

    const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      return {
        id: doc.id,
        isOpen: docData?.isOpen || false,
        term: docData?.term || '',
        createdAt: convertFirestoreTimestamp(docData?.createdAt),
        updatedAt: convertFirestoreTimestamp(docData?.updatedAt),
        projectLimit: docData?.projectLimit || 0,
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

function convertFirestoreTimestamp(timestamp) {
  if (!timestamp || !timestamp.seconds) return null;
  const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}`;

}

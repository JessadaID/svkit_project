// src/routes/api/teacher-data/+server.js
import { db } from "$lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore"; // Corrected import order

export async function GET() {
  try {
    const dataCollection = collection(db, "forms");    
     let q = query(dataCollection, where("isOpen", "==", true));

    // --- END MODIFIED LINE ---

    const snapshot = await getDocs(q);

    // Map the results
    const data = snapshot.docs.map(doc => {
    const docData = doc.data();

    //console.log('docData:', docData); // Log the docData for debugging
      return {
        id: doc.id,
        isOpen: docData?.isOpen || '',
        term: docData?.term || '',
      };
    });
    //console.log('Data:', data); // Log the data for debugging
    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error processing GET request:', error); // Updated error message context
    // Removed SyntaxError check as it's less relevant for GET requests without bodies
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

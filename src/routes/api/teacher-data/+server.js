// src/routes/api/teacher-data/+server.js
import { db } from "$lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore"; // Corrected import order

export async function GET({url}) {
  try {
    const approval = url.searchParams.get('approval'); // ดึง approval ถ้ามี
    //console.log('Approval:', approval); // Log the approval value for debugging
    let q;
    const dataCollection = collection(db, "users");    
    if (approval) {
      q = query(dataCollection, where("role", "in", ["teacher", "subject_teacher"]), where("Approval", "==", false));
    } else {
      q = query(dataCollection, where("role", "in", ["teacher", "subject_teacher"]));
    }

    // --- END MODIFIED LINE ---

    // Execute the query
    const snapshot = await getDocs(q);

    // Map the results
    const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      return {
        id: doc.id,
        email: docData?.email || '',
        role: docData?.role || '',
        name: docData?.name || '',
        Approval: docData?.Approval || false,
        // Add any other fields you might need from the user document
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

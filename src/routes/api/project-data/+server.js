// src/routes/api/project-data/+server.js
import { db } from "$lib/firebase";
// Import query and where from firestore
import { collection, getDocs, query, where } from "firebase/firestore";

// GET function remains the same (fetches all data)
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
      headers: { "Content-Type": "application/json" }, // Added headers for consistency
    });
  }
}

export async function POST({ request }){
  try {
    const body = await request.json();
    const termToFilter = body.term; // Assuming the client sends { "term": "some_value" }

    if (termToFilter === undefined || termToFilter === null) {
        return new Response(JSON.stringify({ error: 'Missing "term" field in request body' }), {
            status: 400, // Bad Request
            headers: { "Content-Type": "application/json" },
        });
    }

    const dataCollection = collection(db, "project-approve");
    const q = query(dataCollection, where("term", "==", termToFilter));

    // 5. Execute the query
    const snapshot = await getDocs(q);

    // 6. Map the results (same mapping logic as GET)
    const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      return {
        id: doc.id,
        project_name_th: docData?.project_name_th || '',
        project_name_en: docData?.project_name_en || '',
        status: docData?.status || '',
        members: Array.isArray(docData?.members) ? docData.members : [],
        Tasks: docData?.Tasks || {},
        term: docData?.term || '', // This will match termToFilter for all results
        adviser: Array.isArray(docData?.adviser) ? docData.adviser : [],
        directors: docData?.directors || {},
      };
    });

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error processing POST request:', error);
    if (error instanceof SyntaxError) {
        return new Response(JSON.stringify({ error: 'Invalid JSON format in request body' }), {
            status: 400, // Bad Request
            headers: { "Content-Type": "application/json" },
        });
    }
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

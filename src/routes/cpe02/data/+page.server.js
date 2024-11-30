// src/routes/cpe/data/+page.server.js
import { db } from "$lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function load() {
  const dataCollection = collection(db, "project-approve");
  const snapshot = await getDocs(dataCollection);

  const data = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  //console.log(data)
  return {
    data,
  };
}

// src/routes/api/project-data/+server.js
import {  json } from "@sveltejs/kit";
import { db } from "$lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

// ฟังก์ชันสำหรับ format ข้อมูลให้อยู่ในรูปแบบที่ต้องการ (ลดการทำซ้ำ)
function formatDocData(doc) {
  const docData = doc.data();
  return {
    id: doc.id,
    project_name_th: docData?.project_name_th || "",
    project_name_en: docData?.project_name_en || "",
    status: docData?.status || "",
    members: Array.isArray(docData?.members) ? docData.members : [],
    Tasks: docData?.Tasks || {},
    term: docData?.term || "",
    adviser: Array.isArray(docData?.adviser) ? docData.adviser : [],
    directors: docData?.directors || [],
  };
}

// GET: ดึงข้อมูลโปรเจคทั้งหมด
export async function GET({ url }) {
  try {
    // เพิ่มการกรองด้วย query parameters (เช่น ?term=2023)
    const term = url.searchParams.get("term");
    const status = url.searchParams.get("status");
    const email = url.searchParams.get("email");

    const projectCollection = collection(db, "project-approve");
    let projectQuery = projectCollection;

    // สร้าง query ตามเงื่อนไขที่ส่งมา
    if (term) {
      projectQuery = query(projectQuery, where("term", "==", term));
    }

    if (status) {
      projectQuery = query(projectQuery, where("status", "==", status));
    }
    if (email) {
      projectQuery = query(projectQuery, where("email", "==", email));
    }

    const snapshot = await getDocs(projectQuery);

    if (snapshot.empty) {
      return json({ data: [] }, { status: 200 });
    }

    const data = snapshot.docs.map(formatDocData);
    //console.log("data", data);

    return json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return json({ error: "Failed to fetch project data" }, { status: 500 });
  }
}

// POST: ดึงข้อมูลโปรเจคตามเงื่อนไขที่ส่งมาใน request body
export async function POST({ request }) {
  try {
    const body = await request.json();

    // ตรวจสอบว่ามีข้อมูลใน request body หรือไม่
    if (!body || Object.keys(body).length === 0) {
      return json(
        { error: "Request body is empty. Expected filter criteria." },
        { status: 400 }
      );
    }

    // สร้าง query object เริ่มต้น
    const projectCollection = collection(db, "project-approve");
    let projectQuery = projectCollection;

    // เพิ่มเงื่อนไขการค้นหาตามข้อมูลที่ส่งมา
    const validFilters = [
      "term",
      "status",
      "project_name_th",
      "project_name_en",
    ];
    let filtersApplied = false;

    validFilters.forEach((filter) => {
      if (
        body[filter] !== undefined &&
        body[filter] !== null &&
        body[filter] !== ""
      ) {
        projectQuery = query(projectQuery, where(filter, "==", body[filter]));
        filtersApplied = true;
      }
    });

    // ค้นหาข้อมูลตามเงื่อนไข
    const snapshot = await getDocs(projectQuery);

    if (snapshot.empty) {
      return json({ data: [] }, { status: 200 });
    }

    const data = snapshot.docs.map(formatDocData);

    return json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error processing POST request:", error);

    if (error instanceof SyntaxError) {
      return json(
        { error: "Invalid JSON format in request body" },
        { status: 400 }
      );
    }

    return json(
      { error: "Failed to process request", details: error.message },
      { status: 500 }
    );
  }
}

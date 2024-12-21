<script>
  import {
    collection,
    deleteDoc,
    updateDoc,
    getDocs,
    doc,
    orderBy,
    query,
     where,
    addDoc
  } from "firebase/firestore";
  import { db } from "$lib/firebase";
  import { onMount } from "svelte";

  // Variables
  let term = "";
  let projects = [];
  let selectedProject = null; // ตัวแปรสำหรับเก็บโปรเจกต์ที่ถูกเลือก
  let title = "";
  let description = "";
  let dueDate = "";
  let projectCount = 0;
  let isEditing = false;
  let isLoading = false;

  async function fetchProjects() {
  if (term) {
    const projectsRef = collection(db, "Task");

    // สร้าง query ที่กรองตาม term และเรียงตาม index
    const q = query(
      projectsRef,
      where("term", "==", term)     // เรียงตาม index
    );

    try {
      const querySnapshot = await getDocs(q);

      projects = [];
      querySnapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() });
      });

      projects.sort((a, b) => a.index - b.index);

      projectCount = projects.length; // นับจำนวนโปรเจกต์ทั้งหมด
    } catch (error) {
      console.error("Error fetching projects: ", error);
      alert("เกิดข้อผิดพลาดในการดึงข้อมูล");
    }
  }
}

  // ฟังก์ชันลบโปรเจกต์
  async function deleteProject(projectId) {
    const projectRef = doc(db, "Task", projectId); // สร้างการอ้างอิงไปยังเอกสารที่ต้องการลบ
    try {
      isLoading = true;
      await deleteDoc(projectRef); // ลบเอกสาร
      fetchProjects(); // รีเฟรชข้อมูลหลังจากลบ
      alert("ลบข้อมูลสำเร็จ");
    } catch (error) {
      console.error("Error deleting document: ", error);
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
    } finally {
      isLoading = false;
    }
  }
  async function saveProject() {
  isLoading = true;  // ตั้งค่าสถานะเป็นกำลังโหลด

  try {
    if (selectedProject) {
      // หากเลือกโปรเจกต์แล้วให้ทำการอัปเดต
      const projectRef = doc(db, 'Task', selectedProject.id);
      await updateDoc(projectRef, {
        title,
        description,
        dueDate,
      });
      alert("แก้ไขข้อมูลสำเร็จ");
    } else {
      // หากไม่ได้เลือกโปรเจกต์ ให้เพิ่มข้อมูลใหม่ (ใช้ auto ID)
      const projectsRef = collection(db, 'Task');
      const newProjectRef = await addDoc(projectsRef, {
        title,
        description,
        dueDate,
        index: projectCount ,
        term,
      });
      alert("เพิ่มข้อมูลสำเร็จ");
    }
  } catch (error) {
    console.error("Error saving project: ", error);
    alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
  } finally {
    // รีเฟรชข้อมูลและเคลียร์ฟอร์ม
    fetchProjects();
    resetForm();
    isLoading = false;  // ตั้งค่าสถานะโหลดเป็น false
  }
}
  // Load initial data (optional, if you want to load data on page load)
  onMount(() => {
    // Optionally, fetch projects for a default term
    term = "2/2567";
    fetchProjects();
  });

  // ฟังก์ชันเมื่อคลิกที่รายการ
  function editProject(project) {
    selectedProject = project; // เก็บโปรเจกต์ที่ถูกเลือก
    title = project.title;
    description = project.description;
    dueDate = project.dueDate;
    isEditing = true; // ตั้งค่าเป็นโหมดแก้ไข
  }

  function resetForm() {
    selectedProject = null; // เคลียร์โปรเจกต์ที่เลือก
    title = "";
    description = "";
    dueDate = "";
    isEditing = false; // รีเซ็ตเป็นโหมดเพิ่มงาน
  }
</script>

<div class="m-5">
  <a href="/" class="hover:underline">หน้าแรก</a> >
  <a href="/cpe02" class="hover:underline">แบบเสนอโครงงาน</a> >
  <a href="/cpe02/data" class="hover:underline">ข้อมูลแบบเสนอโครงงาน</a> >
  <b>เพิ่มหัวข้องาน</b>
</div><div class="p-5 bg-gray-50 rounded-lg shadow-lg">
  <!-- ส่วนเลือก Term -->
  <div class="mb-6">
    <label for="term-select" class="block text-lg font-semibold text-gray-700 mb-2">
      เลือก Term:
    </label>
    <select
      id="term-select"
      bind:value={term}
      on:change={fetchProjects}
      class="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-sky-300"
    >
      <option value="" disabled selected>เลือก Term</option>
      <option value="2/2567">2/2567</option>
      <option value="1/2568">1/2568</option>
      <option value="2/2568">2/2568</option>
    </select>
  </div>

  <!-- ส่วนหลัก -->
  <div class="flex flex-col lg:flex-row gap-6">
    <!-- ส่วนแสดงผลข้อมูล -->
    <div class="lg:w-4/12 p-3 bg-white rounded-lg shadow-md">
      <h2 class="text-lg font-bold mb-4 text-gray-700">รายการงาน</h2>
      {#if projects.length > 0}
        <ul class="space-y-4">
          {#each projects as project}
            <li 
              on:click={() => editProject(project)} 
              class="p-4 border rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <p class="font-semibold text-gray-800">หัวข้อ: {project.title}</p>
              <p class="text-gray-600">คำอธิบาย: {project.description}</p>
              <p class="text-gray-600">กำหนดส่ง: {project.dueDate}</p>
              <button
                on:click={() => deleteProject(project.id)}
                class="mt-3 bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-4 rounded"
                disabled={isLoading}
              >
                ลบ
              </button>
            </li>
          {/each}
        </ul>
      {:else if term}
        <p class="text-gray-500">ไม่พบข้อมูลใน Term นี้</p>
      {:else}
        <p class="text-gray-500">กรุณาเลือก Term</p>
      {/if}
    </div>

    <!-- ส่วนฟอร์ม -->
    <div class="lg:w-8/12 p-5 bg-white rounded-lg shadow-md">
      <h2 class="text-lg font-bold mb-4 text-gray-700">ฟอร์มจัดการข้อมูล</h2>
      <form on:submit|preventDefault={saveProject} class="space-y-4">
        <div class="flex justify-end">
          <button
            type="button"
            on:click={resetForm}
            class="bg-green-500 hover:bg-green-600 text-white text-sm py-1 px-4 rounded"
          >
            Reset
          </button>
        </div>
        <div>
          <label class="block font-medium text-gray-700">หัวข้อ:</label>
          <input 
            type="text" 
            bind:value={title} 
            placeholder="เช่น งานที่ 1" 
            class="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-sky-300"
          />
        </div>
        <div>
          <label class="block font-medium text-gray-700">คำอธิบาย:</label>
          <textarea
            bind:value={description}
            placeholder="กรอกคำอธิบาย เช่น ส่งถึงหัวข้อที่ 4"
            class="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-sky-300"
          ></textarea>
        </div>
        <div>
          <label class="block font-medium text-gray-700">กำหนดส่ง:</label>
          <input 
            type="date" 
            bind:value={dueDate} 
            class="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-sky-300"
          />
        </div>
        <div class="flex justify-end">
          <button 
            class="bg-sky-500 hover:bg-sky-600 text-white text-sm py-2 px-6 rounded"
            disabled={isLoading}
          >
            {isEditing ? "แก้ไขข้อมูล" : "เพิ่มงาน"}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>

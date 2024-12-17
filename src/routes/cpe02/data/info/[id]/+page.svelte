<script>
  export let data; // รับข้อมูลที่ส่งมาจากหน้าอื่น (data.id)
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
  } from "firebase/firestore";
  import { db } from "$lib/firebase.js";

  let isLoggedIn = false;
  let email = "";
  let project = null;
  let isNotFound = false;
  let role = "";
  let isLoading = true;
  let can_edit = false;
  let status = "";
  let Task = [];
  let comments = "";
  let visibleStates = [];

  if (typeof window !== "undefined") {
    email = localStorage.getItem("email");
    role = localStorage.getItem("role");
  }
  if (role == "advisor") {
    can_edit = true;
  }
  // ฟังก์ชันดึงข้อมูลจาก Firebase

  onMount(async () => {
    try {
      // --- ดึงข้อมูลจาก collection 'project-approve' ตาม ID ---
      const projectRef = doc(db, "project-approve", data.id);
      const projectSnap = await getDoc(projectRef);

      if (projectSnap.exists()) {
        project = projectSnap.data(); // เก็บข้อมูล project
      } else {
        console.error("ไม่พบข้อมูลใน project-approve");
      }

      // --- ดึงข้อมูลจาก collection 'Task' ที่มี term == '2/2567' ---
      const taskQuery = query(
        collection(db, "Task"), // ระบุ collection 'Task'
        where("term", "==", project.term) // เงื่อนไขกรองเฉพาะ term == '2/2567'
      );

      const querySnapshot = await getDocs(taskQuery); // ดึงข้อมูลที่ตรงเงื่อนไข
      Task = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })); // แปลงข้อมูลเป็น Array

      // ตั้งค่าให้ visibleStates มีค่าเริ่มต้นเป็น false ตามจำนวน Task
      visibleStates = Task.map(() => false);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
    } finally {
      isLoading = false; // หยุดสถานะการโหลด
    }
  });

  /*
  async function saveData() {
    try {
      isLoading = true;
      const docRef = doc(db, "project-approve", data.id);
      status = "improvement";
      const updatedData = {
        comments,
        status,
      };

      await updateDoc(docRef, updatedData);
      alert("บันทึกข้อมูลสำเร็จ!");
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล:", error);
      alert("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      isLoading = false;
    }
  }*/

  // ใช้ onMount เพื่อนำข้อมูลจาก localStorage
  onMount(() => {
    isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (typeof window !== "undefined") {
      // เช็คว่าโค้ดทำงานในฝั่งไคลเอนต์
      const storedData = localStorage.getItem("selectedProject");
      if (storedData) {
        try {
          project = JSON.parse(storedData); // แปลงข้อมูลจาก string กลับเป็น object

          // ตรวจสอบว่า project.id ตรงกับ data.id หรือไม่
          if (project.id !== data.id) {
            isNotFound = true; // ถ้าไม่ตรงตั้งค่าสถานะเป็น 404
          }
        } catch (error) {
          console.error("Error parsing stored data:", error);
        }
      } else {
        console.log("No data found in localStorage.");
      }
    }
  });

  function goToEditPage() {
    // ส่งข้อมูลไปยังหน้า edit (สามารถใช้ store หรือ localStorage ได้)
    localStorage.setItem("editProject", JSON.stringify(project));
    goto(`/cpe02/data/edit/${project.id}`); // นำทางไปหน้า /edit
    //console.log(project.id)
  }

  async function deleteProject(id) {
    //console.log(id)
    if (confirm("คุณต้องการลบข้อมูลนี้หรือไม่?")) {
      isLoading = true;

      try {
        // อ้างอิงถึงเอกสารที่ต้องการลบ
        const docRef = doc(db, "project-approve", id);

        // ลบเอกสาร
        await deleteDoc(docRef);

        alert("ลบข้อมูลเรียบร้อยแล้ว!");
        goto(`/cpe02/data`);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการลบ:", error);
        alert("ไม่สามารถลบข้อมูลได้");
      } finally {
        isLoading = false;
      }
    }
  }

  // ฟังก์ชัน toggle
  function toggleTask(index) {
    visibleStates[index] = !visibleStates[index];
  }
  function isOverdue(dueDate) {
    const today = new Date(); // วันที่ปัจจุบัน
    //console.log(today);
    const due = new Date(dueDate); // วันที่กำหนดส่ง
    return today > due; // คืนค่า true ถ้าเลยกำหนด
  }
</script>

{#if isNotFound}
  <h1>404 - Project Not Found</h1>
{:else if project}
  <div class="m-5">
    <a href="/" class="hover:underline">หน้าแรก</a> >
    <a href="/cpe02" class="hover:underline">แบบเสนอโครงงาน</a>
    > <a href="/cpe02/data" class="hover:underline">ข้อมูลแบบเสนอโครงงาน</a> >
    <b>{project.project_name_th}</b>
  </div>

  <div class="md:flex">
    <div
      class="md:m-5 p-3 md:bg-gray-200 rounded md:shadow-lg relative md:w-8/12"
    >
      <!-- ตรวจสอบว่า projectData มีข้อมูล -->
      <b>1. ชื่อเสนอโครงงาน </b>
      <h1>&emsp;&emsp;{project.project_name_th} &emsp; (ไทย)</h1>
      <h1>&emsp;&emsp;{project.project_name_en} &emsp; (อังกฤษ)</h1>
      <b>2. ชื่อผู้เสนอโครงงาน </b>
      {#each project.members as member}
        <h1>&emsp;&emsp;{member}</h1>
      {/each}
      <b>3. อาจารย์ที่ปรึกษาโครงงาน </b>
      {#each project.adviser as advisor}
        <h1>&emsp;&emsp;{advisor}</h1>
      {/each}
      {#if project.External_consultant != ""}
        <h1>&emsp;&emsp;{project.External_consultant} (ที่ปรึกษาภายนอก)</h1>
      {/if}
      <b>4. ที่มาและปัญหา </b>
      <p style="white-space: pre-wrap;">{project.project_problem}</p>
      {#if (role === "admin" || email === project.email) && email != null}
        <div class="flex justify-around mt-5">
          <button
            class="md:absolute top-2 right-2 bg-amber-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
            on:click={goToEditPage}
          >
            แก้ไขข้อมูล
          </button>
          <button
            class="md:absolute top-14 right-2 bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
            on:click={() => deleteProject(project.id)}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "ลบข้อมูล"}
          </button>
        </div>
      {/if}
    </div>

    <div
      class="md:m-5 p-3 md:bg-gray-200 rounded md:shadow-lg md:w-4/12 bg-gray-200"
    >
      <b class="m-2">ความคืบหน้า เทอม : {project.term}</b>
      <!-- UI -->
      <div>
        {#if isLoading != true}
          {#if Task.length > 0}
            {#each Task as task, index}
              <div class="bg-slate-400 relative p-4 mb-4 rounded-md">
                <h1><b>{task.title}</b></h1>
                <p>{task.description}</p>

                <!-- แสดงข้อความหากเกินกำหนด -->
                {#if isOverdue(task.dueDate)}
                  <p class="text-red-600 font-bold mt-2">เกินกำหนดส่งแล้ว!</p>
                {/if}

                <!-- ปุ่ม toggle -->
                <button
                  type="button"
                  class="absolute top-0 right-0 bg-white p-2 m-2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                  on:click={() => toggleTask(index)}
                  aria-label="Toggle task visibility"
                >
                  {visibleStates[index] ? "▲" : "▼"}
                </button>

                <!-- เนื้อหาที่ toggle ได้ -->
                {#if visibleStates[index]}
                  <div class="mt-5 bg-gray-100 p-4 rounded-md">
                    <b>ความคิดเห็นของอาจารย์</b>
                    <textarea class="w-full p-2" rows="5" readonly={!can_edit}
                      >{task.comments}</textarea
                    >

                    {#if role == "advisor"}
                      <button class="bg-red-500 w-full mt-5 p-2 text-white">
                        ยืนยัน
                      </button>
                    {/if}
                  </div>
                {/if}
              </div>
            {/each}
          {:else}
            <!-- แสดงข้อความเมื่อไม่มีข้อมูลใน Task -->
            <div class="text-center bg-gray-200 p-5 rounded-md">
              <h1 class="text-lg font-bold text-red-500">ไม่พบข้อมูล</h1>
              <p>ไม่มีข้อมูลที่จะแสดงในขณะนี้</p>
            </div>
          {/if}
        {:else}
          <div class="text-center bg-gray-200 p-5 rounded-md">
            <p>Loading...</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
{:else}
  <p>กำลังโหลดข้อมูล...</p>
{/if}

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
    deleteDoc,
    updateDoc,
  } from "firebase/firestore";
  import { db } from "$lib/firebase.js";
  import { checkLoginStatus } from "../../../../../auth";
  import { getCookie } from "cookies-next";

  let email = "";
  let project = null;
  let isNotFound = false;
  let role = "";
  let isLoading = true;
  let isLoadingtext = false;
  let can_edit = false;
  let status = [""];
  let Task = [];
  let visibleStates = [];
  let comment = [""];

  onMount(async () => {
    const isUserLoggedIn = await checkLoginStatus(); // รอผลลัพธ์จาก checkLoginStatus

    if (isUserLoggedIn) {
      email = getCookie("email"); // หรือใช้ cookies ถ้าต้องการ
      role = getCookie("role");
      if (role == "advisor") {
        can_edit = true;
      }
      //console.log('User is logged in, Email:', email);
    } else {
      console.log("User not logged in. Redirecting to login...");
      // ถ้าไม่ได้ล็อกอิน เปลี่ยนเส้นทางไปหน้า Login
      goto("/login");
    }
  });

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

      Object.entries(project.Tasks).forEach(([key, task]) => {
        //console.log(`Task ${key}: ${task.comment}`);
        comment[key] = task.comment
        status[key] = task.status
      });

      // --- ดึงข้อมูลจาก collection 'Task' ที่มี term == '2/2567' ---
      const taskQuery = query(
        collection(db, "Task"), // ระบุ collection 'Task'
        where("term", "==", project.term)
      );

      const querySnapshot = await getDocs(taskQuery);
      Task = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.index - b.index); // แปลงข้อมูลเป็น Array

      // ตั้งค่าให้ visibleStates มีค่าเริ่มต้นเป็น false ตามจำนวน Task
      visibleStates = Task.map(() => false);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
    } finally {
      isLoading = false; // หยุดสถานะการโหลด
    }

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
    localStorage.getItem("selectedProject", JSON.stringify(project));
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

  function updateStatus(event, index) {
    status[index] = event.target.value; // อัปเดตค่าใน status ตามที่เลือก
    //console.log(`Task ${index + 1}: ${status[index]}`); // แสดงค่าที่เลือกใน status
  }

  async function addTask(index, comment, status) {
    const projectDocRef = doc(db, "project-approve", data.id);

    // สร้าง Task ใหม่จาก index
    const taskKey = `Tasks.${index}`;
    const newTask = {
      comment: comment[index], // ดึงค่า comment ตาม index
      status: status[index], // ดึงค่า status ตาม index
    };

    try {
      isLoadingtext = true;
      await updateDoc(projectDocRef, {
        [taskKey]: newTask, // ใช้ dot notation ในการอัปเดต
      });
      alert("ดำเนินการเรียบร้อยแล้ว!");
      //console.log("Task added successfully!");
    } catch (error) {
      console.error("Error adding task: ", error);
    } finally {
      isLoadingtext = false;
    }
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
        <!-- ส่วน UI ที่คุณมีอยู่แล้ว แต่เพิ่ม event handlers -->
        {#if isLoading != true}
          {#if Task.length > 0}
            {#each Task as task, index}
              <div class="bg-slate-400 relative p-4 mb-4 rounded-md">
                <h1><b>{task.title}</b></h1>
                <p>{task.description}</p>

                {#if isOverdue(task.dueDate)}
                  <p class="text-red-600 font-bold mt-2">เกินกำหนดส่งแล้ว!</p>
                {/if}

                <button
                  type="button"
                  class="absolute top-0 right-0 bg-white p-2 m-2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                  on:click={() => toggleTask(index)}
                >
                  {visibleStates[index] ? "▲" : "▼"}
                </button>

                {#if visibleStates[index]}
                  <div class="mt-5 bg-gray-100 p-4 rounded-md">
                    <b>ความคิดเห็นของอาจารย์</b>
                    <textarea
                      class="w-full p-2"
                      rows="5"
                      readonly={!can_edit}
                      bind:value={comment[index]}
                    />
                    {#if role === "advisor"}
                      <input
                        type="radio"
                        id="improvement-{index}"
                        name="status-{index}"
                        value="improvement"
                        checked={status[index] === "improvement"}
                        on:change={(event) => updateStatus(event, index)}
                      />
                      <label for="improvement-{index}">แก้ไข</label><br />

                      <input
                        type="radio"
                        id="approve-{index}"
                        name="status-{index}"
                        value="approve"
                        checked={status[index] === "approve"}
                        on:change={(event) => updateStatus(event, index)}
                      />
                      <label for="approve-{index}">ผ่าน</label><br />
                      <button
                        class="bg-red-500 w-full mt-5 p-2 text-white"
                        on:click={() => {
                          //console.log(index, comment[index], status[index]);
                          addTask(index, comment, status);
                        }}
                        disabled={isLoadingtext}
                      >
                        {isLoadingtext ? "Loading..." : "ยืนยัน"}
                      </button>
                    {/if}
                  </div>
                {/if}
              </div>
            {/each}
          {:else}
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

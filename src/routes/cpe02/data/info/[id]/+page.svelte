<script>
  export let data; // รับข้อมูลที่ส่งมาจากหน้าอื่น (data.id)
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { doc, deleteDoc } from "firebase/firestore";
  import { db } from "$lib/firebase.js";

  let isLoggedIn = false;
  let email = "";
  let project = null;
  let isNotFound = false;
  let role = "";
  let isLoading = false;

  // ตรวจสอบค่าใน localStorage เมื่อ component โหลด
  onMount(() => {
    isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  });

  if (typeof window !== "undefined") {
    email = localStorage.getItem("email");
    role = localStorage.getItem("role");
  }

  // ใช้ onMount เพื่อนำข้อมูลจาก localStorage
  onMount(() => {
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
</script>

{#if isNotFound}
  <h1>404 - Project Not Found</h1>
{:else}

{#if project}
<div class="m-5"><a href="/" class="hover:underline">หน้าแรก</a> > <a href="/cpe02" class="hover:underline">แบบเสนอโครงงาน</a> > <a href="/cpe02/data" class="hover:underline">ข้อมูลแบบเสนอโครงงาน</a>  > <b>{project.project_name_th}</b></div>

  <div class="md:m-5 p-3 md:bg-gray-200 rounded md:shadow-lg relative">
    
    
      <!-- ตรวจสอบว่า projectData มีข้อมูล -->
      <div>
        <b>ชื่อเสนอโครงงาน </b>
        <h1>&emsp;&emsp;{project.project_name_th} &emsp; (ไทย)</h1>
        <h1>&emsp;&emsp;{project.project_name_en} &emsp; (อังกฤษ)</h1>
        <b>ชื่อผู้เสนอโครงงาน </b>
        {#each project.members as member}
          <h1>&emsp;&emsp;{member}</h1>
        {/each}
        <b>อาจารย์ที่ปรึกษาโครงงาน </b>
        {#each project.adviser as advisor}
          <h1>&emsp;&emsp;{advisor}</h1>
        {/each}
        <b>ที่มาและปัญหา </b>
        <p style="white-space: pre-wrap;">{project.project_problem}</p>
        {#if (role === "admin" || email === project.email) && email != null}
          <button
            class="absolute top-2 right-2 bg-amber-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
            on:click={goToEditPage}
          >
            แก้ไขข้อมูล
          </button>
          <button
            class="absolute top-14 right-2 bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
            on:click={() => deleteProject(project.id)}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "ลบข้อมูล"}
          </button>
        {/if}
      </div>
  </div>

    {:else}
      <p>กำลังโหลดข้อมูล...</p>
    {/if}
{/if}

<!-- แสดงฟอร์มถ้า isLoggedIn เป็น true 
{#if isLoggedIn}
  <form class="border m-5 bg-red-500 p-5">
    <p class="mb-5"><b>Comment อาจารย์</b></p>
    <div class="flex">
      <textarea id="message" name="message" class="w-8/12" rows="4" cols="50"
      ></textarea>

      <div class=" m-5 ">
        <input type="radio" id="improvement" name="status" value="improvement" />
        <label for="improvement">แก้ไขเอกสาร</label><br />
        <input type="radio" id="approve" name="status" value="approve" />
        <label for="approve">อนุมัติ</label><br />
   
        <button type="submit" class="p-3 mt-5 bg-white w-48 hover:bg-gray-200">Submit</button>
      </div>
    </div>
  </form>
{/if}
-->

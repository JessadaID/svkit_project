<script>
  export let data; // รับข้อมูลที่ส่งมาจากหน้าอื่น (data.id)
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { doc, deleteDoc , getDoc , updateDoc } from "firebase/firestore";
  import { db } from "$lib/firebase.js";

  let isLoggedIn = false;
  let email = "";
  let project = null;
  let isNotFound = false;
  let role = "";
  let isLoading = true;
  let can_edit = false;
  let topics = {
    topic1: false,
    topic2: false,
    topic3: false,
    topic4: false,
    topic5: false,
    topic6: false,
    topic7: false,
    topic8: false,
    topic9: false,
    topic10: false,
    topic11: false,
    topic12: false,
    topic13: false,
  };
  let comments = "";

  if (typeof window !== "undefined") {
    email = localStorage.getItem("email");
    role = localStorage.getItem("role");
  }
  if(role == "advisor"){
    can_edit = true;
  }

  onMount(async () => {
    try {
      const docRef = doc(db, "project-approve", data.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        topics = data.topics || topics; // อัปเดต `topics` จาก Firebase
        comments = data.comments || ""; // อัปเดต `comments` จาก Firebase
      } else {
        console.error("ไม่มีข้อมูลใน Firebase");
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
    } finally {
      isLoading = false; // ยุติการโหลดเมื่อดึงข้อมูลเสร็จ
    }
  });

  async function saveData() {
    try {
      isLoading = true;
      const docRef = doc(db, "project-approve", data.id);

      const updatedData = {
        topics,
        comments,
      };

      await updateDoc(docRef, updatedData);
      alert("บันทึกข้อมูลสำเร็จ!");
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล:", error);
      alert("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
        isLoading = false;
      }
  }

  
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

    <div class="md:m-5 p-3 md:bg-gray-200 rounded md:shadow-lg md:w-4/12 bg-gray-200">
      <b>ความคืบหน้า</b>
      <div class="grid grid-cols-2">
        <div>
          <input type="checkbox" id="topic1" bind:checked={topics.topic1} disabled={!can_edit} />
          <label for="topic1"> หัวข้อที่ 1</label><br />
          <input type="checkbox" id="topic2" bind:checked={topics.topic2} disabled={!can_edit} />
          <label for="topic2"> หัวข้อที่ 2</label><br />
          <input type="checkbox" id="topic3" bind:checked={topics.topic3} disabled={!can_edit} />
          <label for="topic3"> หัวข้อที่ 3</label><br />
          <input type="checkbox" id="topic4" bind:checked={topics.topic4} disabled={!can_edit} />
          <label for="topic4"> หัวข้อที่ 4</label><br />
          <input type="checkbox" id="topic5" bind:checked={topics.topic5} disabled={!can_edit} />
          <label for="topic5"> หัวข้อที่ 5</label><br />
          <input type="checkbox" id="topic6" bind:checked={topics.topic6} disabled={!can_edit} />
          <label for="topic6"> หัวข้อที่ 6</label><br />
          <input type="checkbox" id="topic7" bind:checked={topics.topic7} disabled={!can_edit} />
          <label for="topic7"> หัวข้อที่ 7</label><br />
        </div>
        <div>
          <input type="checkbox" id="topic8" bind:checked={topics.topic8} disabled={!can_edit} />
          <label for="topic8"> หัวข้อที่ 8</label><br />
          <input type="checkbox" id="topic9" bind:checked={topics.topic9} disabled={!can_edit} />
          <label for="topic9"> หัวข้อที่ 9</label><br />
          <input type="checkbox" id="topic10" bind:checked={topics.topic10} disabled={!can_edit} />
          <label for="topic10"> หัวข้อที่ 10</label><br />
          <input type="checkbox" id="topic11" bind:checked={topics.topic11} disabled={!can_edit} />
          <label for="topic11"> หัวข้อที่ 11</label><br />
          <input type="checkbox" id="topic12" bind:checked={topics.topic12} disabled={!can_edit} />
          <label for="topic12"> หัวข้อที่ 12</label><br />
          <input type="checkbox" id="topic13" bind:checked={topics.topic13} disabled={!can_edit} />
          <label for="topic13"> หัวข้อที่ 13</label><br />
        </div>
      </div>
      <div class="mt-5">
        <b>ความคิดเห็นของอาจารย์</b>
        <textarea
          bind:value={comments}
          class="w-full"
          rows="5"
          readonly={!can_edit}
        ></textarea>
        {#if role === "advisor"}
          <button class="bg-red-500 w-full mt-5 p-2" on:click={saveData} disabled={isLoading}>
            {isLoading ? "Loading..." : "ยืนยัน"}
          </button>
        {/if}
      </div>
    </div>
  </div>
{:else}
  <p>กำลังโหลดข้อมูล...</p>
{/if}
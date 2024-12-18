<script>
  // @ts-ignore
  export let data;

  import { onMount } from "svelte";
  import { doc, setDoc } from "firebase/firestore"; // ใช้ setDoc หรือ updateDoc
  import { db } from "$lib/firebase.js";
  import { checkLoginStatus } from "../../../../../auth";
  import { getCookie } from "cookies-next";
  import { goto } from "$app/navigation";
  // @ts-ignore
  let project = null;
  let isNotFound = false;
  let isLoading = false;
  let email = "";
  let role = "";
  // @ts-ignore
  let members = [""]; // ตัวแปรสำหรับเก็บสมาชิกที่เพิ่มเข้ามา

  onMount(async () => {
    const isUserLoggedIn = await checkLoginStatus(); // รอผลลัพธ์จาก checkLoginStatus

    if (isUserLoggedIn) {
      email = getCookie("email"); // หรือใช้ cookies ถ้าต้องการ
      role = getCookie("role");
      //console.log('User is logged in, Email:', email);
      //console.log('User is logged in, Email:', role);
    } else {
      console.log("User not logged in. Redirecting to login...");
      // ถ้าไม่ได้ล็อกอิน เปลี่ยนเส้นทางไปหน้า Login
      goto("/login");
    }

    // ดึงข้อมูลจาก cookies
    const storedData = localStorage.getItem("selectedProject"); // ดึงข้อมูลจาก cookies
    if (storedData) {
      try {
        project = JSON.parse(storedData); // แปลงข้อมูลจาก string กลับเป็น object

        // ตรวจสอบว่า project.id ตรงกับ data.id หรือไม่
        if (project.id !== data.id) {
          isNotFound = true; // ถ้าไม่ตรงตั้งค่าสถานะเป็น 404
          console.log("Project ID mismatch. Marking as not found.");
        }
      } catch (error) {
        console.error("Error parsing stored data from cookies:", error);
      }
    } else {
      console.log("No data found in cookies.");
    }
    if(role != "admin"){
      if (email !== project.email || email == null) {
      goto("../../hacker_exe");
    }
    }
    

    // ตรวจสอบค่า email และ role
    //console.log("project email from cookies:", project.email);
    //console.log("Email from cookies:", email);
    //console.log("Role from cookies:", role);
  });

  function addMemberRow() {
    // @ts-ignore
    project.members = [...project.members, ""]; // เพิ่มสมาชิกใหม่ใน array
  }

  // ฟังก์ชันในการลบแถวล่างสุด
  function deleteLastMember() {
    // @ts-ignore
    if (project.members.length > 1) {
      // @ts-ignore
      project.members = project.members.slice(0, -1); // ลบสมาชิกแถวสุดท้าย
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    isLoading = true;

    try {
      // อัปเดตข้อมูลใน Firestore
      const docRef = doc(db, "project-approve", project.id); // ระบุ collection และ document ID
      await setDoc(docRef, project);

      alert("แก้ไขข้อมูลเรียบร้อยแล้ว!");
    } catch (error) {
      console.error("Error updating document: ", error);
      alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
    } finally {
      isLoading = false; // โหลดเสร็จแล้ว
    }

    // เก็บข้อมูล project ใน cookies
    localStorage.setItem("selectedProject", JSON.stringify(project));
  }

  function handleTab(event) {
    if (event.key === "Tab") {
      event.preventDefault();
      const textarea = event.target;
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;

      // เพิ่ม Tab ที่ตำแหน่งที่กำลังพิมพ์
      textarea.value =
        textarea.value.substring(0, start) +
        "\t" +
        textarea.value.substring(end);

      // ปรับตำแหน่ง cursor
      textarea.selectionStart = textarea.selectionEnd = start + 1;

      // อัปเดตค่าที่ bind
      project.project_problem = textarea.value;
    }
  }
</script>

<div>
  
  {#if isNotFound}
    <h1>404 - Project Not Found</h1>
  {:else if project}
  <div class="m-5">
    <a href="/" class="hover:underline">หน้าแรก</a> >
    <a href="/cpe02" class="hover:underline">แบบเสนอโครงงาน</a>
    > <a href="/cpe02/data" class="hover:underline">ข้อมูลแบบเสนอโครงงาน</a> >
    <b>{project.project_name_th} (Edit)</b>
  </div>
    <!-- ตรวจสอบว่า projectData มีข้อมูล -->

    <div class="md:m-5 md:p-5 flex justify-center items-center">
      <form
        class="shadow-lg p-5 md:rounded-lg md:w-8/12 bg-gray-200"
        on:submit={handleSubmit}
      >
        <h1 class="text-lg font-bold">แก้ไขข้อมูล</h1>

        <div class="p-5">
          <!--===============================================-->

          <label for="name" class="block text-lg font-medium">ภาคเรียน</label>
          <select
            id="dropdown"
            name="term"
            class="p-2 w-4/12"
            required
            bind:value={project.term}
          >
            <option value="2/2567" selected>2/2567</option>
            <option value="1/2568">1/2568</option>
            <option value="2/2568">2/2568</option>
          </select>

          <!--===============================================-->

          <label for="text" class="block text-lg font-medium mt-3"
            >ชื่อโครงงาน (ภาษาไทย)</label
          >
          <input
            type="text"
            placeholder="ชื่อโครงงาน"
            name="project_name"
            required
            class="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            bind:value={project.project_name_th}
          />

          <!--===============================================-->

          <label for="text" class="block text-lg font-medium mt-3"
            >ชื่อโครงงาน (ภาษาอังกฤษ)</label
          >
          <input
            type="text"
            placeholder="Name Project"
            required
            class="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            bind:value={project.project_name_en}
          />

          <!--===============================================-->
          <label for="text" class="block text-lg font-medium mt-3"
            >ชื่อผู้เสนอโครงงาน
          </label>
          <button
            type="button"
            class="bg-white p-1 m-2 rounded"
            on:click={addMemberRow}>เพิ่มสมาชิก</button
          >
          <button
            type="button"
            on:click={deleteLastMember}
            class="bg-red-500 text-white p-1 m-2 rounded"
          >
            ลบสมาชิก
          </button>
          <div class="input-row grid md:grid-cols-2 gap-4">
            {#each project.members as member, index}
              <input
                type="text"
                bind:value={project.members[index]}
                placeholder="Member Name"
                required
                class="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 m-1"
              />
            {/each}
          </div>

          <!--===============================================-->

          <label for="email" class="block text-lg font-medium mt-3"
            >อาจารย์ที่ปรึกษาโครงงาน
          </label>
          <select
            id="dropdown"
            name="adviser"
            class="p-2 w-full"
            multiple
            required
            size="4"
            bind:value={project.adviser}
          >
            <option value="ผู้ช่วยศาสตราจารย์ อนันท์ ทับเกิด"
              >ผู้ช่วยศาสตราจารย์ อนันท์ ทับเกิด</option
            >
            <option value="นายกิตตินันท์ น้อยมณี">นายกิตตินันท์ น้อยมณี</option>
            <option value="ผู้ช่วยศาสตราจารย์ ขวัญชัย เอื้อวิริยานุกูล"
              >ผู้ช่วยศาสตราจารย์ ขวัญชัย เอื้อวิริยานุกูล</option
            >
            <option value="นายจักรภพ ใหม่เสน">นายจักรภพ ใหม่เสน</option>
            <option value="5นายณัฐชาสิทธิ์ ชูเกียรติขจร"
              >นายณัฐชาสิทธิ์ ชูเกียรติขจร</option
            >
            <option value="นายปณต พุกกะพันธุ์">นายปณต พุกกะพันธุ์</option>
            <option value="นายปิยพล ยืนยงสถาวร">นายปิยพล ยืนยงสถาวร</option>
            <option value="นายพิชิต ทนันชัย">นายพิชิต ทนันชัย</option>
            <option value="นางสาวยุพดี หัตถสิน">นางสาวยุพดี หัตถสิน</option>
            <option value="นายสมนึก สุระธง">นายสมนึก สุระธง</option>
            <option value="นายภาณุเดช ทิพย์อักษร">นายภาณุเดช ทิพย์อักษร</option>
            <option value="นายอนุพงศ์ ไพโรจน์">นายอนุพงศ์ ไพโรจน์</option>
            <option value="นายอรรถพล วิเวก">นายอรรถพล วิเวก</option>
          </select>
          <!--===============================================-->

          <label for="email" class="block text-lg font-medium mt-3"
            >ที่ปรึกษาภายนอก (ถ้ามี)
          </label>
          <input
            type="text"
            placeholder="ไม่บังคับ"
            class="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            bind:value={project.External_consultant}
          />

          <label for="text" class="block text-lg font-medium mt-3"
            >ที่มาและความสำคัญของปัญหา
          </label>

          <textarea
            id="editor"
            name="w3review"
            rows="10"
            cols="50"
            class="w-full p-2"
            bind:value={project.project_problem}
            on:keydown={handleTab}
            placeholder="เขียนที่มาและความสำคัญของปัญหา..."
          ></textarea>
        </div>
        <!--===============================================-->

        <div class="p-5 text-center">
          <button
            type="submit"
            class="rounded bg-amber-500 hover:bg-amber-700 text-white px-6 py-2 shadow-md w-full"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "แก้ไขข้อมูล"}
          </button>
        </div>

        <!--===============================================-->
      </form>
    </div>
  {:else}
    <p>กำลังโหลดข้อมูล...</p>
  {/if}
</div>

<script>
  // @ts-nocheck
  export let data;

  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { getCookie } from "cookies-next";
  import { checkLoginStatus } from "../../../auth";
  
  let searchQuery = ""; // ตัวแปรสำหรับเก็บค่าการค้นหา
  let project_status = "all"; // สถานะโปรเจค
  let role = "";
  let email = "";

  onMount(async () => {
        const isUserLoggedIn = await checkLoginStatus(); // รอผลลัพธ์จาก checkLoginStatus

        if (isUserLoggedIn) {
            email = getCookie("email")  // หรือใช้ cookies ถ้าต้องการ
            role = getCookie("role");
            //console.log('User is logged in, Email:', email);
        } else {
            console.log('User not logged in. Redirecting to login...');
            // ถ้าไม่ได้ล็อกอิน เปลี่ยนเส้นทางไปหน้า Login
            goto("/login");
        }
    });



  function setdata(event, item) {
    event.preventDefault(); // ป้องกันการเปลี่ยนเส้นทาง URL โดยอัตโนมัติ
    // เก็บข้อมูลที่เลือกใน localStorage
    localStorage.setItem("selectedProject", JSON.stringify(item));

    // ถ้าต้องการดูผลใน console
    //console.log("เก็บข้อมูลใน localStorage:", item);
    goto(`/cpe02/data/info/${item.id}`);
  }

  // ฟังก์ชันสำหรับกรองข้อมูล
  function filterData() {
    return data.data.filter((item) => {
      // ตรวจสอบคำค้นหา
      const matchesSearchQuery =
        item.project_name_th.includes(searchQuery) ||
        item.project_name_en.includes(searchQuery);

      // ตรวจสอบสถานะ
      const matchesStatus =
        project_status === "all" || item.status === project_status;

      return matchesSearchQuery && matchesStatus;
    });
  }
</script>

<div class="m-5">
  <a href="/" class="hover:underline">หน้าแรก</a> >
  <a href="/cpe02" class="hover:underline">แบบเสนอโครงงาน</a>
  > <b>ข้อมูลแบบเสนอโครงงาน</b>
</div>


<nav class="m-5">
  <p>ค้นหาข้อมูล</p>
  <!-- Input การค้นหา -->
  <input
    type="text"
    bind:value={searchQuery}
    placeholder="ค้นหาโปรเจคตามชื่อ..."
    class="w-full p-2 border border-gray-300 rounded mb-4"
  />

  <!-- เลือกสถานะ -->
  <div class="flex justify-between">
    <div class="p-2">
      {#if role == "advisor"}
        <a
          href="/cpe02/data/AddTask"
          class="bg-sky-600 text-white py-2 px-3  shadow hover:bg-sky-700 transition"
          >เพิ่มหัวข้องาน</a
        >
      {/if}
    </div>

    <div class="flex justify-end mb-4">
      <p class="p-2 font-bold">สถานะ : &nbsp;</p>
      <select
        bind:value={project_status}
        class="p-2 border border-gray-300 rounded"
      >
        <option value="all">แสดงทั้งหมด</option>
        <option value="wait">รออนุมัติ</option>
        <option value="improvement">แก้ไข</option>
        <option value="approve">อนุมัติ</option>
      </select>
    </div>
  </div>
</nav>

<div
  class="relative flex flex-col w-full h-full overflow-scroll text-gray-700 bg-white shadow-md rounded-lg bg-clip-border p-5"
>
  <table class="w-full text-left table-auto min-w-max">
    <thead>
      <tr>
        <th class="p-4 border-b border-slate-300 bg-slate-300">
          <p
            class="block text-md font-normal leading-none text-slate-800 text-center"
          >
            ลำดับที่
          </p>
        </th>
        <th class="p-4 border-b border-slate-300 bg-slate-300">
          <p class="block text-md font-normal leading-none text-slate-800">
            ชื่อโครงงาน
          </p>
        </th>
        <th class="p-4 border-b border-slate-300 bg-slate-300">
          <p class="block text-md font-normal leading-none text-slate-800">
            ชื่อผู้เสนอโครงงาน
          </p>
        </th>
        <th class="p-4 border-b border-slate-300 bg-slate-300">
          <p class="block text-md font-normal leading-none text-slate-800">
            อาจารย์ที่ปรึกษา
          </p>
        </th><th class="p-4 border-b border-slate-300 bg-slate-300">
          <p class="block text-md font-normal leading-none text-slate-800">
            ความคืบหน้า
          </p>
        </th><th class="p-4 border-b border-slate-300 bg-slate-300">
          <p class="block text-md font-normal leading-none text-slate-800">
            สถานะ
          </p>
        </th><th class="p-4 border-b border-slate-300 bg-slate-300">
          <p class="block text-md font-normal leading-none text-slate-800">
            เพิ่มเติม
          </p>
        </th>
      </tr>
    </thead>
    <tbody>
      {#each filterData() as item, index}
        <tr class="hover:bg-slate-200">
          <td class="p-4 border-b border-slate-200">
            <p class="block text-sm text-slate-800 text-center">
              {index + 1}
            </p>
          </td>
          <td class="p-4 border-b border-slate-200">
            <p class="block text-sm text-slate-800">
              {item.project_name_th}
            </p>
          </td>
          <td class="p-4 border-b border-slate-200">
            <p class="block text-sm text-slate-800">
              {item.members[0]}
            </p>
          </td>
          <td class="p-4 border-b border-slate-200">
            <p class="block text-sm text-slate-800">
              {item.adviser[0]}
            </p>
          </td><td class="p-4 border-b border-slate-200">
            <p class="block text-sm text-slate-800">Task 1</p>
          </td><td class="p-4 border-b border-slate-200">
            {#if item.status == "wait"}
              <p class="text-blue-500 font-bold flex items-center text-sm">
                รอการอนุมัติ
              </p>
            {:else if item.status == "improvement"}
              <p class="text-yellow-500 font-bold flex items-center text-sm">
                แก้ไขเอกสาร
              </p>
            {:else if item.status == "approve"}
              <p class="text-green-500 font-bold flex items-center text-sm">
                อนุมัติแล้ว
              </p>
            {/if}
          </td><td class="p-4 border-b border-slate-200">
            <p class="block text-sm text-slate-800">
              <a
                href="#"
                on:click={(event) => setdata(event, item)}
                class="bg-green-500 text-white py-1 px-3 rounded-md shadow hover:bg-green-600 transition"
              >
                แสดงเพิ่มเติม
              </a>
            </p>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

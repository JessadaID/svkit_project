<script>
  import { onMount } from 'svelte';
  import { goto } from "$app/navigation";
  import { warningToast } from "$lib/customtoast.js";
  import { checkAuthStatus } from "$lib/auth";
  import SkeletonLoading from "./SkeletonLoading.svelte";
  
  let searchQuery = "";
  let project_status = "all";
  let projects = [];
  let isLoading = true;

  // ดึงข้อมูลจาก API
  async function fetchProjects() {
    try {
      const res = await fetch('../../api/project-data');
      const data = await res.json();
      if (res.ok) {
        projects = data.data;
      } else {
        console.error('Failed to load data', data.error);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    fetchProjects();
  });

  function setdata(event, item) {
    if (checkAuthStatus()) {
      event.preventDefault();
      goto(`/cpe02/data/info/${item.id}`);
    } else {
      warningToast("กรุณา Login ก่อนใช้งาน");
      goto('/login');
    }
  }

  // ฟังก์ชันสำหรับกรองข้อมูล
  function filterData() {
    return projects.filter((item) => {
      const matchesSearchQuery =
        item.project_name_th.includes(searchQuery) ||
        item.project_name_en.includes(searchQuery);

      const tasks = Object.values(item.Tasks || {});
      const hasImprovement = tasks.some((task) => task.status === "improvement");
      const hasWait = tasks.some((task) => task.status === "wait");
      const hasApprove = tasks.some((task) => task.status === "approve");

      let currentStatus = "wait"; // ค่าเริ่มต้น
      if (hasImprovement) currentStatus = "improvement";
      else if (hasApprove) currentStatus = "approve";

      const matchesStatus =
        project_status === "all" || currentStatus === project_status;

      return matchesSearchQuery && matchesStatus;
    });
  }

  function getLastApprovedTask(tasks) {
    const approvedTasks = Object.keys(tasks)
      .filter((key) => tasks[key].status === "approve")
      .map((key) => ({ key, ...tasks[key] }));

    if (approvedTasks.length > 0) {
      return approvedTasks[approvedTasks.length - 1];
    } else {
      return null;
    }
  }
</script>

<div class="m-5">
  <a href="/" class="hover:underline">หน้าแรก</a> >
  <a href="/cpe02" class="hover:underline">แบบเสนอโครงงาน</a>
  > <b>ข้อมูลแบบเสนอโครงงาน</b>
</div>

<nav class="m-5">
  <p>ค้นหาข้อมูล</p>
  <input
    type="text"
    bind:value={searchQuery}
    placeholder="ค้นหาโปรเจคตามชื่อ..."
    class="w-full p-2 border border-gray-300 rounded mb-4"
  />

  <div class="flex justify-between">
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

<div class="relative flex flex-col w-full h-full overflow-scroll text-gray-700 bg-white shadow-md rounded-lg bg-clip-border p-5">
  {#if isLoading}
    <SkeletonLoading rows={5} />
  {:else}
    <table class="w-full text-left table-auto min-w-max">
      <thead>
        <tr>
          <th class="p-4 border-b border-slate-300 bg-slate-300">
            <p class="block text-md font-normal leading-none text-slate-800 text-center">ลำดับที่</p>
          </th>
          <th class="p-4 border-b border-slate-300 bg-slate-300">
            <p class="block text-md font-normal leading-none text-slate-800">ชื่อโครงงาน</p>
          </th>
          <th class="p-4 border-b border-slate-300 bg-slate-300">
            <p class="block text-md font-normal leading-none text-slate-800">ชื่อผู้เสนอโครงงาน</p>
          </th>
          <th class="p-4 border-b border-slate-300 bg-slate-300">
            <p class="block text-md font-normal leading-none text-slate-800">อาจารย์ที่ปรึกษา</p>
          </th>
          <th class="p-4 border-b border-slate-300 bg-slate-300">
            <p class="block text-md font-normal leading-none text-slate-800">ความคืบหน้า</p>
          </th>
          <th class="p-4 border-b border-slate-300 bg-slate-300">
            <p class="block text-md font-normal leading-none text-slate-800">สถานะ</p>
          </th>
          <th class="p-4 border-b border-slate-300 bg-slate-300">
            <p class="block text-md font-normal leading-none text-slate-800">เพิ่มเติม</p>
          </th>
        </tr>
      </thead>
      <tbody>
        {#each filterData() as item, index}
          <tr class="hover:bg-slate-200">
            <td class="p-4 border-b border-slate-200 text-center">{index + 1}</td>
            <td class="p-4 border-b border-slate-200">{item.project_name_th}</td>
            <td class="p-4 border-b border-slate-200">{item.members?.[0] || '-'}</td>
            <td class="p-4 border-b border-slate-200">{item.adviser?.[0] || '-'}</td>
            <td class="p-4 border-b border-slate-200">
              {#if getLastApprovedTask(item.Tasks)}
                งานที่ {(parseInt(getLastApprovedTask(item.Tasks).key) + 1).toString()}
              {:else}
                ไม่มีการคืบหน้า
              {/if}
            </td>
          <td class="p-4 border-b border-slate-200">
            <!--{ console.log(Object.values(item.Tasks).pop().status)}-->
            {#if Object.keys(item.Tasks).length > 0}
              {#if Object.values(item.Tasks).some((task) => task.status == "improvement")}
                <p class="text-yellow-500 font-bold flex items-center text-sm">
                  แก้ไขเอกสาร
                </p>
              {:else if Object.values(item.Tasks).some((task) => task.status == "wait")}
                <p class="text-blue-500 font-bold flex items-center text-sm">
                  รอการอนุมัติ
                </p>
              {:else if Object.values(item.Tasks).some((task) => task.status == "approve")}
                <p class="text-green-500 font-bold flex items-center text-sm">
                  อนุมัติแล้ว
                </p>
              {/if}
            {:else}
              <p class="text-blue-500 font-bold flex items-center text-sm">
                รอการอนุมัติ
              </p>
            {/if}
          </td>
           <td class="p-4 border-b border-slate-200">
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
  {/if}
</div>

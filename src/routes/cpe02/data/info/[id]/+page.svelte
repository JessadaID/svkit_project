<script>
  export let data; // รับข้อมูลที่ส่งมาจากหน้าอื่น (data.id)
  import { onMount } from "svelte";
  import { goto } from '$app/navigation'

  let project = null;
  let isNotFound = false;

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
    localStorage.setItem('editProject', JSON.stringify(project));
    goto(`/cpe02/data/edit/${project.id}`); // นำทางไปหน้า /edit
    //console.log(project.id)
  }
</script>

{#if isNotFound}
  <h1>404 - Project Not Found</h1>
{:else}
  <div class="md:m-5 p-3 md:bg-gray-200 rounded md:shadow-lg relative">
    {#if project}
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
        <button
          class="absolute top-2 right-2 bg-amber-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
          on:click={goToEditPage}
        >
          แก้ไขข้อมูล
        </button>
      </div>
    {:else}
      <p>กำลังโหลดข้อมูล...</p>
    {/if}
  </div>
{/if}

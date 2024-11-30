<script>
  // @ts-nocheck
  export let data;
  //console.log(data); // ตรวจสอบข้อมูล
  import { goto } from '$app/navigation'
  function setdata(event, item) {
    event.preventDefault(); // ป้องกันการเปลี่ยนเส้นทาง URL โดยอัตโนมัติ
    // เก็บข้อมูลที่เลือกใน localStorage
    localStorage.setItem("selectedProject", JSON.stringify(item));

    // ถ้าต้องการดูผลใน console
    //console.log("เก็บข้อมูลใน localStorage:", item);
    goto(`/cpe02/data/info/${item.id}`)
  }
</script>

{#each data.data as item}
  <a href="#" on:click={(event) => setdata(event, item)}>
    <div class="m-5 p-5 border hover:bg-gray-100">
      <b>ชื่อเสนอโครงงาน </b>
      <h1>&emsp;&emsp;{item.project_name_th} &emsp; (ไทย)</h1>
      <h1>&emsp;&emsp;{item.project_name_en} &emsp; (อังกฤษ)</h1>
      <b>ชื่อผู้เสนอโครงงาน </b>
      {#each item.members as members}
        <h1>&emsp;&emsp;{members}</h1>
      {/each}
      <b>อาจารย์ที่ปรึกษาโครงงาน </b>
      {#each item.adviser as adviser}
        <h1>&emsp;&emsp;{adviser}</h1>
      {/each}
    </div>
  </a>
{/each}

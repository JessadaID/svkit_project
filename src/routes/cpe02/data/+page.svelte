<script>
  export let data;
  // --- ปรับปรุงชื่อตัวแปรให้อ่านง่ายขึ้น ---
  let error = null;

  // --- ตัวอย่างข้อมูลสถานะและสไตล์ Tailwind ---
  // คุณสามารถปรับสีเหล่านี้ได้ตามต้องการใน tailwind.config.js หรือใช้สีดีฟอลต์
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800 border border-yellow-300', // ตัวอย่าง: รออนุมัติ
    approved: 'bg-green-100 text-green-800 border border-green-300',   // ตัวอย่าง: อนุมัติแล้ว
    rejected: 'bg-red-100 text-red-800 border border-red-300',     // ตัวอย่าง: ไม่อนุมัติ
    draft: 'bg-gray-100 text-gray-800 border border-gray-300',       // ตัวอย่าง: ฉบับร่าง
    unknown: 'bg-gray-100 text-gray-600 border border-gray-300',     // สถานะไม่ทราบหรือไม่ระบุ
    // เพิ่มสถานะอื่นๆ ตามต้องการ
  };

</script>

<!-- ใช้ font-sans หรือ font ที่คุณกำหนดใน tailwind.config.js -->
<div class="max-w-7xl mx-auto my-8 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
  <h1 class="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6 pb-2 border-b-2 border-blue-500">
    รายการฟอร์ม CE02
  </h1>

  
  {#if error}
    <p class="my-8 py-4 px-6 rounded-lg text-lg flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 font-medium">
      <span class="text-xl">⚠️</span> <!-- Emoji warning -->
      {error}
    </p>
  {:else if data.terms.length > 0}
    <p class="text-sm text-gray-600 mb-6">พบทั้งหมด {data.terms.length} รายการ</p>

    <!-- Container สำหรับจัดเรียงการ์ด -->
    <div class="w-full">
      {#each data.terms as form (form.id || form._id || Math.random())}
      <a href="/cpe02/data/{form}" class="text-gray-700">
          <div class="p-4 sm:p-5 flex-grow text-sm leading-relaxed space-y-2 border border-gray-400 bg-gray-50 hover:bg-gray-100 cursor-pointer">
           
              <strong class="font-medium text-gray-800 mr-1">ภาคการศึกษา :</strong>
              {form|| 'ไม่ระบุ'}
          </div>
          </a>
      {/each}
    </div>
  {:else}
    <p class="my-8 py-4 px-6 rounded-lg text-lg flex items-center justify-center gap-3 bg-gray-50 border border-gray-200 text-gray-600">
      ไม่พบข้อมูลฟอร์ม
    </p>
  {/if}
</div>

<!-- ไม่จำเป็นต้องมี <style> อีกต่อไป ถ้า Tailwind ถูกตั้งค่าอย่างถูกต้อง -->
<!-- <style> ... </style> -->

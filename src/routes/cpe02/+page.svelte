<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { checkLoginStatus } from "../../auth";

  let isLoggedIn = false;

  onMount(async () => {
    // ตรวจสอบสถานะล็อกอินเมื่อหน้าโหลด
    isLoggedIn = await checkLoginStatus(); // ฟังก์ชันที่ตรวจสอบสถานะจาก Firebase
  });

  function handleNavigation(url) {
    // ตรวจสอบสถานะล็อกอินแล้วนำทางไปยัง URL
    if (isLoggedIn) {
      goto(url);
    } else {
      goto("/login"); // ถ้าไม่ได้ล็อกอินให้ไปที่หน้า Login
    }
  }
</script>

<div class="m-5">
  <a href="/" class="hover:underline">หน้าแรก</a> > <b>แบบเสนอโครงงาน</b>
</div>
<div class="grid grid-rows-2 gap-4 h-auto px-4 py-6 lg:px-8 lg:py-6 overflow-hidden ">
  <!-- Row 1 -->
  <div class="grid grid-cols-1 lg:grid-cols-10 gap-4 relative">
    <!-- Column 1 (70%) -->
    <div class="lg:col-span-7 col-span-1 animated-left">
      <div class="block shadow-lg  w-full text-white text-center transition-transform duration-200" style="background-color: #4851b9;">
        <div class="flex flex-col justify-center items-center h-60">
          <p class="text-xl">📜 กรอกแบบฟอร์ม</p>
          <p class="text-sm">
            เริ่มต้นการกรอกข้อมูลเพื่อเสนอหัวข้อโครงงานได้ที่นี่
          </p>
          <button
            on:click={() => handleNavigation("/cpe02/form")}
            class="mt-3 bg-white text-black px-7 py-1 border-none hover:bg-gray-200"
          >
            เริ่มต้น
          </button>
        </div>
      </div>
    </div>
    <div class="animated-left absolute left-0 h-full w-20" style="background-color: #3d459c;">
    </div>

    <!-- Column 2 (30%) -->
    <div class="lg:col-span-3 col-span-1 p-4 hidden md:block"></div>
  </div>

  <!-- Row 2 -->
  <div class="grid grid-cols-1 lg:grid-cols-10 gap-4 relative">
    <!-- Column 1 (30%) -->
    <div class="lg:col-span-3 col-span-1 p-4 hidden md:block" ></div>

 
    <!-- Column 2 (70%) -->
    <div class="lg:col-span-7 col-span-1 animated-right ">
      <div class="block shadow-lg w-full text-white text-center bg-red-500 transition-transform duration-200">
        <div class="flex flex-col justify-center items-center h-60">
          <p class="text-xl">📊ข้อมูลแบบเสนอโครงงาน</p>
          <p class="text-sm">ดูข้อมูลที่ได้ทำการเสนอไว้ทั้งหมด</p>
          <p class="text-sm">พร้อมการอัพเดทสถานะ</p>
          <button
            on:click={() => handleNavigation("/cpe02/data")}
            class="mt-3 bg-white text-black px-7 py-1 border-none hover:bg-gray-200"
          >
            ดูข้อมูล
          </button>
        </div>
      </div>
    </div>
    <div class="animated-right bg-red-600 absolute right-0 h-full w-20">
    </div>
  </div>
</div>

<div class="custom-shape-divider-bottom-1737392204">
  <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
      <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" class="shape-fill"></path>
  </svg>
</div>

<style>
  .custom-shape-divider-bottom-1737392204 {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    overflow: hidden;
    line-height: 0;
    z-index: -1;
}

.custom-shape-divider-bottom-1737392204 svg {
    position: relative;
    display: block;
    width: calc(274% + 1.3px);
    height: 210px;
    transform: rotateY(180deg);
}

.custom-shape-divider-bottom-1737392204 .shape-fill {
    fill: #FF8585;
}

.animated-left{
  opacity: 0; /* เริ่มต้นโปร่งใส */
    transform: translateY(100px); /* เริ่มต้นเลื่อนจากด้านล่าง */
    animation: slideIn 1.5s ease-out forwards; /* เรียกใช้ keyframes */

}.animated-right{
  opacity: 0; /* เริ่มต้นโปร่งใส */
    transform: translateY(100px); /* เริ่มต้นเลื่อนจากด้านล่าง */
    animation: slideOut 1.5s ease-out forwards; /* เรียกใช้ keyframes */

}
@keyframes slideIn {
    0% {
      opacity: 0;
      transform: translateX(-100px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideOut {
    0% {
      opacity: 0;
      transform: translateX(100px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
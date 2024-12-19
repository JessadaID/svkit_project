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
<div class="grid grid-cols-1 md:grid-cols-2 m-5">
  <!-- กรอกแบบฟอร์ม -->
  <div class=" h-40">
    <div
      class="block shadow-lg h-full w-full text-white text-center transform bg-emerald-700 transition-transform duration-200"
    >
      <div class=" h-full content-center">
        <p class="text-xl">📜 กรอกแบบฟอร์ม</p>
        <p class="text-sm">เริ่มต้นการกรอกข้อมูลเพื่อเสนอหัวข้อโครงงานได้ที่นี่</p>

        <button
          on:click={() => handleNavigation("/cpe02/form")}
          class="mt-3 bg-white text-black px-7 py-1 border-none hover:bg-gray-200"
          >เริ่มต้น</button
        >
      </div>
    </div>
  </div>
  <div class="hidden md:block">
    <img
      src="https://www.nsbpictures.com/wp-content/uploads/2018/12/christmas_tree_PNG133.png"
      alt=""
      class="h-40"
    />
  </div>
  <div class="grid justify-items-end hidden md:block">
    <img
      src="https://png.pngtree.com/png-clipart/20211024/original/pngtree-christmas-gift-red-3d-package-png-image_6861061.png"
      alt=""
      class="h-40"
    />
  </div>
  <!-- ข้อมูลแบบเสนอโครงงาน -->
  <div class="h-40 justify-items-center">
    <div
      class="block shadow-lg h-full w-full text-white text-center transform bg-red-500 transition-transform duration-200"
    >
      
      <div class=" h-full content-center">
        <p class="text-xl">📊ข้อมูลแบบเสนอโครงงาน</p>
        <p class="text-sm">ดูข้อมูลที่ได้ทำการเสนอไว้ทั้งหมด</p>
        <p class="text-sm">พร้อมการอัพเดทสถานะ</p>
        <button on:click={() => handleNavigation("/cpe02/data")} class="mt-3 bg-white text-black px-7 py-1 border-none hover:bg-gray-200">
          ดูข้อมูล
        </button>
      </div>
    </div>
  </div>
</div>
<marquee behavior="" direction="left"
  >⋆꙳•̩̩͙❅*̩̩͙‧͙ ‧͙*̩̩͙❆ ͙͛ ˚₊⋆‧₊˚🎄✩ ₊˚🦌⊹♡&emsp;Merry christmas&emsp;⋆꙳•̩̩͙❅*̩̩͙‧͙ ‧͙*̩̩͙❆ ͙͛ ˚₊⋆‧₊˚🎄✩
  ₊˚🦌⊹♡</marquee
>

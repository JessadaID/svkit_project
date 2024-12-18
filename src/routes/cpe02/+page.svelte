<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { checkLoginStatus} from '../../auth';


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
            goto('/login');  // ถ้าไม่ได้ล็อกอินให้ไปที่หน้า Login
        }
    }
</script>

<div class="m-5">
  <a href="/" class="hover:underline">หน้าแรก</a> > <b>แบบเสนอโครงงาน</b>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 m-5 ">
  <!-- กรอกแบบฟอร์ม -->
  <div class=" h-40 ">
    <button
      on:click={() => handleNavigation("/cpe02/form")}
      class="block shadow-lg h-full w-full text-white text-center transform bg-emerald-700 hover:bg-emerald-800 transition-transform duration-200"
      
    >
      กรอกแบบฟอร์ม
    </button>
  </div>
  <div class="hidden md:block"><img src="https://www.nsbpictures.com/wp-content/uploads/2018/12/christmas_tree_PNG133.png" alt="" class="h-40"></div>
  <div class="grid justify-items-end hidden md:block"><img src="https://png.pngtree.com/png-clipart/20211024/original/pngtree-christmas-gift-red-3d-package-png-image_6861061.png" alt="" class="h-40 "></div>
    <!-- ข้อมูลแบบเสนอโครงงาน -->
  <div class="h-40 justify-items-center">
    <button
      on:click={() => handleNavigation("/cpe02/data")}
      class="block shadow-lg h-full w-full text-white text-center transform bg-red-500 hover:bg-red-600 transition-transform duration-200"
    >
      ข้อมูลแบบเสนอโครงงาน
    </button>
  </div>
</div>
<marquee behavior="" direction="left">⋆꙳•̩̩͙❅*̩̩͙‧͙ ‧͙*̩̩͙❆ ͙͛ ˚₊⋆‧₊˚🎄✩ ₊˚🦌⊹♡&emsp;Merry christmas&emsp;⋆꙳•̩̩͙❅*̩̩͙‧͙ ‧͙*̩̩͙❆ ͙͛ ˚₊⋆‧₊˚🎄✩ ₊˚🦌⊹♡</marquee>

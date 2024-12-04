<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getAuth, onAuthStateChanged } from 'firebase/auth';

  let isLoggedIn = false;
  
  onMount(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      isLoggedIn = !!user; // ตรวจสอบว่าผู้ใช้ล็อกอินอยู่หรือไม่
    });
  });

  function handleNavigation(url) {
    if (isLoggedIn) {
      goto(url);
    } else {
      goto('/login');
    }
  }
</script>
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 m-5">
  <!-- กรอกแบบฟอร์ม -->
  <button
    on:click={() => handleNavigation('/cpe02/form')}
    class="block border rounded shadow-lg p-5 text-white text-center transform hover:scale-105 transition-transform duration-200"
    style="background-color:#4F709C"
      >
    กรอกแบบฟอร์ม
  </button>

  <!-- ข้อมูลแบบเสนอโครงงาน -->
  <button
    on:click={() => handleNavigation('/cpe02/data')}
    class="block border rounded shadow-lg p-5 text-white text-center transform hover:scale-105 transition-transform duration-200"
    style="background-color:#4F709C"
    >
    ข้อมูลแบบเสนอโครงงาน
  </button>
</div>

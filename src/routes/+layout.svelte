<script>
  import { onMount } from "svelte";
  import { auth } from "$lib/firebase"; // นำเข้า Firebase Auth ที่ตั้งค่าไว้
  import { onAuthStateChanged, signOut } from "firebase/auth";
  import { goto } from "$app/navigation";

  let isLoggedIn = false;
  let currentUser = null;

  // ตรวจสอบสถานะการล็อกอินผ่าน Firebase
  onMount(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        isLoggedIn = true;
        currentUser = user;
      } else {
        isLoggedIn = false;
        currentUser = null;
      }
    });
  });

  // ฟังก์ชัน Logout
  async function logout() {
    try {
      await signOut(auth);
      isLoggedIn = false;
      localStorage.removeItem("email");
      localStorage.removeItem("role");
      goto("/cpe02"); // พาผู้ใช้กลับไปที่หน้า Login
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }
</script>
<nav class="p-4  w-full shadow-lg flex items-center justify-between" style="background-color: #11235A;">
  <!-- Logo / Title -->
  <a href="/" class="text-lg text-white hover:text-gray-200">
    โครงงาน/วิจัย
  </a>

  <!-- Navigation Items -->
  {#if isLoggedIn}
    <div class="flex items-center space-x-4">
      <span class="text-sm text-white">สวัสดี, {currentUser?.email}</span>
      <button
        on:click={logout}
        class="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-md shadow hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  {:else}
    <div class="flex space-x-3">
      <a
        href="/signup"
        class="px-4 py-2 text-sm font-semibold text-white bg-sky-500 rounded-md shadow hover:bg-sky-600 transition"
      >
        Signup
      </a>
      <a
        href="/login"
        class="px-4 py-2 text-sm font-semibold text-white bg-green-500 rounded-md shadow hover:bg-green-600 transition"
      >
        Signin
      </a>
    </div>
  {/if}
</nav>

<div class="container">
  <slot />
</div>

<script>
  import { onMount } from "svelte";
  import { auth } from "$lib/firebase"; // นำเข้า Firebase Auth ที่ตั้งค่าไว้
  import { onAuthStateChanged, signOut } from "firebase/auth";
  import { goto } from "$app/navigation";
  import { deleteCookie, getCookie } from "cookies-next";

  let isLoggedIn = false;
  let currentUser = null;
  let isMenuOpen = false;

  function toggle() {
    isMenuOpen = !isMenuOpen;
  }

  function checkAuthStatus() {
    const email = getCookie("email");
    const role = getCookie("role");

    // ถ้าไม่มี email หรือ role ใน cookie ให้ทำการ logout
    if (!email || !role) {
      logout();
      return false;
    }
    return true;
  }

  // ตรวจสอบสถานะการล็อกอินผ่าน Firebase
  // ตรวจสอบสถานะการล็อกอินผ่าน Firebase และ cookies
  onMount(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // ตรวจสอบ cookie เมื่อมีการ login
        if (checkAuthStatus()) {
          isLoggedIn = true;
          currentUser = user;
        }
      } else {
        isLoggedIn = false;
        currentUser = null;
      }
    });

    // ตั้งเวลาตรวจสอบ cookie ทุก 1 นาที
    const intervalId = setInterval(() => {
      if (isLoggedIn) {
        checkAuthStatus();
      }
    }, 60000);

    // Cleanup interval เมื่อ component ถูกทำลาย
    return () => clearInterval(intervalId);
  });

 // ฟังก์ชัน Logout
async function logout() {
  try {
    await signOut(auth);
    isLoggedIn = false;
    // ลบ cookies
    deleteCookie("email");
    deleteCookie("role");
    goto("/cpe02");
  } catch (error) {
    console.error("Error logging out:", error);
  }
}
</script>

<nav
  class="p-4 w-full shadow-lg flex items-center justify-between"
  style="background-color: #11235A;"
>
  <!-- Logo / Title -->
  <a href="/" class="text-lg text-white hover:text-gray-200">
    ระบบสนับสนุนการเสนอหัวข้อโครงงาน
  </a>

  <!-- Navigation Items -->
  {#if isLoggedIn}
    <div class="flex items-center space-x-4 hidden md:block">
      <span class="text-sm text-white">สวัสดี, {currentUser?.email}</span>
      <button
        on:click={logout}
        class="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-md shadow hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>

    <div class="md:hidden">
      <!-- svelte-ignore a11y_consider_explicit_label -->
      <button on:click={toggle}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          class="w-6 h-6 text-white hover:scale-105"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </button>
    </div>
  {:else}
    <div class="flex space-x-3 hidden md:block">
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
    <div class="md:hidden">
      <!-- svelte-ignore a11y_consider_explicit_label -->
      <button on:click={toggle}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          class="w-6 h-6 text-white hover:scale-105"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </button>
    </div>
  {/if}
</nav>

<!-- Hidden Menu -->
<div
  class={`space-y-2  p-4  md:hidden transition-all   ${
    isMenuOpen ? "block" : "hidden"
  }`}
  style="background-color: #21618c;"
>
  <a href="/" class="block text-white hover:text-gray-200 hover:underline">
    หน้าแรก
  </a>

  {#if isLoggedIn}
    <a
      href="/cpe02/form"
      class="block text-white hover:text-gray-200 hover:underline mb-5"
    >
      กรอกแบบฟรอม
    </a>
    <a
      href="/cpe02/data"
      class="block text-white hover:text-gray-200 hover:underline mb-5"
    >
      ข้อมูลแบบเสนอโครงงาน
    </a>
    <hr />

    <span class="text-sm text-white">สวัสดี, {currentUser?.email}</span><br />
    <button
      on:click={logout}
      class="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-md shadow hover:bg-red-600 transition"
    >
      Logout
    </button>
  {:else}
    <a
      href="/login"
      class="block text-white hover:text-gray-200 hover:underline mb-5"
    >
      กรอกแบบฟรอม
    </a>
    <a
      href="/login"
      class="block text-white hover:text-gray-200 hover:underline mb-5"
    >
      ข้อมูลแบบเสนอโครงงาน
    </a>
    <hr />
    <a
      href="/signup"
      class="block text-white hover:text-gray-200 hover:underline"
    >
      สมัครสมาชิก
    </a>
    <a
      href="/login"
      class="block text-white hover:text-gray-200 hover:underline"
    >
      เข้าสู่ระบบ
    </a>
  {/if}
</div>

<slot />

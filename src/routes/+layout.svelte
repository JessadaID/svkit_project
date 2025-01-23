<script>
  import { onMount } from "svelte";
  import { auth } from "$lib/firebase"; // นำเข้า Firebase Auth ที่ตั้งค่าไว้
  import { onAuthStateChanged, signOut } from "firebase/auth";
  import { goto } from "$app/navigation";
  import { getCookie } from "cookies-next";
  import { clearLoginCookies } from "../auth";
  let isLoggedIn = false;
  let currentUser = null;
  let isMenuOpen = false;

  function toggle() {
    isMenuOpen = !isMenuOpen;
  }

  function checkAuthStatus() {
    const email = getCookie("email");
    const role = getCookie("role");

    //console.log("Checking cookies:", { email, role });

    if (!email || !role) {
      console.warn("Missing cookies. Logging out.");
      logout();
      return false;
    }
    return true;
  }

  onMount(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        if (checkAuthStatus()) {
          isLoggedIn = true;
          currentUser = user;
        }
        //console.log("state change")
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
      clearLoginCookies();
      goto("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }
</script>

<nav
  class="p-2 px-4 w-full shadow-lg flex items-center justify-between"
  style="background-color: #11235A;"
>
  <!-- Logo / Title -->
  <div class="flex items-center">
    <a href="/">
      <img src="/LOGO.png" width="40px" height="40px" alt="" />
    </a>
    <a href="/" class="text-white pe-2 ps-5 hover:text-gray-20 me-4">ระบบสนับสนุนการเสนอหัวข้อโครงงาน</a>
    <a href="/cpe02/form" class="text-white pe-2 hover:text-gray-200 "
      >กรอกแบบฟรอม</a
    >
    <a href="/cpe02/data" class="text-white pe-2 hover:text-gray-200"
      >ดูข้อมูล</a
    >
  </div>

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
        href="/login"
        class="px-4 py-2 text-sm flex font-semibold text-white bg-green-500 items-center rounded-full shadow hover:bg-green-600 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="icon icon-tabler icons-tabler-outline icon-tabler-user-edit pe-1"
          ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
            d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"
          /><path d="M6 21v-2a4 4 0 0 1 4 -4h3.5" /><path
            d="M18.42 15.61a2.1 2.1 0 0 1 2.97 2.97l-3.39 3.42h-3v-3l3.42 -3.39z"
          /></svg
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

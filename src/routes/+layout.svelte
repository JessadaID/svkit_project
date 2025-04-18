<script>
  import { onMount } from "svelte";
  import { auth, db } from "$lib/firebase"; // นำเข้า Firebase Auth ที่ตั้งค่าไว้
  import { onAuthStateChanged } from "firebase/auth";
  import { doc, getDoc } from "firebase/firestore";
  import { checkAuthStatus, logout} from "$lib/auth";
  import { SvelteToast } from '@zerodevx/svelte-toast'
  import { dangerToast } from "$lib/customtoast";

  let isLoggedIn = false;
  let currentUser = null;
  let isMenuOpen = false;
  let userName = "";
  let menuItems = [];
  let role = null ;
  const vapidKey = 'BOpqwMjROZUjSv0jI_XQad5CTMN1rjDoyEVLNwdTiW3VNK-Dp8sD1hmwj8E4MvF4fisnNoKwoG1Tb-PewzwpKg4';


  const getMenuItems = (role) => {
        // Full menu for admin and subject_teacher
        if (role === 'admin') {
            return [
                { id: '/', label: 'หน้าแรก' },
                { id: '/cpe02/data', label: 'ดูข้อมูล' },
                { id: '/Dashboard', label: 'แดชบอร์ด' },
            ];
        } else if(role === 'subject_teacher' || role === 'teacher'){
          return [
                { id: '/', label: 'หน้าแรก' },
                { id: '/cpe02/data', label: 'ดูข้อมูล' },
                { id: '/TS_Dashboard', label: 'แดชบอร์ด' },
            ];
        }else{
          return [
                { id: '/', label: 'หน้าแรก' },
                { id: '/cpe02/data', label: 'ดูข้อมูล' },
                { id: '/cpe02', label: 'กรอกแบบฟอร์ม' },
            ];
        }
    };


  function toggle() {
    isMenuOpen = !isMenuOpen;
  }

  //get name from firestore where uid
  onMount(() => {
    menuItems = getMenuItems();
    onAuthStateChanged(auth, (user) => {
      
      if (user) {
        if (checkAuthStatus()) {
          isLoggedIn = true;
          currentUser = user;

          // ดึงข้อมูลชื่อจาก Firestore
          const userDocRef = doc(db, "users", user.uid);
          getDoc(userDocRef).then((docSnap) => {
            if (docSnap.exists()) {
              userName = docSnap.data().name;
              role = docSnap.data().role;
              //console.log(role)
              menuItems = getMenuItems(role);
            } else {
              //console.log("No such document!");
              dangerToast("ไม่พบข้อมูล")
            }
          }).catch((error) => {
            console.error("Error getting document:", error);
            dangerToast("ไม่พบข้อมูล " + error)
          });


        }
      } else {
        isLoggedIn = false;
        currentUser = null;
      }
    });


  });

</script>

<SvelteToast />

<nav
  class="p-2 px-4 w-full shadow-lg flex items-center justify-between"
  style="background-color: #11235A;"
>
  <!-- All menu -->
  <div class="flex items-center">
    <a href="/">
      <img src="/LOGO.png" width="40px" height="40px" alt="" />
    </a>
    {#each menuItems as item}
      <a href={item.id} class="text-white pe-2 hover:text-gray-200">{item.label}</a>
    {/each}
  </div>

  
  <!-- Desktop menu -->
  {#if isLoggedIn}
  <div class="relative">
    <button on:click={toggle} class="text-black hover:text-gray-800 bg-gray-200 hover:bg-gray-400 px-4 py-2 rounded-md">
      {userName ?? "anonymous"} <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-4 h-4 inline-block"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
    </button>
    {#if isMenuOpen}
      <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
        <a href="/account" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">ข้อมูลส่วนตัว</a>
        <button on:click={logout} class="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100">ออกจากระบบ</button>
      </div>
    {/if}
  </div>

      <!-- Hamburgur icon-->
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
     <!-- end Hamburgur icon-->
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
        เข้าสู่ระบบ
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

<!--molide menu-->
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
      href="/cpe02/data"
      class="block text-white hover:text-gray-200 hover:underline mb-5"
    >
      ข้อมูลแบบเสนอโครงงาน
    </a>
    <hr />

    <span class="text-sm text-white">สวัสดี, {userName || currentUser?.email}</span><br />
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

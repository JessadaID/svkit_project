<script>
  import { onMount } from "svelte";
  import SearchMember from "./SearchMember.svelte";
  import Main from "./Main.svelte";
  import { getCookie } from "cookies-next";
  import { goto } from "$app/navigation";

  let email = null;
  let role = null;
  let activeComponent = "Main"; // Default component

  onMount(() => {
    // ดึงค่า email และ role จาก cookie
    email = getCookie("email");
    role = getCookie("role");
    if (!email || role !== "admin") {
      goto("./../cpe02");
    }
  });

  function setActiveComponent(component) {
    activeComponent = component;
  }
</script>

<div class="flex">
  <!-- Sidebar -->
  <div class="w-64 bg-gray-800 text-white p-4 h-svh">
    <button
      class="w-full py-2 px-4 mb-2 text-left hover:bg-gray-700"
      on:click={() => setActiveComponent("Main")}
    >
      หน้าหลัก
    </button>
    <button
      class="w-full py-2 px-4 mb-2 text-left hover:bg-gray-700"
      on:click={() => setActiveComponent("searchMember")}
    >
      จัดการสมาชิก
    </button>
   
  </div>

  <!-- Main Content -->
  <div class="flex-1 p-4">
    {#if activeComponent === "searchMember"}
      <SearchMember />
    {:else if activeComponent === "Main"}
      <Main />
    {/if}
  </div>
</div>

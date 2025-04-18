<script>
  import { onMount } from "svelte";
  import SearchMember from "./SearchMember.svelte";
  import Main from "./Main.svelte";
  import { getCookie } from "cookies-next"; // Corrected import if using 'cookies-next'
  // If using 'js-cookie', the import would be: import Cookies from 'js-cookie';
  import { goto } from "$app/navigation";
  import { checkAuthStatus } from "$lib/auth";

  let email = null;
  let role = null;
  let activeComponent = "Main"; // Default component
  let menuItems = [];

  const getMenuItems = (role) => {
        // Full menu for admin and subject_teacher
        if (role === 'admin') {
            return [
                { id: 'Main', label: 'หน้าหลัก', icon: '<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"/></svg>' },
                { id: 'searchMember', label: 'จัดการสมาชิก', icon: '<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/></svg>' },
            ];
        } 
        // Default empty menu
        return [];
    };
  
  onMount(() => {
    if(checkAuthStatus()){
      role = getCookie('role');
      email = getCookie('email');
      menuItems = getMenuItems(role);
    }
  

    if (!email || role !== "admin") {
      // Consider adding a small delay or using tick() if redirection issues occur
      goto("./../cpe02");
    }
  });

  function setActiveComponent(component) {
    activeComponent = component;
  }
</script>

<div class="flex">
  <!-- Sidebar -->
  <div class="w-64 bg-gray-800 text-white p-4 h-screen sticky top-0">
    {#each menuItems as item}
      <button
      class="w-full flex py-2 px-4 mb-2 text-left rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 {activeComponent === item.id ? 'bg-gray-700' : ''}"
      on:click={() => setActiveComponent(item.id)}
    >
    <span class="text-xl">{@html item.icon}</span>
    <span class="ml-3">{item.label}</span>
    </button>
    {/each}

    <!-- Add more sidebar buttons here if needed -->
  </div>

  <!-- Main Content -->
  <div class="flex-1 p-4 overflow-y-auto">
    {#if activeComponent === "searchMember"}
      <SearchMember />
    {:else if activeComponent === "Main"}
      <Main />
    {/if}
  </div>
</div>

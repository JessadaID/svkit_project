<script>
    import { fade, slide } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    
    // Component imports
    import OpenForm from './open_form.svelte';
    import Addtask from './Addtask.svelte';
    import SelectProject from './Select_Project.svelte';
    import Table_director from './Table_director.svelte';
    import Appointment from './Appointment.svelte';
    import { getCookie } from "cookies-next";
    import { checkAuthStatus } from '$lib/auth';

    let isOpen = true;
    let selectedComponent = 'SelectProject';  // Default to Select_Project
    let userRole = '';

    const components = {
        OpenForm,
        Addtask,
        SelectProject,
        Table_director,
        Appointment,
    };

    // Define different menu items based on role
    const getMenuItems = (role) => {
        // Full menu for admin and subject_teacher
        if (role === 'admin' || role === 'subject_teacher') {
            return [
                { id: 'OpenForm', label: 'เปิด/ปิด ฟอร์ม', icon: '<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-forms"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3a3 3 0 0 0 -3 3v12a3 3 0 0 0 3 3" /><path d="M6 3a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3" /><path d="M13 7h7a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-7" /><path d="M5 7h-1a1 1 0 0 0 -1 1v8a1 1 0 0 0 1 1h1" /><path d="M17 12h.01" /><path d="M13 12h.01" /></svg>' },
                { id: 'Addtask', label: 'มอบหมายงาน', icon: '<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 5l0 14" /><path d="M5 12l14 0" /></svg>' },
                { id: 'SelectProject', label: 'เลือกเป็นกรรมการ', icon: '<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-select"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" /><path d="M9 11l3 3l3 -3" /></svg>' },
                { id: 'Table_director', label: 'ตารางลงชื่อกรรมการ', icon: `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-table"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z" /><path d="M3 10h18" /><path d="M10 3v18" /></svg>`},
                { id: 'Appointment', label: 'นัดหมายการสอบ', icon: `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-clock"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 7v5l3 3" /></svg>`},
            ];
        } 
        // Limited menu for regular teachers
        else if (role === 'teacher') {
            return [
                { id: 'SelectProject', label: 'เลือกเป็นกรรมการ', icon: '<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-select"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" /><path d="M9 11l3 3l3 -3" /></svg>' },
                { id: 'Table_director', label: 'ตารางลงชื่อกรรมการ', icon: `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-table"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z" /><path d="M3 10h18" /><path d="M10 3v18" /></svg>`},
                { id: 'Appointment', label: 'นัดหมายการสอบ', icon: `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-clock"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 7v5l3 3" /></svg>`},

            ];
        }
        // Default empty menu
        return [];
    };

    let menuItems = [];

    function toggleSidebar() {
        isOpen = !isOpen;
    }

    function selectComponent(id) {
        selectedComponent = id;
    }

 
    onMount(() => {
        if(checkAuthStatus()){
            userRole = getCookie('role');
        // Set menu items based on role
        menuItems = getMenuItems(userRole);
        
        // If teacher role, force select the Select_Project component
        if (userRole === 'teacher') {
            selectedComponent = 'SelectProject';
        }
        
        // Redirect if unauthorized
        if (userRole !== 'subject_teacher' && userRole !== 'admin' && userRole !== 'teacher') {
            goto('/cpe02');
        }
        }
    });
</script>

{#if userRole === 'subject_teacher' || userRole === 'admin' || userRole === 'teacher'}
    <div class="flex h-screen bg-gray-100">
        <!-- Sidebar -->
        <div class={` ${isOpen ? 'w-64' : 'w-20'} duration-300 h-screen bg-gray-800 relative sticky top-0`}>
            <!-- Toggle Button -->
            <button 
                class="absolute -right-3 top-9 bg-gray-800 text-white p-1 rounded-full hover:bg-gray-700"
                on:click={toggleSidebar}
            >
                {#if isOpen}
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                {:else}
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                {/if}
            </button>

            <!-- Sidebar Content -->
            <div class="p-4">
                <!-- Logo/Title -->
                <div class="flex items-center space-x-3 mb-8">
                    <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span class="text-white font-bold">D</span>
                    </div>
                    {#if isOpen}
                        <h1 transition:fade class="text-white font-medium text-xl">Dashboard</h1>
                    {/if}
                </div>

                <!-- Menu Items - Dynamically generated based on role -->
                <nav class="space-y-2">
                    {#each menuItems as item}
                        <button
                            class={`w-full flex items-center p-3 rounded-lg transition-colors duration-200
                                ${selectedComponent === item.id ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700'}
                                ${!isOpen ? 'justify-center' : ''}`}
                            on:click={() => selectComponent(item.id)}
                        >
                            <span class="text-xl">{@html item.icon}</span>
                            {#if isOpen}
                                <span transition:slide class="ml-3">{item.label}</span>
                            {/if}
                        </button>
                    {/each}
                </nav>
            </div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 p-6 overflow-y-auto">
            <svelte:component this={components[selectedComponent]} />
        </div>
    </div>
{/if}

<style>
    .h-screen {
        height: 100vh;
    }
    .h-screen-full {
        height: 100vh;
    }
</style>

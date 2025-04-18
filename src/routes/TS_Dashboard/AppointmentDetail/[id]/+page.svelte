<script>
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { getCookie } from "cookies-next";
    import Calendar from "./Calendar.svelte";
    import ShowCalendar from './show-Calendar.svelte'
  import { successToast } from '$lib/customtoast';
    
    let userRole = '';
    let returnPath = '/TS_Dashboard';
    let selectedDates = [];
     let selectedRange = { start: null, end: null };
    let savedSelections = [];
    let selectionMode = 'single'; // เริ่มต้นด้วยโหมดเลือกวันเดียว
    let email;
    let showCalendar; // Add a variable to hold a reference to the ShowCalendar component.

 
    onMount(() => {
        userRole = getCookie('role');
        email = getCookie('email');
        if (userRole !== 'subject_teacher' && userRole !== 'admin' && userRole !== 'teacher') {
            goto('/cpe02');
        }
    });

    function goBack() {
        goto(returnPath);
    }

 function handleSave(event) {
  const { savedSelections, currentSelection } = event.detail;
  //console.log('บันทึกการเลือก:', currentSelection);
  //console.log([{email,savedSelections},{email,savedSelections},{email,savedSelections}]);
  update();
  // ทำอะไรกับข้อมูลตามต้องการ เช่น บันทึกลงฐานข้อมูล
  successToast("บันทึกสำเร็จ");
}
function update(){
    const userData = [
    { email: "user1@example.com", savedSelections: savedSelections },
    { email: "user2@example.com", savedSelections: savedSelections },
    { email: "user3@example.com", savedSelections: savedSelections },
  ];
  showCalendar.updateUserData(userData)//update user date
}

</script>

{#if userRole === 'subject_teacher' || userRole === 'admin' || userRole === 'teacher'}
<div class="w-full h-screen">
    <div class=" p-4 flex justify-between items-center">
        <button on:click={goBack} class="flex items-center gap-2 hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            กลับ
        </button>
        <h1 class="text-xl font-bold">รายละเอียดการนัดหมาย</h1>
    </div>
    <Calendar 
    bind:selectionMode
    bind:selectedDates
    bind:selectedRange
    bind:savedSelections
    on:save={handleSave}
    on:delete={update} 
    />

<ShowCalendar bind:this={showCalendar}/>

</div>
{/if}



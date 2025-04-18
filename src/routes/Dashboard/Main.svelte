<script>
  import { onMount } from "svelte";
  import { collection, getDocs } from "firebase/firestore";
  import { db } from "$lib/firebase";
  let totalMembers = 0;
  let totalProjects = 0;
  let loading = false;

  onMount(async () => {
    loadProjectData();
  });


  async function loadProjectData() {
    try {
      loading = true;
      // Get total members count from 'users' collection
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      totalMembers = usersSnapshot.size;

      // Get total projects count from 'project-approve' collection
      const projectsCollection = collection(db, "project-approve");
      const projectsSnapshot = await getDocs(projectsCollection);
      totalProjects = projectsSnapshot.size;
    } catch (error) {
      console.error("Error fetching data: ", error);
    }finally{
      loading = false;
    }
  }
</script>

<div class="p-6 bg-gray-100">
  <!-- Card container for members and projects -->
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
    <!-- Total Members Card -->
    <div
      class="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between"
    >
      <h3 class="text-xl font-semibold text-gray-800 mb-4">จำนวนสมาชิกทั้งหมด</h3> 
      <div class="flex items-center justify-between">
        {#if loading}
          <span class="text-4xl font-bold text-blue-600">...</span>
          <!-- Loading dots -->
        {:else}
          <span class="text-4xl font-bold text-blue-600">{totalMembers}</span>
        {/if}
        <span class="text-sm text-gray-500">สมาชิก</span> 
      </div>
    </div>

    <!-- Total Projects Card -->
    <div
      class="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between"
    >
      <h3 class="text-xl font-semibold text-gray-800 mb-4">จำนวนโครงงานทั้งหมด</h3>
      <div class="flex items-center justify-between">
        {#if loading}
          <span class="text-4xl font-bold text-green-600">...</span>
          <!-- Loading dots -->
        {:else}
          <span class="text-4xl font-bold text-green-600">{totalProjects}</span>
        {/if}
        <span class="text-sm text-gray-500">โครงงาน</span> 
      </div>
    </div>
  </div>
</div>

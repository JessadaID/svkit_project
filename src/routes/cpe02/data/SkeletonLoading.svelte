<script>
    // Skeleton loading component for project data table
    export let rows = 5; // Default number of skeleton rows to show
  </script>
  
  <div class="relative flex flex-col w-full h-full overflow-scroll text-gray-700 bg-white shadow-md rounded-lg bg-clip-border p-5">
    <div class="animate-pulse">
      
      <!-- Skeleton for table header -->
      <div class="w-full mb-2">
        <div class="flex">
          <div class="w-16 h-12 bg-slate-300 rounded mr-1"></div>
          <div class="flex-1 h-12 bg-slate-300 rounded mr-1"></div>
          <div class="w-48 h-12 bg-slate-300 rounded mr-1"></div>
          <div class="w-48 h-12 bg-slate-300 rounded mr-1"></div>
          <div class="w-32 h-12 bg-slate-300 rounded mr-1"></div>
          <div class="w-32 h-12 bg-slate-300 rounded mr-1"></div>
          <div class="w-32 h-12 bg-slate-300 rounded"></div>
        </div>
      </div>
      
      <!-- Skeleton for table rows -->
      {#each Array(rows) as _, i}
        <div class="flex w-full py-2 mb-1">
          <div class="w-16 h-10 bg-slate-100 rounded mr-1"></div>
          <div class="flex-1 h-10 bg-slate-100 rounded mr-1"></div>
          <div class="w-48 h-10 bg-slate-100 rounded mr-1"></div>
          <div class="w-48 h-10 bg-slate-100 rounded mr-1"></div>
          <div class="w-32 h-10 bg-slate-100 rounded mr-1"></div>
          <div class="w-32 h-10 bg-slate-100 rounded mr-1"></div>
          <div class="w-32 h-10 bg-slate-100 rounded"></div>
        </div>
      {/each}
    </div>
  </div>
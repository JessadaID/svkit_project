<script>
  // export let data;
</script>

<div class="container mx-auto p-6">
  <!-- 
  <ul>
    {#each data.blogs as blog}
      <li class="mb-2">
        <span class="font-bold">{blog.id}</span>: {blog.name}
        <a href="/blog/{blog.id}" class="text-blue-600 hover:underline ml-2">View</a>
      </li>
    {/each}
  </ul> 
  -->

  <section class="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mt-6">
    <a
      href="/cpe02"
      class="block bg-red-500 border border-black p-5 text-center rounded shadow-md hover:bg-blue-200 transition-colors duration-200 transition-transform transform hover:scale-105"
    >
      ใบเสนอโครงงาน
    </a>
    <div
      class="block bg-red-500 border border-black p-5 text-center rounded shadow-md hover:bg-blue-200 transition-colors duration-200 transition-transform transform hover:scale-105"
    >
      บทที่ 1
    </div>
  </section>
</div>

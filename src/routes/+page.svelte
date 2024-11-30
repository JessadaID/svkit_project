<script>
    export let data
</script>

<h1>Welcome to SvelteKit</h1>
<div>
    {#each data.blogs as blog}
        <li>{blog.id} Name : {blog.name}</li>
        <a href="/blog/{blog.id}">view</a>
    {/each}
</div>

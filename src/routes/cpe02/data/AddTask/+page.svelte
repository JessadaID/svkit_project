<script>
    import {collection, query, where, getDocs } from 'firebase/firestore';
    import { db } from "$lib/firebase";
    import { onMount } from 'svelte';
  
    // Variables
    let term = ''; // ค่าเริ่มต้น
    let projects = [];
    
    // Fetch projects by term
    async function fetchProjects() {
      if (term) {
        const projectsRef = collection(db, 'Task');
        const q = query(projectsRef, where('term', '==', term));
        const querySnapshot = await getDocs(q);
  
        projects = [];
        querySnapshot.forEach((doc) => {
          projects.push({ id: doc.id, ...doc.data() });
        });
      }
    }
  
    // Load initial data (optional, if you want to load data on page load)
    onMount(() => {
      // Optionally, fetch projects for a default term
      term = '2/2567';
      fetchProjects();
    });
  </script>
  
  <!-- Dropdown สำหรับเลือก term -->
  <select bind:value={term} on:change={fetchProjects}>
    <option value="" disabled selected>เลือก Term</option>
    <option value="2/2567">2/2567</option>
    <option value="1/2568">1/2568</option>
    <option value="2/2568">2/2568</option>
  </select>
  
  <!-- แสดงผลข้อมูล -->
  {#if projects.length > 0}
    <ul>
      {#each projects as project}
        <li>{project.name} (Term: {project.title})</li>
        <li>{project.name} (Term: {project.term})</li>
        <li>{project.name} (Term: {project.description})</li>
        <li>{project.name} (Term: {project.dueDate})</li>
        <hr>
      {/each}
    </ul>
  {:else if term}
    <p>ไม่พบข้อมูลใน Term นี้</p>
  {/if}
  
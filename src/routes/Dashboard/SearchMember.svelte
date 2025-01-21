<script>
    import { onMount } from "svelte";
    import { collection, getDocs, query, where, orderBy, limit, startAfter } from "firebase/firestore";
    import { db } from "$lib/firebase";
  
    let members = [];
    let currentPage = 1;
    let pageSize = 10;
    let searchQuery = "";
    let selectedRole = ""; // ตัวแปรสำหรับบทบาทที่เลือก
    let lastVisible = null;
    let isLoading = false;
    let noDataFound = false;
  
    const roles = ["user", "advisor", "admin"]; // รายการบทบาท
  
    async function loadMembers(page = 1, search = "", role = "", resetPagination = false) {
      isLoading = true;
      noDataFound = false;
  
      if (resetPagination) {
        lastVisible = null; // รีเซ็ต lastVisible ถ้ามีการค้นหาใหม่
        currentPage = 1;
      }
  
      const usersCollection = collection(db, "users");
      let q;
  
      let filters = [];
      if (search) {
        filters.push(where("email", ">=", search));
        filters.push(where("email", "<=", search + "\uf8ff"));
      }
      if (role) {
        filters.push(where("role", "==", role));
      }
  
      q = query(
        usersCollection,
        ...filters,
        ...(lastVisible ? [startAfter(lastVisible)] : []),
        limit(pageSize)
      );
  
      const snapshot = await getDocs(q);
      members = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      if (snapshot.docs.length > 0) {
        lastVisible = snapshot.docs[snapshot.docs.length - 1];
      } else if (page === 1) {
        noDataFound = true;
      }
  
      currentPage = page;
      isLoading = false;
    }
  
    onMount(() => {
      loadMembers();
    });
  
    async function nextPage() {
      if (!isLoading) {
        currentPage += 1;
        await loadMembers(currentPage, searchQuery, selectedRole);
      }
    }
  
    async function prevPage() {
      if (currentPage > 1 && !isLoading) {
        currentPage -= 1;
        lastVisible = null; // รีเซ็ต lastVisible เพื่อดึงข้อมูลจากต้นฉบับใหม่
        await loadMembers(currentPage, searchQuery, selectedRole);
      }
    }
  
    async function search() {
      await loadMembers(1, searchQuery, selectedRole, true); // โหลดใหม่และรีเซ็ตการแบ่งหน้า
    }
  </script>
  
  <div class="max-w-4xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Dashboard</h1>
  
    <div class="flex items-center gap-4 mb-6">
      <input
        type="text"
        placeholder="ค้นหาอีเมลสมาชิก..."
        bind:value={searchQuery}
        class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      />
      <select
        bind:value={selectedRole}
        class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      >
        <option value="">ทั้งหมด</option>
        {#each roles as role}
          <option value={role}>{role}</option>
        {/each}
      </select>
      <button
        on:click={search}
        class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        disabled={isLoading}
      >
        ค้นหา
      </button>
    </div>
  
    {#if isLoading}
      <div class="text-center py-4">
        <span class="text-gray-500">กำลังโหลดข้อมูล...</span>
      </div>
    {:else if noDataFound}
      <div class="text-center py-4">
        <span class="text-red-500">ไม่พบข้อมูลที่ค้นหา</span>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="min-w-full table-auto border-collapse border border-gray-200">
          <thead class="bg-gray-100">
            <tr>
              <th class="border border-gray-200 px-4 py-2 text-left">อีเมล</th>
              <th class="border border-gray-200 px-4 py-2 text-left">บทบาท</th>
            </tr>
          </thead>
          <tbody>
            {#each members as member}
              <tr class="odd:bg-white even:bg-gray-50">
                <td class="border border-gray-200 px-4 py-2">{member.email}</td>
                <td class="border border-gray-200 px-4 py-2">{member.role}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  
    <div class="flex items-center justify-between mt-6">
      <button
        on:click={prevPage}
        class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
        disabled={currentPage === 1 || isLoading}
      >
        ก่อนหน้า
      </button>
      <span>หน้าที่ {currentPage}</span>
      <button
        on:click={nextPage}
        class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        disabled={members.length < pageSize || isLoading}
      >
        ถัดไป
      </button>
    </div>
  </div>
  
<script lang="ts">
  import { db } from "$lib/firebase";
  import {
    collection,
    getDocs,
    doc,
    updateDoc,
    addDoc,
    serverTimestamp,
    orderBy,
    query,
    writeBatch,
    deleteDoc,
  } from "firebase/firestore";
  import { onMount } from "svelte";

  let terms = [];
  let loading = false;
  let showModal = false;
  let editingTerm = null;
  let editTermName = "";

  onMount(async () => {
    try {
      loading = true;
      const formsRef = collection(db, "forms");
      const q = query(formsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      terms = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    loading = false;
  });

  async function loadTerms() {
    loading = true;
    const formsRef = collection(db, "forms");
    const q = query(formsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    terms = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    loading = false;
  }

  function openEditModal(term) {
    editingTerm = term;
    editTermName = term.term;
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    editingTerm = null;
    editTermName = "";
  }

  async function toggleForm(termId, isOpen) {
    if (isOpen) {
      if (!confirm(`คุณแน่ใจหรือไม่ที่จะปิดให้กรอกแบบฟอร์ม?`)) {
        return;
      }
    }

    try {
      loading = true;
      const batch = writeBatch(db);
      const formsRef = collection(db, "forms");
      const snapshot = await getDocs(formsRef);

      if (!isOpen) {
        snapshot.docs.forEach((doc) => {
          if (doc.id !== termId && doc.data().isOpen) {
            const docRef = doc.ref;
            batch.update(docRef, {
              isOpen: false,
              updatedAt: serverTimestamp(),
            });
          }
        });
      }

      const termRef = doc(db, "forms", termId);
      batch.update(termRef, {
        isOpen: !isOpen,
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
      await loadTerms();
    } catch (error) {
      console.error("Error toggling form:", error);
      alert("เกิดข้อผิดพลาดในการเปลี่ยนสถานะฟอร์ม");
    } finally {
      loading = false;
    }
  }

  async function updateTerm() {
    if (!editingTerm || !editTermName.trim()) return;

    try {
      loading = true;
      const termRef = doc(db, "forms", editingTerm.id);
      await updateDoc(termRef, {
        term: editTermName.trim(),
        updatedAt: serverTimestamp(),
      });
      await loadTerms();
      closeModal();
    } catch (error) {
      console.error("Error updating term:", error);
      alert("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
    } finally {
      loading = false;
    }
  }

  async function deleteTerm() {
    if (!editingTerm) return;

    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบเทอม ${editingTerm.term}?`)) {
      return;
    }

    try {
      loading = true;
      await deleteDoc(doc(db, "forms", editingTerm.id));
      await loadTerms();
      closeModal();
    } catch (error) {
      console.error("Error deleting term:", error);
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
    } finally {
      loading = false;
    }
  }

  async function createNewTerm() {
    const newTerm = prompt("กรุณาใส่ชื่อเทอม (เช่น 2024-2)");
    if (!newTerm) return;

    try {
      loading = true;
      const batch = writeBatch(db);

      const formsRef = collection(db, "forms");
      const snapshot = await getDocs(formsRef);
      snapshot.docs.forEach((doc) => {
        if (doc.data().isOpen) {
          batch.update(doc.ref, {
            isOpen: false,
            updatedAt: serverTimestamp(),
          });
        }
      });

      const newFormRef = doc(collection(db, "forms"));
      batch.set(newFormRef, {
        term: newTerm,
        isOpen: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
      await loadTerms();
    } catch (error) {
      console.error("Error creating new term:", error);
      alert("เกิดข้อผิดพลาดในการสร้างเทอมใหม่");
    } finally {
      loading = false;
    }
  }

  loadTerms();
</script>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-bold text-gray-800">จัดการเปิด/ปิดฟอร์ม</h1>
    <button
      on:click={createNewTerm}
      disabled={loading}
      class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
          clip-rule="evenodd"
        />
      </svg>
      สร้างเทอมใหม่
    </button>
  </div>

  {#if loading}
    <div class="text-center py-8 text-gray-500">กำลังโหลดข้อมูล...</div>
  {:else}
    <div class="grid gap-4">
      {#each terms as term}
        <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-3">
              <h3 class="text-xl font-semibold text-gray-800">
                เทอม : {term.term}
              </h3>
              <span
                class={`px-3 py-1 rounded-full text-sm font-medium 
                            ${
                              term.isOpen
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
              >
                สถานะ : {term.isOpen ? "เปิด" : "ปิด"}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <button
                on:click={() => toggleForm(term.id, term.isOpen)}
                disabled={loading}
                class={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                                ${
                                  term.isOpen
                                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                                    : "bg-green-50 text-green-600 hover:bg-green-100"
                                }`}
              >
                {term.isOpen ? "ปิดฟอร์ม" : "เปิดฟอร์ม"}
              </button>
              <button
                on:click={() => openEditModal(term)}
                disabled={loading}
                class="px-4 py-2 rounded-lg font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                แก้ไข
              </button>
            </div>
          </div>

          {#if term.createdAt}
            <p class="text-sm text-gray-500 mt-2">
              สร้างเมื่อ: {new Date(term.createdAt.toDate()).toLocaleString(
                "th-TH"
              )}
            </p>
          {/if}
        </div>
      {:else}
        <div class="text-center py-8 text-gray-500">ไม่พบข้อมูลเทอม</div>
      {/each}
    </div>
  {/if}
</div>

{#if showModal}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg p-6 w-full max-w-md">
      <h2 class="text-xl font-bold mb-4">แก้ไขข้อมูลเทอม</h2>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          ชื่อเทอม
        </label>
        <input
          type="text"
          bind:value={editTermName}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="เช่น 2024-2"
        />
      </div>

      <div class="flex justify-between">
        <button
          on:click={deleteTerm}
          disabled={loading}
          class="bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ลบ
        </button>

        <div class="space-x-2">
          <button
            on:click={updateTerm}
            disabled={loading}
            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            บันทึก
          </button>
          <button
            on:click={closeModal}
            disabled={loading}
            class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

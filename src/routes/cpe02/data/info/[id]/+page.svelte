<script>
  export let data; // รับข้อมูลที่ส่งมาจากหน้าอื่น (data.id)
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    deleteDoc,
  } from "firebase/firestore";
  import { ref, deleteObject } from 'firebase/storage';
  import { db,storage } from "$lib/firebase.js";
  import { checkLoginStatus } from "../../../../../auth";
  import { getCookie } from "cookies-next";
  import Loading from "../../loading.svelte";
  import Process from "./Process.svelte";

  let email = "";
  let project = null;
  let project_local = null;
  let isNotFound = false;
  let role = "";
  let isLoading = true;
  let isLoadingtext = false;
  let can_edit = false;
  let status = [""];
  let Task = [];
  let visibleStates = [];
  let comment = [""];
  let showModal = false;
  let selectedImage = null;

  function openImageModal(image) {
    selectedImage = image;
    showModal = true;
  }
  onMount(async () => {
    const isUserLoggedIn = await checkLoginStatus(); // รอผลลัพธ์จาก checkLoginStatus

    if (isUserLoggedIn) {
      email = getCookie("email"); // หรือใช้ cookies ถ้าต้องการ
      role = getCookie("role");
      if (role == "advisor") {
        can_edit = true;
      }
      //console.log('User is logged in, Email:', email);
    } else {
      console.log("User not logged in. Redirecting to login...");
      // ถ้าไม่ได้ล็อกอิน เปลี่ยนเส้นทางไปหน้า Login
      goto("/login");
    }
  });

  // ฟังก์ชันดึงข้อมูลจาก Firebase

  onMount(async () => {
    try {
      // --- ดึงข้อมูลจาก collection 'project-approve' ตาม ID ---
      const projectRef = doc(db, "project-approve", data.id);
      const projectSnap = await getDoc(projectRef);

      if (projectSnap.exists()) {
        project = projectSnap.data(); // เก็บข้อมูล project
      } else {
        console.error("ไม่พบข้อมูลใน project-approve");
      }

      Object.entries(project.Tasks).forEach(([key, task]) => {
        //console.log(`Task ${key}: ${task.comment}`);
        comment[key] = task.comment;
        status[key] = task.status;
      });

      // --- ดึงข้อมูลจาก collection 'Task' ที่มี term == '2/2567' ---
      const taskQuery = query(
        collection(db, "Task"), // ระบุ collection 'Task'
        where("term", "==", project.term)
      );

      const querySnapshot = await getDocs(taskQuery);
      Task = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.index - b.index); // แปลงข้อมูลเป็น Array

      // ตั้งค่าให้ visibleStates มีค่าเริ่มต้นเป็น false ตามจำนวน Task
      visibleStates = Task.map(() => false);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
    } finally {
      isLoading = false; // หยุดสถานะการโหลด
    }

    if (typeof window !== "undefined") {
      // เช็คว่าโค้ดทำงานในฝั่งไคลเอนต์
      const storedData = localStorage.getItem("selectedProject");
      if (storedData) {
        try {
          project_local = JSON.parse(storedData); // แปลงข้อมูลจาก string กลับเป็น object

          // ตรวจสอบว่า project.id ตรงกับ data.id หรือไม่
          if (project_local.id !== data.id) {
            isNotFound = true; // ถ้าไม่ตรงตั้งค่าสถานะเป็น 404
          }
        } catch (error) {
          console.error("Error parsing stored data:", error);
        }
      } else {
        console.log("No data found in localStorage.");
      }
    }
  });

  function goToEditPage() {
    // ส่งข้อมูลไปยังหน้า edit (สามารถใช้ store หรือ localStorage ได้)
    goto(`/cpe02/data/edit/${data.id}`); // นำทางไปหน้า /edit
    //console.log(project.id)
  }

  
async function deleteProject(id) {
  if (confirm("คุณต้องการลบข้อมูลนี้หรือไม่?")) {
    let isLoading = true;

    try {
      // 1. ดึงข้อมูลโครงการก่อนลบ เพื่อเอา URLs ของรูปภาพ
      const docRef = doc(db, "project-approve", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const projectData = docSnap.data();
        
        // 2. ลบรูปภาพทั้งหมดใน Storage
        if (projectData.images && Array.isArray(projectData.images)) {
          const deletePromises = projectData.images.map(async (image) => {
            if (image.url) {
              // แปลง URL เป็น path ใน Storage
              const urlPath = decodeURIComponent(image.url);
              const storagePath = urlPath.split('/o/')[1].split('?')[0];
              
              // สร้าง reference ไปยังไฟล์ใน Storage
              const imageRef = ref(storage, storagePath);
              
              try {
                await deleteObject(imageRef);
                console.log(`ลบรูปภาพสำเร็จ: ${image.name}`);
              } catch (error) {
                console.error(`ไม่สามารถลบรูปภาพ ${image.name}:`, error);
              }
            }
          });

          // รอให้ลบรูปภาพทั้งหมดเสร็จ
          await Promise.all(deletePromises);
        }

        // 3. ลบเอกสารใน Firestore
        await deleteDoc(docRef);
        
        alert("ลบข้อมูลและรูปภาพเรียบร้อยแล้ว!");
        goto(`/cpe02/data`);
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการลบ:", error);
      alert("ไม่สามารถลบข้อมูลได้");
    } finally {
      isLoading = false;
    }
  }
}

</script>

{#if isNotFound}
  <h1>404 - Project Not Found</h1>
{:else if project}
  <div class="m-5">
    <a href="/" class="hover:underline">หน้าแรก</a> >
    <a href="/cpe02" class="hover:underline">แบบเสนอโครงงาน</a>
    > <a href="/cpe02/data" class="hover:underline">ข้อมูลแบบเสนอโครงงาน</a> >
    <b>{project.project_name_th}</b>
  </div>

  <div class="md:flex">
    <div
      class="md:m-5 p-3 md:bg-gray-200 rounded md:shadow-lg relative md:w-8/12"
    >
      <!-- ตรวจสอบว่า projectData มีข้อมูล -->
      <b>1. ชื่อเสนอโครงงาน </b>
      <h1>&emsp;&emsp;{project.project_name_th} &emsp; (ไทย)</h1>
      <h1>&emsp;&emsp;{project.project_name_en} &emsp; (อังกฤษ)</h1>
      <b>2. ชื่อผู้เสนอโครงงาน </b>
      {#each project.members as member}
        <h1>&emsp;&emsp;{member}</h1>
      {/each}
      <b>3. อาจารย์ที่ปรึกษาโครงงาน </b>
      {#each project.adviser as advisor}
        <h1>&emsp;&emsp;{advisor}</h1>
      {/each}
      {#if project.External_consultant != ""}
        <h1>&emsp;&emsp;{project.External_consultant} (ที่ปรึกษาภายนอก)</h1>
      {/if}
      <p class="mt-2"><b>4. ที่มาและความสำคัญของปัญหา </b></p>
      <p style="white-space: pre-wrap;">{project.project_problem}</p>
      <p class="mt-2"><b>5. วัตถุประสงค์ของโครงงาน </b></p>
      <p style="white-space: pre-wrap;">{project.project_Objective}</p>
      <p class="mt-2"><b>6. เอกสาร งานวิจัยที่เกี่ยวข้อง </b></p>
      <p style="white-space: pre-wrap;">{project.research_data}</p>
      <p class="mt-2"><b>7. ทฤษฎีและหลักการ </b></p>
      <p style="white-space: pre-wrap;">{project.Theory_principles}</p>
      <div class="grid grid-cols-2">
        {#each project.images as imageUrl}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
          <!-- svelte-ignore a11y_img_redundant_alt -->
          <div>
            <img
              src={imageUrl.url}
              alt="Image"
              class="h-40 w-auto mb-2 cursor-pointer hover:opacity-80 transition-opacity"
              on:click={() => openImageModal(imageUrl)}
            />
            <p>{imageUrl.title}</p>
          </div>
        {/each}
      </div>
      <p class="mt-2"><b>8. ขอบเขต </b></p>
      <p style="white-space: pre-wrap;">{project.scope}</p>

      {#if (role === "admin" || email === project.email) && email != null}
        <div class="flex justify-around mt-5">
          <button
            class="md:absolute top-2 right-2 bg-amber-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
            on:click={goToEditPage}
          >
            แก้ไขข้อมูล
          </button>
          <button
            class="md:absolute top-14 right-2 bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
            on:click={() => deleteProject(data.id)}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "ลบข้อมูล"}
          </button>
        </div>
      {/if}
      {#if project.Method_of_operation != null}
      <div class="max-w-5xl mx-auto py-4">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse border border-gray-300">
            <thead>
              <tr class="bg-gray-100">
                <th class="border border-gray-300 p-2 w-1/4">กิจกรรม</th>
                <th
                  class="border border-gray-300 p-2"
                  colspan={project.Method_of_operation.monthLabels.length + 1}
                >
                  <div class="flex items-center justify-between px-2">
                    <p class="flex-1 p-1 text-center bg-transparent">
                      {project.Method_of_operation.tableTitle}
                    </p>
                  </div>
                </th>
              </tr>
              <tr class="bg-gray-50">
                <th class="border border-gray-300 p-2"></th>
                {#each project.Method_of_operation.monthLabels as month, i}
                  <th class="border border-gray-300 p-2">
                    <div class="flex items-center justify-between">
                      <p class="w-full p-1 text-center bg-transparent">
                        {project.Method_of_operation.monthLabels[i]}
                      </p>
                    </div>
                  </th>
                {/each}
              </tr>
            </thead>
            <tbody class="bg-white">
              {#each project.Method_of_operation.activities as activity (activity.id)}
                <tr>
                  <td class="border border-gray-300 p-2">
                    <div class="flex items-center space-x-2">
                        
                      <p class="w-full p-1 rounded">
                        {activity.name}
                      </p>
                    </div>
                  </td>
                  {#each project.Method_of_operation.monthLabels as month}
                    <td
                      class="border border-gray-300 p-2 text-center"
                      style:background-color={activity.months[month]
                        ? activity.color
                        : "transparent"}
                    >
                    </td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
      {/if}
    </div>

    <Process project={project} isLoading={isLoading} can_edit={can_edit} Task={Task} isLoadingtext={isLoadingtext} visibleStates={visibleStates} status={status} data={data} db={db} comment={comment} role={role}/>
  </div>
{:else}
  <Loading />
{/if}

<!-- Add Modal component at the bottom of your template -->
{#if showModal && selectedImage}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    on:click={() => (showModal = false)}
  >
    <div class="relative max-w-4xl max-h-[90vh] overflow-auto">
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <img
        src={selectedImage.url}
        alt={selectedImage.title}
        class="max-w-full max-h-[85vh] object-contain bg-white p-2"
        on:click|stopPropagation={() => {}}
      />
      <button
        type="button"
        class="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600"
        on:click={() => (showModal = false)}
      >
        ✕
      </button>
      <p class="text-white text-center mt-2">{selectedImage.title}</p>
    </div>
  </div>
{/if}

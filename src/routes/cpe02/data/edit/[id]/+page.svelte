<script>
  // @ts-ignore
  export let data;

  import { onMount } from "svelte";
  import { doc, setDoc ,getDoc} from "firebase/firestore"; // ใช้ setDoc หรือ updateDoc
  import { db, storage } from "$lib/firebase.js";
  import { checkAuthStatus } from "$lib/auth";
  import { getCookie } from "cookies-next";
  import { goto } from "$app/navigation";
  import {
    ref,
    deleteObject,
    uploadBytes,
    getDownloadURL,
  } from "firebase/storage";
  import Loading from "$lib/loading.svelte";
  import { warningToast ,successToast, dangerToast} from "$lib/customtoast";

  // @ts-ignore
  let project = null;
  let isNotFound = false;
  let isLoading = false;
  let email = "";
  let role = "";
  // @ts-ignore
  let members = [""]; // ตัวแปรสำหรับเก็บสมาชิกที่เพิ่มเข้ามา
  let selectedFiles = [];
  let previewUrls = [];
  let imageDescriptions = [];
  let isUploading = false;
  let fileInput;

  onMount(async () => {
  try {
    // ตรวจสอบสถานะการล็อกอิน
    const isUserLoggedIn = await checkAuthStatus();

    if (isUserLoggedIn) {
      // ดึงข้อมูล email และ role จาก cookies
      email = getCookie("email");
      role = getCookie("role");
    } else {
      warningToast("ผู้ใช้ไม่ได้เข้าสู่ระบบ กำลังเปลี่ยนเส้นทางไปเข้าสู่ระบบ...");
      goto("/login");
      return;
    }

    // ดึงข้อมูลโปรเจกต์จาก Firestore
    try {
      const projectDoc = await getDoc(doc(db, "project-approve", data.id));
      if (projectDoc.exists()) {
        project = projectDoc.data();
        //console.log("Project data fetched successfully:", project);
      } else {
        console.error("Project not found in Firestore.");
        isNotFound = true;
        return;
      }
    } catch (error) {
      console.error("Error fetching project data from Firestore:", error);
      return;
    }

    // ตรวจสอบสิทธิ์การเข้าถึง
    if (role !== "admin") {
      if (email !== project.email || !email) {
        console.log("Access denied. Redirecting to restricted page...");
        goto("../../hacker_exe");
        return;
      }
    }
  } catch (error) {
    console.error("Error during onMount process:", error);
  }
});


  function addMemberRow() {
    // @ts-ignore
    project.members = [...project.members, ""]; // เพิ่มสมาชิกใหม่ใน array
  }

  // ฟังก์ชันในการลบแถวล่างสุด
  function deleteLastMember() {
    // @ts-ignore
    if (project.members.length > 1) {
      // @ts-ignore
      project.members = project.members.slice(0, -1); // ลบสมาชิกแถวสุดท้าย
    }
  }

  // Modify your existing handleSubmit function
  async function handleSubmit(event) {
    event.preventDefault();
    isLoading = true;

    try {
      // Upload images first if there are any
      if (selectedFiles.length > 0) {
        const uploadSuccess = await uploadImages();
        if (!uploadSuccess) {
          throw new Error("Image upload failed");
        }
      }

      // Your existing Firestore update code
      const docRef = doc(db, "project-approve", data.id);
      const updatedTasks = { ...project.Tasks };
      Object.keys(updatedTasks).forEach((key) => {
        if (updatedTasks[key].status !== "approve") {
          updatedTasks[key].status = "wait";
        }
      });

      const updatedProject = {
        ...project,
        Tasks: updatedTasks,
      };

      await setDoc(docRef, updatedProject);
      successToast("แก้ไขข้อมูลเรียบร้อยแล้ว!");
      goto("../")
    } catch (error) {
      console.error("Error updating document: ", error);
      dangerToast("เกิดข้อผิดพลาดในการอัปเดตข้อมูล " + error);
    } finally {
      isLoading = false;
    }

  }

  function handleTab(event, bindVariableSetter) {
    if (event.key === "Tab") {
      event.preventDefault();
      const textarea = event.target;
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;

      // เพิ่ม Tab ที่ตำแหน่งที่กำลังพิมพ์
      textarea.value =
        textarea.value.substring(0, start) +
        "\t" +
        textarea.value.substring(end);

      // ปรับตำแหน่ง cursor
      textarea.selectionStart = textarea.selectionEnd = start + 1;

      // อัปเดตค่าของตัวแปรที่ส่งมา
      bindVariableSetter(textarea.value);
    }
  }

  async function deleteImage(imageUrl, index) {
    // แสดงกล่องยืนยันก่อนลบ
    const confirmDelete = window.confirm("คุณต้องการลบรูปภาพนี้จริงๆ หรือไม่?");
    if (!confirmDelete) {
      return; // ถ้าผู้ใช้ยกเลิกการลบ ให้หยุดการทำงาน
    }

    try {
      // สร้าง reference ไปยังรูปภาพใน Firebase Storage
      const imageRef = ref(storage, imageUrl.url);

      // ลบรูปภาพจาก Firebase Storage
      await deleteObject(imageRef);

      // ลบรูปภาพจาก array ของ images
      project.images = project.images.filter((_, i) => i !== index);

      // อัปเดตเอกสารของโปรเจกต์ใน Firestore
      const docRef = doc(db, "project-approve", data.id);
      await setDoc(docRef, project);

      successToast("ลบรูปภาพเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Error deleting image:", error);
      dangerToast("เกิดข้อผิดพลาดในการลบรูปภาพ " +error);
    }
  }

  function handleFileSelect(event) {
    fileInput = event.target;
    const files = Array.from(event.target.files);
    selectedFiles = [...selectedFiles, ...files];

    // Generate previews for new files
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previewUrls = [...previewUrls, reader.result];
        imageDescriptions = [...imageDescriptions, ""];
      };
      reader.readAsDataURL(file);
    });
  }

  function removePreview(index) {
    selectedFiles = selectedFiles.filter((_, i) => i !== index);
    previewUrls = previewUrls.filter((_, i) => i !== index);
    imageDescriptions = imageDescriptions.filter((_, i) => i !== index);

    if (imagePreviews.length === 0 && fileInput) {
        fileInput.value = '';
    }
  }

  async function uploadImages() {
    isUploading = true;
    const uploadPromises = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const description = imageDescriptions[i];

      // Create a unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `project-images/${filename}`);

      // Create upload promise
      const uploadPromise = uploadBytes(storageRef, file)
        .then((snapshot) => getDownloadURL(snapshot.ref))
        .then((url) => ({
          url: url,
          title: description || "No description",
        }));

      uploadPromises.push(uploadPromise);
    }

    try {
      const uploadedImages = await Promise.all(uploadPromises);
      // Add new images to existing project images
      project.images = [...(project.images || []), ...uploadedImages];

      // Clear the upload queue
      selectedFiles = [];
      previewUrls = [];
      imageDescriptions = [];

      return true;
    } catch (error) {
      console.error("Error uploading images:", error);
      dangerToast('เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ' + error)
      return false;
    } finally {
      isUploading = false;
    }
  }
</script>

<div>
  {#if isNotFound}
    <h1>404 - Project Not Found</h1>
  {:else if project}
    <div class="m-5">
      <a href="/" class="hover:underline">หน้าแรก</a> >
      <a href="/cpe02" class="hover:underline">แบบเสนอโครงงาน</a>
      > <a href="/cpe02/data" class="hover:underline">ข้อมูลแบบเสนอโครงงาน</a> >
      <b>{project.project_name_th} (Edit)</b>
    </div>
    <!-- ตรวจสอบว่า projectData มีข้อมูล -->

    <div class="md:m-5 md:p-5 flex justify-center items-center">
      <form
        class="shadow-lg p-5 md:rounded-lg md:w-8/12 bg-gray-200"
        on:submit={handleSubmit}
      >
        <h1 class="text-lg font-bold">แก้ไขข้อมูล</h1>

        <div class="p-5">
          <!--===============================================-->

          <label for="name" class="block text-lg font-medium">ภาคเรียน <b class="text-red-500">*</b></label>
          <input
            id="dropdown"
            name="term"
            class="p-2 w-4/12"
            required
            disabled
            bind:value={project.term}
          />

          <!--===============================================-->

          <label for="text" class="block text-lg font-medium mt-3"
            >ชื่อโครงงาน (ภาษาไทย) <b class="text-red-500">*</b></label
          >
          <input
            type="text"
            placeholder="ชื่อโครงงาน"
            name="project_name"
            required
            class="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            bind:value={project.project_name_th}
          />

          <!--===============================================-->

          <label for="text" class="block text-lg font-medium mt-3"
            >ชื่อโครงงาน (ภาษาอังกฤษ) <b class="text-red-500">*</b></label
          >
          <input
            type="text"
            placeholder="Name Project"
            required
            class="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            bind:value={project.project_name_en}
          />

          <!--===============================================-->
          <label for="text" class="block text-lg font-medium mt-3"
            >ชื่อผู้เสนอโครงงาน <b class="text-red-500">*</b>
          </label>
          <button
            type="button"
            class="bg-white p-1 m-2 rounded"
            on:click={addMemberRow}>เพิ่มสมาชิก</button
          >
          <button
            type="button"
            on:click={deleteLastMember}
            class="bg-red-500 text-white p-1 m-2 rounded"
          >
            ลบสมาชิก
          </button>
          <div class="input-row grid md:grid-cols-2 gap-4">
            {#each project.members as member, index}
              <input
                type="text"
                bind:value={project.members[index]}
                placeholder="Member Name"
                required
                class="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 m-1"
              />
            {/each}
          </div>

          <!--===============================================-->

          
      <label for="adviser" class="block text-lg font-medium mt-3">
        อาจารย์ที่ปรึกษาโครงงาน <b class="text-red-500">*</b>
      </label>
      <div class="h-48 overflow-y-auto border rounded-md p-2 mt-2 bg-white">
        <div class="space-y-2">
          <div class="flex items-center">
            <input type="checkbox" id="adviser1" bind:group={project.adviser} value="ผู้ช่วยศาสตราจารย์ อนันท์ ทับเกิด" class="w-4 h-4">
            <label for="adviser1" class="ml-2">ผู้ช่วยศาสตราจารย์ อนันท์ ทับเกิด</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="adviser2" bind:group={project.adviser} value="นายกิตตินันท์ น้อยมณี" class="w-4 h-4">
            <label for="adviser2" class="ml-2">นายกิตตินันท์ น้อยมณี</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="adviser3" bind:group={project.adviser} value="ผู้ช่วยศาสตราจารย์ ขวัญชัย เอื้อวิริยานุกูล" class="w-4 h-4">
            <label for="adviser3" class="ml-2">ผู้ช่วยศาสตราจารย์ ขวัญชัย เอื้อวิริยานุกูล</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="adviser4" bind:group={project.adviser} value="นายจักรภพ ใหม่เสน" class="w-4 h-4">
            <label for="adviser4" class="ml-2">นายจักรภพ ใหม่เสน</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="adviser5" bind:group={project.adviser} value="นายณัฐชาสิทธิ์ ชูเกียรติขจร" class="w-4 h-4">
            <label for="adviser5" class="ml-2">นายณัฐชาสิทธิ์ ชูเกียรติขจร</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="adviser6" bind:group={project.adviser} value="นายปณต พุกกะพันธุ์" class="w-4 h-4">
            <label for="adviser6" class="ml-2">นายปณต พุกกะพันธุ์</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="adviser7" bind:group={project.adviser} value="นายปิยพล ยืนยงสถาวร" class="w-4 h-4">
            <label for="adviser7" class="ml-2">นายปิยพล ยืนยงสถาวร</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="adviser8" bind:group={project.adviser} value="นายพิชิต ทนันชัย" class="w-4 h-4">
            <label for="adviser8" class="ml-2">นายพิชิต ทนันชัย</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="adviser9" bind:group={project.adviser} value="นางสาวยุพดี หัตถสิน" class="w-4 h-4">
            <label for="adviser9" class="ml-2">นางสาวยุพดี หัตถสิน</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="adviser10" bind:group={project.adviser} value="นายสมนึก สุระธง" class="w-4 h-4">
            <label for="adviser10" class="ml-2">นายสมนึก สุระธง</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="adviser11" bind:group={project.adviser} value="นายภาณุเดช ทิพย์อักษร" class="w-4 h-4">
            <label for="adviser11" class="ml-2">นายภาณุเดช ทิพย์อักษร</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="adviser12" bind:group={project.adviser} value="นายอนุพงศ์ ไพโรจน์" class="w-4 h-4">
            <label for="adviser12" class="ml-2">นายอนุพงศ์ ไพโรจน์</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="adviser13" bind:group={project.adviser} value="นายอรรถพล วิเวก" class="w-4 h-4">
            <label for="adviser13" class="ml-2">นายอรรถพล วิเวก</label>
          </div>
        </div>
      </div>
          <!--===============================================-->

          <label for="email" class="block text-lg font-medium mt-3"
            >ที่ปรึกษาภายนอก (ถ้ามี)
          </label>
          <input
            type="text"
            placeholder="ไม่บังคับ"
            class="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            bind:value={project.External_consultant}
          />

          <label for="text" class="block text-lg font-medium mt-3"
            >4. ที่มาและความสำคัญของปัญหา <b class="text-red-500">*</b>
          </label>

          <textarea
            id="editor"
            name="w3review"
            rows="10"
            cols="50"
            class="w-full p-2"
            required
            bind:value={project.project_problem}
            on:keydown={(event) =>
              handleTab(event, (value) => (project.project_problem = value))}
            placeholder="เขียนที่มาและความสำคัญของปัญหา..."
          ></textarea>

          <label for="text" class="block text-lg font-medium mt-3"
            >5. วัตถุประสงค์ของโครงงาน
          </label>

          <textarea
            id="editor"
            name="w3review"
            rows="7"
            cols="50"
            class="w-full p-2"
            bind:value={project.project_Objective}
            on:keydown={(event) =>
              handleTab(event, (value) => (project.project_Objective = value))}
            placeholder="วัตถุประสงค์ของโครงงาน"
          ></textarea>

          <label for="text" class="block text-lg font-medium mt-3"
            >6. เอกสาร งานวิจัยที่เกี่ยวข้อง
          </label>
          <textarea
            id="editor"
            name="w3review"
            rows="10"
            cols="50"
            class="w-full p-2"
            bind:value={project.research_data}
            on:keydown={(event) =>
              handleTab(event, (value) => (project.research_data = value))}
            placeholder="งานวิจัยที่เกี่ยวข้อง"
          ></textarea>

          <label for="text" class="block text-lg font-medium mt-3"
            >7. ทฤษฎีและหลักการ <b class="text-red-500">*</b>
          </label>
          <textarea
            id="editor"
            name="w3review"
            rows="10"
            cols="50"
            class="w-full p-2"
            required
            bind:value={project.Theory_principles}
            on:keydown={(event) =>
              handleTab(event, (value) => (project.Theory_principles = value))}
            placeholder="งานวิจัยที่เกี่ยวข้อง"
          ></textarea>

          <div class="mt-5">
            <label for="images" class="block text-lg font-medium"
              >เพิ่มรูปภาพ (ไม่เกิน 2MB)</label
            >
            <input
              type="file"
              id="images"
              accept="image/*"
              multiple
              on:change={handleFileSelect}
              class="p-2 border border-gray-300 rounded w-full"
            />

            <!-- Preview section -->
            {#if previewUrls.length > 0}
              <div class="grid grid-cols-2 gap-4 mt-4">
                {#each previewUrls as preview, index}
                  <div class="border p-4 rounded">
                    <img
                      src={preview}
                      alt="Preview"
                      class="h-40 w-auto mx-auto mb-2"
                    />
                    <input
                      type="text"
                      bind:value={imageDescriptions[index]}
                      placeholder="รายละเอียดรูปภาพ..."
                      class="w-full p-2 border rounded mb-2"
                    />
                    <button
                      type="button"
                      class="bg-red-500 hover:bg-red-600 text-white px-7 py-1"
                      on:click={() => removePreview(index)}
                    >
                      ลบ
                    </button>
                  </div>
                {/each}
              </div>
            {/if}
          </div>

          <!--===================-->
          <label for="" class="block text-lg font-medium mt-2"
            >รูปภาพเดิม</label
          >
          <div class="grid grid-cols-2">
            {#each project.images as imageUrl, index}
              <div class="image-item mt-2">
                <img src={imageUrl.url} alt={imageUrl.title} class="h-40" />
                <label class=" mt-2">รายละเอียด :</label>
                <input
                  type="text"
                  bind:value={imageUrl.title}
                  placeholder="รายละเอียดรูปภาพ..."
                  class="w-full p-2 border rounded mb-2"
                />
                <button
                  type="button"
                  class="bg-red-500 hover:bg-red-600 text-white px-7 p-1 shadow-md"
                  on:click={() => deleteImage(imageUrl, index)}
                >
                  ลบ
                </button>
              </div>
              <!-- Delete button -->
            {/each}
          </div>

          <label for="text" class="block text-lg font-medium mt-3"
            >8. ขอบเขต <b class="text-red-500">*</b>
          </label>
          <textarea
            id="editor"
            name="w3review"
            rows="10"
            cols="50"
            class="w-full p-2"
            required
            bind:value={project.scope}
            on:keydown={(event) =>
              handleTab(event, (value) => (project.scope = value))}
            placeholder="งานวิจัยที่เกี่ยวข้อง"
          ></textarea>
        </div>
        <!--===============================================-->

        <div class="p-5 text-center">
          <button
            type="submit"
            class="rounded bg-amber-500 hover:bg-amber-700 text-white px-6 py-2 shadow-md w-full"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "แก้ไขข้อมูล"}
          </button>
        </div>

        <!--===============================================-->
      </form>
    </div>
  {:else}
    <Loading />
  {/if}
</div>

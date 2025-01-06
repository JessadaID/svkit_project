<script>
  import { db, storage } from "$lib/firebase";
  import { collection, addDoc } from "firebase/firestore";
  import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { getCookie } from "cookies-next/client";
  import { checkLoginStatus } from "../../../auth";

  let term = ""; //เทอม
  let project_name_th = ""; //ชื่อโปรเจค ไทย
  let project_name_en = ""; //ชื่อโปรเจค eng
  let adviser = [""]; // ที่ปรึกษา
  let project_problem = ""; //4.	ที่มาและความสำคัญของปัญหา
  let status = "";
  let email = "";
  let isLoading = false;
  let External_consultant = ""; // ที่ปรึกษาภายนอก
  let Tasks = {}; //comment advisor
  let scope = "";
  let project_Objective = ""; //5.	วัตถุประสงค์ของโครงงาน
  let research_data = ""; //งานวิจัยที่เกี่ยวข้อง
  let Theory_principles = ""; //7.	ทฤษฎีและหลักการ

  let selectedFiles = [];
  let imagePreviews = [];
  let uploadedImageUrls = []; // เพิ่มตัวแปรสำหรับเก็บ URL ที่อัพโหลดแล้ว
  let fileInput;

  onMount(async () => {
    const isUserLoggedIn = await checkLoginStatus(); // รอผลลัพธ์จาก checkLoginStatus

    if (isUserLoggedIn) {
      email = getCookie("email"); // หรือใช้ cookies ถ้าต้องการ
      //console.log('User is logged in, Email:', email);
    } else {
      console.log("User not logged in. Redirecting to login...");
      // ถ้าไม่ได้ล็อกอิน เปลี่ยนเส้นทางไปหน้า Login
      goto("/login");
    }
  });

  let members = [""]; // ตัวแปรสำหรับเก็บสมาชิกที่เพิ่มเข้ามา

  function addMemberRow() {
    members = [...members, ""]; // เพิ่มสมาชิกใหม่ใน array
  }

  // ฟังก์ชันในการลบแถวล่างสุด
  function deleteLastMember() {
    if (members.length > 1) {
      members = members.slice(0, -1); // ลบสมาชิกแถวสุดท้าย
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

  async function handleSubmit(event) {
    event.preventDefault();
    isLoading = true;

    try {
      // อัพโหลดรูปภาพก่อน
      const imageUrls = await uploadImages();

      status = "wait";
      // เพิ่มข้อมูลไปยัง Firestore พร้อมกับ URL ของรูปภาพ
      const docRef = await addDoc(collection(db, "project-approve"), {
        term,
        project_name_th,
        project_name_en,
        members,
        adviser,
        project_problem,
        status,
        email,
        External_consultant,
        Tasks,
        project_Objective,
        research_data,
        Theory_principles,
        images: imageUrls,// เพิ่ม array ของ URL รูปภาพ
        scope, 
      });

      alert(`เพิ่มข้อมูลสำเร็จ!`);
      // รีเซ็ตฟอร์ม
      term = "";
      project_name_th = "";
      project_name_en = "";
      members = [];
      adviser = [];
      project_problem = "";
      status = "";
      External_consultant = "";
      project_Objective = "";
      research_data = "";
      Theory_principles = "";
      selectedFiles = [];
      imagePreviews = [];
      scope = "";
      goto("../cpe02")
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      isLoading = false;
    }
  }

  function handleFileSelect(event) {
    fileInput = event.target;
    const files = Array.from(event.target.files);

    // รีเซ็ตอาเรย์เก่า
    selectedFiles = [];
    imagePreviews = [];

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        selectedFiles = [...selectedFiles, file];

        const reader = new FileReader();
        reader.onload = (e) => {
          imagePreviews = [
            ...imagePreviews,
            {
              url: e.target.result,
              name: file.name,
              size: (file.size / 1024 / 1024).toFixed(2),
              originalFile: file, // เก็บไฟล์ต้นฉบับไว้
              title: "", // เพิ่ม title สำหรับแต่ละรูป
            },
          ];
        };
        reader.readAsDataURL(file);
      }
    });
  }

  function removeImage(index) {
    imagePreviews = imagePreviews.filter((_, i) => i !== index);
    selectedFiles = selectedFiles.filter((_, i) => i !== index);
    
    // Clear the file input if all images are removed
    if (imagePreviews.length === 0 && fileInput) {
        fileInput.value = '';
    }
}
  async function uploadImages() {
  const urls = [];
  const MAX_SIZE_MB = 2; // จำกัดขนาดไฟล์ไม่เกิน 2MB
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024; // แปลงเป็นไบต์

  for (let preview of imagePreviews) {
    const file = preview.originalFile;
    
    // ตรวจสอบขนาดไฟล์ก่อนการอัปโหลด
    if (file.size > MAX_SIZE_BYTES) {
      alert(`ไฟล์ "${file.name}" มีขนาดเกิน 2MB และไม่สามารถอัปโหลดได้`);
      continue; // ข้ามไฟล์ที่ขนาดเกิน 2MB
    }

    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`; // สร้างชื่อไฟล์ด้วย timestamp

    // สร้าง reference ใน storage
    const storageRef = ref(storage, `project-images/${fileName}`);

    try {
      // อัปโหลดไฟล์ไปยัง Firebase Storage
      await uploadBytes(storageRef, file);

      // ดึง URL ของไฟล์ที่อัปโหลด
      const downloadURL = await getDownloadURL(storageRef);
      urls.push({
        url: downloadURL,
        name: fileName,
        title: preview.title || "ไม่มีคำอธิบาย",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  return urls;
}
</script>

<div class="m-5">
  <a href="/" class="hover:underline">หน้าแรก</a> >
  <a href="/cpe02" class="hover:underline">แบบเสนอโครงงาน</a>
  > <b>กรอกแบบฟรอม</b>
</div>

<div class="md:m-5 md:p-5 flex justify-center items-center">
  <form
    on:submit={handleSubmit}
    class="shadow-lg p-5 md:rounded-lg md:w-8/12 bg-gray-200"
  >
    <div class="p-5">
      <!--===============================================-->

      <label for="name" class="block text-lg font-medium">ภาคเรียน <b class="text-red-500">*</b></label>
      <select
        id="dropdown"
        name="term"
        class="p-2 w-4/12"
        bind:value={term}
        required
      >
        <option value="2/2567" selected>2/2567</option>
        <option value="1/2568">1/2568</option>
        <option value="2/2568">2/2568</option>
      </select>

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
        bind:value={project_name_th}
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
        bind:value={project_name_en}
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
        {#each members as member, index}
          <input
            type="text"
            bind:value={members[index]}
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
            <input type="checkbox" id="adviser1" bind:group={adviser} value="ผู้ช่วยศาสตราจารย์ อนันท์ ทับเกิด" class="w-4 h-4">
            <label for="adviser1" class="ml-2">ผู้ช่วยศาสตราจารย์ อนันท์ ทับเกิด</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="adviser2" bind:group={adviser} value="นายกิตตินันท์ น้อยมณี" class="w-4 h-4">
            <label for="adviser2" class="ml-2">นายกิตตินันท์ น้อยมณี</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="adviser3" bind:group={adviser} value="ผู้ช่วยศาสตราจารย์ ขวัญชัย เอื้อวิริยานุกูล" class="w-4 h-4">
            <label for="adviser3" class="ml-2">ผู้ช่วยศาสตราจารย์ ขวัญชัย เอื้อวิริยานุกูล</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="adviser4" bind:group={adviser} value="นายจักรภพ ใหม่เสน" class="w-4 h-4">
            <label for="adviser4" class="ml-2">นายจักรภพ ใหม่เสน</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="adviser5" bind:group={adviser} value="นายณัฐชาสิทธิ์ ชูเกียรติขจร" class="w-4 h-4">
            <label for="adviser5" class="ml-2">นายณัฐชาสิทธิ์ ชูเกียรติขจร</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="adviser6" bind:group={adviser} value="นายปณต พุกกะพันธุ์" class="w-4 h-4">
            <label for="adviser6" class="ml-2">นายปณต พุกกะพันธุ์</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="adviser7" bind:group={adviser} value="นายปิยพล ยืนยงสถาวร" class="w-4 h-4">
            <label for="adviser7" class="ml-2">นายปิยพล ยืนยงสถาวร</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="adviser8" bind:group={adviser} value="นายพิชิต ทนันชัย" class="w-4 h-4">
            <label for="adviser8" class="ml-2">นายพิชิต ทนันชัย</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="adviser9" bind:group={adviser} value="นางสาวยุพดี หัตถสิน" class="w-4 h-4">
            <label for="adviser9" class="ml-2">นางสาวยุพดี หัตถสิน</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="adviser10" bind:group={adviser} value="นายสมนึก สุระธง" class="w-4 h-4">
            <label for="adviser10" class="ml-2">นายสมนึก สุระธง</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="adviser11" bind:group={adviser} value="นายภาณุเดช ทิพย์อักษร" class="w-4 h-4">
            <label for="adviser11" class="ml-2">นายภาณุเดช ทิพย์อักษร</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="adviser12" bind:group={adviser} value="นายอนุพงศ์ ไพโรจน์" class="w-4 h-4">
            <label for="adviser12" class="ml-2">นายอนุพงศ์ ไพโรจน์</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="adviser13" bind:group={adviser} value="นายอรรถพล วิเวก" class="w-4 h-4">
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
        bind:value={External_consultant}
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
        bind:value={project_problem}
        on:keydown={(event) =>
          handleTab(event, (value) => (project_problem = value))}
        placeholder="เขียนที่มาและความสำคัญของปัญหา..."
      ></textarea>

      <label for="text" class="block text-lg font-medium mt-3"
        >5. วัตถุประสงค์ของโครงงาน <b class="text-red-500">*</b>
      </label>

      <textarea
        id="editor"
        name="w3review"
        rows="7"
        cols="50"
        required
        class="w-full p-2"
        bind:value={project_Objective}
        on:keydown={(event) =>
          handleTab(event, (value) => (project_Objective = value))}
        placeholder="วัตถุประสงค์ของโครงงาน"
      ></textarea>

      <label for="text" class="block text-lg font-medium mt-3"
        >6. เอกสาร งานวิจัยที่เกี่ยวข้อง <b class="text-red-500">*</b>
      </label>
      <textarea
        id="editor"
        name="w3review"
        rows="10"
        cols="50"
        required
        class="w-full p-2"
        bind:value={research_data}
        on:keydown={(event) =>
          handleTab(event, (value) => (research_data = value))}
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
        bind:value={Theory_principles}
        on:keydown={(event) =>
          handleTab(event, (value) => (Theory_principles = value))}
        placeholder="งานวิจัยที่เกี่ยวข้อง"
      ></textarea>

      <label class="block mt-2 text-sm font-medium" for="multiple_files"
        >อัพโหลดรูปภาพ (ห้ามเกิน 2MB) <b class="text-red-500">*</b></label
      >
      <input
        id="multiple_files"
        type="file"
        accept="image/*"
        multiple
        required
        class="relative m-0 block w-full min-w-0 flex-auto cursor-pointer rounded border border-solid-black border-secondary-500 bg-transparent bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-surface transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:me-3 file:cursor-pointer file:overflow-hidden file:rounded-none file:border-0 file:border-e file:border-solid file:border-inherit file:bg-transparent file:px-3 file:py-[0.32rem] file:text-surface focus:border-primary focus:text-gray-700 focus:shadow-inset focus:outline-none dark:border-black/70"
        on:change={handleFileSelect}
      />

      <div class="grid grid-cols-2">
        {#each imagePreviews as preview, index}
          <div class="image-item mt-3">
            <img src={preview.url} alt={preview.name} class="h-40" />
            <div class="image-info">
              <span>{preview.size} MB</span>
              <input
                type="text"
                placeholder="ใส่คำอธิบายรูปภาพ"
                class="w-full p-1 my-1 border rounded"
                bind:value={preview.title}
              />
              <button
                type="button"
                class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                on:click={() => removeImage(index)}
              >
                ลบ
              </button>
            </div>
          </div>
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
            bind:value={scope}
            on:keydown={(event) =>
              handleTab(event, (value) => (scope = value))}
            placeholder="งานวิจัยที่เกี่ยวข้อง"
          ></textarea>
    </div>
    <!--===============================================-->

    <div class="p-5 text-center">
      <button
        type="submit"
        class="rounded bg-blue-500 hover:bg-blue-700 text-white px-6 py-2 shadow-md w-full"
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "ส่งข้อมูล"}
      </button>
    </div>

    <!--===============================================-->
  </form>
</div>

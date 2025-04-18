<script>
  import { db, storage } from "$lib/firebase";
  import { collection, addDoc } from "firebase/firestore";
  import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { getCookie } from "cookies-next/client";
  import { checkAuthStatus } from "$lib/auth";
  import "./style.css";
  import Topic1_3 from "./topic1_3.svelte";
  import Topic4_5 from "./topic4_5.svelte";
  import Topic6_7 from "./topic6_7.svelte";
  import Topic8_9 from "./topic8_9.svelte";
  export let data; // รับค่าจาก `+page.js`

  let term = data.termId; // กำหนดค่า term จาก URL
  let project_name_th = ""; //ชื่อโปรเจค ไทย
  let project_name_en = ""; //ชื่อโปรเจค eng
  let adviser = [""]; // ที่ปรึกษา
  let project_problem = ""; //4.	ที่มาและความสำคัญของปัญหา
  let status = "";
  let email = "";
  let isLoading = false;
  let External_consultant = ""; // ที่ปรึกษาภายนอก
  let Tasks = {}; //comment advisor
  let scope = ""; //ขอบเขต
  let project_Objective = ""; //5.	วัตถุประสงค์ของโครงงาน
  let research_data = ""; //งานวิจัยที่เกี่ยวข้อง
  let Theory_principles = ""; //7.	ทฤษฎีและหลักการ
  let members = [""]; // ตัวแปรสำหรับเก็บสมาชิกที่เพิ่มเข้ามา
  let currentStep = 0;

  let selectedFiles = [];
  let imagePreviews = [];
  let uploadedImageUrls = []; // เพิ่มตัวแปรสำหรับเก็บ URL ที่อัพโหลดแล้ว
  let fileInput;

  let tableTitle = "เดือน / พ.ศ. 2566 - 2567";
  let monthLabels = ["กค", "สค", "กย", "ตค", "พย", "ธค", "มค", "กพ"];
  let activities = [
    {
      id: 1,
      name: "",
      months: Object.fromEntries(monthLabels.map((month) => [month, false])),
      color: "#11235A",
    },
  ];
  const steps = [
    { title: "ข้อมูลทั่วไป" },
    {
      title: "ปัญหาและวัตถุประสงค์",
    },
    { title: "ข้อมูลวิจัย" },
    { title: "ขอบเขตและแผนงาน" },
  ];

  function navigateStep(direction) {
    if (direction === "next" && currentStep < steps.length - 1) {
      if (validateStep()) {
        currentStep++;
      }
    } else if (direction === "prev" && currentStep > 0) {
      currentStep--;
    }
  }
  function validateStep() {
    switch (currentStep) {
      case 0:
        if (
          !project_name_th ||
          !project_name_en ||
          !term ||
          members.some((m) => !m) ||
          adviser.length === 0
        ) {
          alert("กรุณากรอกข้อมูลให้ครบถ้วน");
          return false;
        }
        break;
      case 1:
        if (!project_problem || !project_Objective) {
          alert("กรุณากรอกข้อมูลปัญหาและวัตถุประสงค์");
          return false;
        }
        break;
      case 2:
        if (!research_data || !Theory_principles || !fileInput) {
          alert("กรุณากรอกข้อมูลการวิจัยและทฤษฎี");
          return false;
        }
        break;
    }
    return true;
  }

  onMount(async () => {
    const isUserLoggedIn = await checkAuthStatus(); // รอผลลัพธ์จาก checkLoginStatus

    if (isUserLoggedIn) {
      email = getCookie("email"); // หรือใช้ cookies ถ้าต้องการ
      //console.log('User is logged in, Email:', email);
    } else {
      console.log("User not logged in. Redirecting to login...");
      // ถ้าไม่ได้ล็อกอิน เปลี่ยนเส้นทางไปหน้า Login
      goto("/login");
    }
  });

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
    if(checkAuthStatus()){
      isLoading = true;

    try {
      // อัพโหลดรูปภาพก่อน
      const imageUrls = await uploadImages();
      let Method_of_operation = {
        tableTitle,
        monthLabels,
        activities,
      };
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
        images: imageUrls, // เพิ่ม array ของ URL รูปภาพ
        scope,
        Method_of_operation,
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
      tableTitle = "";
      monthLabels = [];
      activities = [];
      goto("../../cpe02");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      isLoading = false;
    }
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
    on:submit|preventDefault={handleSubmit}
    class="shadow-lg p-5 md:rounded-lg md:w-8/12 bg-gray-200"
  >
    <!-- Progress Steps -->
    <nav aria-label="Progress" class="block md:hidden">
      <ol role="list" class="space-y-4">
        {#each steps as step, index}
          {#if currentStep === index}
            <li class="flex items-center justify-center py-2">
              <span
                class={`text-sm font-medium ${currentStep >= index ? "text-blue-600" : "text-gray-500"}`}
              >
                Step {index + 1}&nbsp;
              </span>
              <span class="text-sm font-medium text-blue-600">
                {step.title}
              </span>
            </li>
          {/if}
        {/each}
      </ol>
    </nav>

    <nav aria-label="Progress" class="hidden md:block">
      <ol role="list" class="space-y-4 md:flex md:space-y-0 md:space-x-8">
        {#each steps as step, index}
          <li class="md:flex-1">
            <div class="group flex flex-col py-2 pl-4 md:pb-0 md:pl-0 md:pt-4">
              <span
                class={`text-sm font-medium ${currentStep >= index ? "text-blue-600" : "text-gray-500"}`}
              >
                Step {index + 1}
              </span>
              <span class="text-sm font-medium">{step.title}</span>
            </div>
          </li>
        {/each}
      </ol>
    </nav>

    <!-- Progress Bar -->
    <div class="mt-4 mb-8">
      <div class="h-2 w-full bg-gray-200 rounded-full">
        <div
          class="h-2 bg-blue-600 rounded-full transition-all duration-500 ease-in-out"
          style="width: {((currentStep + 1) / steps.length) * 100}%"
        ></div>
      </div>
    </div>

    <!-- Form Content -->
    <div class="p-5">
      {#if currentStep === 0}
        <Topic1_3
          bind:term
          bind:project_name_th
          bind:project_name_en
          bind:members
          bind:adviser
          bind:External_consultant
        />
      {:else if currentStep === 1}
        <Topic4_5 bind:project_problem bind:project_Objective {handleTab} />
      {:else if currentStep === 2}
        <Topic6_7
          bind:research_data
          bind:Theory_principles
          bind:imagePreviews
          bind:selectedFiles
          bind:fileInput
          {handleTab}
        />
      {:else if currentStep === 3}
        <Topic8_9
          bind:scope
          {handleTab}
          bind:tableTitle
          bind:monthLabels
          bind:activities
        />
      {/if}
    </div>

    <!-- Navigation Buttons -->
    <div class="p-5 flex justify-between">
      <button
        type="button"
        class={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 
                    ${currentStep === 0 ? "invisible" : "visible bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500"}`}
        on:click={() => navigateStep("prev")}
        disabled={currentStep === 0}
      >
        ย้อนกลับ
      </button>

      <button
        type={currentStep === steps.length - 1 ? "submit" : "button"}
        class="px-4 py-2 rounded-md text-sm font-medium text-white
                    bg-blue-600 hover:bg-blue-700
                    focus:outline-none focus:ring-2 focus:ring-offset-2"
        on:click={() => currentStep < steps.length - 1 && navigateStep("next")}
        disabled={isLoading}
      >
        {#if currentStep === steps.length - 1}
          {isLoading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
        {:else}
          ถัดไป
        {/if}
      </button>
    </div>
  </form>
</div>
<div class="custom-shape-divider-bottom-1737391877">
  <svg
    data-name="Layer 1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1200 120"
    preserveAspectRatio="none"
  >
    <path d="M1200 120L0 16.48 0 0 1200 0 1200 120z" class="shape-fill"></path>
  </svg>
</div>

<style>
  .custom-shape-divider-bottom-1737391877 {
    position: fixed; /* เปลี่ยนจาก absolute เป็น fixed */
    bottom: 0;
    left: 0;
    width: 100%;
    overflow: hidden;
    line-height: 0;
    transform: rotate(180deg);
    z-index: -1; /* เพิ่ม z-index เพื่อให้อยู่ด้านหลังเนื้อหา */
  }

  .custom-shape-divider-bottom-1737391877 svg {
    position: relative;
    display: block;
    width: calc(300% + 1.3px);
    height: 369px;
    transform: rotateY(180deg);
  }

  .custom-shape-divider-bottom-1737391877 .shape-fill {
    fill: #ff8585;
  }
</style>

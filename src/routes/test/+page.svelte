<script>
  import { onMount } from "svelte";
  import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
  } from "firebase/storage";
  import { storage } from "$lib/firebase"; // ไฟล์ตั้งค่า Firebase
  import { toast } from "@zerodevx/svelte-toast";
  import Calendar from "../TS_Dashboard/AppointmentDetail/[id]/Calendar.svelte";


  let savedContent = '<h1>หัวข้อที่บันทึกไว้</h1><p>ข้อความที่บันทึกไว้</p>';
  let editor;
  let content = "";
  let selectedDates = [];
  let selectedRange = { start: null, end: null };
  let savedSelections = [];
  let selectionMode = 'single'; // เริ่มต้นด้วยโหมดเลือกวันเดียว
  
  function handleSave(event) {
    const { savedSelections, currentSelection } = event.detail;
    console.log('บันทึกการเลือก:', currentSelection);
    console.log('การเลือกทั้งหมดที่บันทึก:', savedSelections);
    
    // ทำอะไรกับข้อมูลตามต้องการ เช่น บันทึกลงฐานข้อมูล
  }
  // อัปโหลดรูปไปยัง Firebase Storage
  async function uploadImage(file) {
    const now = new Date();
    const timestamp = now.getTime(); // Get current timestamp
    const uniqueFileName = `${timestamp}-${file.name}`; // Add timestamp to filename

    const storageRef = ref(storage, `temp/${uniqueFileName}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }

  // เพิ่ม custom handler ให้ Quill.js สำหรับอัปโหลดรูป
  function imageHandler() {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        // Check file size
        const maxSize = 2 * 1024 * 1024; // 2MB in bytes
        if (file.size > maxSize) {
          toast.push("ขนาดไฟล์รูปภาพต้องไม่เกิน 2MB", {
            theme: {
              "--toastBackground": "red",
              "--toastColor": "white",
              "--toastBarBackground": "white",
            },
          });
          return;
        }
        const imageUrl = await uploadImage(file);
        const range = editor.getSelection();
        editor.insertEmbed(range.index, "image", imageUrl);
      }
    };
  }

  onMount(() => {
    // The Quill and image resize modules are now loaded from CDN in the <svelte:head> section
    // We need to ensure they're loaded before using them
    if (window.Quill) {
      // Register the ImageResize module with Quill
      window.Quill.register("modules/imageResize", window.ImageResize.default);

      Quill.register(
        {
          "modules/table-better": QuillTableBetter,
        },
        true
      );

      editor = new window.Quill("#editor-container", {
        theme: "snow",
        modules: {
          toolbar: {
            container: [
              ["bold", "italic", "underline"],
              [{ header: [1, 2, false] }],
              ["image"], // ปุ่มใส่รูปภาพ
              [{ align: [] }],
            ],
            handlers: {
              image: imageHandler, // ใช้ custom function
            },
          },
          imageResize: {},
          "table-better": {
            cellMenu: [],
          },
        },
      });

      editor.on("text-change", () => {
        content = editor.root.innerHTML;
      });

      editor.root.innerHTML = savedContent;
    } else {
      console.error("Quill not loaded correctly from CDN");
    }
  });

  function logContent() {
    console.log(content);
  }
</script>

<svelte:head>
  <!-- Quill CSS from CDN -->
  <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet" />

  <!-- Quill JS from CDN -->
  <script src="https://cdn.quilljs.com/1.3.6/quill.min.js"></script>

  <!-- Quill Image Resize Module from CDN -->
  <script
    src="https://cdn.jsdelivr.net/npm/quill-image-resize-module@3.0.0/image-resize.min.js"
  ></script>

  <script src="https://cdn.jsdelivr.net/npm/quill@2/dist/quill.js"></script>
  <script
    src="https://cdn.jsdelivr.net/npm/quill-table-better@1/dist/quill-table-better.js"
  ></script>
  
<script>
	tailwind.config = {
	  theme: {
		extend: {},
	  },
	  plugins: [window.tailwindcss.typography],
	}
  </script>
  
  <style>
    .ql-table-menus-container{
    display: none !important;  /* ซ่อน toolbar ในเซลล์ */
}
.ql-operate-line-container{
  display: none !important;  /* ซ่อน toolbar ในเซลล์ */

}.ql-operate-block{
  display: none !important;  /* ซ่อน toolbar ในเซลล์ */

}
  </style>
</svelte:head>

<div class="p-6 max-w-3xl mx-auto">
  <h1 class="text-2xl font-bold mb-4">กรอกแบบฟรอม</h1>
  <div id="editor-container" class="border border-gray-300 rounded-md" ></div>

  <button
    on:click={logContent}
    class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
  >
    บันทึกเนื้อหา
  </button>
</div>



<div class="container mx-auto p-4">
  <h1 class="text-2xl font-bold mb-4">ปฏิทินเลือกวัน</h1>
  <Calendar 
    bind:selectionMode
    bind:selectedDates
    bind:selectedRange
    bind:savedSelections
    on:save={handleSave} 
  />
</div>
<script>
    import { onMount } from "svelte";
    import {
      getStorage,
      ref,
      uploadBytes,
      getDownloadURL,
    } from "firebase/storage";
    import {
      getFirestore,
      collection,
      addDoc,
      onSnapshot,
      query,
      orderBy,
    } from "firebase/firestore";
    import { db, storage } from "$lib/firebase"; // ต้อง export Firebase App และ Storage
    import { toast } from "@zerodevx/svelte-toast";
  
    let editor;
    let content = "";
    let savedPosts = [];
  
    // อัปโหลดรูปภาพไป Storage
    async function uploadImage(file) {
      const now = new Date();
      const timestamp = now.getTime();
      const uniqueFileName = `${timestamp}-${file.name}`;
      const storageRef = ref(storage, `temp/${uniqueFileName}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    }
  
    // แปลง dataURL เป็น File
    function dataURLtoFile(dataUrl, filename) {
      const arr = dataUrl.split(",");
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) u8arr[n] = bstr.charCodeAt(n);
      return new File([u8arr], filename, { type: mime });
    }
  
    function imageHandler() {
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", "image/*");
      input.click();
  
      input.onchange = async () => {
        const file = input.files[0];
        if (file) {
          const maxSize = 2 * 1024 * 1024;
          if (file.size > maxSize) {
            toast.push("ขนาดไฟล์รูปภาพต้องไม่เกิน 2MB", {
              theme: {
                "--toastBackground": "red",
                "--toastColor": "white",
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
  
    async function logContent() {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, "text/html");
      const imgTags = doc.querySelectorAll("img");
  
      for (let img of imgTags) {
        if (img.src.startsWith("data:image")) {
          const file = dataURLtoFile(img.src, "image.png");
          const imageUrl = await uploadImage(file);
          img.src = imageUrl;
        }
      }
  
      const finalHTML = doc.body.innerHTML;
  
      try {
        await addDoc(collection(db, "testquill"), {
          content: finalHTML,
          createdAt: new Date(),
        });
        toast.push("✅ บันทึกเรียบร้อยแล้ว");
      } catch (err) {
        console.error("❌ เกิดข้อผิดพลาด:", err);
        toast.push("❌ บันทึกล้มเหลว", {
          theme: {
            "--toastBackground": "red",
          },
        });
      }
    }
  
    onMount(() => {
      // โหลด Quill
      if (window.Quill) {
        window.Quill.register("modules/imageResize", window.ImageResize.default);
        editor = new window.Quill("#editor-container", {
          theme: "snow",
          modules: {
            toolbar: {
              container: [
                ["bold", "italic", "underline"],
                [{ header: [1, 2, false] }],
                ["image"],
                [{ align: [] }],
              ],
              handlers: {
                image: imageHandler,
              },
            },
            imageResize: {},
          },
        });
  
        editor.on("text-change", () => {
          content = editor.root.innerHTML;
        });
      }
  
      // โหลดข้อมูลจาก Firestore
      const q = query(collection(db, "testquill"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        savedPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      });
  
      return () => unsubscribe();
    });
  </script>
  
  <svelte:head>
    <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet" />
    <script src="https://cdn.quilljs.com/1.3.6/quill.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/quill-image-resize-module@3.0.0/image-resize.min.js"></script>
  </svelte:head>
  
  <style>
    .prose h1 {
      font-size: 1.5rem;
      font-weight: bold;
      margin-top: 1rem;
      margin-bottom: 0.5rem;
    }
    .prose h2 {
      font-size: 1.25rem;
      font-weight: bold;
      margin-top: 1rem;
      margin-bottom: 0.5rem;
    }
    .prose p {
      margin-bottom: 0.75rem;
      line-height: 1.6;
    }
    .prose img {
      max-width: 100%;
      height: auto;
      margin: 1rem 0;
      border-radius: 0.5rem;
    }
    .prose ul {
      list-style: disc;
      padding-left: 1.5rem;
      margin-bottom: 1rem;
    }
  </style>
  
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">กรอกแบบฟอร์ม</h1>
    <div id="editor-container" class="border rounded-md min-h-[200px]"></div>
  
    <button
      on:click={logContent}
      class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
    >
      บันทึกเนื้อหา
    </button>
  
    <h2 class="text-xl font-semibold mt-8 mb-4">เนื้อหาที่บันทึกไว้</h2>
    {#if savedPosts.length === 0}
      <p class="text-gray-500">ยังไม่มีข้อมูล</p>
    {:else}
      <div class="space-y-4">
        {#each savedPosts as post}
          <div class="p-4 border rounded-md bg-gray-50">
            <div class="text-sm text-gray-400 mb-2">
              🕒 {new Date(post.createdAt.seconds * 1000).toLocaleString()}
            </div>
            <div class="prose" >{@html post.content}</div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
  
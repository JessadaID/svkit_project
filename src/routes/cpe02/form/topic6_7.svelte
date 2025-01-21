<script>
    export let research_data,Theory_principles,imagePreviews,selectedFiles,fileInput,handleTab

    
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
      fileInput.value = "";
    }
  }
</script>

<div>
    
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
</div>
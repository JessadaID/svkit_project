<script>
  export let term,
    project_name_th,
    project_name_en,
    members,
    adviser,
    External_consultant;

  function addMemberRow() {
    members = [...members, ""]; // เพิ่มสมาชิกใหม่ใน array
  }

  // ฟังก์ชันในการลบแถวล่างสุด
  function deleteLastMember() {
    if (members.length > 1) {
      members = members.slice(0, -1); // ลบสมาชิกแถวสุดท้าย
    }
  }
</script>

<div>
  <label for="name" class="block text-lg font-medium"
    >ภาคเรียน <b class="text-red-500">*</b></label
  >
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
  <button type="button" class="bg-white p-1 m-2 rounded" on:click={addMemberRow}
    >เพิ่มสมาชิก</button
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
        <input
          type="checkbox"
          id="adviser1"
          bind:group={adviser}
          value="ผู้ช่วยศาสตราจารย์ อนันท์ ทับเกิด"
          class="w-4 h-4"
        />
        <label for="adviser1" class="ml-2"
          >ผู้ช่วยศาสตราจารย์ อนันท์ ทับเกิด</label
        >
      </div>
      <div class="flex items-center">
        <input
          type="checkbox"
          id="adviser2"
          bind:group={adviser}
          value="นายกิตตินันท์ น้อยมณี"
          class="w-4 h-4"
        />
        <label for="adviser2" class="ml-2">นายกิตตินันท์ น้อยมณี</label>
      </div>
      <div class="flex items-center">
        <input
          type="checkbox"
          id="adviser3"
          bind:group={adviser}
          value="ผู้ช่วยศาสตราจารย์ ขวัญชัย เอื้อวิริยานุกูล"
          class="w-4 h-4"
        />
        <label for="adviser3" class="ml-2"
          >ผู้ช่วยศาสตราจารย์ ขวัญชัย เอื้อวิริยานุกูล</label
        >
      </div>
      <div class="flex items-center">
        <input
          type="checkbox"
          id="adviser4"
          bind:group={adviser}
          value="นายจักรภพ ใหม่เสน"
          class="w-4 h-4"
        />
        <label for="adviser4" class="ml-2">นายจักรภพ ใหม่เสน</label>
      </div>
      <div class="flex items-center">
        <input
          type="checkbox"
          id="adviser5"
          bind:group={adviser}
          value="นายณัฐชาสิทธิ์ ชูเกียรติขจร"
          class="w-4 h-4"
        />
        <label for="adviser5" class="ml-2">นายณัฐชาสิทธิ์ ชูเกียรติขจร</label>
      </div>
      <div class="flex items-center">
        <input
          type="checkbox"
          id="adviser6"
          bind:group={adviser}
          value="นายปณต พุกกะพันธุ์"
          class="w-4 h-4"
        />
        <label for="adviser6" class="ml-2">นายปณต พุกกะพันธุ์</label>
      </div>
      <div class="flex items-center">
        <input
          type="checkbox"
          id="adviser7"
          bind:group={adviser}
          value="นายปิยพล ยืนยงสถาวร"
          class="w-4 h-4"
        />
        <label for="adviser7" class="ml-2">นายปิยพล ยืนยงสถาวร</label>
      </div>
      <div class="flex items-center">
        <input
          type="checkbox"
          id="adviser8"
          bind:group={adviser}
          value="นายพิชิต ทนันชัย"
          class="w-4 h-4"
        />
        <label for="adviser8" class="ml-2">นายพิชิต ทนันชัย</label>
      </div>
      <div class="flex items-center">
        <input
          type="checkbox"
          id="adviser9"
          bind:group={adviser}
          value="นางสาวยุพดี หัตถสิน"
          class="w-4 h-4"
        />
        <label for="adviser9" class="ml-2">นางสาวยุพดี หัตถสิน</label>
      </div>
      <div class="flex items-center">
        <input
          type="checkbox"
          id="adviser10"
          bind:group={adviser}
          value="นายสมนึก สุระธง"
          class="w-4 h-4"
        />
        <label for="adviser10" class="ml-2">นายสมนึก สุระธง</label>
      </div>
      <div class="flex items-center">
        <input
          type="checkbox"
          id="adviser11"
          bind:group={adviser}
          value="นายภาณุเดช ทิพย์อักษร"
          class="w-4 h-4"
        />
        <label for="adviser11" class="ml-2">นายภาณุเดช ทิพย์อักษร</label>
      </div>
      <div class="flex items-center">
        <input
          type="checkbox"
          id="adviser12"
          bind:group={adviser}
          value="นายอนุพงศ์ ไพโรจน์"
          class="w-4 h-4"
        />
        <label for="adviser12" class="ml-2">นายอนุพงศ์ ไพโรจน์</label>
      </div>
      <div class="flex items-center">
        <input
          type="checkbox"
          id="adviser13"
          bind:group={adviser}
          value="นายอรรถพล วิเวก"
          class="w-4 h-4"
        />
        <label for="adviser13" class="ml-2">นายอรรถพล วิเวก</label>
      </div>
    </div>
  </div>

  <label for="email" class="block text-lg font-medium mt-3"
    >ที่ปรึกษาภายนอก (ถ้ามี)
  </label>
  <input
    type="text"
    placeholder="ไม่บังคับ"
    class="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
    bind:value={External_consultant}
  />
</div>

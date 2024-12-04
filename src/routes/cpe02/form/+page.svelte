<script>
    import { db } from "$lib/firebase";
    import { collection, addDoc } from "firebase/firestore";

  let term = "";
  let project_name_th = "";
  let project_name_en = "";
  let adviser = [""];
  let project_problem = "";
  let comment = "";
  let status = "wait";
  let email = "";
  let isLoading = false;

  // ดึง email จาก localStorage เมื่อ component โหลด
  if (typeof window !== "undefined") {
    email = localStorage.getItem("email");
  }

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

  function handleTab(event) {
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

      // อัปเดตค่าที่ bind
      project_problem = textarea.value;
    }
  }

  
  async function handleSubmit(event) {
    event.preventDefault();
    isLoading = true;
    try {
      // เพิ่มข้อมูลไปยัง Firestore
      const docRef = await addDoc(collection(db, "project-approve"), {
        term,
        project_name_th,
        project_name_en,
        members,
        adviser,
        project_problem,
        comment,
        status,
        email,
      });
      alert(`เพิ่มข้อมูลสำเร็จ!`);
      // รีเซ็ตฟอร์ม
      term = "";
      project_name_th = "";
      project_name_en = "";
      members = [];
      adviser = [];
      project_problem = "";
      comment = "";
      status = "";
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      isLoading = false; // โหลดเสร็จแล้ว
    }
  }
</script>

<div class="md:m-5 md:p-5 flex justify-center items-center">
    <form
    on:submit={handleSubmit}
      class="shadow-lg p-5 md:rounded-lg md:w-8/12 bg-gray-200"
    >
      <div class="p-5">
        <!--===============================================-->
  
        <label for="name" class="block text-lg font-medium">ภาคเรียน</label>
        <select id="dropdown" name="term" class="p-2 w-4/12" bind:value={term}>
          <option value="2/2567" selected>2/2567</option>
          <option value="1/2568">1/2568</option>
          <option value="2/2568">2/2568</option>
        </select>
  
        <!--===============================================-->
  
        <label for="text" class="block text-lg font-medium mt-3"
          >ชื่อโครงงาน (ภาษาไทย)</label
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
          >ชื่อโครงงาน (ภาษาอังกฤษ)</label
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
          >ชื่อผู้เสนอโครงงาน 
        </label>
        <button type="button" class="bg-white p-1 m-2 rounded" on:click={addMemberRow}>เพิ่มสมาชิก</button>
        <button type="button" on:click={deleteLastMember} class="bg-red-500 text-white p-1 m-2 rounded">
          ลบสมาชิก
        </button>
        <div class="input-row grid md:grid-cols-2 gap-4">
          {#each members as member, index}
            <input
              type="text"
              bind:value={members[index]}
              placeholder="Member Name"
              class="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 m-1"
            />
          {/each}
        </div>
  
  
        <!--===============================================-->
  
        <label for="email" class="block text-lg font-medium mt-3"
          >อาจารย์ที่ปรึกษาโครงงาน
        </label>
        <select
          id="dropdown"
          name="adviser"
          class="p-2 w-full"
          multiple
          size="4"
          bind:value={adviser}
        >
          <option value="ผู้ช่วยศาสตราจารย์ อนัน ทับเกิด"
            >ผู้ช่วยศาสตราจารย์ อนัน ทับเกิด</option
          >
          <option value="นายกิตตินันท์ น้อยมณี">นายกิตตินันท์ น้อยมณี</option>
          <option value="ผู้ช่วยศาสตราจารย์ ขวัญชัย เอื้อวิริยานุกูล"
            >ผู้ช่วยศาสตราจารย์ ขวัญชัย เอื้อวิริยานุกูล</option
          >
          <option value="นายจักรภพ ใหม่เสน">นายจักรภพ ใหม่เสน</option>
          <option value="นายณัฐชาสิทธิ์ ชูเกียรติขจร"
            >นายณัฐชาสิทธิ์ ชูเกียรติขจร</option
          >
          <option value="นายปณต พุกกะพันธุ์">นายปณต พุกกะพันธุ์</option>
          <option value="นายปิยพล ยืนยงสถาวร">นายปิยพล ยืนยงสถาวร</option>
          <option value="นายพิชิต ทนันชัย">นายพิชิต ทนันชัย</option>
          <option value="นางสาวยุพดี หัตถสิน">นางสาวยุพดี หัตถสิน</option>
          <option value="นายสมนึก สุระธง">นายสมนึก สุระธง</option>
          <option value="นายภาณุเดช ทิพย์อักษร">นายภาณุเดช ทิพย์อักษร</option>
          <option value="นายอนุพงศ์ ไพโรจน์">นายอนุพงศ์ ไพโรจน์</option>
          <option value="นายอรรถพล วิเวก">นายอรรถพล วิเวก</option>
        </select>
        <!--===============================================-->
  
  
  
        <label for="text" class="block text-lg font-medium mt-3"
          >ที่มาและความสำคัญของปัญหา
        </label>
  
        <textarea
          id="editor"
          name="w3review"
          rows="10"
          cols="50"
          class="w-full"
          bind:value={project_problem}
          on:keydown={handleTab}
          placeholder="เขียนที่มาและความสำคัญของปัญหา..."
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
  
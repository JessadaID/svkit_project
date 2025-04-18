<script>
  export let project,can_edit,Task,isLoading,isLoadingtext,visibleStates,status,data,db,comment,role;
  import {
    doc,
    updateDoc,
  } from "firebase/firestore";
  // ฟังก์ชัน toggle
  function toggleTask(index) {
    visibleStates[index] = !visibleStates[index];
  }
  function isOverdue(dueDate) {
    const today = new Date(); // วันที่ปัจจุบัน
    //console.log(today);
    const due = new Date(dueDate); // วันที่กำหนดส่ง
    return today > due; // คืนค่า true ถ้าเลยกำหนด
  }

  function updateStatus(event, index) {
    status[index] = event.target.value; // อัปเดตค่าใน status ตามที่เลือก
    //console.log(`Task ${index + 1}: ${status[index]}`); // แสดงค่าที่เลือกใน status
  }

  async function addTask(index, comment, status) {
    const projectDocRef = doc(db, "project-approve", data.id);

    // สร้าง Task ใหม่จาก index
    const taskKey = `Tasks.${index}`;
    const newTask = {
      comment: comment[index] || "", // ดึงค่า comment ตาม index
      status: status[index], // ดึงค่า status ตาม index
    };

    try {
      isLoadingtext = true;
      await updateDoc(projectDocRef, {
        [taskKey]: newTask, // ใช้ dot notation ในการอัปเดต
      });
      alert("ดำเนินการเรียบร้อยแล้ว!");
      //console.log("Task added successfully!");
    } catch (error) {
      console.error("Error adding task: ", error);
    } finally {
      isLoadingtext = false;
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // เดือนเริ่มต้นที่ 0
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  </script>


<div
      class="md:m-5 p-3 md:bg-gray-200 rounded md:shadow-lg md:w-4/12 bg-gray-200 h-full  sticky top-5"
    >
      <b class="m-2">ความคืบหน้า เทอม : {project.term}</b>
      <!-- UI -->
      <div>
        <!-- ส่วน UI ที่คุณมีอยู่แล้ว แต่เพิ่ม event handlers -->
        {#if isLoading != true}
          {#if Task.length > 0}
            {#each Task as task, index}
              <div class="bg-slate-400 relative p-4 mb-4 rounded-md">
                <h1><b>{task.title}</b></h1>
                <p>{task.description}</p>
                {#if project.Tasks[index]?.status == "wait"}
                  <p
                    class="text-sky-500 bg-white inline-block px-2 mt-2 rounded"
                  >
                    รออนุมัติ
                  </p>
                {:else if project.Tasks[index]?.status == "improvement"}
                  <p
                    class="text-amber-500 bg-white inline-block px-2 mt-2 rounded"
                  >
                    แก้ไข
                  </p>
                {:else if project.Tasks[index]?.status == "approve"}
                  <p
                    class="text-green-500 bg-white inline-block px-2 mt-2 rounded"
                  >
                    อนุมัติ
                  </p>
                {/if}
                <p>กำหนดส่ง : {formatDate(task.dueDate)}</p>
                {#if isOverdue(task.dueDate)}
                  <p class="text-red-600 font-bold mt-2">เกินกำหนดส่งแล้ว!</p>
                {/if}
                <button
                  type="button"
                  class="absolute top-0 right-0 bg-white p-2 m-2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                  on:click={() => toggleTask(index)}
                >
                  {visibleStates[index] ? "▲" : "▼"}
                </button>

                {#if visibleStates[index]}
                  <div class="mt-5 bg-gray-100 p-4 rounded-md">
                    <b>ความคิดเห็นของอาจารย์</b>
                    <textarea
                      class="w-full p-2"
                      rows="5"
                      readonly={!can_edit}
                      bind:value={comment[index]}
                    ></textarea>
                    {#if role === "teacher" || role === "subject_teacher" || role === "admin"}
                      <input
                        type="radio"
                        id="improvement-{index}"
                        name="status-{index}"
                        value="improvement"
                        checked={status[index] === "improvement"}
                        on:change={(event) => updateStatus(event, index)}
                      />
                      <label for="improvement-{index}">แก้ไข</label><br />

                      <input
                        type="radio"
                        id="approve-{index}"
                        name="status-{index}"
                        value="approve"
                        checked={status[index] === "approve"}
                        on:change={(event) => updateStatus(event, index)}
                      />
                      <label for="approve-{index}">ผ่าน</label><br />
                      <button
                        class="bg-red-500 w-full mt-5 p-2 text-white"
                        on:click={() => {
                          //console.log(index, comment[index], status[index]);
                          addTask(index, comment, status);
                        }}
                        disabled={isLoadingtext}
                      >
                        {isLoadingtext ? "Loading..." : "ยืนยัน"}
                      </button>
                    {/if}
                  </div>
                {/if}
              </div>
            {/each}
          {:else}
            <div class="text-center bg-gray-200 p-5 rounded-md">
              <h1 class="text-lg font-bold text-red-500">ไม่พบข้อมูล</h1>
              <p>ไม่มีข้อมูลที่จะแสดงในขณะนี้</p>
            </div>
          {/if}
        {:else}
          <div class="text-center bg-gray-200 p-5 rounded-md">
            <p>Loading...</p>
          </div>
        {/if}
      </div>
    </div>
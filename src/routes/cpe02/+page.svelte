<script>
  export let data;

  import { goto } from "$app/navigation";
  import {checkAuthStatus } from "$lib/auth";
  import { warningToast } from "$lib/customtoast.js";
  
  $: latestTerm = data.latestTerm;

  function handleNavigation(url) {
    if(checkAuthStatus()){
        goto(url);
    }else{
      warningToast('กรุณา Login ก่อนใช้งาน');
      goto(`/login?redirect=${encodeURIComponent(url)}`);
    }
  }
</script>

<div class="m-5">
  <a href="/" class="hover:underline">หน้าแรก</a> > <b>แบบเสนอโครงงาน</b>
</div>
<div class="flex justify-center items-center pb-10">
  <div class="grid grid-rows-2 w-full max-w-5xl">
    <!-- Row 1 -->
    <div class="grid grid-cols-1 lg:grid-cols-10 relative w-full">
      <!-- Column 1 (50%) -->
      <div class="lg:col-span-5 col-span-1 animated-left">
        <div class="block shadow-lg w-full transition-transform duration-200">
          <div
            class="flex flex-col justify-center items-center h-96 bg-white"
            style="background-color: #FCFAEE;"
          >
            <div>
              <p class="text-xl">📜 กรอกแบบฟอร์ม</p>
              <br />
              <p class="text-sm">
                เริ่มต้นการกรอกข้อมูลเพื่อเสนอหัวข้อโครงงานได้ที่นี่
              </p>

              {#if latestTerm}
                <button
                  on:click={() =>
                    handleNavigation(`/cpe02/form/${latestTerm.term}`)}
                  class="mt-3 bg-blue-500 text-black px-7 py-1 border-none hover:bg-blue-600"
                >
                  กรอกแบบฟอร์ม เทอม : {latestTerm.term}
                </button>
              {:else}
                <button
                  class="mt-3 bg-gray-500 text-black px-7 py-1 border-none"
                  disabled
                >
                  <p>ยังไม่มีแบบฟอร์มที่เปิดอยู่</p>
                </button>
              {/if}
            </div>
          </div>
        </div>
      </div>

      <!-- Column 2 (50%) -->
      <div class="lg:col-span-5 col-span-1 hidden md:block">
        <img
          src="/cpe-01.jpg"
          alt=""
          class="w-full h-auto max-h-96 object-cover"
        />
      </div>
    </div>

    <!-- Row 2 -->
    <div class="grid grid-cols-1 lg:grid-cols-10 w-full relative">
      <!-- Column 1 (30%) -->
      <div class="lg:col-span-5 col-span-1 hidden md:block">
        <img
          src="/cpe-02.jpg"
          alt=""
          class="w-full h-auto max-h-96 object-cover"
        />
      </div>

      <!-- Column 2 (70%) -->
      <div class="lg:col-span-5 col-span-1 animated-right">
        <div class="block shadow-lg w-full transition-transform duration-200">
          <div
            class="flex flex-col justify-center items-center h-96 bg-white"
            style="background-color: #FCFAEE;"
          >
            <div>
              <p class="text-xl">📊ข้อมูลแบบเสนอโครงงาน</p>
              <br />
              <p class="text-sm">ดูข้อมูลที่ได้ทำการเสนอไว้ทั้งหมด</p>
              <p class="text-sm">พร้อมการอัพเดทสถานะ</p>
              <br />
              <a
                href="/cpe02/data"
                class="mt-3 bg-green-500 text-black px-7 py-1 border-none hover:bg-green-600"
              >
                ดูข้อมูล
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="custom-shape-divider-bottom-1737392204">
  <svg
    data-name="Layer 1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1200 120"
    preserveAspectRatio="none"
  >
    <path
      d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
      class="shape-fill"
    ></path>
  </svg>
</div>

<style>
  .custom-shape-divider-bottom-1737392204 {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    overflow: hidden;
    line-height: 0;
    z-index: -1;
  }

  .custom-shape-divider-bottom-1737392204 svg {
    position: relative;
    display: block;
    width: calc(274% + 1.3px);
    height: 210px;
    transform: rotateY(180deg);
  }

  .custom-shape-divider-bottom-1737392204 .shape-fill {
    fill: #5052ff;
  }

  .animated-left {
    opacity: 0; /* เริ่มต้นโปร่งใส */
    transform: translateX(100px); /* เริ่มต้นเลื่อนจากด้านล่าง */
    animation: slideIn 1.5s ease-out forwards; /* เรียกใช้ keyframes */
  }
  .animated-right {
    opacity: 0; /* เริ่มต้นโปร่งใส */
    transform: translateX(100px); /* เริ่มต้นเลื่อนจากด้านล่าง */
    animation: slideOut 1.5s ease-out forwards; /* เรียกใช้ keyframes */
  }
  @keyframes slideIn {
    0% {
      opacity: 0;
      transform: translateY(100px);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideOut {
    0% {
      opacity: 0;
      transform: translateY(100px);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }
</style>

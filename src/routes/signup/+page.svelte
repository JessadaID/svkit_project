<script>
  import { auth, db } from "$lib/firebase";
  import { createUserWithEmailAndPassword } from "firebase/auth";
  import { doc, setDoc } from "firebase/firestore";
  import { goto } from "$app/navigation";
  import { setLoginCookies, clearLoginCookies } from "$lib/auth";
  import { dangerToast, successToast, warningToast } from "$lib/customtoast";


  let prefix = 'นาย';
  let name = '';
  const prefixes = ['นาย', 'นาง', 'นางสาว'];
  
  let email = "";
  let password = "";
  let confirmPassword = "";
  let role = "user"; // Role เริ่มต้น (สามารถปรับเปลี่ยนได้)
  let isLoading = false;

  async function signup() {
    try {
      isLoading = true;

      // ตรวจสอบว่ารหัสผ่านและยืนยันรหัสผ่านตรงกันหรือไม่
      if(email == "" || name == "" || password == "" || confirmPassword == ""){
        warningToast("กรอกข้อมูลให้ครบถ้วน");
        return;
      }

      if (password !== confirmPassword) {
        warningToast("รหัสผ่านไม่ตรงกัน");
        return;
      }
      
      // สร้างผู้ใช้ใน Firebase Authentication
      setLoginCookies(email, "user");

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // บันทึกข้อมูลผู้ใช้ลงใน Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        email: user.email,
        role: role, // บันทึก Role ของผู้ใชh
        name:prefix+name,
      });

      // เก็บข้อมูลใน Cookies
      setLoginCookies(email, role);

      // แจ้งเตือนผู้ใช้
      successToast(`สมัครสมาชิกสำเร็จ! ยินดีต้อนรับ ${user.email}`);

      // รีเซ็ตฟอร์ม
      name = "";
      email = "";
      password = "";
      confirmPassword = "";

      // นำทางไปยังหน้า /cpe02
      goto("/cpe02");
    } catch (error) {
      clearLoginCookies();
      dangerToast("เกิดข้อผิดพลาดในการสมัครสมาชิก: " + error.message);
    } finally {
      isLoading = false; // เสร็จสิ้นการโหลด
    }
  }
</script><div class="flex justify-center items-center min-h-screen">
  <div class="flex w-full max-w-4xl shadow-lg rounded-lg overflow-hidden relative " style="box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);">
    
    <div class="w-full md:w-1/2 flex items-center justify-center p-6 bg-white/90 backdrop-blur-md">
      <div class="w-full max-w-md">
        <h1 class="text-2xl font-bold text-center mb-6 text-gray-800">
          สมัครสมาชิก
        </h1>
 
        <form on:submit|preventDefault={signup} class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              ชื่อ
            </label>
            <div class="flex items-center space-x-2">
            
              <select
                bind:value={prefix}
                class="px-3 py-2 border rounded-md bg-white focus:outline-none shadow-sm focus:ring focus:ring-blue-300"
              >
                {#each prefixes as p}
                  <option value={p}>{p}</option>
                {/each}
              </select>
              <input
                type="text"
                bind:value={name}
                placeholder="เช่น เอ บี"
                class="px-3 w-full py-2 border rounded-md focus:outline-none shadow-sm focus:ring focus:ring-blue-300"
              />
            </div>
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              อีเมล
            </label>
            <input
              id="email"
              type="email"
              bind:value={email}
              required
              class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="กรอกอีเมลของคุณ"
            />
            
          </div>
 
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              รหัสผ่าน
            </label>
            <input
              id="password"
              type="password"
              bind:value={password}
              required
              class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="กรอกรหัสผ่านของคุณ"
            />
          </div>
 
          <div>
            <label
              for="confirmPassword"
              class="block text-sm font-medium text-gray-700"
            >
              กรอกรหัสผ่านอีกครั้ง
            </label>
            <input
              id="confirmPassword"
              type="password"
              bind:value={confirmPassword}
              required
              class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="กรอกรหัสผ่านของคุณอีกครั้ง"
            />
          </div>
 
          <button
            type="submit"
            class="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
    <div class="hidden md:block w-1/2 relative">
      <img 
        src="/Sign_up.jpg" 
        alt="Signup Background" 
        class="w-full h-full object-cover"
      />
      <div class="absolute bottom-0 right-0 bg-white/80 p-4">
        <p class="text-sm text-gray-500">
          ถ้ามีบัญชีอยู่แล้ว ? <a
            href="/login"
            class="text-blue-500 hover:underline font-bold">Sign In</a
          >
        </p>
      </div>
    </div>
  </div>
 </div>

<div class="custom-shape-divider-bottom-1737443007 hidden md:block">
  <svg
    data-name="Layer 1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1200 120"
    preserveAspectRatio="none"
  >
    <path d="M1200 120L0 16.48 0 0 1200 0 1200 120z" class="shape-fill"></path>
  </svg>
</div>

<div class="custom-shape-divider-bottom-1737650222">
  <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
      <path d="M1200 120L0 16.48 0 0 1200 0 1200 120z" class="shape-fill"></path>
  </svg>
</div>

<style>
  .custom-shape-divider-bottom-1737443007 {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    overflow: hidden;
    line-height: 0;
    transform: rotate(180deg);
    z-index: -1;
  }

  .custom-shape-divider-bottom-1737443007 svg {
    position: relative;
    display: block;
    width: calc(300% + 1.3px);
    height: 369px;
    transform: rotateY(180deg);
  }

  .custom-shape-divider-bottom-1737443007 .shape-fill {
    fill: #5052FF;
  }.custom-shape-divider-bottom-1737650222 {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    overflow: hidden;
    line-height: 0;
    transform: rotate(180deg);
    z-index: -1;
}

.custom-shape-divider-bottom-1737650222 svg {
    position: relative;
    display: block;
    width: calc(100% + 1.3px);
    height: 150px;
}

.custom-shape-divider-bottom-1737650222 .shape-fill {
    fill: #6769E2;
}
</style>

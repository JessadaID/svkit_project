<script>
  import { auth, db } from "$lib/firebase";
  import { createUserWithEmailAndPassword } from "firebase/auth";
  import { doc, setDoc } from "firebase/firestore";
  import { goto } from "$app/navigation";
  import { setLoginCookies } from '../../auth';


  let email = "";
  let password = "";
  let confirmPassword = "";
  let role = "user"; // Role เริ่มต้น (สามารถปรับเปลี่ยนได้)
  let isLoading = false;

  
async function signup() {
    try {
        isLoading = true;

        // ตรวจสอบว่ารหัสผ่านและยืนยันรหัสผ่านตรงกันหรือไม่
        if (password !== confirmPassword) {
            alert("รหัสผ่านไม่ตรงกัน");
            return;
        }

        // สร้างผู้ใช้ใน Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // บันทึกข้อมูลผู้ใช้ลงใน Firestore
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
            email: user.email,
            role: role, // บันทึก Role ของผู้ใช้
        });

        // เก็บข้อมูลใน Cookies
        setLoginCookies(email, role);

        // แจ้งเตือนผู้ใช้
        alert(`สมัครสมาชิกสำเร็จ! ยินดีต้อนรับ ${user.email}`);

        // รีเซ็ตฟอร์ม
        email = "";
        password = "";
        confirmPassword = "";

        // นำทางไปยังหน้า /cpe02
        goto('/cpe02');
    } catch (error) {
        alert("เกิดข้อผิดพลาดในการสมัครสมาชิก: " + error.message);
    } finally {
        isLoading = false; // เสร็จสิ้นการโหลด
    }
}
</script>
<div class="flex justify-center items-center mt-24">

  <div class="p-8 bg-white shadow-md rounded-md w-full max-w-md ">
    <h1 class="text-2xl font-bold text-center mb-6 text-gray-800 ">สมัครสมาชิก</h1>

    <form on:submit|preventDefault={signup} class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">อีเมล</label>
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
        <label for="password" class="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
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
        <label for="confirmPassword" class="block text-sm font-medium text-gray-700">กรอกรหัสผ่านอีกครั้ง</label>
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

    <p class="text-center text-sm text-gray-500 mt-4">
      ถ้ามีบัญชีอยู่แล้ว ? <a href="/login" class="text-blue-500 hover:underline">Sign In</a>
    </p>
  </div>
</div>

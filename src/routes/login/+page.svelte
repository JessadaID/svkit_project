<script>
  import { db, auth } from "$lib/firebase";
  import { signInWithEmailAndPassword, signOut } from "firebase/auth";
  import { doc, getDoc } from "firebase/firestore";
  import { goto } from "$app/navigation";
  import { setLoginCookies,clearLoginCookies } from '../../auth';
  let email = "";
  let password = "";
  let user = null;
  let role = null;
  let loading = false;

async function login() {
    try {
        loading = true;

        // ล็อกอินผู้ใช้
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // ดึงข้อมูลผู้ใช้จาก Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const role = userData.role;

            // เก็บข้อมูลใน Cookies
            setLoginCookies(email, role);

            // นำทางไปยังหน้า /cpe02
            goto('/cpe02');
        } else {
            alert('ไม่พบข้อมูลผู้ใช้ใน Firestore');
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert(`ล็อกอินไม่สำเร็จ: ${error.message}`);
    } finally {
        loading = false;
    }
}

async function logout() {
    try {
        // ทำการ Sign Out จาก Firebase Authentication
        await signOut(auth);

        // ล้างข้อมูลผู้ใช้
        user = null;
        role = null;

        // ลบข้อมูลจาก Cookies
        clearLoginCookies();

        // แสดงข้อความแจ้งเตือนการออกจากระบบ
        alert('ออกจากระบบสำเร็จ');

        // เปลี่ยนเส้นทางไปยังหน้า Login
        goto('/login');
    } catch (error) {
        // แสดงข้อผิดพลาดหากเกิดขึ้น
        alert('เกิดข้อผิดพลาด: ' + error.message);
    }
}
</script>

<div class="flex justify-center items-center mt-40">
  <div class="p-5 bg-white shadow-md rounded-md w-full max-w-sm">
    <h1 class="text-xl font-bold mb-5 text-center">เข้าสู่ระบบ</h1>

    {#if loading}
      <p class="text-center text-gray-500">กำลังโหลด...</p>
    {:else if !user}
      <form on:submit|preventDefault={login} class="space-y-4">
        <div>
          <label
            for="email"
            class="block text-sm font-medium text-gray-700 mb-1">อีเมล</label
          >
          <input
            id="email"
            type="email"
            bind:value={email}
            required
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>
        <div>
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label
          >
          <input
            id="password"
            type="password"
            bind:value={password}
            required
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>
        <button
          type="submit"
          class="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
        >
          Sign In
        </button>
      </form>
    {:else}
 
      {#if role === "admin"}
        <p class="text-center text-gray-700 mt-2">คุณเป็นผู้ดูแลระบบ (Admin)</p>
      {:else if role === "user"}
        <p class="text-center text-gray-700 mt-2">
          คุณเป็นผู้ใช้งานทั่วไป (User)
        </p>
      {:else}
        <p class="text-center text-gray-700 mt-2">สิทธิ์ของคุณไม่ถูกต้อง</p>
      {/if}
      <button
        on:click={logout}
        class="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition mt-5"
      >
        Logout
      </button>
    {/if}
    <p class="text-center text-sm text-gray-500 mt-4">
      ยังไม่มีบัญชีหรอ ? <a href="/signup" class="text-blue-500 hover:underline"
        >Sign Up</a
      >
    </p>
  </div>
</div>

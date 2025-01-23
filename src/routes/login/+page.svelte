<script>
  import { db, auth } from "$lib/firebase";
  import { signInWithEmailAndPassword, signOut } from "firebase/auth";
  import { doc, getDoc } from "firebase/firestore";
  import { goto } from "$app/navigation";
  import { setLoginCookies, clearLoginCookies } from "../../auth";

  let email = "";
  let password = "";
  let user = null;
  let role = null;
  let loading = false;

  async function login() {
    try {
      loading = true;
      setLoginCookies(email, "user");
      //console.log("set cookie..")

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      user = userCredential.user; // เพิ่มการอัพเดท user state

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        role = userData.role; // เพิ่มการอัพเดท role state
        setLoginCookies(email, role);

        if (role == "admin") {
          goto("/Dashboard");
        } else {
          goto("/cpe02");
        }
      }
    } catch (error) {
      console.error("Error during login:", error);
      clearLoginCookies();
      alert(error.message);
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
      alert("ออกจากระบบสำเร็จ");

      // เปลี่ยนเส้นทางไปยังหน้า Login
      goto("/login");
    } catch (error) {
      // แสดงข้อผิดพลาดหากเกิดขึ้น
      alert("เกิดข้อผิดพลาด: " + error.message);
    }
  }
</script>
<div class="flex justify-center items-center min-h-screen">
  <div class="flex w-full max-w-4xl rounded-lg overflow-hidden relative" style="box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);">
    <div class="hidden md:block w-1/2 relative" >
      <img 
        src="/Sign_in.jpg" 
        alt="Login Background" 
        class="w-full h-full object-cover"
      />
      <div class="absolute bottom-0 left-0 bg-white/80 p-4">
        <p class="text-sm text-gray-500">
          ยังไม่มีบัญชีหรอ ? <a
            href="/signup"
            class="text-blue-500 hover:underline font-bold">Sign Up</a
          >
        </p>
      </div>
    </div>
    <div class="w-full md:w-1/2 flex items-center justify-center p-6 bg-white/60 backdrop-blur-md">
      <div class="w-full max-w-md">
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
          <button
            on:click={logout}
            class="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition mt-5"
          >
            Logout
          </button>
        {/if}
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

<div class="custom-shape-divider-bottom-1737647643">
  <svg
    data-name="Layer 1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1200 120"
    preserveAspectRatio="none"
  >
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
    fill: #a1cae2;
  }
  .custom-shape-divider-bottom-1737647643 {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    overflow: hidden;
    line-height: 0;
    transform: rotate(180deg);
    z-index: -1;
  }

  .custom-shape-divider-bottom-1737647643 svg {
    position: relative;
    display: block;
    width: calc(100% + 1.3px);
    height: 112px;
  }

  .custom-shape-divider-bottom-1737647643 .shape-fill {
    fill: #7fa0b3;
  }
</style>

<script>
  import { getCookie } from "cookies-next/client";

    let email = ""
    email = getCookie("email")  // หรือใช้ cookies ถ้าต้องการ
</script>
<div class="w-full grid justify-items-center mt-10">
<img src="https://media.tenor.com/prT_agJ7F98AAAAM/the-rock-the-rock-sus.gif" alt="">
<p class="text-xl">คุณ {email}</p>
</div>
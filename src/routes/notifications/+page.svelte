<script>
  import { onMount } from 'svelte';
  import { requestNotificationPermissionAndSaveToken } from '$lib/fcm';
  import { auth } from '$lib/firebase';
  import { onAuthStateChanged } from 'firebase/auth';

  onMount(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
              console.log('User is logged in, attempting to get FCM token...');
              const token = await requestNotificationPermissionAndSaveToken();
              if (token) {
                  console.log('FCM Token process completed successfully.');
                  // ทำอย่างอื่นต่อได้ถ้าต้องการ
              } else {
                   console.log('FCM Token process did not complete successfully.');
              }
          } else {
              console.log('User is logged out.');
              // อาจจะลบ token หรือทำอย่างอื่น
          }
      });

      // Cleanup listener on component destroy
      return () => unsubscribe();
  });
</script>

<button on:click={requestNotificationPermissionAndSaveToken}>
  เปิดใช้งานการแจ้งเตือน
</button>

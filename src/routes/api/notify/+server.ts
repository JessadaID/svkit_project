import { admin } from '$lib/server/firebase';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  const { message, target } = await request.json();

  try {
    if (target === 'all') {
      await admin.messaging().sendToTopic('all', {
        notification: { title: '📢 แจ้งเตือน', body: message }
      });
    } else {
      await admin.messaging().sendToDevice(target, {
        notification: { title: '📩 ข้อความใหม่', body: message }
      });
    }

    return new Response(JSON.stringify({ success: true }));
  } catch (err) {
    console.error('ส่งไม่สำเร็จ:', err);
    return new Response(JSON.stringify({ success: false, error: err.message }));
  }
};

/**
 * Middleware สำหรับเช็คสถานะการล็อกอิน
 * 
 * - ถ้าผู้ใช้ไม่ได้ล็อกอินและเข้าหน้า `/protected/*`
 *   จะเปลี่ยนเส้นทางไป `/login`
 */
export async function handle({ event, resolve }) {
    // ดึงค่า email จาก Cookies
    const email = event.cookies.get('email');

    // ถ้าผู้ใช้ไม่ได้ล็อกอินและพยายามเข้าถึง Protected Routes
    if (!email && event.url.pathname.startsWith('/protected')) {
        return Response.redirect('/login', 302);
    }

    // อนุญาตให้โหลดหน้าตามปกติ
    return await resolve(event);
}

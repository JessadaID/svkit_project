import { setCookie, deleteCookie } from 'cookies-next';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
/**
 * ตั้งค่า Cookies หลังจากล็อกอินสำเร็จ
 * @param {string} email - อีเมลของผู้ใช้
 * @param {string} role - บทบาทของผู้ใช้
 */
export function setLoginCookies(email, role) {
    setCookie('email', email, {
        path: '/',
        maxAge: 60 * 60 * 24, // อายุ Cookies 1 วัน
        secure: true,
        sameSite: 'strict',
    });

    setCookie('role', role, {
        path: '/',
        maxAge: 60 * 60 * 24,
        secure: true,
        sameSite: 'strict',
    });
}

/**
 * ลบ Cookies เมื่อล็อกเอาท์
 */
export function clearLoginCookies() {
    deleteCookie('email', { path: '/' });
    deleteCookie('role', { path: '/' });
}

/**
 * ตรวจสอบสถานะการล็อกอิน
 * @returns {boolean} - คืนค่า true ถ้าผู้ใช้ล็อกอิน, false ถ้าไม่ได้ล็อกอิน
 */
export function checkLoginStatus() {
    return new Promise((resolve) => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            resolve(!!user); // คืนค่า true ถ้าผู้ใช้ล็อกอิน
        });
    });
}
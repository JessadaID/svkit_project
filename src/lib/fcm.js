import { getToken } from 'firebase/messaging';
import { browser } from '$app/environment';
import { getMessagingIfSupported, db, auth } from './firebase';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { successToast, warningToast, dangerToast } from './customtoast';

/**
 * ขออนุญาตแสดง Notification, รับ FCM Token, และบันทึกลง Firestore
 * รองรับหลายอุปกรณ์ต่อ 1 ผู้ใช้
 */
export async function requestNotificationPermissionAndSaveToken() {
    if (!browser) {
        console.log('[FCM] Not running in browser environment.');
        return null;
    }

    const messaging = await getMessagingIfSupported();
    if (!messaging) {
        console.warn('[FCM] Firebase Messaging is not available.');
        return null;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
        console.warn('[FCM] User not logged in.');
        return null;
    }

    const userId = currentUser.uid;

    try {
        const currentPermission = Notification.permission;
        let permissionResult = currentPermission;

        if (currentPermission === 'default') {
            permissionResult = await Notification.requestPermission();
        }

        if (permissionResult === 'granted') {
            const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
            if (!vapidKey) {
                dangerToast('VAPID Key ไม่ถูกตั้งค่า');
                return null;
            }

            const currentToken = await getToken(messaging, { vapidKey });

            if (currentToken) {
                // Save token to Firestore subcollection
                const tokenDocRef = doc(db, 'users', userId, 'fcmTokens', currentToken);
                await setDoc(tokenDocRef, {
                    token: currentToken,
                    updatedAt: serverTimestamp()
                });

                //successToast('เปิดใช้งานการแจ้งเตือนสำเร็จ!');
                return currentToken;
            } else {
                warningToast('ไม่สามารถรับ Token ได้');
                return null;
            }
        } else if (permissionResult === 'denied') {
            warningToast('คุณปฏิเสธการรับการแจ้งเตือน');

            // ลบ token เก่าทิ้งทุกอัน
            const userTokensRef = await db.collection(`users/${userId}/fcmTokens`).get();
            for (const docSnap of userTokensRef.docs) {
                await deleteDoc(doc(db, 'users', userId, 'fcmTokens', docSnap.id));
            }

            return null;
        } else {
            warningToast('คุณยังไม่ได้ให้สิทธิ์การแจ้งเตือน');
            return null;
        }

    } catch (error) {
        console.error('[FCM] Error:', error);
        if (error.code?.includes('messaging/')) {
            dangerToast('เกิดข้อผิดพลาดในการเชื่อมต่อกับ FCM');
        } else {
            dangerToast('เกิดข้อผิดพลาดในการตั้งค่าการแจ้งเตือน');
        }
        return null;
    }
}

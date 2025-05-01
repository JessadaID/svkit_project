// src/lib/fcm.js
import { getToken } from 'firebase/messaging';
import { browser } from '$app/environment';
// Import the messaging instance along with others
import { getMessagingIfSupported, db, auth } from './firebase';
// Import Firestore functions needed for checking
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { successToast, warningToast, dangerToast } from './customtoast'; // Import toasts

/**
 * ขออนุญาตแสดง Notification, รับ FCM Token, และบันทึกลง Firestore
 * Checks Firestore first if a token already exists for the logged-in user.
 * @returns {Promise<string|null>} Promise ที่ resolve เป็น FCM token หรือ null ถ้าไม่สำเร็จ
 */
export async function requestNotificationPermissionAndSaveToken() {
    // 1. ตรวจสอบว่าทำงานใน Browser และ messaging ถูก initialize สำเร็จ
    if (!browser) {
        console.log('[FCM] Not running in browser environment. Skipping FCM token request.');
        return null;
    }

    const messaging = await getMessagingIfSupported();
    if (!messaging) {
        console.warn('[FCM] Firebase Messaging is not available or not initialized.');
        // warningToast('ไม่สามารถเปิดใช้งานการแจ้งเตือนได้ในขณะนี้'); // Optional
        return null;
    }

    // 2. ตรวจสอบว่ามี User ล็อกอินอยู่หรือไม่
    const currentUser = auth.currentUser;
    if (!currentUser) {
        console.warn('[FCM] User not logged in. Cannot request/save FCM token.');
        // warningToast('กรุณาเข้าสู่ระบบเพื่อเปิดใช้งานการแจ้งเตือน'); // Optional
        return null;
    }
    const userId = currentUser.uid;
    const userDocRef = doc(db, 'users', userId);

    try {
        // 3. *** NEW: Check Firestore for existing token FIRST ***
        //console.log(`[FCM] Checking Firestore for existing token for user: ${userId}`);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists() && userDocSnap.data()?.fcmToken) {
            const existingToken = userDocSnap.data().fcmToken;
            //console.log('[FCM] Existing FCM token found in Firestore:', existingToken);
            // Optional: Update timestamp to show the token is still actively used/checked
            // await setDoc(userDocRef, { fcmTokenTimestamp: serverTimestamp() }, { merge: true });
            // successToast('การแจ้งเตือนเปิดใช้งานอยู่แล้ว'); // Maybe too noisy? Log is enough.
            return existingToken; // Return the existing token, skip permission request
        } else {
            console.log('[FCM] No existing token found in Firestore for this user. Proceeding with permission check/request.');
        }

        // 4. ถ้าไม่มี Token ใน Firestore, ดำเนินการขอ Permission และ Token ต่อไป
        // Check current browser permission status *before* requesting
        const currentPermission = Notification.permission;
        //.log('[FCM] Current browser notification permission status:', currentPermission);

        let permissionResult = currentPermission;

        // Only request permission if it's 'default'
        if (currentPermission === 'default') {
            //console.log('[FCM] Requesting notification permission from user...');
            permissionResult = await Notification.requestPermission();
            //console.log('[FCM] Permission request result:', permissionResult);
        }

        // 5. Handle permission result
        if (permissionResult === 'granted') {
           // console.log('[FCM] Notification permission granted (or was already granted).');

            // 6. รับ VAPID Key
            const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
            if (!vapidKey) {
                console.error("[FCM] VITE_FIREBASE_VAPID_KEY is not set!");
                dangerToast('เกิดข้อผิดพลาดในการตั้งค่าการแจ้งเตือน (Config)');
                return null;
            }

            // 7. ขอ Token (Get Token)
            //console.log('[FCM] Getting FCM token...');
            const currentToken = await getToken(messaging, { vapidKey: vapidKey });

            if (currentToken) {
                //console.log('[FCM] New FCM Token received:', currentToken);

                // 8. บันทึก Token ใหม่ ลง Firestore
                try {
                    await setDoc(userDocRef, {
                        fcmToken: currentToken,
                        fcmTokenTimestamp: serverTimestamp()
                    }, { merge: true });

                    //console.log('[FCM] New FCM Token saved successfully to Firestore for user:', userId);
                    successToast('เปิดใช้งานการแจ้งเตือนสำเร็จ!');
                    return currentToken;

                } catch (dbError) {
                    console.error('[FCM] Error saving new FCM token to Firestore:', dbError);
                    dangerToast('เกิดข้อผิดพลาดในการบันทึกข้อมูลการแจ้งเตือน');
                    return null;
                }

            } else {
                console.error('[FCM] Failed to get FCM token even though permission is granted. Check Service Worker.');
                warningToast('ไม่สามารถรับ Token การแจ้งเตือนได้ โปรดลองอีกครั้ง');
                return null;
            }
        } else if (permissionResult === 'denied') {
            //console.log('[FCM] Notification permission denied by user (or was already denied).');
            warningToast('คุณปฏิเสธการรับการแจ้งเตือน สามารถเปิดใช้งานได้ในการตั้งค่า Browser');
            // Optional: Ensure token is cleared in Firestore if permission is denied
            // if (userDocSnap.exists() && userDocSnap.data()?.fcmToken) {
            //     console.log('[FCM] Clearing FCM token in Firestore due to denied permission.');
            //     await setDoc(userDocRef, { fcmToken: null, fcmTokenTimestamp: serverTimestamp() }, { merge: true });
            // }
            return null;
        } else { // 'default' - User dismissed the prompt without choosing
            //console.log('[FCM] Notification permission dismissed (remains default).');
            warningToast('คุณยังไม่ได้ให้สิทธิ์การแจ้งเตือน');
            return null;
        }
    } catch (error) {
        console.error('[FCM] Error during permission/token process:', error);
        // Keep existing detailed error handling
        if (error.code === 'messaging/notifications-blocked' || error.code === 'messaging/permission-blocked') {
             warningToast('การแจ้งเตือนถูกบล็อก โปรดเปิดใช้งานในการตั้งค่า Browser');
        } else if (error.code === 'messaging/failed-serviceworker-registration') {
             dangerToast('ไม่สามารถลงทะเบียน Service Worker ได้ โปรดรีเฟรชหน้า');
        } else if (error.code === 'messaging/permission-default') {
             // This case might be less common now since we check Notification.permission first
             warningToast('คุณยังไม่ได้ให้สิทธิ์การแจ้งเตือน');
        } else if (error.code === 'messaging/token-subscribe-failed') {
             dangerToast(`เกิดข้อผิดพลาดในการเชื่อมต่อกับ FCM: ${error.message}`);
        } else if (error.name === 'FirebaseError' && error.message.includes('firestore')) {
             dangerToast('เกิดข้อผิดพลาดในการเข้าถึงฐานข้อมูล'); // Firestore specific error
        }
        else {
            dangerToast('เกิดข้อผิดพลาดในการตั้งค่าการแจ้งเตือน'); // General error
        }
        return null;
    }
}

// --- (Optional) Foreground message handler remains the same ---
// import { onMessage } from 'firebase/messaging';
// export function setupForegroundMessageHandler() { ... }

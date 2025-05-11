import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.VITE_projectId,
      clientEmail: process.env.VITE_clientEmail,
      privateKey: process.env.VITE_private_key?.replace(/\\n/g, '\n'),
    }),
  });
}
export const adminDb = getFirestore();
export const adminAuth = getAuth();
export { admin }
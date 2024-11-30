// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBSL4HXr2IdQ_oSkMkcECF626HVfDzf52w",
  authDomain: "cpe02-4b991.firebaseapp.com",
  projectId: "cpe02-4b991",
  storageBucket: "cpe02-4b991.firebasestorage.app",
  messagingSenderId: "827303701453",
  appId: "1:827303701453:web:3a98898fb3865832403284",
  measurementId: "G-E3KLMCT3FQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);


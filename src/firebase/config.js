// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDVFFrLdXf6M4r1rWrUImt9fjsHtI-FqhI",
    authDomain: "finance-tracker-f5631.firebaseapp.com",
    projectId: "finance-tracker-f5631",
    storageBucket: "finance-tracker-f5631.firebasestorage.app",
    messagingSenderId: "496100451937",
    appId: "1:496100451937:web:3d7b28150b8b09e218ac20"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);




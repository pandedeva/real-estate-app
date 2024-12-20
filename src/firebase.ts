// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "real-estate-app-8091d.firebaseapp.com",
  projectId: "real-estate-app-8091d",
  storageBucket: "real-estate-app-8091d.firebasestorage.app",
  messagingSenderId: "824704974891",
  appId: "1:824704974891:web:4c3e6cc3fd31454b9f2a6e",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

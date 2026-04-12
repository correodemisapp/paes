// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // ← añadir esto

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB30iEUlpdJBrwsF1ZyHsufvWMHP_8Qxok",
  authDomain: "paes-app-82aab.firebaseapp.com",
  projectId: "paes-app-82aab",
  storageBucket: "paes-app-82aab.firebasestorage.app",
  messagingSenderId: "72270848497",
  appId: "1:72270848497:web:85b5ef3a02a89599b3a450",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // ← añadir esto
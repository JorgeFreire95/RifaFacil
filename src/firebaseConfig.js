import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Reemplaza con tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD8aDg1Pywwla9M2g9Ar7mImjOQDYt5qFw",
    authDomain: "rifafacil-7af04.firebaseapp.com",
    projectId: "rifafacil-7af04",
    storageBucket: "rifafacil-7af04.firebasestorage.app",
    messagingSenderId: "621778931438",
    appId: "1:621778931438:web:9adb84115834a89a8aadff",
    measurementId: "G-0R1BZ3MJDM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

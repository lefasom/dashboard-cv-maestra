// src/firebase.js  (Vite + React, web)
//
// Instalar:  npm install firebase

import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC5kSucOpOEpc-l07bUV8rH3I0gKaq4WAQ",
  authDomain: "dash-cv-master.firebaseapp.com",
  projectId: "dash-cv-master",
  storageBucket: "dash-cv-master.firebasestorage.app",
  messagingSenderId: "17243727797",
  appId: "1:17243727797:web:a446d186534e88a09b5bfc",
  measurementId: "G-RXL2C5NCMF",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Analytics solo si el navegador lo soporta (no rompe si no)
isSupported()
  .then((ok) => {
    if (ok) getAnalytics(app);
  })
  .catch(() => {});
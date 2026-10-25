// src/firebase.js  (Vite + React, web)
//
// Instalar:  npm install firebase   (versión 10 o superior)
//
// CAMBIO PARA AHORRAR LECTURAS: Firestore ahora usa caché local persistente
// (IndexedDB). Si recargás la página, los documentos que ya se bajaron salen
// del navegador y solo se pagan los que cambiaron (mientras el cierre dure
// menos de ~30 minutos). Funciona con varias pestañas del navegador abiertas.

import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

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

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export const auth = getAuth(app);

// Analytics solo si el navegador lo soporta (no rompe si no)
isSupported()
  .then((ok) => {
    if (ok) getAnalytics(app);
  })
  .catch(() => {});
// Conexión con Firebase. Los valores de configuración NO van en el código:
// se leen de variables de entorno del archivo .env (que no se sube a GitHub).
// En .env.example están los nombres que hay que rellenar.
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const env = import.meta.env;

const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY ?? "",
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: env.VITE_FIREBASE_PROJECT_ID ?? "",
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: env.VITE_FIREBASE_APP_ID ?? "",
};

// Sin variables de entorno la app funciona igual (eventos en localStorage)
// y no intenta conectarse.
export const firebaseActivo = Boolean(
    firebaseConfig.apiKey && firebaseConfig.projectId,
);

export const app = firebaseActivo ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

console.log("Firebase activo:", firebaseActivo);
console.log("Firebase app:", app);
console.log("Firebase auth:", auth);
console.log("Firebase db:", db);
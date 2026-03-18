import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBOh2OyAp68eYhe2svn4bWpXFXs1JV8qgk",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "devtonic-lms-2.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "devtonic-lms-2",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "devtonic-lms-2.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "178747945557",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:178747945557:web:e77ab6c840c4cdb3a11adc"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

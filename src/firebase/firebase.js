import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyB6toQ2t2A7jfTmMmmUO0OIRIJ3tysLBCE",
  authDomain: "trustlens-cbf72.firebaseapp.com",
  projectId: "trustlens-cbf72",
  storageBucket: "trustlens-cbf72.firebasestorage.app",
  messagingSenderId: "779362610790",
  appId: "1:779362610790:web:5af6161b6d9b96b69d47a7",
  measurementId: "G-GJL974W6TN",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const storage = getStorage(app);
const messaging = getMessaging(app);

export { app, auth, db, storage, messaging };

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBqPNNijIbZaAodhgdA96rVNuOhQRj_po",
  authDomain: "sommelierpro-reloaded.firebaseapp.com",
  projectId: "sommelierpro-reloaded",
  storageBucket: "sommelierpro-reloaded.appspot.com",
  messagingSenderId: "704789541138",
  appId: "1:704789541138:web:ec8c641032f297de9583cb"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

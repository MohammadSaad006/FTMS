// Firebase config
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBs3MqgJOqX22Tdwr7sfaCwlMKzXIWgIfc",
  authDomain: "farma-2ea59.firebaseapp.com",
  projectId: "farma-2ea59",
  storageBucket: "farma-2ea59.firebasestorage.app",
  messagingSenderId: "866473353666",
  appId: "1:866473353666:web:c18f453eababf6de76765b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged };

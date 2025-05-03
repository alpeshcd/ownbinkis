// Firebase configuration file
import { initializeApp } from "firebase/app";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBntN10J6UrAdXcO7g2P54DsBbrdgr7IEo",
  authDomain: "bnkis-1.firebaseapp.com",
  projectId: "bnkis-1",
  storageBucket: "bnkis-1.firebasestorage.app",
  messagingSenderId: "850152958299",
  appId: "1:850152958299:web:6ba4e0b1aab6d4bb93927e",
  measurementId: "G-GV1RZXZ23H",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;

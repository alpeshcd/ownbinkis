
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQK8SMJnrUy6tR6LzJTtrxpMblU7qhIfE",
  authDomain: "bniskis.firebaseapp.com",
  projectId: "bniskis",
  storageBucket: "bniskis.appspot.com",
  messagingSenderId: "948027267803",
  appId: "1:948027267803:web:8befa73fb1a50c8abb0afe",
  measurementId: "G-M9N2DFY62J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

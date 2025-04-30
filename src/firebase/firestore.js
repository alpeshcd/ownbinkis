
// Firebase Firestore service
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs } from "firebase/firestore";
import app from "./config";

// Initialize Cloud Firestore
const db = getFirestore(app);

// Collection references
const usersCollection = collection(db, "users");

// Helper functions
export const createDocument = async (collectionName, id, data) => {
  return await setDoc(doc(db, collectionName, id), data);
};

export const getDocument = async (collectionName, id) => {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
};

export const updateDocument = async (collectionName, id, data) => {
  const docRef = doc(db, collectionName, id);
  return await updateDoc(docRef, data);
};

export const deleteDocument = async (collectionName, id) => {
  return await deleteDoc(doc(db, collectionName, id));
};

export const queryDocuments = async (collectionName, field, operator, value) => {
  const q = query(collection(db, collectionName), where(field, operator, value));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export { db, usersCollection };

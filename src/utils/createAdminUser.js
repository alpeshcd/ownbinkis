
// Utility for creating an admin user
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import auth from "../firebase/auth";
import { db } from "../firebase/firestore";

const createAdminUser = async (email, password, name) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Set display name
    await updateProfile(firebaseUser, { displayName: name });
    
    // Create user document in Firestore
    const userData = {
      email: email.toLowerCase(),
      name,
      role: "admin",
      createdAt: new Date()
    };
    
    await setDoc(doc(db, "users", firebaseUser.uid), userData);
    
    return {
      id: firebaseUser.uid,
      ...userData
    };
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  }
};

export default createAdminUser;

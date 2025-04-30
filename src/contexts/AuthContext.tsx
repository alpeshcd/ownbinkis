
import React, { createContext, useState, useContext, useEffect } from "react";
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import auth from "@/firebase/auth";
import { db } from "@/firebase/firestore";
import { toast } from "@/components/ui/use-toast";

// Define the User type
export type UserRole = "admin" | "supervisor" | "finance" | "vendor" | "user";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

// Define the context type
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  login: async () => {
    throw new Error("Not implemented");
  },
  register: async () => {
    throw new Error("Not implemented");
  },
  logout: async () => {
    throw new Error("Not implemented");
  },
  resetPassword: async () => {
    throw new Error("Not implemented");
  },
  isAuthenticated: false,
  hasRole: () => false,
});

// This is now connected to Firebase
export const useAuth = () => useContext(AuthContext);

// Demo users for easier testing
const demoUsers: Record<string, { password: string; role: UserRole }> = {
  "admin@example.com": { password: "password", role: "admin" },
  "supervisor@example.com": { password: "password", role: "supervisor" },
  "finance@example.com": { password: "password", role: "finance" },
  "vendor@example.com": { password: "password", role: "vendor" },
  "user@example.com": { password: "password", role: "user" },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Firebase auth state monitoring
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          
          if (userDoc.exists()) {
            // User exists in Firestore
            const userData = userDoc.data() as Omit<User, "id">;
            setCurrentUser({
              id: firebaseUser.uid,
              ...userData,
              createdAt: userData.createdAt instanceof Date 
                ? userData.createdAt 
                : new Date(userData.createdAt)
            });
          } else {
            // User exists in auth but not in Firestore
            // This is an edge case, but we'll handle it
            const defaultUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: firebaseUser.displayName || "",
              role: "user",
              createdAt: new Date()
            };
            
            // Create user document in Firestore
            await setDoc(doc(db, "users", firebaseUser.uid), {
              email: defaultUser.email,
              name: defaultUser.name,
              role: defaultUser.role,
              createdAt: defaultUser.createdAt
            });
            
            setCurrentUser(defaultUser);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        // No user signed in
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<User> => {
    const lowercaseEmail = email.toLowerCase();
    
    try {
      // Check if it's a demo user
      if (demoUsers[lowercaseEmail]) {
        // For demo users, we'll create them in Firebase if they don't exist yet
        try {
          // Try to sign in first
          await signInWithEmailAndPassword(auth, lowercaseEmail, demoUsers[lowercaseEmail].password);
        } catch (error: any) {
          // If user doesn't exist, create them
          if (error.code === "auth/user-not-found") {
            const userCredential = await createUserWithEmailAndPassword(
              auth, 
              lowercaseEmail, 
              demoUsers[lowercaseEmail].password
            );
            
            const firebaseUser = userCredential.user;
            
            // Set display name
            await updateProfile(firebaseUser, {
              displayName: lowercaseEmail.split("@")[0].replace(/\./g, " ")
            });
            
            // Create user document in Firestore
            const userData = {
              email: lowercaseEmail,
              name: lowercaseEmail.split("@")[0].replace(/\./g, " "),
              role: demoUsers[lowercaseEmail].role,
              createdAt: new Date()
            };
            
            await setDoc(doc(db, "users", firebaseUser.uid), userData);
            
            // Now sign in
            await signInWithEmailAndPassword(auth, lowercaseEmail, demoUsers[lowercaseEmail].password);
          } else {
            throw error;
          }
        }
      } else {
        // Regular login
        await signInWithEmailAndPassword(auth, lowercaseEmail, password);
      }
      
      // User data will be set by the auth state change listener
      // Wait for the auth state to update
      return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          unsubscribe();
          
          if (!firebaseUser) {
            reject(new Error("Authentication failed"));
            return;
          }
          
          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            
            if (!userDoc.exists()) {
              reject(new Error("User data not found"));
              return;
            }
            
            const userData = userDoc.data() as Omit<User, "id">;
            const user: User = {
              id: firebaseUser.uid,
              ...userData,
              createdAt: userData.createdAt instanceof Date 
                ? userData.createdAt 
                : new Date(userData.createdAt)
            };
            
            toast({
              title: "Login Successful",
              description: `Welcome back, ${user.name}!`,
            });
            
            resolve(user);
          } catch (error) {
            reject(error);
          }
        });
      });
    } catch (error: any) {
      // Handle specific Firebase auth errors
      if (error.code === "auth/wrong-password") {
        throw new Error("Invalid password");
      } else if (error.code === "auth/user-not-found") {
        throw new Error("User not found");
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Invalid email format");
      } else if (error.code === "auth/too-many-requests") {
        throw new Error("Too many login attempts. Please try again later.");
      } else {
        throw new Error(error.message || "Failed to log in");
      }
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string): Promise<User> => {
    const lowercaseEmail = email.toLowerCase();
    
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, lowercaseEmail, password);
      const firebaseUser = userCredential.user;
      
      // Set display name
      await updateProfile(firebaseUser, { displayName: name });
      
      // Create user document in Firestore
      const userData = {
        email: lowercaseEmail,
        name,
        role: "user" as UserRole, // Default role for new registrations
        createdAt: new Date()
      };
      
      await setDoc(doc(db, "users", firebaseUser.uid), userData);
      
      // Create user object
      const user: User = {
        id: firebaseUser.uid,
        ...userData
      };
      
      toast({
        title: "Registration Successful",
        description: `Welcome to BNKIS, ${name}!`,
      });
      
      return user;
    } catch (error: any) {
      // Handle specific Firebase auth errors
      if (error.code === "auth/email-already-in-use") {
        throw new Error("Email already in use");
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Invalid email format");
      } else if (error.code === "auth/weak-password") {
        throw new Error("Password is too weak");
      } else {
        throw new Error(error.message || "Failed to register");
      }
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      throw new Error("Failed to log out");
    }
  };

  // Reset password function
  const resetPassword = async (email: string): Promise<void> => {
    const lowercaseEmail = email.toLowerCase();
    
    try {
      await sendPasswordResetEmail(auth, lowercaseEmail);
      
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for further instructions",
      });
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        throw new Error("Email not found");
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Invalid email format");
      } else {
        throw new Error(error.message || "Failed to send password reset email");
      }
    }
  };

  // Check if a user has one of the specified roles
  const hasRole = (roles: UserRole[]): boolean => {
    if (!currentUser) return false;
    return roles.includes(currentUser.role);
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    resetPassword,
    isAuthenticated: !!currentUser,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

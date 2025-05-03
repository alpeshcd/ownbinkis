
import React, { useState, useEffect } from "react";
import { 
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
import { User, UserRole } from "./types";
import { safelyConvertToDate } from "./utils";
import AuthContext from "./AuthContext";

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
            
            // Make sure the role is valid, default to "user" if not
            const validRoles: UserRole[] = ["admin", "supervisor", "finance", "vendor", "user"];
            const role = validRoles.includes(userData.role as UserRole) ? userData.role as UserRole : "user";
            
            setCurrentUser({
              id: firebaseUser.uid,
              ...userData,
              role,
              createdAt: safelyConvertToDate(userData.createdAt)
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
          // Set user with basic info from Firebase Auth to avoid login failures
          setCurrentUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || "",
            role: "user",
            createdAt: new Date()
          });
        }
      } else {
        // No user signed in
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login function - enhanced to handle role validation
  const login = async (email: string, password: string): Promise<User> => {
    const lowercaseEmail = email.toLowerCase();
    
    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, lowercaseEmail, password);
      const firebaseUser = userCredential.user;

      // Try to get user data from Firestore
      try {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as Omit<User, "id">;
          
          // Ensure the role is valid
          const validRoles: UserRole[] = ["admin", "supervisor", "finance", "vendor", "user"];
          const role = validRoles.includes(userData.role as UserRole) ? userData.role as UserRole : "user";
          
          const user: User = {
            id: firebaseUser.uid,
            ...userData,
            role,
            createdAt: safelyConvertToDate(userData.createdAt)
          };
          
          toast({
            title: "Login Successful",
            description: `Welcome back, ${user.name}!`,
          });
          
          return user;
        } else {
          // If user exists in Auth but not in Firestore, create a default user document
          const defaultUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || email.split('@')[0],
            role: "user",
            createdAt: new Date()
          };
          
          await setDoc(doc(db, "users", firebaseUser.uid), {
            email: defaultUser.email,
            name: defaultUser.name,
            role: defaultUser.role,
            createdAt: defaultUser.createdAt
          });
          
          toast({
            title: "Login Successful",
            description: `Welcome, ${defaultUser.name}!`,
          });
          
          return defaultUser;
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Even if Firestore is offline, we can still create a user object from Auth data
        const fallbackUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || email.split('@')[0],
          role: "user",
          createdAt: new Date()
        };
        
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        
        return fallbackUser;
      }
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
        console.error("Login error:", error);
        throw new Error(error.message || "Failed to log in");
      }
    }
  };

  // Register function - keep as is, it's working well
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

  // Reload user data function
  const reloadUser = async (): Promise<void> => {
    try {
      if (!auth.currentUser) {
        console.error("No authenticated user found");
        return;
      }
      
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as Omit<User, "id">;
        
        // Ensure the role is valid
        const validRoles: UserRole[] = ["admin", "supervisor", "finance", "vendor", "user"];
        const role = validRoles.includes(userData.role as UserRole) ? userData.role as UserRole : "user";
        
        setCurrentUser({
          id: auth.currentUser.uid,
          ...userData,
          role,
          createdAt: safelyConvertToDate(userData.createdAt)
        });
      } else {
        console.error("User document not found in Firestore");
      }
    } catch (error) {
      console.error("Error reloading user data:", error);
      toast({
        title: "Error",
        description: "Failed to reload user data",
        variant: "destructive",
      });
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
    reloadUser,
    isAuthenticated: !!currentUser,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


import React, { createContext, useState, useContext, useEffect } from "react";
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

// This would be connected to Firebase in a real implementation
export const useAuth = () => useContext(AuthContext);

// For development/demo purposes, we'll create some fake users
const demoUsers: Record<string, User> = {
  "admin@example.com": {
    id: "admin-id",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
    createdAt: new Date(),
  },
  "supervisor@example.com": {
    id: "supervisor-id",
    email: "supervisor@example.com",
    name: "Supervisor User",
    role: "supervisor",
    createdAt: new Date(),
  },
  "finance@example.com": {
    id: "finance-id",
    email: "finance@example.com",
    name: "Finance User",
    role: "finance",
    createdAt: new Date(),
  },
  "vendor@example.com": {
    id: "vendor-id",
    email: "vendor@example.com",
    name: "Vendor User",
    role: "vendor",
    createdAt: new Date(),
  },
  "user@example.com": {
    id: "user-id",
    email: "user@example.com",
    name: "Regular User",
    role: "user",
    createdAt: new Date(),
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if there's a stored user on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("bnkis_user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("bnkis_user");
      }
    }
    setLoading(false);
  }, []);

  // Mock login function
  const login = async (email: string, password: string): Promise<User> => {
    // In a real app, this would validate against Firebase Auth
    const lowercaseEmail = email.toLowerCase();
    
    if (!demoUsers[lowercaseEmail] || password !== "password") {
      throw new Error("Invalid email or password");
    }
    
    const user = demoUsers[lowercaseEmail];
    setCurrentUser(user);
    localStorage.setItem("bnkis_user", JSON.stringify(user));
    
    toast({
      title: "Login Successful",
      description: `Welcome back, ${user.name}!`,
    });
    
    return user;
  };

  // Mock register function
  const register = async (email: string, password: string, name: string): Promise<User> => {
    // In a real app, this would create a Firebase Auth user
    const lowercaseEmail = email.toLowerCase();
    
    if (demoUsers[lowercaseEmail]) {
      throw new Error("Email already in use");
    }
    
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: lowercaseEmail,
      name,
      role: "user", // Default role for new registrations
      createdAt: new Date(),
    };
    
    // Add to our demo users
    demoUsers[lowercaseEmail] = newUser;
    
    // Set as current user
    setCurrentUser(newUser);
    localStorage.setItem("bnkis_user", JSON.stringify(newUser));
    
    toast({
      title: "Registration Successful",
      description: `Welcome to BNKIS, ${name}!`,
    });
    
    return newUser;
  };

  // Mock logout function
  const logout = async (): Promise<void> => {
    setCurrentUser(null);
    localStorage.removeItem("bnkis_user");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  // Mock reset password function
  const resetPassword = async (email: string): Promise<void> => {
    const lowercaseEmail = email.toLowerCase();
    
    if (!demoUsers[lowercaseEmail]) {
      throw new Error("Email not found");
    }
    
    // In a real app, this would send a reset email via Firebase
    toast({
      title: "Password Reset Email Sent",
      description: "Check your email for further instructions",
    });
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

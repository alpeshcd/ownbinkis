
import { User as FirebaseUser } from "firebase/auth";

// Define the User type
export type UserRole = "admin" | "supervisor" | "finance" | "vendor" | "user";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string; // Added phone property as optional
  createdAt: Date;
  updatedAt?: Date;
}

// Define the context type
export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  reloadUser: () => Promise<void>; // Add method to reload user data
  isAuthenticated: boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

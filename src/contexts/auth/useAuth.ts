
import { useContext } from "react";
import AuthContext from "./AuthContext";

// Hook for using the auth context
export const useAuth = () => useContext(AuthContext);

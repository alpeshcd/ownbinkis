
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/auth";

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const { currentUser, loading, hasRole } = useAuth();
  const location = useLocation();

  // Wait until authentication status is known
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!currentUser) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Debug: log user role and required roles
  console.log("Current user:", currentUser);
  console.log("Current user role:", currentUser.role);
  console.log("Required roles for this route:", requiredRoles);

  // If specific roles are required, check them
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    console.log("User role not allowed, redirecting to unauthorized");
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and has the required role (or no role is required)
  return <>{children}</>;
};

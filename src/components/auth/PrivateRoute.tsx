
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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required, check them
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

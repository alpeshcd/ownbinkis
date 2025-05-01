
import React from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { Action, Resource } from "@/utils/permissions";

interface PermissionGuardProps {
  action: Action;
  resource: Resource;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  context?: {
    isOwner?: boolean;
    isTeamMember?: boolean;
    isAssigned?: boolean;
    isOwnProfile?: boolean;
  };
}

/**
 * Component that conditionally renders children based on user permissions
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  action, 
  resource, 
  children, 
  fallback = null,
  context 
}) => {
  const { can } = usePermissions();
  
  // Check if user has permission to perform the action on the resource
  const hasPermission = can(action, resource, context);
  
  // Render children if user has permission, otherwise render fallback
  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

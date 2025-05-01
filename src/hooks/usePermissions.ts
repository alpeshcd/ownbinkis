
import { useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { Action, Resource, canUserPerform } from "@/utils/permissions";

/**
 * Hook for checking user permissions
 */
export const usePermissions = () => {
  const { currentUser } = useAuth();

  // Create permission checker function
  const can = useMemo(() => {
    return (
      action: Action,
      resource: Resource,
      context?: {
        isOwner?: boolean;
        isTeamMember?: boolean;
        isAssigned?: boolean;
        isOwnProfile?: boolean;
      }
    ): boolean => {
      if (!currentUser) {
        return false;
      }

      return canUserPerform(action, resource, currentUser.role, context);
    };
  }, [currentUser]);

  // Helper functions for common permission checks
  const canView = (resource: Resource, context?: any) => can("view", resource, context);
  const canCreate = (resource: Resource, context?: any) => can("create", resource, context);
  const canEdit = (resource: Resource, context?: any) => can("edit", resource, context);
  const canDelete = (resource: Resource, context?: any) => can("delete", resource, context);
  const canUpload = (resource: Resource, context?: any) => can("upload", resource, context);
  const canApprove = (resource: Resource, context?: any) => can("approve", resource, context);
  const canPay = (resource: Resource, context?: any) => can("pay", resource, context);
  const canClose = (resource: Resource, context?: any) => can("close", resource, context);

  return {
    can,
    canView,
    canCreate,
    canEdit, 
    canDelete,
    canUpload,
    canApprove,
    canPay,
    canClose
  };
};

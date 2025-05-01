
import { UserRole } from "@/contexts/auth";

// Define permission structure based on provided access matrix
export type Resource = 
  | "users" 
  | "vendors" 
  | "projects" 
  | "vendorDocuments" 
  | "tickets" 
  | "ticketDocuments" 
  | "bills" 
  | "adHocPayments";

export type Action = "view" | "create" | "edit" | "delete" | "upload" | "approve" | "pay" | "close";

// Define access levels
export type AccessLevel = 
  | "all"           // Full access to everything
  | "yes"           // General access 
  | "team"          // Access to team-related items
  | "own"           // Access only to own data
  | "assigned"      // Access only to assigned items
  | "no"            // No access
  | "self-register" // Special case for user registration
  | "own-profile";  // Special case for profile editing

// Main permissions matrix
export const permissionsMatrix: Record<Resource, Record<Action, Record<UserRole, AccessLevel>>> = {
  users: {
    view: {
      admin: "all",
      supervisor: "team",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    create: {
      admin: "yes",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "self-register"
    },
    edit: {
      admin: "yes",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "own-profile"
    },
    delete: {
      admin: "yes",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    upload: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    approve: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    pay: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    close: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    }
  },
  vendors: {
    view: {
      admin: "yes",
      supervisor: "yes",
      finance: "yes",
      vendor: "own",
      user: "no"
    },
    create: {
      admin: "yes",
      supervisor: "yes",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    edit: {
      admin: "yes",
      supervisor: "yes",
      finance: "no",
      vendor: "own",
      user: "no"
    },
    delete: {
      admin: "yes",
      supervisor: "yes",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    upload: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    approve: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    pay: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    close: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    }
  },
  projects: {
    view: {
      admin: "yes",
      supervisor: "yes",
      finance: "yes",
      vendor: "assigned",
      user: "assigned"
    },
    create: {
      admin: "yes",
      supervisor: "yes",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    edit: {
      admin: "yes",
      supervisor: "yes",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    delete: {
      admin: "yes",
      supervisor: "yes",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    upload: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    approve: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    pay: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    close: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    }
  },
  vendorDocuments: {
    view: {
      admin: "yes",
      supervisor: "yes",
      finance: "yes",
      vendor: "own",
      user: "no"
    },
    create: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    edit: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    delete: {
      admin: "yes",
      supervisor: "yes",
      finance: "no",
      vendor: "own",
      user: "no"
    },
    upload: {
      admin: "yes",
      supervisor: "yes",
      finance: "no",
      vendor: "own",
      user: "no"
    },
    approve: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    pay: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    close: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    }
  },
  tickets: {
    view: {
      admin: "yes",
      supervisor: "yes",
      finance: "yes",
      vendor: "assigned",
      user: "assigned"
    },
    create: {
      admin: "yes",
      supervisor: "yes",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    edit: {
      admin: "yes",
      supervisor: "yes",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    delete: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    upload: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    approve: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    pay: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    close: {
      admin: "yes",
      supervisor: "yes",
      finance: "no",
      vendor: "no",
      user: "no"
    }
  },
  ticketDocuments: {
    view: {
      admin: "yes",
      supervisor: "yes",
      finance: "no",
      vendor: "assigned",
      user: "assigned"
    },
    create: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    edit: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    delete: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    upload: {
      admin: "yes",
      supervisor: "yes",
      finance: "no",
      vendor: "assigned",
      user: "assigned"
    },
    approve: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    pay: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    close: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    }
  },
  bills: {
    view: {
      admin: "yes",
      supervisor: "yes",
      finance: "yes",
      vendor: "own",
      user: "no"
    },
    create: {
      admin: "yes",
      supervisor: "no",
      finance: "no",
      vendor: "own",
      user: "no"
    },
    edit: {
      admin: "yes",
      supervisor: "no",
      finance: "yes",
      vendor: "own",
      user: "no"
    },
    delete: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    upload: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    approve: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    pay: {
      admin: "no",
      supervisor: "no",
      finance: "yes",
      vendor: "no",
      user: "no"
    },
    close: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    }
  },
  adHocPayments: {
    view: {
      admin: "yes",
      supervisor: "yes",
      finance: "yes",
      vendor: "no",
      user: "no"
    },
    create: {
      admin: "yes",
      supervisor: "yes",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    edit: {
      admin: "yes",
      supervisor: "no",
      finance: "yes",
      vendor: "no",
      user: "no"
    },
    delete: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    upload: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    approve: {
      admin: "yes",
      supervisor: "no",
      finance: "yes",
      vendor: "no",
      user: "no"
    },
    pay: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    },
    close: {
      admin: "no",
      supervisor: "no",
      finance: "no",
      vendor: "no",
      user: "no"
    }
  }
};

// Main permission check function
export const canUserPerform = (
  action: Action,
  resource: Resource,
  userRole: UserRole,
  context?: {
    isOwner?: boolean;
    isTeamMember?: boolean;
    isAssigned?: boolean;
    isOwnProfile?: boolean;
  }
): boolean => {
  // Get the permission level for this action, resource, and role
  const permissionLevel = permissionsMatrix[resource]?.[action]?.[userRole];

  if (!permissionLevel) {
    return false;
  }

  switch (permissionLevel) {
    case "all":
    case "yes":
      return true;
    case "team":
      return !!context?.isTeamMember;
    case "own":
      return !!context?.isOwner;
    case "assigned":
      return !!context?.isAssigned;
    case "self-register":
      // Special case for user registration - always allowed
      return true;
    case "own-profile":
      return !!context?.isOwnProfile;
    case "no":
    default:
      return false;
  }
};

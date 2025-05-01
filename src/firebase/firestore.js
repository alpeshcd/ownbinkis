
// Firebase Firestore service
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore";
import app from "./config";
import { toast } from "@/components/ui/use-toast";

// Initialize Cloud Firestore
const db = getFirestore(app);

// Collection references
const usersCollection = collection(db, "users");

// Helper functions
export const getDocument = async (collectionName, id) => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    toast({
      title: "Error",
      description: `Failed to fetch ${collectionName} data: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

export const getCollection = async (collectionName, options = {}) => {
  try {
    const { filters = [], orderByField = 'createdAt', orderDirection = 'desc', limitCount = 50 } = options;
    const collectionRef = collection(db, collectionName);
    
    // Build query with filters, ordering, and limit
    let q = collectionRef;
    
    if (filters.length > 0) {
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });
    }
    
    q = query(q, orderBy(orderByField, orderDirection));
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error getting collection ${collectionName}:`, error);
    toast({
      title: "Error",
      description: `Failed to fetch ${collectionName} collection: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

export const createDocument = async (collectionName, data, customId = null) => {
  try {
    const timestamp = serverTimestamp();
    const dataWithTimestamp = {
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    let docRef;
    if (customId) {
      docRef = doc(db, collectionName, customId);
      await setDoc(docRef, dataWithTimestamp);
      return { id: customId, ...dataWithTimestamp };
    } else {
      docRef = await addDoc(collection(db, collectionName), dataWithTimestamp);
      return { id: docRef.id, ...dataWithTimestamp };
    }
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    toast({
      title: "Error",
      description: `Failed to create ${collectionName}: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

export const updateDocument = async (collectionName, id, data) => {
  try {
    const docRef = doc(db, collectionName, id);
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, updateData);
    return { id, ...updateData };
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    toast({
      title: "Error",
      description: `Failed to update ${collectionName}: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

export const deleteDocument = async (collectionName, id) => {
  try {
    await deleteDoc(doc(db, collectionName, id));
    return id;
  } catch (error) {
    console.error(`Error deleting document in ${collectionName}:`, error);
    toast({
      title: "Error",
      description: `Failed to delete ${collectionName}: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

// Role-based access control helpers
export const hasPermission = (userRole, requiredRoles) => {
  if (!userRole || !requiredRoles || requiredRoles.length === 0) {
    return false;
  }
  return requiredRoles.includes(userRole);
};

export const getRoleBasedFilter = (collectionName, userRole, userId) => {
  // Admin can see everything
  if (userRole === "admin") {
    return [];
  }
  
  // Role-specific filtering
  switch (collectionName) {
    case "users":
      // Non-admins can only see their own user data
      if (userRole !== "admin") {
        return [{ field: "id", operator: "==", value: userId }];
      }
      break;
    case "projects":
      if (userRole === "supervisor") {
        // Supervisors can see all projects
        return [];
      } else if (userRole === "vendor") {
        // Vendors can only see projects they're assigned to
        return [{ field: "assignedVendors", operator: "array-contains", value: userId }];
      } else if (userRole === "user" || userRole === "finance") {
        // Regular users and finance can only see projects they created
        return [{ field: "createdBy", operator: "==", value: userId }];
      }
      break;
    case "vendors":
      if (userRole === "vendor") {
        // Vendors can only see their own profile
        return [{ field: "id", operator: "==", value: userId }];
      }
      // Supervisors and Finance can see all vendors
      break;
    case "invoices":
      if (userRole === "vendor") {
        // Vendors can only see invoices associated with them
        return [{ field: "vendorId", operator: "==", value: userId }];
      } else if (userRole === "supervisor") {
        // Supervisors can see invoices for their projects
        // This would need more complex querying in a real application
      }
      break;
    default:
      // Default filtering based on user role
      if (userRole !== "admin" && userRole !== "supervisor") {
        return [{ field: "createdBy", operator: "==", value: userId }];
      }
  }
  
  return [];
};

export { db, usersCollection };


// Firebase Firestore service
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, limit, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import app from "./config";
import { toast } from "@/components/ui/use-toast";

// Initialize Cloud Firestore
const db = getFirestore(app);

// Collection references
const collections = {
  users: collection(db, "users"),
  vendors: collection(db, "vendors"),
  projects: collection(db, "projects"),
  vendorDocuments: collection(db, "vendorDocuments"),
  tickets: collection(db, "tickets"),
  ticketDocuments: collection(db, "ticketDocuments"),
  bills: collection(db, "bills"),
  adHocPayments: collection(db, "adHocPayments"),
};

// Helper to convert Firestore timestamp to Date
export const convertTimestampToDate = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return timestamp;
};

// Helper to convert document data with timestamps to dates
export const convertDocDates = (doc) => {
  const data = { ...doc };
  
  // Convert all timestamp fields to dates
  Object.keys(data).forEach(key => {
    if (data[key] instanceof Timestamp) {
      data[key] = data[key].toDate();
    } else if (data[key] && typeof data[key] === 'object' && data[key].seconds) {
      // Handle timestamp objects that might be serialized
      data[key] = new Date(data[key].seconds * 1000);
    }
  });
  
  return data;
};

// Helper functions
export const getDocument = async (collectionName, id) => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        ...convertDocDates(data)
      };
    } else {
      console.log(`Document ${id} not found in ${collectionName}`);
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
    const { 
      filters = [], 
      orderByField = 'createdAt', 
      orderDirection = 'desc', 
      limitCount = 100,
      pagination = null, // { page, pageSize }
    } = options;
    
    const collectionRef = collection(db, collectionName);
    let constraints = [];
    
    // Add filters
    if (filters.length > 0) {
      filters.forEach(filter => {
        if (filter && filter.field && filter.operator && filter.value !== undefined) {
          constraints.push(where(filter.field, filter.operator, filter.value));
        }
      });
    }
    
    // Add sorting
    if (orderByField) {
      constraints.push(orderBy(orderByField, orderDirection));
    }
    
    // Create the query
    let q = query(collectionRef, ...constraints);
    
    // Add pagination or limit
    if (pagination) {
      const { page, pageSize } = pagination;
      const skipCount = (page - 1) * pageSize;
      
      // Firestore doesn't have a direct "skip" functionality, so we need to get all documents
      // and then slice the result (not optimal for large collections)
      const snapshot = await getDocs(q);
      const allDocs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertDocDates(doc.data())
      }));
      
      // Calculate total pages for the response
      const totalItems = allDocs.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      
      // Return paginated data and pagination info
      return {
        data: allDocs.slice(skipCount, skipCount + pageSize),
        pagination: {
          page,
          pageSize,
          totalItems,
          totalPages,
        }
      };
    } else if (limitCount) {
      // If no pagination but limit is set
      q = query(q, limit(limitCount));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...convertDocDates(doc.data())
      }));
    } else {
      // No pagination, no limit
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...convertDocDates(doc.data())
      }));
    }
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
    // Add timestamps
    const timestamp = serverTimestamp();
    const dataWithTimestamp = {
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    let docRef;
    
    if (customId) {
      // Create document with custom ID
      docRef = doc(db, collectionName, customId);
      await setDoc(docRef, dataWithTimestamp);
      
      // Return the created document
      return { 
        id: customId, 
        ...data, // Use original data as serverTimestamp() returns null initially
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
    } else {
      // Create document with auto-generated ID
      docRef = await addDoc(collection(db, collectionName), dataWithTimestamp);
      
      // Return the created document
      return { 
        id: docRef.id, 
        ...data,  // Use original data as serverTimestamp() returns null initially
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
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
    
    // Add updatedAt timestamp
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, updateData);
    
    // Return the updated document (with current date for immediate UI update)
    return { 
      id, 
      ...data,  // Use original data as serverTimestamp() returns null initially
      updatedAt: new Date() 
    };
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

// Get filters based on user role for different collections
export const getRoleBasedFilter = (collectionName, userRole, userId) => {
  // Admin can see everything
  if (userRole === "admin") {
    return [];
  }
  
  // Role-specific filtering
  switch (collectionName) {
    case "users":
      // Non-admins can only see their own user data
      if (userRole !== "admin" && userRole !== "supervisor") {
        return [{ field: "id", operator: "==", value: userId }];
      }
      break;
      
    case "projects":
      if (userRole === "supervisor") {
        // Supervisors can see all projects or just their own
        return [
          { field: "supervisor", operator: "==", value: userId }
        ];
      } else if (userRole === "vendor") {
        // Vendors can only see projects they're assigned to
        return [{ field: "assignedVendors", operator: "array-contains", value: userId }];
      } else if (userRole === "user" || userRole === "finance") {
        // Regular users see projects where they are team members
        // Finance users see all projects for financial purposes
        if (userRole === "user") {
          return [{ field: "team", operator: "array-contains", value: userId }];
        }
      }
      break;
      
    case "vendors":
      if (userRole === "vendor") {
        // Vendors can only see their own profile
        return [{ field: "id", operator: "==", value: userId }];
      }
      // Supervisors and Finance can see all vendors
      break;
      
    case "bills":
      if (userRole === "vendor") {
        // Vendors can only see bills associated with them
        return [{ field: "vendorId", operator: "==", value: userId }];
      } else if (userRole === "supervisor") {
        // Supervisors can see bills for projects they supervise
        // This would need to be handled differently, possibly with a custom query
      }
      break;
      
    case "tickets":
      if (userRole === "vendor") {
        // Vendors can only see tickets assigned to them
        return [{ field: "assignedVendors", operator: "array-contains", value: userId }];
      } else if (userRole === "user") {
        // Users can see tickets they created or are assigned to
        // This needs a more complex query logic
        return [
          { field: "createdBy", operator: "==", value: userId },
          // OR logic would need to be handled in the component
          { field: "assignedTo", operator: "array-contains", value: userId }
        ];
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

// Batch operations (for future use)
export const batchWrite = async (operations) => {
  // To be implemented for complex operations
};

export { db, collections };

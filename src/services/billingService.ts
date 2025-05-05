import { db } from "@/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp, 
  getDoc, 
  Query, 
  CollectionReference, 
  DocumentData,
  DocumentReference
} from "firebase/firestore";
import { toast } from "@/components/ui/use-toast";

const BILLS_COLLECTION = 'bills';
const PAYMENTS_COLLECTION = 'adHocPayments';
const INVOICES_COLLECTION = 'invoices';
const FINANCIAL_REQUESTS_COLLECTION = 'financialRequests';

export interface Bill {
  id?: string;
  billId?: string;
  vendorId: string;
  vendorName?: string;
  projectId?: string;
  projectName?: string;
  amount: number;
  invoiceNumber: string;
  description: string;
  status: 'draft' | 'pending' | 'approved' | 'paid' | 'rejected' | 'overdue';
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  paymentReference?: string;
  isScamSuspected?: boolean;
  scamReportedBy?: string;
  scamReportDate?: Date;
  scamNotes?: string;
}

export interface Payment {
  id?: string;
  paymentId?: string;
  amount: number;
  purpose: string;
  requestedBy: string;
  projectId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'completed';
  requestDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  paidBy?: string;
  paidAt?: Date;
  paymentReference?: string;
  isScamSuspected?: boolean;
  scamReportedBy?: string;
  scamReportDate?: Date;
  scamNotes?: string;
}

export interface Invoice {
  id?: string;
  invoiceId?: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName?: string;
  projectId?: string;
  projectName?: string;
  amount: number;
  description: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue';
  issueDate: Date;
  dueDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
  isScamSuspected?: boolean;
  scamReportedBy?: string;
  scamReportDate?: Date;
  scamNotes?: string;
}

export interface FinancialRequest {
  id?: string;
  requestId?: string;
  requestType: 'advance' | 'reimbursement' | 'purchase';
  amount: number;
  description: string;
  purpose?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedBy: string;
  projectId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  completedBy?: string;
  completedAt?: Date;
  isScamSuspected?: boolean;
  scamReportedBy?: string;
  scamReportDate?: Date;
  scamNotes?: string;
}

// Helper function to convert Firestore timestamps to JavaScript Date objects
const convertTimestamps = (data: any) => {
  const result = { ...data };
  
  ['createdAt', 'updatedAt', 'approvedAt', 'paidAt', 'issueDate', 'dueDate', 
   'requestDate', 'completedAt', 'scamReportDate', 'paidDate'].forEach(field => {
    if (result[field] && result[field].toDate) {
      result[field] = result[field].toDate();
    }
  });
  
  return result;
};

// Bills
export const getBills = async (filters?: any) => {
  try {
    const billsCollection: CollectionReference<DocumentData> = collection(db, BILLS_COLLECTION);
    let q: Query<DocumentData> = billsCollection;
    
    if (filters) {
      if (filters.vendorId) {
        q = query(q, where('vendorId', '==', filters.vendorId));
      }
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      // Add filter for potential scams
      if (filters.isScamSuspected) {
        q = query(q, where('isScamSuspected', '==', true));
      }
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    })) as Bill[];
  } catch (error: any) {
    console.error("Error fetching bills:", error);
    toast({
      title: "Error",
      description: `Failed to fetch bills: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
};

export const createBill = async (bill: Bill) => {
  try {
    const billData = {
      ...bill,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, BILLS_COLLECTION), billData);
    return { id: docRef.id, ...bill };
  } catch (error: any) {
    console.error("Error creating bill:", error);
    toast({
      title: "Error",
      description: `Failed to create bill: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

export const updateBill = async (id: string, data: Partial<Bill>) => {
  try {
    const billRef = doc(db, BILLS_COLLECTION, id);
    await updateDoc(billRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    return { id, ...data };
  } catch (error: any) {
    console.error("Error updating bill:", error);
    toast({
      title: "Error",
      description: `Failed to update bill: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

export const deleteBill = async (id: string) => {
  try {
    await deleteDoc(doc(db, BILLS_COLLECTION, id));
    return true;
  } catch (error: any) {
    console.error("Error deleting bill:", error);
    toast({
      title: "Error",
      description: `Failed to delete bill: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

// Payments
export const getPayments = async (filters?: any) => {
  try {
    const paymentsCollection: CollectionReference<DocumentData> = collection(db, PAYMENTS_COLLECTION);
    let q: Query<DocumentData> = paymentsCollection;
    
    if (filters) {
      if (filters.requestedBy) {
        q = query(q, where('requestedBy', '==', filters.requestedBy));
      }
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      // Add filter for potential scams
      if (filters.isScamSuspected) {
        q = query(q, where('isScamSuspected', '==', true));
      }
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    })) as Payment[];
  } catch (error: any) {
    console.error("Error fetching payments:", error);
    toast({
      title: "Error",
      description: `Failed to fetch payments: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
};

export const createPayment = async (payment: Payment) => {
  try {
    const paymentData = {
      ...payment,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, PAYMENTS_COLLECTION), paymentData);
    return { id: docRef.id, ...payment };
  } catch (error: any) {
    console.error("Error creating payment:", error);
    toast({
      title: "Error",
      description: `Failed to create payment request: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

export const updatePayment = async (id: string, data: Partial<Payment>) => {
  try {
    const paymentRef = doc(db, PAYMENTS_COLLECTION, id);
    await updateDoc(paymentRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    return { id, ...data };
  } catch (error: any) {
    console.error("Error updating payment:", error);
    toast({
      title: "Error",
      description: `Failed to update payment: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

export const deletePayment = async (id: string) => {
  try {
    await deleteDoc(doc(db, PAYMENTS_COLLECTION, id));
    return true;
  } catch (error: any) {
    console.error("Error deleting payment:", error);
    toast({
      title: "Error",
      description: `Failed to delete payment: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

// Invoices
export const getInvoices = async (filters?: any) => {
  try {
    const invoicesCollection: CollectionReference<DocumentData> = collection(db, INVOICES_COLLECTION);
    let q: Query<DocumentData> = invoicesCollection;
    
    if (filters) {
      if (filters.vendorId) {
        q = query(q, where('vendorId', '==', filters.vendorId));
      }
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      // Add filter for potential scams
      if (filters.isScamSuspected) {
        q = query(q, where('isScamSuspected', '==', true));
      }
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    })) as Invoice[];
  } catch (error: any) {
    console.error("Error fetching invoices:", error);
    toast({
      title: "Error",
      description: `Failed to fetch invoices: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
};

export const createInvoice = async (invoice: Invoice) => {
  try {
    const invoiceData = {
      ...invoice,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, INVOICES_COLLECTION), invoiceData);
    return { id: docRef.id, ...invoice };
  } catch (error: any) {
    console.error("Error creating invoice:", error);
    toast({
      title: "Error",
      description: `Failed to create invoice: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

export const updateInvoice = async (id: string, data: Partial<Invoice>) => {
  try {
    const invoiceRef = doc(db, INVOICES_COLLECTION, id);
    await updateDoc(invoiceRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    return { id, ...data };
  } catch (error: any) {
    console.error("Error updating invoice:", error);
    toast({
      title: "Error",
      description: `Failed to update invoice: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

export const deleteInvoice = async (id: string) => {
  try {
    await deleteDoc(doc(db, INVOICES_COLLECTION, id));
    return true;
  } catch (error: any) {
    console.error("Error deleting invoice:", error);
    toast({
      title: "Error",
      description: `Failed to delete invoice: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

// Financial Requests
export const getFinancialRequests = async (filters?: any) => {
  try {
    const requestsCollection: CollectionReference<DocumentData> = collection(db, FINANCIAL_REQUESTS_COLLECTION);
    let q: Query<DocumentData> = requestsCollection;
    
    if (filters) {
      if (filters.requestedBy) {
        q = query(q, where('requestedBy', '==', filters.requestedBy));
      }
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.requestType) {
        q = query(q, where('requestType', '==', filters.requestType));
      }
      // Add filter for potential scams
      if (filters.isScamSuspected) {
        q = query(q, where('isScamSuspected', '==', true));
      }
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    })) as FinancialRequest[];
  } catch (error: any) {
    console.error("Error fetching financial requests:", error);
    toast({
      title: "Error",
      description: `Failed to fetch financial requests: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
};

export const createFinancialRequest = async (request: FinancialRequest) => {
  try {
    const requestData = {
      ...request,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, FINANCIAL_REQUESTS_COLLECTION), requestData);
    return { id: docRef.id, ...request };
  } catch (error: any) {
    console.error("Error creating financial request:", error);
    toast({
      title: "Error",
      description: `Failed to create financial request: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

export const updateFinancialRequest = async (id: string, data: Partial<FinancialRequest>) => {
  try {
    const requestRef = doc(db, FINANCIAL_REQUESTS_COLLECTION, id);
    await updateDoc(requestRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    return { id, ...data };
  } catch (error: any) {
    console.error("Error updating financial request:", error);
    toast({
      title: "Error",
      description: `Failed to update financial request: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

export const deleteFinancialRequest = async (id: string) => {
  try {
    await deleteDoc(doc(db, FINANCIAL_REQUESTS_COLLECTION, id));
    return true;
  } catch (error: any) {
    console.error("Error deleting financial request:", error);
    toast({
      title: "Error",
      description: `Failed to delete financial request: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

// New function for reporting a financial entity as potentially fraudulent
export const reportPotentialScam = async (
  collectionName: string, 
  id: string, 
  reportedBy: string, 
  notes: string
) => {
  try {
    const docRef = doc(db, collectionName, id);
    
    await updateDoc(docRef, {
      isScamSuspected: true,
      scamReportedBy: reportedBy,
      scamReportDate: serverTimestamp(),
      scamNotes: notes,
      updatedAt: serverTimestamp()
    });
    
    toast({
      title: "Scam Report Submitted",
      description: "The suspicious activity has been reported and will be investigated.",
    });
    
    return true;
  } catch (error: any) {
    console.error("Error reporting potential scam:", error);
    toast({
      title: "Error",
      description: `Failed to report potential scam: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

// Function to get all reported scams across different financial collections
export const getAllReportedScams = async () => {
  try {
    // Query for scams in bills
    const billsQuery = query(
      collection(db, BILLS_COLLECTION),
      where('isScamSuspected', '==', true)
    );
    const billsSnapshot = await getDocs(billsQuery);
    const reportedBills = billsSnapshot.docs.map(doc => ({
      id: doc.id,
      type: 'bill',
      ...convertTimestamps(doc.data())
    }));
    
    // Query for scams in payments
    const paymentsQuery = query(
      collection(db, PAYMENTS_COLLECTION),
      where('isScamSuspected', '==', true)
    );
    const paymentsSnapshot = await getDocs(paymentsQuery);
    const reportedPayments = paymentsSnapshot.docs.map(doc => ({
      id: doc.id,
      type: 'payment',
      ...convertTimestamps(doc.data())
    }));
    
    // Query for scams in invoices
    const invoicesQuery = query(
      collection(db, INVOICES_COLLECTION),
      where('isScamSuspected', '==', true)
    );
    const invoicesSnapshot = await getDocs(invoicesQuery);
    const reportedInvoices = invoicesSnapshot.docs.map(doc => ({
      id: doc.id,
      type: 'invoice',
      ...convertTimestamps(doc.data())
    }));
    
    // Query for scams in financial requests
    const requestsQuery = query(
      collection(db, FINANCIAL_REQUESTS_COLLECTION),
      where('isScamSuspected', '==', true)
    );
    const requestsSnapshot = await getDocs(requestsQuery);
    const reportedRequests = requestsSnapshot.docs.map(doc => ({
      id: doc.id,
      type: 'financial_request',
      ...convertTimestamps(doc.data())
    }));
    
    // Combine all reported scams
    return [...reportedBills, ...reportedPayments, ...reportedInvoices, ...reportedRequests];
  } catch (error: any) {
    console.error("Error fetching reported scams:", error);
    toast({
      title: "Error",
      description: `Failed to fetch reported scams: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
};

// Function to clear a scam report after investigation
export const clearScamReport = async (collectionName: string, id: string, clearedBy: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    
    await updateDoc(docRef, {
      isScamSuspected: false,
      scamInvestigationComplete: true,
      scamInvestigatedBy: clearedBy,
      scamInvestigationDate: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    toast({
      title: "Scam Report Cleared",
      description: "The investigation is complete and the report has been cleared.",
    });
    
    return true;
  } catch (error: any) {
    console.error("Error clearing scam report:", error);
    toast({
      title: "Error",
      description: `Failed to clear scam report: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

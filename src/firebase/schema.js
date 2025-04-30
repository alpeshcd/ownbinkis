
// Firebase schema definitions

// User schema
export const UserSchema = {
  id: "",           // User ID (from Firebase Auth)
  email: "",        // User email
  name: "",         // User's full name
  role: "",         // User role: "admin" | "supervisor" | "finance" | "vendor" | "user"
  createdAt: null,  // Date when the user was created
};

// Project schema
export const ProjectSchema = {
  id: "",           // Project ID
  name: "",         // Project name
  description: "",  // Project description
  status: "",       // Status: "active" | "completed" | "on-hold" | "cancelled"
  startDate: null,  // Project start date
  endDate: null,    // Project end date
  assignedVendors: [], // List of vendor IDs
  tickets: 0,       // Number of tickets
};

// Ticket schema
export const TicketSchema = {
  id: "",           // Ticket ID
  projectId: "",    // Project ID
  projectName: "",  // Project name
  title: "",        // Ticket title
  status: "",       // Status: "open" | "in-progress" | "resolved" | "closed"
  assignedTo: "",   // User assigned to the ticket
  createdAt: null,  // Creation date
  priority: "",     // Priority: "high" | "medium" | "low"
};

// Vendor schema
export const VendorSchema = {
  id: "",           // Vendor ID
  name: "",         // Vendor name
  contactEmail: "", // Contact email
  contactPhone: "", // Contact phone
  services: [],     // List of services provided
  address: "",      // Vendor address
  status: "",       // Status: "active" | "inactive"
};

// Invoice schema
export const InvoiceSchema = {
  id: "",           // Invoice ID
  vendorId: "",     // Vendor ID
  vendorName: "",   // Vendor name
  projectId: "",    // Project ID
  projectName: "",  // Project name
  amount: 0,        // Invoice amount
  status: "",       // Status: "paid" | "pending" | "overdue" | "draft"
  dueDate: null,    // Due date
  paidDate: null,   // Paid date
};

// Payment schema
export const PaymentSchema = {
  id: "",           // Payment ID
  invoiceId: "",    // Related invoice ID
  vendorName: "",   // Vendor name
  amount: 0,        // Payment amount
  status: "",       // Status: "pending" | "completed" | "authorized" | "rejected"
  date: null,       // Payment date
  method: "",       // Payment method
  processedBy: "",  // User who processed the payment
};

// Payment request schema
export const PaymentRequestSchema = {
  id: "",           // Request ID
  projectId: "",    // Project ID
  projectName: "",  // Project name
  requester: "",    // Requester name
  amount: 0,        // Request amount
  purpose: "",      // Purpose description
  status: "",       // Status: "pending" | "approved" | "rejected"
  submittedDate: null, // Submission date
};

// Financial request schema
export const FinancialRequestSchema = {
  id: "",           // Request ID
  projectId: "",    // Project ID
  projectName: "",  // Project name
  amount: 0,        // Request amount
  purpose: "",      // Purpose description
  status: "",       // Status: "pending" | "approved" | "rejected" | "completed"
  createdAt: null,  // Creation date
  createdBy: "",    // Creator name
  approvedBy: "",   // Approver name
  approvedAt: null, // Approval date
};

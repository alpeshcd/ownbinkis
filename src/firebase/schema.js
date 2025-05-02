
// Firebase schema definitions

// User schema
export const UserSchema = {
  id: "",           // User ID (from Firebase Auth)
  email: "",        // User email
  name: "",         // User's full name
  role: "",         // User role: "admin" | "supervisor" | "finance" | "vendor" | "user"
  phone: "",        // User's phone number (optional)
  createdAt: null,  // Date when the user was created
  updatedAt: null,  // Date when the user was last updated
};

// Vendor schema
export const VendorSchema = {
  id: "",           // Vendor ID
  name: "",         // Vendor name
  contactInfo: {    // Contact information
    email: "",      // Contact email
    phone: "",      // Contact phone
    address: "",    // Physical address
  },
  serviceCategories: [], // List of service categories
  rateInformation: {    // Rate information
    hourlyRate: 0,      // Hourly rate
    dayRate: 0,         // Daily rate
    currency: "USD",    // Currency
  },
  status: "",       // Status: "active" | "inactive"
  createdBy: "",    // User ID who created this vendor
  createdAt: null,  // Creation date
  updatedAt: null,  // Last update date
};

// Project schema
export const ProjectSchema = {
  id: "",           // Project ID
  name: "",         // Project name
  description: "",  // Project description
  status: "",       // Status: "not-started" | "in-progress" | "completed"
  priority: "",     // Priority: "low" | "medium" | "high"
  supervisor: "",   // User ID of the supervisor
  team: [],         // List of user IDs in the team
  assignedVendors: [], // List of vendor IDs
  startDate: null,  // Project start date
  endDate: null,    // Project end date (optional)
  budget: 0,        // Project budget (optional)
  createdBy: "",    // User ID who created this project
  createdAt: null,  // Creation date
  updatedAt: null,  // Last update date
  tasks: [],        // List of tasks
  comments: [],     // List of comments
  attachments: [],  // List of attachments
};

// Task schema
export const TaskSchema = {
  id: "",           // Task ID
  title: "",        // Task title
  description: "",  // Task description
  status: "",       // Status: "not-started" | "in-progress" | "completed"
  assignedTo: [],   // List of user IDs assigned to the task
  dueDate: null,    // Due date
  createdBy: "",    // User ID who created this task
  createdAt: null,  // Creation date
  updatedAt: null,  // Last update date
  comments: [],     // List of comments
  attachments: [],  // List of attachments
};

// VendorDocument schema
export const VendorDocumentSchema = {
  id: "",           // Document ID
  vendorId: "",     // Vendor ID
  fileName: "",     // File name
  fileUrl: "",      // File URL
  fileType: "",     // File type
  fileSize: 0,      // File size
  category: "",     // Category: "contract" | "invoice" | "certification" | "other"
  uploadedBy: "",   // User ID who uploaded the document
  uploadedAt: null, // Upload date
  description: "",  // Description (optional)
  expiryDate: null, // Expiry date (optional)
};

// Ticket schema
export const TicketSchema = {
  id: "",           // Ticket ID
  projectId: "",    // Project ID
  title: "",        // Ticket title
  description: "",  // Ticket description
  status: "",       // Status: "open" | "in-progress" | "resolved" | "closed"
  priority: "",     // Priority: "high" | "medium" | "low"
  assignedTo: [],   // List of user IDs
  assignedVendors: [], // List of vendor IDs
  createdBy: "",    // User ID who created this ticket
  createdAt: null,  // Creation date
  updatedAt: null,  // Last update date
  comments: [],     // List of comments
  attachments: [],  // List of attachments
};

// TicketDocument schema
export const TicketDocumentSchema = {
  id: "",           // Document ID
  ticketId: "",     // Ticket ID
  fileName: "",     // File name
  fileUrl: "",      // File URL
  fileType: "",     // File type
  fileSize: 0,      // File size
  uploadedBy: "",   // User ID who uploaded the document
  uploadedAt: null, // Upload date
};

// Bill schema
export const BillSchema = {
  id: "",           // Bill ID
  vendorId: "",     // Vendor ID
  projectId: "",    // Project ID
  vendorName: "",   // Vendor name (for quick access)
  projectName: "",  // Project name (for quick access)
  invoiceNumber: "",// Invoice number
  amount: 0,        // Bill amount
  status: "",       // Status: "draft" | "pending" | "paid" | "overdue"
  issueDate: null,  // Issue date
  dueDate: null,    // Due date
  paidDate: null,   // Paid date (if paid)
  description: "",  // Bill description
  attachments: [],  // List of attachments
  createdBy: "",    // User ID who created this bill
  createdAt: null,  // Creation date
  updatedAt: null,  // Last update date
  approvedBy: "",   // User ID who approved the bill (optional)
  approvedAt: null, // Approval date (optional)
  paidBy: "",       // User ID who marked it as paid (optional)
  paymentReference: "", // Payment reference (optional)
};

// AdHocPayment schema
export const AdHocPaymentSchema = {
  id: "",           // Payment ID
  projectId: "",    // Project ID (optional)
  requestedBy: "",  // User ID who requested this payment
  amount: 0,        // Payment amount
  purpose: "",      // Payment purpose
  status: "",       // Status: "pending" | "approved" | "rejected" | "paid"
  requestDate: null, // Request date
  attachments: [],  // List of attachments
  approvedBy: "",   // User ID who approved the payment (optional)
  approvedAt: null, // Approval date (optional)
  rejectedBy: "",   // User ID who rejected the payment (optional)
  rejectionReason: "", // Reason for rejection (optional)
  paidBy: "",       // User ID who marked it as paid (optional)
  paidAt: null,     // Payment date (optional)
  paymentReference: "", // Payment reference (optional)
};

// Comment schema
export const CommentSchema = {
  id: "",           // Comment ID
  content: "",      // Comment content
  createdBy: "",    // User ID who created this comment
  createdByName: "", // Name of the user who created this comment
  createdAt: null,  // Creation date
};

// Attachment schema
export const AttachmentSchema = {
  id: "",           // Attachment ID
  fileName: "",     // File name
  fileUrl: "",      // File URL
  fileType: "",     // File type
  fileSize: 0,      // File size (optional)
  uploadedBy: "",   // User ID who uploaded the attachment
  uploadedByName: "", // Name of the user who uploaded the attachment (optional)
  uploadedAt: null, // Upload date
};

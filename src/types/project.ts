
import { User, UserRole } from "@/contexts/auth";

export type ProjectStatus = "not-started" | "in-progress" | "completed";
export type ProjectPriority = "low" | "medium" | "high";

export interface ProjectComment {
  id: string;
  content: string;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
}

export interface ProjectAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  uploadedBy: string;
  uploadedByName?: string;
  uploadedAt: Date;
}

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  assignedTo: string[];
  dueDate: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  comments: ProjectComment[];
  attachments: ProjectAttachment[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: Date;
  endDate: Date;
  budget?: number;
  supervisor: string;
  team: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  tasks: ProjectTask[];
  comments: ProjectComment[];
  attachments: ProjectAttachment[];
}

// VendorDocument interfaces
export interface VendorDocument {
  id: string;
  vendorId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: "contract" | "invoice" | "certification" | "other";
  uploadedBy: string;
  uploadedAt: Date;
  description?: string;
  expiryDate?: Date;
}

// Ticket interfaces
export interface Ticket {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  assignedTo: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  comments: TicketComment[];
  attachments: TicketAttachment[];
}

export interface TicketComment {
  id: string;
  content: string;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
}

export interface TicketAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
}

// Bill and Payment interfaces
export interface Bill {
  id: string;
  vendorId: string;
  invoiceNumber: string;
  amount: number;
  status: "pending" | "approved" | "paid" | "rejected";
  issueDate: Date;
  dueDate: Date;
  description: string;
  attachments: ProjectAttachment[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  paidBy?: string;
  paidAt?: Date;
  paymentReference?: string;
}

export interface AdHocPayment {
  id: string;
  requestedBy: string;
  amount: number;
  purpose: string;
  status: "pending" | "approved" | "rejected" | "paid";
  requestDate: Date;
  projectId?: string;
  attachments: ProjectAttachment[];
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectionReason?: string;
  paidBy?: string;
  paidAt?: Date;
  paymentReference?: string;
}

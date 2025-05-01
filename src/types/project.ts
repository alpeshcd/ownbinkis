
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
  uploadedBy: string;
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

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  Timestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/firebase";
import { 
  Project, 
  ProjectTask, 
  ProjectComment, 
  ProjectAttachment, 
  ProjectStatus, 
  ProjectPriority 
} from "@/types/project";
import { User } from "@/contexts/auth";
import { safelyConvertToDate } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";

// Helper function to convert Firestore data to our Project interface
const convertFirestoreProject = (doc: any): Project => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    description: data.description,
    status: data.status,
    priority: data.priority,
    startDate: safelyConvertToDate(data.startDate),
    endDate: safelyConvertToDate(data.endDate),
    budget: data.budget,
    supervisor: data.supervisor,
    team: data.team || [],
    createdBy: data.createdBy,
    createdAt: safelyConvertToDate(data.createdAt),
    updatedAt: safelyConvertToDate(data.updatedAt),
    tasks: (data.tasks || []).map((task: any) => ({
      ...task,
      dueDate: safelyConvertToDate(task.dueDate),
      createdAt: safelyConvertToDate(task.createdAt),
      updatedAt: safelyConvertToDate(task.updatedAt),
      comments: (task.comments || []).map((comment: any) => ({
        ...comment,
        createdAt: safelyConvertToDate(comment.createdAt),
      })),
      attachments: (task.attachments || []).map((attachment: any) => ({
        ...attachment,
        uploadedAt: safelyConvertToDate(attachment.uploadedAt),
      })),
    })),
    comments: (data.comments || []).map((comment: any) => ({
      ...comment,
      createdAt: safelyConvertToDate(comment.createdAt),
    })),
    attachments: (data.attachments || []).map((attachment: any) => ({
      ...attachment,
      uploadedAt: safelyConvertToDate(attachment.uploadedAt),
    })),
  };
};

// Get all projects (with optional filters)
export const getProjects = async (filters?: any): Promise<Project[]> => {
  try {
    let projectsQuery = collection(db, "projects");
    let constraints = [];

    if (filters) {
      if (filters.status) {
        constraints.push(where("status", "==", filters.status));
      }
      if (filters.supervisor) {
        constraints.push(where("supervisor", "==", filters.supervisor));
      }
      if (filters.team) {
        constraints.push(where("team", "array-contains", filters.team));
      }
    }

    constraints.push(orderBy("createdAt", "desc"));
    
    const q = query(projectsQuery, ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(convertFirestoreProject);
  } catch (error: any) {
    console.error("Error getting projects:", error);
    toast({
      title: "Error",
      description: `Failed to fetch projects: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
};

// Get projects for a specific user based on their role
export const getUserProjects = async (user: User): Promise<Project[]> => {
  try {
    if (!user) throw new Error("User not authenticated");

    let projects: Project[] = [];
    
    // Admins can see all projects
    if (user.role === "admin") {
      projects = await getProjects();
    } 
    // Supervisors see projects where they are the supervisor
    else if (user.role === "supervisor") {
      projects = await getProjects({ supervisor: user.id });
    } 
    // Other users see only projects where they are in the team
    else {
      projects = await getProjects({ team: user.id });
    }
    
    return projects;
  } catch (error: any) {
    console.error("Error getting user projects:", error);
    toast({
      title: "Error",
      description: `Failed to fetch your projects: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
};

// Get a specific project
export const getProject = async (projectId: string): Promise<Project | null> => {
  try {
    const docRef = doc(db, "projects", projectId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return convertFirestoreProject(docSnap);
    } else {
      toast({
        title: "Error",
        description: "Project not found",
        variant: "destructive",
      });
      return null;
    }
  } catch (error: any) {
    console.error("Error getting project:", error);
    toast({
      title: "Error",
      description: `Failed to fetch project: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

// Create a new project
export const createProject = async (projectData: Omit<Project, "id" | "createdAt" | "updatedAt" | "tasks" | "comments" | "attachments">): Promise<Project | null> => {
  try {
    const projectRef = collection(db, "projects");
    
    const newProject = {
      ...projectData,
      tasks: [],
      comments: [],
      attachments: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(projectRef, newProject);
    const newDoc = await getDoc(docRef);
    
    toast({
      title: "Success",
      description: "Project created successfully",
    });
    
    return convertFirestoreProject(newDoc);
  } catch (error: any) {
    console.error("Error creating project:", error);
    toast({
      title: "Error",
      description: `Failed to create project: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

// Update a project
export const updateProject = async (projectId: string, projectData: Partial<Project>): Promise<Project | null> => {
  try {
    const projectRef = doc(db, "projects", projectId);
    
    const updateData = {
      ...projectData,
      updatedAt: serverTimestamp()
    };
    
    // Remove id, createdAt, tasks, comments, attachments from update data
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.tasks;
    delete updateData.comments;
    delete updateData.attachments;
    
    await updateDoc(projectRef, updateData);
    
    toast({
      title: "Success",
      description: "Project updated successfully",
    });
    
    return await getProject(projectId);
  } catch (error: any) {
    console.error("Error updating project:", error);
    toast({
      title: "Error",
      description: `Failed to update project: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

// Delete a project
export const deleteProject = async (projectId: string): Promise<boolean> => {
  try {
    // First delete all attachments
    const project = await getProject(projectId);
    if (project) {
      // Delete project attachments
      for (const attachment of project.attachments) {
        await deleteAttachment(projectId, attachment.id);
      }
      
      // Delete task attachments
      for (const task of project.tasks) {
        for (const attachment of task.attachments) {
          await deleteTaskAttachment(projectId, task.id, attachment.id);
        }
      }
    }
    
    // Then delete the project document
    await deleteDoc(doc(db, "projects", projectId));
    
    toast({
      title: "Success",
      description: "Project deleted successfully",
    });
    
    return true;
  } catch (error: any) {
    console.error("Error deleting project:", error);
    toast({
      title: "Error",
      description: `Failed to delete project: ${error.message}`,
      variant: "destructive",
    });
    return false;
  }
};

// Add a comment to a project
export const addProjectComment = async (projectId: string, content: string, user: User): Promise<Project | null> => {
  try {
    const projectRef = doc(db, "projects", projectId);
    
    const comment = {
      id: crypto.randomUUID(),
      content,
      createdBy: user.id,
      createdByName: user.name,
      createdAt: new Date()
    };
    
    await updateDoc(projectRef, {
      comments: arrayUnion(comment),
      updatedAt: serverTimestamp()
    });
    
    return await getProject(projectId);
  } catch (error: any) {
    console.error("Error adding comment:", error);
    toast({
      title: "Error",
      description: `Failed to add comment: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

// Delete a comment from a project
export const deleteProjectComment = async (projectId: string, commentId: string): Promise<Project | null> => {
  try {
    const projectRef = doc(db, "projects", projectId);
    const project = await getProject(projectId);
    
    if (!project) return null;
    
    const comment = project.comments.find(c => c.id === commentId);
    
    if (comment) {
      await updateDoc(projectRef, {
        comments: arrayRemove(comment),
        updatedAt: serverTimestamp()
      });
    }
    
    return await getProject(projectId);
  } catch (error: any) {
    console.error("Error deleting comment:", error);
    toast({
      title: "Error",
      description: `Failed to delete comment: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

// Upload and attach a file to a project
export const addAttachment = async (projectId: string, file: File, user: User): Promise<Project | null> => {
  try {
    // Upload file to storage
    const storageRef = ref(storage, `projects/${projectId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    // Add file reference to project
    const projectRef = doc(db, "projects", projectId);
    
    const attachment = {
      id: crypto.randomUUID(),
      fileName: file.name,
      fileUrl: downloadURL,
      fileType: file.type,
      uploadedBy: user.id,
      uploadedAt: new Date()
    };
    
    await updateDoc(projectRef, {
      attachments: arrayUnion(attachment),
      updatedAt: serverTimestamp()
    });
    
    return await getProject(projectId);
  } catch (error: any) {
    console.error("Error adding attachment:", error);
    toast({
      title: "Error",
      description: `Failed to upload file: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

// Delete an attachment from a project
export const deleteAttachment = async (projectId: string, attachmentId: string): Promise<Project | null> => {
  try {
    const projectRef = doc(db, "projects", projectId);
    const project = await getProject(projectId);
    
    if (!project) return null;
    
    const attachment = project.attachments.find(a => a.id === attachmentId);
    
    if (attachment) {
      // Delete file from storage
      const storageRef = ref(storage, attachment.fileUrl);
      await deleteObject(storageRef);
      
      // Remove reference from project
      await updateDoc(projectRef, {
        attachments: arrayRemove(attachment),
        updatedAt: serverTimestamp()
      });
    }
    
    return await getProject(projectId);
  } catch (error: any) {
    console.error("Error deleting attachment:", error);
    toast({
      title: "Error",
      description: `Failed to delete file: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

// Add a task to a project
export const addTask = async (projectId: string, taskData: Omit<ProjectTask, "id" | "createdAt" | "updatedAt" | "comments" | "attachments">, user: User): Promise<Project | null> => {
  try {
    const projectRef = doc(db, "projects", projectId);
    
    const task: ProjectTask = {
      ...taskData,
      id: crypto.randomUUID(),
      comments: [],
      attachments: [],
      createdBy: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const project = await getProject(projectId);
    
    if (!project) return null;
    
    const updatedTasks = [...project.tasks, task];
    
    await updateDoc(projectRef, {
      tasks: updatedTasks,
      updatedAt: serverTimestamp()
    });
    
    return await getProject(projectId);
  } catch (error: any) {
    console.error("Error adding task:", error);
    toast({
      title: "Error",
      description: `Failed to add task: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

// Update a task
export const updateTask = async (projectId: string, taskId: string, taskData: Partial<ProjectTask>): Promise<Project | null> => {
  try {
    const projectRef = doc(db, "projects", projectId);
    const project = await getProject(projectId);
    
    if (!project) return null;
    
    const taskIndex = project.tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      toast({
        title: "Error",
        description: "Task not found",
        variant: "destructive",
      });
      return null;
    }
    
    const updatedTask = {
      ...project.tasks[taskIndex],
      ...taskData,
      updatedAt: new Date()
    };
    
    // Don't override these fields
    updatedTask.id = project.tasks[taskIndex].id;
    updatedTask.createdAt = project.tasks[taskIndex].createdAt;
    updatedTask.comments = project.tasks[taskIndex].comments;
    updatedTask.attachments = project.tasks[taskIndex].attachments;
    
    const updatedTasks = [...project.tasks];
    updatedTasks[taskIndex] = updatedTask;
    
    await updateDoc(projectRef, {
      tasks: updatedTasks,
      updatedAt: serverTimestamp()
    });
    
    return await getProject(projectId);
  } catch (error: any) {
    console.error("Error updating task:", error);
    toast({
      title: "Error",
      description: `Failed to update task: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

// Delete a task
export const deleteTask = async (projectId: string, taskId: string): Promise<Project | null> => {
  try {
    const projectRef = doc(db, "projects", projectId);
    const project = await getProject(projectId);
    
    if (!project) return null;
    
    const taskIndex = project.tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      toast({
        title: "Error",
        description: "Task not found",
        variant: "destructive",
      });
      return null;
    }
    
    // Delete task attachments first
    for (const attachment of project.tasks[taskIndex].attachments) {
      await deleteTaskAttachment(projectId, taskId, attachment.id);
    }
    
    const updatedTasks = project.tasks.filter(t => t.id !== taskId);
    
    await updateDoc(projectRef, {
      tasks: updatedTasks,
      updatedAt: serverTimestamp()
    });
    
    return await getProject(projectId);
  } catch (error: any) {
    console.error("Error deleting task:", error);
    toast({
      title: "Error",
      description: `Failed to delete task: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

// Add a comment to a task
export const addTaskComment = async (projectId: string, taskId: string, content: string, user: User): Promise<Project | null> => {
  try {
    const project = await getProject(projectId);
    
    if (!project) return null;
    
    const taskIndex = project.tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      toast({
        title: "Error",
        description: "Task not found",
        variant: "destructive",
      });
      return null;
    }
    
    const comment = {
      id: crypto.randomUUID(),
      content,
      createdBy: user.id,
      createdByName: user.name,
      createdAt: new Date()
    };
    
    const updatedTask = { ...project.tasks[taskIndex] };
    updatedTask.comments = [...updatedTask.comments, comment];
    updatedTask.updatedAt = new Date();
    
    const updatedTasks = [...project.tasks];
    updatedTasks[taskIndex] = updatedTask;
    
    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, {
      tasks: updatedTasks,
      updatedAt: serverTimestamp()
    });
    
    return await getProject(projectId);
  } catch (error: any) {
    console.error("Error adding task comment:", error);
    toast({
      title: "Error",
      description: `Failed to add comment: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

// Delete a comment from a task
export const deleteTaskComment = async (projectId: string, taskId: string, commentId: string): Promise<Project | null> => {
  try {
    const project = await getProject(projectId);
    
    if (!project) return null;
    
    const taskIndex = project.tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      toast({
        title: "Error",
        description: "Task not found",
        variant: "destructive",
      });
      return null;
    }
    
    const updatedTask = { ...project.tasks[taskIndex] };
    updatedTask.comments = updatedTask.comments.filter(c => c.id !== commentId);
    updatedTask.updatedAt = new Date();
    
    const updatedTasks = [...project.tasks];
    updatedTasks[taskIndex] = updatedTask;
    
    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, {
      tasks: updatedTasks,
      updatedAt: serverTimestamp()
    });
    
    return await getProject(projectId);
  } catch (error: any) {
    console.error("Error deleting task comment:", error);
    toast({
      title: "Error",
      description: `Failed to delete comment: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

// Upload and attach a file to a task
export const addTaskAttachment = async (projectId: string, taskId: string, file: File, user: User): Promise<Project | null> => {
  try {
    // Upload file to storage
    const storageRef = ref(storage, `projects/${projectId}/tasks/${taskId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    // Add file reference to task
    const project = await getProject(projectId);
    
    if (!project) return null;
    
    const taskIndex = project.tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      toast({
        title: "Error",
        description: "Task not found",
        variant: "destructive",
      });
      return null;
    }
    
    const attachment = {
      id: crypto.randomUUID(),
      fileName: file.name,
      fileUrl: downloadURL,
      fileType: file.type,
      uploadedBy: user.id,
      uploadedAt: new Date()
    };
    
    const updatedTask = { ...project.tasks[taskIndex] };
    updatedTask.attachments = [...updatedTask.attachments, attachment];
    updatedTask.updatedAt = new Date();
    
    const updatedTasks = [...project.tasks];
    updatedTasks[taskIndex] = updatedTask;
    
    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, {
      tasks: updatedTasks,
      updatedAt: serverTimestamp()
    });
    
    return await getProject(projectId);
  } catch (error: any) {
    console.error("Error adding task attachment:", error);
    toast({
      title: "Error",
      description: `Failed to upload file: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

// Delete an attachment from a task
export const deleteTaskAttachment = async (projectId: string, taskId: string, attachmentId: string): Promise<Project | null> => {
  try {
    const project = await getProject(projectId);
    
    if (!project) return null;
    
    const taskIndex = project.tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      toast({
        title: "Error",
        description: "Task not found",
        variant: "destructive",
      });
      return null;
    }
    
    const attachment = project.tasks[taskIndex].attachments.find(a => a.id === attachmentId);
    
    if (!attachment) {
      toast({
        title: "Error",
        description: "Attachment not found",
        variant: "destructive",
      });
      return null;
    }
    
    // Delete file from storage
    const storageRef = ref(storage, attachment.fileUrl);
    await deleteObject(storageRef);
    
    // Remove reference from task
    const updatedTask = { ...project.tasks[taskIndex] };
    updatedTask.attachments = updatedTask.attachments.filter(a => a.id !== attachmentId);
    updatedTask.updatedAt = new Date();
    
    const updatedTasks = [...project.tasks];
    updatedTasks[taskIndex] = updatedTask;
    
    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, {
      tasks: updatedTasks,
      updatedAt: serverTimestamp()
    });
    
    return await getProject(projectId);
  } catch (error: any) {
    console.error("Error deleting task attachment:", error);
    toast({
      title: "Error",
      description: `Failed to delete file: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

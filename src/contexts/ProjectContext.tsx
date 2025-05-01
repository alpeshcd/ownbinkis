
import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  Project, 
  ProjectTask,
  ProjectComment,
  ProjectAttachment 
} from "@/types/project";
import { useAuth } from "@/contexts/auth";
import { 
  getProjects, 
  getUserProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addProjectComment,
  deleteProjectComment,
  addAttachment,
  deleteAttachment,
  addTask,
  updateTask,
  deleteTask,
  addTaskComment,
  deleteTaskComment,
  addTaskAttachment,
  deleteTaskAttachment
} from "@/services/projectService";

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  fetchProject: (projectId: string) => Promise<void>;
  createNewProject: (projectData: Omit<Project, "id" | "createdAt" | "updatedAt" | "tasks" | "comments" | "attachments">) => Promise<Project | null>;
  updateSelectedProject: (projectData: Partial<Project>) => Promise<Project | null>;
  removeProject: (projectId: string) => Promise<boolean>;
  addComment: (content: string) => Promise<void>;
  removeComment: (commentId: string) => Promise<void>;
  uploadAttachment: (file: File) => Promise<void>;
  removeAttachment: (attachmentId: string) => Promise<void>;
  addNewTask: (taskData: Omit<ProjectTask, "id" | "createdAt" | "updatedAt" | "comments" | "attachments">) => Promise<void>;
  updateExistingTask: (taskId: string, taskData: Partial<ProjectTask>) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
  addTaskNewComment: (taskId: string, content: string) => Promise<void>;
  removeTaskComment: (taskId: string, commentId: string) => Promise<void>;
  uploadTaskAttachment: (taskId: string, file: File) => Promise<void>;
  removeTaskAttachment: (taskId: string, attachmentId: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { currentUser } = useAuth();
  
  const fetchProjects = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const userProjects = await getUserProjects(currentUser);
      setProjects(userProjects);
    } catch (error: any) {
      setError(error.message || "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProject = async (projectId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const project = await getProject(projectId);
      setSelectedProject(project);
    } catch (error: any) {
      setError(error.message || "Failed to fetch project");
    } finally {
      setLoading(false);
    }
  };
  
  const createNewProject = async (projectData: Omit<Project, "id" | "createdAt" | "updatedAt" | "tasks" | "comments" | "attachments">) => {
    if (!currentUser) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const newProject = await createProject(projectData);
      if (newProject) {
        setProjects([newProject, ...projects]);
      }
      return newProject;
    } catch (error: any) {
      setError(error.message || "Failed to create project");
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const updateSelectedProject = async (projectData: Partial<Project>) => {
    if (!selectedProject || !currentUser) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedProject = await updateProject(selectedProject.id, projectData);
      
      if (updatedProject) {
        setSelectedProject(updatedProject);
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
      }
      
      return updatedProject;
    } catch (error: any) {
      setError(error.message || "Failed to update project");
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const removeProject = async (projectId: string) => {
    if (!currentUser) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const success = await deleteProject(projectId);
      
      if (success) {
        setProjects(projects.filter(p => p.id !== projectId));
        if (selectedProject?.id === projectId) {
          setSelectedProject(null);
        }
      }
      
      return success;
    } catch (error: any) {
      setError(error.message || "Failed to delete project");
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const addComment = async (content: string) => {
    if (!selectedProject || !currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedProject = await addProjectComment(selectedProject.id, content, currentUser);
      
      if (updatedProject) {
        setSelectedProject(updatedProject);
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
      }
    } catch (error: any) {
      setError(error.message || "Failed to add comment");
    } finally {
      setLoading(false);
    }
  };
  
  const removeComment = async (commentId: string) => {
    if (!selectedProject || !currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedProject = await deleteProjectComment(selectedProject.id, commentId);
      
      if (updatedProject) {
        setSelectedProject(updatedProject);
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
      }
    } catch (error: any) {
      setError(error.message || "Failed to delete comment");
    } finally {
      setLoading(false);
    }
  };
  
  const uploadAttachment = async (file: File) => {
    if (!selectedProject || !currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedProject = await addAttachment(selectedProject.id, file, currentUser);
      
      if (updatedProject) {
        setSelectedProject(updatedProject);
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
      }
    } catch (error: any) {
      setError(error.message || "Failed to upload attachment");
    } finally {
      setLoading(false);
    }
  };
  
  const removeAttachment = async (attachmentId: string) => {
    if (!selectedProject || !currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedProject = await deleteAttachment(selectedProject.id, attachmentId);
      
      if (updatedProject) {
        setSelectedProject(updatedProject);
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
      }
    } catch (error: any) {
      setError(error.message || "Failed to delete attachment");
    } finally {
      setLoading(false);
    }
  };
  
  const addNewTask = async (taskData: Omit<ProjectTask, "id" | "createdAt" | "updatedAt" | "comments" | "attachments">) => {
    if (!selectedProject || !currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedProject = await addTask(selectedProject.id, taskData, currentUser);
      
      if (updatedProject) {
        setSelectedProject(updatedProject);
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
      }
    } catch (error: any) {
      setError(error.message || "Failed to add task");
    } finally {
      setLoading(false);
    }
  };
  
  const updateExistingTask = async (taskId: string, taskData: Partial<ProjectTask>) => {
    if (!selectedProject || !currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedProject = await updateTask(selectedProject.id, taskId, taskData);
      
      if (updatedProject) {
        setSelectedProject(updatedProject);
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
      }
    } catch (error: any) {
      setError(error.message || "Failed to update task");
    } finally {
      setLoading(false);
    }
  };
  
  const removeTask = async (taskId: string) => {
    if (!selectedProject || !currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedProject = await deleteTask(selectedProject.id, taskId);
      
      if (updatedProject) {
        setSelectedProject(updatedProject);
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
      }
    } catch (error: any) {
      setError(error.message || "Failed to delete task");
    } finally {
      setLoading(false);
    }
  };
  
  const addTaskNewComment = async (taskId: string, content: string) => {
    if (!selectedProject || !currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedProject = await addTaskComment(selectedProject.id, taskId, content, currentUser);
      
      if (updatedProject) {
        setSelectedProject(updatedProject);
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
      }
    } catch (error: any) {
      setError(error.message || "Failed to add task comment");
    } finally {
      setLoading(false);
    }
  };
  
  const removeTaskComment = async (taskId: string, commentId: string) => {
    if (!selectedProject || !currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedProject = await deleteTaskComment(selectedProject.id, taskId, commentId);
      
      if (updatedProject) {
        setSelectedProject(updatedProject);
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
      }
    } catch (error: any) {
      setError(error.message || "Failed to delete task comment");
    } finally {
      setLoading(false);
    }
  };
  
  const uploadTaskAttachment = async (taskId: string, file: File) => {
    if (!selectedProject || !currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedProject = await addTaskAttachment(selectedProject.id, taskId, file, currentUser);
      
      if (updatedProject) {
        setSelectedProject(updatedProject);
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
      }
    } catch (error: any) {
      setError(error.message || "Failed to upload task attachment");
    } finally {
      setLoading(false);
    }
  };
  
  const removeTaskAttachment = async (taskId: string, attachmentId: string) => {
    if (!selectedProject || !currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedProject = await deleteTaskAttachment(selectedProject.id, taskId, attachmentId);
      
      if (updatedProject) {
        setSelectedProject(updatedProject);
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
      }
    } catch (error: any) {
      setError(error.message || "Failed to delete task attachment");
    } finally {
      setLoading(false);
    }
  };

  // Load projects when user changes
  useEffect(() => {
    if (currentUser) {
      fetchProjects();
    } else {
      setProjects([]);
      setSelectedProject(null);
    }
  }, [currentUser]);
  
  const value = {
    projects,
    selectedProject,
    loading,
    error,
    fetchProjects,
    fetchProject,
    createNewProject,
    updateSelectedProject,
    removeProject,
    addComment,
    removeComment,
    uploadAttachment,
    removeAttachment,
    addNewTask,
    updateExistingTask,
    removeTask,
    addTaskNewComment,
    removeTaskComment,
    uploadTaskAttachment,
    removeTaskAttachment
  };
  
  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};

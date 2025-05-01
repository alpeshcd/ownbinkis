
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Edit, 
  Loader2, 
  Plus, 
  Trash2, 
  User, 
  Users 
} from "lucide-react";
import { format } from "date-fns";
import { useProject } from "@/contexts/ProjectContext";
import { useAuth } from "@/contexts/auth";
import { Project, ProjectStatus, ProjectTask } from "@/types/project";
import { TaskCard } from "./components/TaskCard";
import { TaskForm } from "./components/TaskForm";
import { CommentSection } from "./components/CommentSection";
import { AttachmentsList } from "./components/AttachmentsList";
import { ProjectForm } from "./components/ProjectForm";

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { 
    selectedProject, 
    loading, 
    fetchProject,
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
  } = useProject();
  
  const { currentUser, hasRole } = useAuth();
  
  const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = useState(false);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [isDeleteProjectDialogOpen, setIsDeleteProjectDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
    }
  }, [projectId, fetchProject]);
  
  // Redirect to projects list if project not found
  useEffect(() => {
    if (!loading && !selectedProject && projectId) {
      navigate("/projects");
    }
  }, [selectedProject, loading, navigate, projectId]);
  
  if (!selectedProject || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading project details...</span>
      </div>
    );
  }
  
  // Calculate project progress
  const calculateProgress = (project: Project) => {
    if (!project.tasks.length) return 0;
    
    const completedTasks = project.tasks.filter(task => task.status === "completed").length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };
  
  const progress = calculateProgress(selectedProject);
  
  // Check if user can edit this project
  const canEdit = hasRole(["admin"]) || 
    selectedProject.supervisor === currentUser?.id || 
    selectedProject.createdBy === currentUser?.id;
  
  // Check if user can add tasks
  const canAddTasks = hasRole(["admin", "supervisor"]) || 
    selectedProject.supervisor === currentUser?.id;
  
  // Handle status color
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case "not-started":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const statusClass = getStatusColor(selectedProject.status);
  
  const handleEditProject = (data: Partial<Project>) => {
    updateSelectedProject(data);
    setIsEditProjectDialogOpen(false);
  };
  
  const handleDeleteProject = async () => {
    await removeProject(selectedProject.id);
    navigate("/projects");
  };
  
  const handleAddTask = (taskData: Omit<ProjectTask, "id" | "createdAt" | "updatedAt" | "comments" | "attachments">) => {
    addNewTask(taskData);
    setIsAddTaskDialogOpen(false);
  };
  
  const handleEditTask = () => {
    setIsEditTaskDialogOpen(true);
  };
  
  const handleUpdateTask = (taskData: Partial<ProjectTask>) => {
    if (selectedTaskId) {
      updateExistingTask(selectedTaskId, taskData);
      setIsEditTaskDialogOpen(false);
      setSelectedTaskId(null);
    }
  };
  
  const handleTaskStatusChange = (taskId: string, status: ProjectStatus) => {
    updateExistingTask(taskId, { status });
  };
  
  const handleDeleteTask = async (taskId: string) => {
    await removeTask(taskId);
  };
  
  const selectedTask = selectedTaskId 
    ? selectedProject.tasks.find(task => task.id === selectedTaskId) 
    : null;
  
  // Get all user IDs involved in the project
  useEffect(() => {
    const userIds = new Set<string>();
    
    // Add supervisor and team
    userIds.add(selectedProject.supervisor);
    selectedProject.team.forEach(id => userIds.add(id));
    
    // Add task assignees
    selectedProject.tasks.forEach(task => {
      task.assignedTo.forEach(id => userIds.add(id));
    });
    
    // Fetch user names for these IDs
    // This would be a real API call in a production application
    // For now, we'll just use placeholder names
    const names: Record<string, string> = {};
    Array.from(userIds).forEach(id => {
      names[id] = `User ${id.substring(0, 4)}`;
    });
    
    setUserNames(names);
  }, [selectedProject]);
  
  // Filter tasks by status for tabs
  const notStartedTasks = selectedProject.tasks.filter(task => task.status === "not-started");
  const inProgressTasks = selectedProject.tasks.filter(task => task.status === "in-progress");
  const completedTasks = selectedProject.tasks.filter(task => task.status === "completed");
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate("/projects")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Projects
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{selectedProject.name}</h1>
          <div className="mt-2 flex items-center">
            <Badge variant="outline" className={statusClass}>
              {selectedProject.status.replace("-", " ")}
            </Badge>
            <span className="ml-4 text-sm text-muted-foreground">
              Created {format(selectedProject.createdAt, "MMM d, yyyy")}
            </span>
          </div>
        </div>
        
        {canEdit && (
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button 
              variant="outline"
              onClick={() => setIsEditProjectDialogOpen(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Project
            </Button>
            <Button 
              variant="destructive"
              onClick={() => setIsDeleteProjectDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{selectedProject.description}</p>
            
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Progress</h3>
                <div className="flex justify-between text-sm mb-1">
                  <span>{progress}% Complete</span>
                  <span>
                    {completedTasks.length} of {selectedProject.tasks.length} tasks completed
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Timeline</h3>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                      <div>Start: {format(selectedProject.startDate, "MMM d, yyyy")}</div>
                      {selectedProject.endDate && (
                        <div>End: {format(selectedProject.endDate, "MMM d, yyyy")}</div>
                      )}
                    </div>
                  </div>
                </div>
                
                {selectedProject.budget && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Budget</h3>
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
                      <span>${selectedProject.budget.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Supervisor</h3>
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback>
                      {userNames[selectedProject.supervisor]?.substring(0, 2) || "??"}
                    </AvatarFallback>
                  </Avatar>
                  <span>{userNames[selectedProject.supervisor] || "Unknown"}</span>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Team Members ({selectedProject.team.length})
                </h3>
                {selectedProject.team.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No team members assigned yet</p>
                ) : (
                  <div className="space-y-2">
                    {selectedProject.team.map(userId => (
                      <div key={userId} className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarFallback>
                            {userNames[userId]?.substring(0, 2) || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <span>{userNames[userId] || "Unknown"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Tasks</h2>
          {canAddTasks && (
            <Button onClick={() => setIsAddTaskDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">
              All Tasks ({selectedProject.tasks.length})
            </TabsTrigger>
            <TabsTrigger value="not-started">
              Not Started ({notStartedTasks.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              In Progress ({inProgressTasks.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedTasks.length})
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="all">
              {selectedProject.tasks.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium">No tasks yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Get started by creating your first task
                  </p>
                  {canAddTasks && (
                    <Button onClick={() => setIsAddTaskDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Task
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedProject.tasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => {
                        setSelectedTaskId(task.id);
                        handleEditTask();
                      }}
                      onDelete={() => handleDeleteTask(task.id)}
                      onStatusChange={(status) => handleTaskStatusChange(task.id, status)}
                      userNames={userNames}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="not-started">
              {notStartedTasks.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p>No tasks in "Not Started" status</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notStartedTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => {
                        setSelectedTaskId(task.id);
                        handleEditTask();
                      }}
                      onDelete={() => handleDeleteTask(task.id)}
                      onStatusChange={(status) => handleTaskStatusChange(task.id, status)}
                      userNames={userNames}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="in-progress">
              {inProgressTasks.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p>No tasks in "In Progress" status</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inProgressTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => {
                        setSelectedTaskId(task.id);
                        handleEditTask();
                      }}
                      onDelete={() => handleDeleteTask(task.id)}
                      onStatusChange={(status) => handleTaskStatusChange(task.id, status)}
                      userNames={userNames}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed">
              {completedTasks.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p>No tasks in "Completed" status</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => {
                        setSelectedTaskId(task.id);
                        handleEditTask();
                      }}
                      onDelete={() => handleDeleteTask(task.id)}
                      onStatusChange={(status) => handleTaskStatusChange(task.id, status)}
                      userNames={userNames}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AttachmentsList
          attachments={selectedProject.attachments}
          onUpload={(file) => uploadAttachment(file)}
          onDelete={(attachmentId) => removeAttachment(attachmentId)}
          loading={loading}
        />
        
        <CommentSection
          comments={selectedProject.comments}
          onAddComment={(content) => addComment(content)}
          onDeleteComment={(commentId) => removeComment(commentId)}
          loading={loading}
        />
      </div>
      
      {/* Edit Project Dialog */}
      <Dialog 
        open={isEditProjectDialogOpen} 
        onOpenChange={setIsEditProjectDialogOpen}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <ProjectForm
            initialData={selectedProject}
            onSubmit={handleEditProject}
            onCancel={() => setIsEditProjectDialogOpen(false)}
            loading={loading}
            availableUsers={Object.entries(userNames).map(([id, name]) => ({ id, name }))}
          />
        </DialogContent>
      </Dialog>
      
      {/* Add Task Dialog */}
      <Dialog 
        open={isAddTaskDialogOpen} 
        onOpenChange={setIsAddTaskDialogOpen}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            onSubmit={handleAddTask}
            onCancel={() => setIsAddTaskDialogOpen(false)}
            loading={loading}
            availableUsers={Object.entries(userNames).map(([id, name]) => ({ id, name }))}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Task Dialog */}
      <Dialog 
        open={isEditTaskDialogOpen} 
        onOpenChange={setIsEditTaskDialogOpen}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            initialData={selectedTask || undefined}
            onSubmit={handleUpdateTask}
            onCancel={() => {
              setIsEditTaskDialogOpen(false);
              setSelectedTaskId(null);
            }}
            loading={loading}
            availableUsers={Object.entries(userNames).map(([id, name]) => ({ id, name }))}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Project Confirmation Dialog */}
      <AlertDialog
        open={isDeleteProjectDialogOpen}
        onOpenChange={setIsDeleteProjectDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All tasks, comments, and attachments associated with this project will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectDetail;


import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { getCollection, createDocument, updateDocument, deleteDocument } from "@/firebase/firestore";
import { useAuth } from "@/contexts/auth";
import { Loader2 } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "completed" | "on-hold" | "cancelled";
  startDate: string | Date;
  endDate: string | Date;
  assignedVendors: string[];
  tickets: number;
}

const ProjectManagement = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active" as "active" | "completed" | "on-hold" | "cancelled",
    startDate: "",
    endDate: "",
    assignedVendors: "",
  });
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);

  // Fetch projects from Firebase
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        let projectData;
        
        // If user is admin or supervisor, get all projects
        if (currentUser?.role === 'admin' || currentUser?.role === 'supervisor') {
          projectData = await getCollection('projects');
        } else {
          // For other users, get only projects they're assigned to
          projectData = await getCollection('projects', {
            filters: [
              { field: 'assignedVendors', operator: 'array-contains', value: currentUser?.id || '' }
            ]
          });
        }

        // Process projects data
        const formattedProjects = projectData.map((project: any) => ({
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status || "active",
          startDate: project.startDate || new Date(),
          endDate: project.endDate || new Date(),
          assignedVendors: project.assignedVendors || [],
          tickets: project.tickets || 0,
        }));

        setProjects(formattedProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast({
          title: "Error",
          description: "Failed to load projects. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if user is logged in
    if (currentUser) {
      fetchProjects();
    }
  }, [currentUser, toast]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to create a project",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const newProject = {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        assignedVendors: formData.assignedVendors.split(",").map(v => v.trim()).filter(v => v),
        tickets: 0,
        createdBy: currentUser.id,
      };
      
      const createdProject = await createDocument('projects', newProject);
      
      setProjects([...projects, { ...createdProject, id: createdProject.id } as Project]);
      resetForm();
      
      toast({
        title: "Project Created",
        description: `Project ${newProject.name} has been created successfully.`,
      });
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProject) return;
    
    try {
      const updatedProject = {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        assignedVendors: formData.assignedVendors.split(",").map(v => v.trim()).filter(v => v),
      };
      
      await updateDocument('projects', selectedProject.id, updatedProject);
      
      setProjects(
        projects.map(project =>
          project.id === selectedProject.id
            ? { ...project, ...updatedProject }
            : project
        )
      );
      
      resetForm();
      
      toast({
        title: "Project Updated",
        description: `Project ${formData.name} has been updated successfully.`,
      });
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.startDate instanceof Date ? project.startDate.toISOString().split('T')[0] : project.startDate,
      endDate: project.endDate instanceof Date ? project.endDate.toISOString().split('T')[0] : project.endDate,
      assignedVendors: project.assignedVendors.join(", "),
    });
    setIsEditing(true);
  };

  const handleDelete = async (projectId: string) => {
    try {
      await deleteDocument('projects', projectId);
      setProjects(projects.filter(project => project.id !== projectId));
      
      toast({
        title: "Project Deleted",
        description: `Project has been deleted successfully.`,
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setSelectedProject(null);
    setIsEditing(false);
    setFormData({
      name: "",
      description: "",
      status: "active",
      startDate: "",
      endDate: "",
      assignedVendors: "",
    });
  };

  const filterProjects = () => {
    if (filter === "all") return projects;
    return projects.filter(project => project.status === filter);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 px-2 py-1 rounded";
      case "completed": return "bg-blue-100 text-blue-800 px-2 py-1 rounded";
      case "on-hold": return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded";
      case "cancelled": return "bg-red-100 text-red-800 px-2 py-1 rounded";
      default: return "bg-gray-100 text-gray-800 px-2 py-1 rounded";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading projects...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Project Management</h2>
        <p className="text-muted-foreground">
          Create and manage projects and assign vendors.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-12">
        {/* Project Form */}
        <Card className="md:col-span-5">
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Project" : "Create Project"}</CardTitle>
            <CardDescription>
              {isEditing ? "Update project details" : "Set up a new project"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isEditing ? handleUpdate : handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input 
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter project name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea 
                  id="description"
                  className="w-full min-h-[100px] p-2 border border-gray-300 rounded"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="Describe the project goals and scope"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select 
                    id="status"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vendors">Assigned Vendors</Label>
                  <Input 
                    id="vendors"
                    value={formData.assignedVendors}
                    onChange={(e) => setFormData({ ...formData, assignedVendors: e.target.value })}
                    placeholder="Vendor names, comma-separated"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input 
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input 
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-between mt-4">
                <Button variant="outline" type="button" onClick={resetForm}>
                  {isEditing ? "Cancel" : "Clear"}
                </Button>
                <Button type="submit">
                  {isEditing ? "Update Project" : "Create Project"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Projects List */}
        <Card className="md:col-span-7">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Projects</CardTitle>
              <select 
                className="border border-gray-300 rounded p-1"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <CardDescription>
              Manage your projects and track their progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterProjects().length > 0 ? (
                    filterProjects().map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-muted-foreground">{project.id}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Vendors: {project.assignedVendors.join(", ") || "None"} • 
                            Tickets: {project.tickets}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={getStatusBadgeColor(project.status)}>
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {project.startDate instanceof Date ? 
                              project.startDate.toLocaleDateString() : 
                              new Date(project.startDate).toLocaleDateString()} to
                            {" "}
                            {project.endDate instanceof Date ? 
                              project.endDate.toLocaleDateString() : 
                              new Date(project.endDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEdit(project)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDelete(project.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No projects found. Create your first project!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectManagement;

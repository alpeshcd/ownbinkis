
import React, { useState } from "react";
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

// Mock project data
const initialProjects = [
  {
    id: "PRJ-001",
    name: "Website Redesign",
    description: "Complete overhaul of the company website",
    status: "active" as "active" | "completed" | "on-hold" | "cancelled",
    startDate: "2024-04-01",
    endDate: "2024-07-30",
    assignedVendors: ["Tech Solutions Inc"],
    tickets: 8,
  },
  {
    id: "PRJ-002",
    name: "SEO Campaign",
    description: "Improve organic search rankings",
    status: "active" as "active" | "completed" | "on-hold" | "cancelled",
    startDate: "2024-03-15",
    endDate: "2024-06-15",
    assignedVendors: ["Digital Marketing Co"],
    tickets: 5,
  },
  {
    id: "PRJ-003",
    name: "Logo Creation",
    description: "New brand identity and logo design",
    status: "completed" as "active" | "completed" | "on-hold" | "cancelled",
    startDate: "2024-02-10",
    endDate: "2024-03-10",
    assignedVendors: ["Creative Design Studios"],
    tickets: 3,
  },
  {
    id: "PRJ-004",
    name: "Network Upgrade",
    description: "Upgrade office network infrastructure",
    status: "on-hold" as "active" | "completed" | "on-hold" | "cancelled",
    startDate: "2024-05-01",
    endDate: "2024-08-15",
    assignedVendors: ["IT Support Services"],
    tickets: 12,
  },
];

interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "completed" | "on-hold" | "cancelled";
  startDate: string;
  endDate: string;
  assignedVendors: string[];
  tickets: number;
}

const ProjectManagement = () => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProject: Project = {
      id: `PRJ-${Math.floor(Math.random() * 1000)}`,
      name: formData.name,
      description: formData.description,
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate,
      assignedVendors: formData.assignedVendors.split(",").map(v => v.trim()).filter(v => v),
      tickets: 0,
    };
    
    setProjects([...projects, newProject]);
    resetForm();
    
    toast({
      title: "Project Created",
      description: `Project ${newProject.name} has been created successfully.`,
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProject) return;
    
    setProjects(
      projects.map(project =>
        project.id === selectedProject.id
          ? {
              ...project,
              name: formData.name,
              description: formData.description,
              status: formData.status,
              startDate: formData.startDate,
              endDate: formData.endDate,
              assignedVendors: formData.assignedVendors.split(",").map(v => v.trim()).filter(v => v),
            }
          : project
      )
    );
    
    resetForm();
    
    toast({
      title: "Project Updated",
      description: `Project ${formData.name} has been updated successfully.`,
    });
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      assignedVendors: project.assignedVendors.join(", "),
    });
    setIsEditing(true);
  };

  const handleDelete = (projectId: string) => {
    setProjects(projects.filter(project => project.id !== projectId));
    
    toast({
      title: "Project Deleted",
      description: `Project has been deleted successfully.`,
    });
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
                  {filterProjects().map((project) => (
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
                          {new Date(project.startDate).toLocaleDateString()} to 
                          {" "}{new Date(project.endDate).toLocaleDateString()}
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
                  ))}
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

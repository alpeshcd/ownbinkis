
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

// Mock ticket data
const initialTickets = [
  {
    id: "TKT-001",
    projectId: "PRJ-001",
    projectName: "Website Redesign",
    title: "Homepage Layout Issues",
    status: "open",
    assignedTo: "Developer A",
    createdAt: "2024-04-15",
    priority: "high",
  },
  {
    id: "TKT-002",
    projectId: "PRJ-001",
    projectName: "Website Redesign",
    title: "Mobile Responsiveness",
    status: "in-progress",
    assignedTo: "Developer B",
    createdAt: "2024-04-20",
    priority: "medium",
  },
  {
    id: "TKT-003",
    projectId: "PRJ-002",
    projectName: "SEO Campaign",
    title: "Keyword Research",
    status: "resolved",
    assignedTo: "Marketing Specialist",
    createdAt: "2024-03-25",
    priority: "medium",
  },
  {
    id: "TKT-004",
    projectId: "PRJ-004",
    projectName: "Network Upgrade",
    title: "Server Configuration",
    status: "open",
    assignedTo: "IT Specialist",
    createdAt: "2024-05-05",
    priority: "critical",
  },
];

// Mock projects for dropdown
const projectOptions = [
  { id: "PRJ-001", name: "Website Redesign" },
  { id: "PRJ-002", name: "SEO Campaign" },
  { id: "PRJ-003", name: "Logo Creation" },
  { id: "PRJ-004", name: "Network Upgrade" },
];

interface Ticket {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  assignedTo: string;
  createdAt: string;
  priority: "low" | "medium" | "high" | "critical";
}

const TicketComponent = () => {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    projectId: "",
    title: "",
    description: "",
    status: "open" as "open" | "in-progress" | "resolved" | "closed",
    assignedTo: "",
    priority: "medium" as "low" | "medium" | "high" | "critical",
  });
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedProject = projectOptions.find(p => p.id === formData.projectId);
    
    const newTicket: Ticket = {
      id: `TKT-${Math.floor(Math.random() * 1000)}`,
      projectId: formData.projectId,
      projectName: selectedProject?.name || "Unknown Project",
      title: formData.title,
      status: formData.status,
      assignedTo: formData.assignedTo,
      createdAt: new Date().toISOString().split("T")[0],
      priority: formData.priority,
    };
    
    setTickets([...tickets, newTicket]);
    resetForm();
    
    toast({
      title: "Ticket Created",
      description: `Ticket "${formData.title}" has been created successfully.`,
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTicket) return;
    
    const selectedProject = projectOptions.find(p => p.id === formData.projectId);
    
    setTickets(
      tickets.map(ticket =>
        ticket.id === selectedTicket.id
          ? {
              ...ticket,
              projectId: formData.projectId,
              projectName: selectedProject?.name || ticket.projectName,
              title: formData.title,
              status: formData.status,
              assignedTo: formData.assignedTo,
              priority: formData.priority,
            }
          : ticket
      )
    );
    
    resetForm();
    
    toast({
      title: "Ticket Updated",
      description: `Ticket "${formData.title}" has been updated successfully.`,
    });
  };

  const handleEdit = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setFormData({
      projectId: ticket.projectId,
      title: ticket.title,
      description: "", // This would come from additional ticket details in a real app
      status: ticket.status,
      assignedTo: ticket.assignedTo,
      priority: ticket.priority,
    });
    setIsEditing(true);
  };

  const handleDelete = (ticketId: string) => {
    setTickets(tickets.filter(ticket => ticket.id !== ticketId));
    
    toast({
      title: "Ticket Deleted",
      description: `Ticket has been deleted successfully.`,
    });
  };

  const resetForm = () => {
    setSelectedTicket(null);
    setIsEditing(false);
    setFormData({
      projectId: "",
      title: "",
      description: "",
      status: "open",
      assignedTo: "",
      priority: "medium",
    });
  };

  const filterTickets = () => {
    if (filter === "all") return tickets;
    return tickets.filter(ticket => ticket.status === filter);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-100 text-blue-800 px-2 py-1 rounded";
      case "in-progress": return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded";
      case "resolved": return "bg-green-100 text-green-800 px-2 py-1 rounded";
      case "closed": return "bg-gray-100 text-gray-800 px-2 py-1 rounded";
      default: return "bg-gray-100 text-gray-800 px-2 py-1 rounded";
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-gray-100 text-gray-800 px-2 py-1 rounded";
      case "medium": return "bg-blue-100 text-blue-800 px-2 py-1 rounded";
      case "high": return "bg-orange-100 text-orange-800 px-2 py-1 rounded";
      case "critical": return "bg-red-100 text-red-800 px-2 py-1 rounded";
      default: return "bg-gray-100 text-gray-800 px-2 py-1 rounded";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Ticket Management</h2>
        <p className="text-muted-foreground">
          Create and manage tickets for projects.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-12">
        {/* Ticket Form */}
        <Card className="md:col-span-5">
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Ticket" : "Create Ticket"}</CardTitle>
            <CardDescription>
              {isEditing ? "Update ticket details" : "Create a new ticket for a project"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isEditing ? handleUpdate : handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectId">Project</Label>
                <select 
                  id="projectId"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  required
                >
                  <option value="">Select a project</option>
                  {projectOptions.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.id})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Ticket Title</Label>
                <Input 
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Brief description of the issue"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description</Label>
                <textarea 
                  id="description"
                  className="w-full min-h-[100px] p-2 border border-gray-300 rounded"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the issue in detail"
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
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select 
                    id="priority"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Input 
                  id="assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  placeholder="Name of person assigned"
                />
              </div>
              
              <div className="flex justify-between mt-4">
                <Button variant="outline" type="button" onClick={resetForm}>
                  {isEditing ? "Cancel" : "Clear"}
                </Button>
                <Button type="submit">
                  {isEditing ? "Update Ticket" : "Create Ticket"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Tickets List */}
        <Card className="md:col-span-7">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Tickets</CardTitle>
              <select 
                className="border border-gray-300 rounded p-1"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <CardDescription>
              Manage and track tickets for your projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterTickets().map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <div className="font-medium">{ticket.title}</div>
                        <div className="text-sm text-muted-foreground">{ticket.id}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Project: {ticket.projectName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={getStatusBadgeColor(ticket.status)}>
                          {ticket.status
                            .split("-")
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={getPriorityBadgeColor(ticket.priority)}>
                          {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>{ticket.assignedTo || "Unassigned"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(ticket)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDelete(ticket.id)}
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

export default TicketComponent;

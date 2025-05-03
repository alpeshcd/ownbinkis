import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import {
  getCollection,
  createDocument,
  updateDocument,
} from "@/firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTriangle, Loader } from "lucide-react";

interface Ticket {
  id: string;
  projectId: string;
  projectName?: string;
  title: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  assignedTo: string;
  createdAt: any;
  priority: string;
}

const TicketComponent = () => {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    projectId: "",
    title: "",
    assignedTo: "",
    priority: "medium",
  });
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch tickets
        const fetchedTickets = await getCollection("tickets");

        const fetchedProjects = await getCollection("projects");
        setProjects(fetchedProjects);

        const enhancedTickets = fetchedTickets.map((ticket) => {
          const relatedProject = fetchedProjects.find(
            (project) => project.id === ticket.projectId
          );
          return {
            ...ticket,
            projectName: relatedProject?.name || "Unknown Project",
          };
        });

        setTickets(enhancedTickets);
      } catch (err) {
        console.error("Error fetching ticket data:", err);
        setError("Failed to load tickets. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to create a ticket",
        variant: "destructive",
      });
      return;
    }

    try {
      const projectExists = projects.find(
        (project) => project.id === formData.projectId
      );

      if (!projectExists) {
        toast({
          title: "Error",
          description: "Invalid project ID. Please select a valid project.",
          variant: "destructive",
        });
        return;
      }

      const newTicket = {
        projectId: formData.projectId,
        title: formData.title,
        status: "open" as "open" | "in-progress" | "resolved" | "closed",
        assignedTo: formData.assignedTo,
        priority: formData.priority,
        createdBy: currentUser.id,
        createdAt: new Date(),
      };

      const createdTicket = await createDocument("tickets", newTicket);

      const ticketWithProject = {
        ...createdTicket,
        projectName: projectExists.name,
      };

      setTickets([...tickets, ticketWithProject as Ticket]);
      resetForm();

      toast({
        title: "Ticket Created",
        description: `New ticket "${formData.title}" has been created.`,
      });
    } catch (err) {
      console.error("Error creating ticket:", err);
      toast({
        title: "Error",
        description: "Failed to create ticket. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      projectId: "",
      title: "",
      assignedTo: "",
      priority: "medium",
    });
  };

  const handleStatusChange = async (
    ticketId: string,
    newStatus: Ticket["status"]
  ) => {
    try {
      // Update in Firestore
      await updateDocument("tickets", ticketId, {
        status: newStatus,
        updatedAt: new Date(),
      });

      // Update local state
      setTickets(
        tickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
        )
      );

      toast({
        title: "Ticket Updated",
        description: `Ticket status has been updated to ${newStatus}.`,
      });
    } catch (err) {
      console.error("Error updating ticket:", err);
      toast({
        title: "Error",
        description: "Failed to update ticket status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filterTickets = () => {
    if (filter === "all") return tickets;
    return tickets.filter((ticket) => ticket.status === filter);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800 px-2 py-1 rounded";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded";
      case "resolved":
        return "bg-green-100 text-green-800 px-2 py-1 rounded";
      case "closed":
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded";
      default:
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded";
    }
  };

  return (
    <div className="space-y-6 container mt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Ticket Management</h2>
    
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="">
        {/* Ticket Form */}
        <Card className="md:col-span-5">
          <CardHeader>
            <CardTitle>Create New Ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectId">Project</Label>
                <select
                  id="projectId"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.projectId}
                  onChange={(e) =>
                    setFormData({ ...formData, projectId: e.target.value })
                  }
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  placeholder="Enter ticket title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assign To</Label>
                <Input
                  id="assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) =>
                    setFormData({ ...formData, assignedTo: e.target.value })
                  }
                  placeholder="Assign to"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex justify-between mt-4">
                <Button variant="outline" type="button" onClick={resetForm}>
                  Clear
                </Button>
                <Button type="submit">Submit Ticket</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tickets List */}
        <Card className="md:col-span-7">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Your Tickets</CardTitle>
              <select
                className="border border-gray-300 rounded p-1"
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <CardDescription>Track the status of your tickets</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader className="h-8 w-8 animate-spin text-bnkis-primary" />
              </div>
            ) : filterTickets().length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterTickets().map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell>
                          <div className="font-medium">{ticket.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {ticket.projectName}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Created:{" "}
                            {ticket.createdAt
                              ? new Date(
                                  ticket.createdAt.seconds * 1000
                                ).toLocaleDateString()
                              : "Unknown date"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={getStatusBadgeColor(ticket.status)}>
                            {ticket.status.charAt(0).toUpperCase() +
                              ticket.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {ticket.assignedTo || "Unassigned"}
                        </TableCell>
                        <TableCell>{ticket.priority}</TableCell>
                        <TableCell>
                          <select
                            className="border border-gray-300 rounded p-1"
                            value={ticket.status}
                            onChange={(e) =>
                              handleStatusChange(
                                ticket.id,
                                e.target.value as Ticket["status"]
                              )
                            }
                          >
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No tickets found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {filter !== "all" ? "Try changing your filter or " : ""}
                  Create a new ticket to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TicketComponent;

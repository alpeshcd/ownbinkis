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
    id: "TICK-001",
    projectId: "PRJ-001",
    projectName: "Website Redesign",
    title: "Homepage Layout Issue",
    status: "open" as "open" | "in-progress" | "resolved" | "closed",
    assignedTo: "John Doe",
    createdAt: "2024-05-01",
    priority: "high",
  },
  {
    id: "TICK-002",
    projectId: "PRJ-001",
    projectName: "Website Redesign",
    title: "Contact Form Not Working",
    status: "in-progress" as "open" | "in-progress" | "resolved" | "closed",
    assignedTo: "Jane Smith",
    createdAt: "2024-05-02",
    priority: "high",
  },
  {
    id: "TICK-003",
    projectId: "PRJ-002",
    projectName: "SEO Campaign",
    title: "Meta Tags Update",
    status: "resolved" as "open" | "in-progress" | "resolved" | "closed",
    assignedTo: "Alex Johnson",
    createdAt: "2024-04-28",
    priority: "medium",
  },
  {
    id: "TICK-004",
    projectId: "PRJ-002",
    projectName: "SEO Campaign",
    title: "Keyword Research",
    status: "closed" as "open" | "in-progress" | "resolved" | "closed",
    assignedTo: "Sarah Williams",
    createdAt: "2024-04-15",
    priority: "low",
  },
];

interface Ticket {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  assignedTo: string;
  createdAt: string;
  priority: string;
}

const TicketComponent = () => {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [formData, setFormData] = useState({
    projectId: "",
    title: "",
    assignedTo: "",
    priority: "medium",
  });
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newTicket: Ticket = {
      id: `TICK-${Math.floor(Math.random() * 1000)}`,
      projectId: formData.projectId,
      projectName: "Related Project Name", // You might want to fetch this from project data
      title: formData.title,
      status: "open",
      assignedTo: formData.assignedTo,
      createdAt: new Date().toISOString().split("T")[0],
      priority: formData.priority,
    } as Ticket;

    setTickets([...tickets, newTicket]);
    resetForm();

    toast({
      title: "Ticket Created",
      description: `New ticket "${formData.title}" has been created.`,
    });
  };

  const resetForm = () => {
    setFormData({
      projectId: "",
      title: "",
      assignedTo: "",
      priority: "medium",
    });
  };

  const handleStatusChange = (ticketId: string, newStatus: Ticket["status"]) => {
    setTickets(
      tickets.map(ticket =>
        ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
      )
    );

    toast({
      title: "Ticket Updated",
      description: `Ticket status has been updated.`,
    });
  };

  const filterTickets = () => {
    if (filter === "all") return tickets;
    return tickets.filter(ticket => ticket.status === filter);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "open": return "bg-red-100 text-red-800 px-2 py-1 rounded";
      case "in-progress": return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded";
      case "resolved": return "bg-green-100 text-green-800 px-2 py-1 rounded";
      case "closed": return "bg-gray-100 text-gray-800 px-2 py-1 rounded";
      default: return "bg-gray-100 text-gray-800 px-2 py-1 rounded";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Ticket Management</h2>
        <p className="text-muted-foreground">
          Manage and track support tickets for projects.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Ticket Form */}
        <Card className="md:col-span-5">
          <CardHeader>
            <CardTitle>Create New Ticket</CardTitle>
            <CardDescription>
              Submit a new support ticket
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectId">Project ID</Label>
                <Input
                  id="projectId"
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  required
                  placeholder="Enter project ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Enter ticket title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assign To</Label>
                <Input
                  id="assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  placeholder="Assign to"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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
                <Button type="submit">
                  Submit Ticket
                </Button>
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
            <CardDescription>
              Track the status of your tickets
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                        <div className="text-sm text-muted-foreground">{ticket.projectName}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Created: {new Date(ticket.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={getStatusBadgeColor(ticket.status)}>
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>{ticket.assignedTo}</TableCell>
                      <TableCell>{ticket.priority}</TableCell>
                      <TableCell>
                        <select
                          className="border border-gray-300 rounded p-1"
                          value={ticket.status}
                          onChange={(e) => handleStatusChange(ticket.id, e.target.value as Ticket["status"])}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TicketComponent;

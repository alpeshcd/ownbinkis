
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

// Mock financial request data
const initialRequests = [
  {
    id: "REQ-001",
    projectId: "PRJ-001",
    projectName: "Website Redesign",
    amount: 1500,
    purpose: "Stock photo licensing",
    status: "pending" as "pending" | "approved" | "rejected" | "completed",
    createdAt: "2024-05-01",
    createdBy: "Project Manager",
    approvedBy: null,
    approvedAt: null,
  },
  {
    id: "REQ-002",
    projectId: "PRJ-002",
    projectName: "SEO Campaign",
    amount: 2500,
    purpose: "Ad campaign budget",
    status: "approved" as "pending" | "approved" | "rejected" | "completed",
    createdAt: "2024-04-15",
    createdBy: "Marketing Lead",
    approvedBy: "Finance Manager",
    approvedAt: "2024-04-20",
  },
  {
    id: "REQ-003",
    projectId: "PRJ-004",
    projectName: "Network Upgrade",
    amount: 5000,
    purpose: "Additional hardware purchase",
    status: "rejected" as "pending" | "approved" | "rejected" | "completed",
    createdAt: "2024-04-25",
    createdBy: "IT Manager",
    approvedBy: "Finance Manager",
    approvedAt: "2024-04-28",
  },
  {
    id: "REQ-004",
    projectId: "PRJ-001",
    projectName: "Website Redesign",
    amount: 800,
    purpose: "UI/UX consultant fees",
    status: "completed" as "pending" | "approved" | "rejected" | "completed",
    createdAt: "2024-03-10",
    createdBy: "Project Manager",
    approvedBy: "Finance Manager",
    approvedAt: "2024-03-12",
  },
];

// Mock projects for dropdown
const projectOptions = [
  { id: "PRJ-001", name: "Website Redesign" },
  { id: "PRJ-002", name: "SEO Campaign" },
  { id: "PRJ-003", name: "Logo Creation" },
  { id: "PRJ-004", name: "Network Upgrade" },
];

interface FinancialRequest {
  id: string;
  projectId: string;
  projectName: string;
  amount: number;
  purpose: string;
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt: string;
  createdBy: string;
  approvedBy: string | null;
  approvedAt: string | null;
}

const FinancialRequestComponent = () => {
  const [requests, setRequests] = useState<FinancialRequest[]>(initialRequests);
  const [formData, setFormData] = useState({
    projectId: "",
    amount: "",
    purpose: "",
  });
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedProject = projectOptions.find(p => p.id === formData.projectId);
    
    const newRequest: FinancialRequest = {
      id: `REQ-${Math.floor(Math.random() * 1000)}`,
      projectId: formData.projectId,
      projectName: selectedProject?.name || "Unknown Project",
      amount: parseFloat(formData.amount),
      purpose: formData.purpose,
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
      createdBy: "Current User", // In a real app, this would be the logged-in user
      approvedBy: null,
      approvedAt: null,
    };
    
    setRequests([...requests, newRequest]);
    resetForm();
    
    toast({
      title: "Financial Request Created",
      description: `Your request for $${formData.amount} has been submitted for approval.`,
    });
  };

  const resetForm = () => {
    setFormData({
      projectId: "",
      amount: "",
      purpose: "",
    });
  };

  const handleCancel = (requestId: string) => {
    setRequests(requests.filter(request => request.id !== requestId));
    
    toast({
      title: "Request Cancelled",
      description: `Financial request ${requestId} has been cancelled.`,
    });
  };

  const filterRequests = () => {
    if (filter === "all") return requests;
    return requests.filter(request => request.status === filter);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded";
      case "approved": return "bg-blue-100 text-blue-800 px-2 py-1 rounded";
      case "rejected": return "bg-red-100 text-red-800 px-2 py-1 rounded";
      case "completed": return "bg-green-100 text-green-800 px-2 py-1 rounded";
      default: return "bg-gray-100 text-gray-800 px-2 py-1 rounded";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Financial Requests</h2>
        <p className="text-muted-foreground">
          Submit and track financial requests for your projects.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-12">
        {/* Request Form */}
        <Card className="md:col-span-5">
          <CardHeader>
            <CardTitle>New Financial Request</CardTitle>
            <CardDescription>
              Submit a new request for financial approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="amount">Amount ($)</Label>
                <Input 
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <textarea 
                  id="purpose"
                  className="w-full min-h-[100px] p-2 border border-gray-300 rounded"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  required
                  placeholder="Explain what the funds will be used for"
                />
              </div>
              
              <div className="flex justify-between mt-4">
                <Button variant="outline" type="button" onClick={resetForm}>
                  Clear
                </Button>
                <Button type="submit">
                  Submit Request
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Requests List */}
        <Card className="md:col-span-7">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Your Requests</CardTitle>
              <select 
                className="border border-gray-300 rounded p-1"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <CardDescription>
              Track the status of your financial requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterRequests().map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="font-medium">{request.id}</div>
                        <div className="text-sm text-muted-foreground">{request.purpose}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Created: {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>${request.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={getStatusBadgeColor(request.status)}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                        {request.approvedBy && (
                          <div className="text-xs mt-1">
                            {request.status === "approved" || request.status === "completed"
                              ? `Approved by: ${request.approvedBy}`
                              : `Rejected by: ${request.approvedBy}`}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{request.projectName}</TableCell>
                      <TableCell>
                        {request.status === "pending" && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleCancel(request.id)}
                          >
                            Cancel
                          </Button>
                        )}
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

export default FinancialRequestComponent;

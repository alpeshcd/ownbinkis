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
import { createFinancialRequest, getFinancialRequests, updateFinancialRequest, deleteFinancialRequest } from "@/services/billingService";
import { useAuth } from "@/contexts/auth";
import { Loader2 } from "lucide-react";

// Project options - in real app would come from a projectService
const projectOptions = [
  { id: "PRJ-001", name: "Website Redesign" },
  { id: "PRJ-002", name: "SEO Campaign" },
  { id: "PRJ-003", name: "Logo Creation" },
  { id: "PRJ-004", name: "Network Upgrade" },
];

// Updated to align with billingService FinancialRequest interface
interface FinancialRequest {
  id?: string;
  requestId?: string;
  projectId?: string;
  amount: number;
  purpose?: string;
  description: string;
  requestType: "advance" | "reimbursement" | "purchase";
  status: "pending" | "approved" | "rejected" | "completed";
  requestedBy: string;
  createdAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

const FinancialRequestComponent = () => {
  const [requests, setRequests] = useState<FinancialRequest[]>([]);
  const [formData, setFormData] = useState({
    projectId: "",
    amount: "",
    purpose: "",
  });
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Fetch financial requests from Firebase
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        // Get requests created by the current user
        const filters = currentUser ? { requestedBy: currentUser.id } : undefined; // Changed from uid to id
        const fetchedRequests = await getFinancialRequests(filters);
        
        // Transform the requests to match our component's interface
        const transformedRequests = fetchedRequests.map(req => ({
          ...req,
          purpose: req.description // Map description to purpose for backward compatibility
        }));
        
        setRequests(transformedRequests);
      } catch (error: any) {
        console.error("Error fetching financial requests:", error);
        toast({
          title: "Error",
          description: `Failed to load financial requests: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [currentUser, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to create requests",
        variant: "destructive",
      });
      return;
    }
    
    const selectedProject = projectOptions.find(p => p.id === formData.projectId);
    
    try {
      // Create new request
      const newRequest: FinancialRequest = {
        projectId: formData.projectId,
        amount: parseFloat(formData.amount),
        description: formData.purpose, // Map purpose to description
        purpose: formData.purpose, // Keep purpose for component-side usage
        requestType: "advance", // Default request type
        status: "pending",
        requestedBy: currentUser.id, // Changed from uid to id
      };
      
      setLoading(true);
      const createdRequest = await createFinancialRequest(newRequest);
      
      // Add purpose field to returned request for component compatibility
      const requestWithPurpose = {
        ...createdRequest,
        purpose: createdRequest.description
      };
      
      setRequests([...requests, requestWithPurpose]);
      resetForm();
      
      toast({
        title: "Financial Request Created",
        description: `Your request for $${formData.amount} has been submitted for approval.`,
      });
    } catch (error: any) {
      console.error("Error creating request:", error);
      toast({
        title: "Error",
        description: `Failed to create request: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      projectId: "",
      amount: "",
      purpose: "",
    });
  };

  const handleCancel = async (requestId: string) => {
    try {
      setLoading(true);
      await deleteFinancialRequest(requestId);
      
      setRequests(requests.filter(request => request.id !== requestId));
      
      toast({
        title: "Request Cancelled",
        description: `Financial request has been cancelled.`,
      });
    } catch (error: any) {
      console.error("Error cancelling request:", error);
      toast({
        title: "Error",
        description: `Failed to cancel request: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
            {loading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
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
                    {filterRequests().length > 0 ? (
                      filterRequests().map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div className="font-medium">{request.id || request.requestId}</div>
                            <div className="text-sm text-muted-foreground">{request.purpose}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Created: {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "N/A"}
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
                          <TableCell>{request.projectId}</TableCell>
                          <TableCell>
                            {request.status === "pending" && (
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleCancel(request.id || "")}
                                disabled={!request.id || loading}
                              >
                                Cancel
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No requests found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialRequestComponent;

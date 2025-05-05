
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { getPayments, updatePayment, deletePayment, getFinancialRequests, updateFinancialRequest, reportPotentialScam } from "@/services/billingService";
import { useAuth } from "@/contexts/auth";
import { AlertTriangle, CheckCircle, Loader2, XCircle } from "lucide-react";

interface Payment {
  id?: string;
  paymentId?: string;
  amount: number;
  purpose: string;
  requestedBy: string;
  projectId?: string;
  status: "pending" | "approved" | "rejected" | "paid" | "completed";
  requestDate: Date;
  createdAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  paidBy?: string;
  paidAt?: Date;
  paymentReference?: string;
  isScamSuspected?: boolean;
}

interface FinancialRequest {
  id?: string;
  requestId?: string;
  requestType: "advance" | "reimbursement" | "purchase";
  amount: number;
  description: string;
  purpose?: string; // Add purpose as optional to align with the component
  status: "pending" | "approved" | "rejected" | "completed";
  requestedBy: string;
  projectId?: string;
  isScamSuspected?: boolean;
}

const PaymentComponent = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [requests, setRequests] = useState<FinancialRequest[]>([]);
  const [activeTab, setActiveTab] = useState<"payments" | "requests">("payments");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Fetch data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (activeTab === "payments") {
          const fetchedPayments = await getPayments();
          setPayments(fetchedPayments);
        } else {
          // Get only pending financial requests
          const fetchedRequests = await getFinancialRequests({ status: "pending" });
          setRequests(fetchedRequests);
        }
      } catch (error: any) {
        console.error(`Error fetching ${activeTab}:`, error);
        toast({
          title: "Error",
          description: `Failed to load ${activeTab}: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, toast]);

  const handleProcessPayment = async (paymentId: string) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      const updatedData = {
        status: "completed" as "completed",
        paidAt: new Date(),
        paidBy: currentUser.id, // Changed from uid to id
        paymentReference: `REF-${Date.now().toString().slice(-6)}`
      };
      
      await updatePayment(paymentId, updatedData);
      
      setPayments(
        payments.map(payment =>
          payment.id === paymentId
            ? { ...payment, ...updatedData }
            : payment
        )
      );
      
      toast({
        title: "Payment Processed",
        description: `Payment ${paymentId} has been processed successfully.`,
      });
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast({
        title: "Error",
        description: `Failed to process payment: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPayment = async (paymentId: string) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      await updatePayment(paymentId, {
        status: "rejected" as "rejected",
      });
      
      setPayments(
        payments.map(payment =>
          payment.id === paymentId
            ? { ...payment, status: "rejected" }
            : payment
        )
      );
      
      toast({
        title: "Payment Cancelled",
        description: `Payment ${paymentId} has been cancelled.`,
      });
    } catch (error: any) {
      console.error("Error cancelling payment:", error);
      toast({
        title: "Error",
        description: `Failed to cancel payment: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Update the request status
      await updateFinancialRequest(requestId, {
        status: "approved" as "approved",
        approvedBy: currentUser.id, // Changed from uid to id
        approvedAt: new Date(),
      });
      
      // Refresh the requests list
      const updatedRequests = await getFinancialRequests({ status: "pending" });
      setRequests(updatedRequests);
      
      toast({
        title: "Request Approved",
        description: `Financial request ${requestId} has been approved.`,
      });
      
      // Now fetch updated payments to show the new authorized payment
      const updatedPayments = await getPayments();
      setPayments(updatedPayments);
      
    } catch (error: any) {
      console.error("Error approving request:", error);
      toast({
        title: "Error",
        description: `Failed to approve request: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      await updateFinancialRequest(requestId, {
        status: "rejected" as "rejected",
        approvedBy: currentUser.id, // Changed from uid to id
        approvedAt: new Date(),
      });
      
      // Refresh the requests list
      const updatedRequests = await getFinancialRequests({ status: "pending" });
      setRequests(updatedRequests);
      
      toast({
        title: "Request Rejected",
        description: `Financial request ${requestId} has been rejected.`,
      });
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Error",
        description: `Failed to reject request: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleReportScam = async (entityId: string, collectionName: string) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      await reportPotentialScam(
        collectionName,
        entityId,
        currentUser.id, // Changed from uid to id
        "Transaction flagged as potentially fraudulent"
      );
      
      // Update local state based on which collection was reported
      if (collectionName === "adHocPayments") {
        setPayments(
          payments.map(payment =>
            payment.id === entityId
              ? { ...payment, isScamSuspected: true }
              : payment
          )
        );
      } else if (collectionName === "financialRequests") {
        setRequests(
          requests.map(request =>
            request.id === entityId
              ? { ...request, isScamSuspected: true }
              : request
          )
        );
      }
      
      toast({
        title: "Scam Reported",
        description: `Transaction ${entityId} has been reported as potentially fraudulent.`,
      });
    } catch (error: any) {
      console.error("Error reporting scam:", error);
      toast({
        title: "Error",
        description: `Failed to report scam: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    if (filter === "all") return payments;
    return payments.filter(payment => payment.status === filter);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 px-2 py-1 rounded";
      case "approved": case "authorized": return "bg-blue-100 text-blue-800 px-2 py-1 rounded";
      case "pending": return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded";
      case "rejected": return "bg-red-100 text-red-800 px-2 py-1 rounded";
      default: return "bg-gray-100 text-gray-800 px-2 py-1 rounded";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Payment Management</h2>
        <p className="text-muted-foreground">
          Process payments and manage payment requests.
        </p>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            className={`py-4 border-b-2 ${
              activeTab === "payments"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("payments")}
          >
            Payments
          </button>
          <button
            className={`py-4 border-b-2 ${
              activeTab === "requests"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("requests")}
          >
            Payment Requests
          </button>
        </div>
      </div>
      
      {activeTab === "payments" && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Payment Processing</CardTitle>
              <select 
                className="border border-gray-300 rounded p-1"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <CardDescription>
              Process and track payments for invoices
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
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterPayments().length > 0 ? (
                      filterPayments().map((payment) => (
                        <TableRow key={payment.id} className={payment.isScamSuspected ? "bg-red-50" : ""}>
                          <TableCell>
                            <div className="font-medium">
                              {payment.paymentId || payment.id} 
                              {payment.isScamSuspected && (
                                <span className="ml-2 text-red-500">
                                  <AlertTriangle className="h-4 w-4 inline" />
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Created: {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>{payment.purpose}</div>
                            <div className="text-sm text-muted-foreground">
                              {payment.projectId && `Project: ${payment.projectId}`}
                            </div>
                          </TableCell>
                          <TableCell>${payment.amount?.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className={getStatusBadgeColor(payment.status)}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </span>
                            {payment.approvedBy && (
                              <div className="text-xs mt-1">
                                Approved by: {payment.approvedBy}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col space-y-2">
                              {(payment.status === "pending" || payment.status === "approved") && !payment.isScamSuspected && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleProcessPayment(payment.id || "")}
                                  disabled={!payment.id || loading}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Process
                                </Button>
                              )}
                              {payment.status === "pending" && !payment.isScamSuspected && (
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleCancelPayment(payment.id || "")}
                                  disabled={!payment.id || loading}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              )}
                              {!payment.isScamSuspected && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleReportScam(payment.id || "", "adHocPayments")}
                                  disabled={!payment.id || loading}
                                  className="bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
                                >
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  Report Scam
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No payments found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {activeTab === "requests" && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Requests</CardTitle>
            <CardDescription>
              Review and approve payment requests from supervisors and project managers
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
                      <TableHead>Request ID</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.length > 0 ? (
                      requests.map((request) => (
                        <TableRow key={request.id} className={request.isScamSuspected ? "bg-red-50" : ""}>
                          <TableCell>
                            <div className="font-medium">
                              {request.requestId || request.id}
                              {request.isScamSuspected && (
                                <span className="ml-2 text-red-500">
                                  <AlertTriangle className="h-4 w-4 inline" />
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Type: {request.requestType || "Unknown"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {request.projectId || "No project assigned"}
                          </TableCell>
                          <TableCell>${request.amount?.toLocaleString()}</TableCell>
                          <TableCell>{request.description}</TableCell>
                          <TableCell>
                            <div className="flex flex-col space-y-2">
                              {!request.isScamSuspected && (
                                <>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleApproveRequest(request.id || "")}
                                    disabled={!request.id || loading}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleRejectRequest(request.id || "")}
                                    disabled={!request.id || loading}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              {!request.isScamSuspected && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleReportScam(request.id || "", "financialRequests")}
                                  disabled={!request.id || loading}
                                  className="bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
                                >
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  Report Scam
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No pending payment requests
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentComponent;

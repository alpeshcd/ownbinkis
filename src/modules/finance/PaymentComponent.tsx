
import React, { useState } from "react";
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

// Mock payment data
const initialPayments = [
  {
    id: "PMT-001",
    invoiceId: "INV-001",
    vendorName: "Tech Solutions Inc",
    amount: 5000,
    status: "completed" as "pending" | "authorized" | "completed" | "rejected",
    date: "2024-05-10",
    method: "bank_transfer",
    processedBy: "Finance Manager",
  },
  {
    id: "PMT-002",
    invoiceId: "INV-003",
    vendorName: "Creative Design Studios",
    amount: 1200,
    status: "pending" as "pending" | "authorized" | "completed" | "rejected",
    date: null,
    method: null,
    processedBy: null,
  },
  {
    id: "PMT-003",
    invoiceId: "INV-004",
    vendorName: "IT Support Services",
    amount: 8500,
    status: "authorized" as "pending" | "authorized" | "completed" | "rejected",
    date: "2024-06-01",
    method: "credit_card",
    processedBy: "Finance Manager",
  },
  {
    id: "PMT-004",
    invoiceId: "INV-002",
    vendorName: "Digital Marketing Co",
    amount: 3500,
    status: "rejected" as "pending" | "authorized" | "completed" | "rejected",
    date: "2024-05-25",
    method: null,
    processedBy: "Admin User",
  },
];

// Mock pending requests
const initialRequests = [
  {
    id: "REQ-001",
    projectId: "P-005",
    projectName: "Staff Training",
    requester: "Project Manager",
    amount: 1200,
    purpose: "Training materials and venue rental",
    status: "pending" as "pending" | "approved" | "rejected",
    submittedDate: "2024-05-20",
  },
  {
    id: "REQ-002",
    projectId: "P-003",
    projectName: "Logo Creation",
    requester: "Design Lead",
    amount: 500,
    purpose: "Stock photo license purchase",
    status: "pending" as "pending" | "approved" | "rejected",
    submittedDate: "2024-05-22",
  },
];

interface Payment {
  id: string;
  invoiceId: string;
  vendorName: string;
  amount: number;
  status: "pending" | "authorized" | "completed" | "rejected";
  date: string | null;
  method: string | null;
  processedBy: string | null;
}

interface PaymentRequest {
  id: string;
  projectId: string;
  projectName: string;
  requester: string;
  amount: number;
  purpose: string;
  status: "pending" | "approved" | "rejected";
  submittedDate: string;
}

const PaymentComponent = () => {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [requests, setRequests] = useState<PaymentRequest[]>(initialRequests);
  const [activeTab, setActiveTab] = useState<"payments" | "requests">("payments");
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  const handleProcessPayment = (paymentId: string) => {
    setPayments(
      payments.map(payment =>
        payment.id === paymentId
          ? { 
              ...payment, 
              status: "completed", 
              date: new Date().toISOString().substring(0, 10),
              method: "bank_transfer",
              processedBy: "Current User" // In a real app, this would be the current user's name
            }
          : payment
      )
    );
    
    toast({
      title: "Payment Processed",
      description: `Payment ${paymentId} has been processed successfully.`,
    });
  };

  const handleCancelPayment = (paymentId: string) => {
    setPayments(
      payments.map(payment =>
        payment.id === paymentId
          ? { ...payment, status: "rejected", date: new Date().toISOString().substring(0, 10) }
          : payment
      )
    );
    
    toast({
      title: "Payment Cancelled",
      description: `Payment ${paymentId} has been cancelled.`,
    });
  };

  const handleApproveRequest = (requestId: string) => {
    // Update the request status
    setRequests(
      requests.map(request =>
        request.id === requestId
          ? { ...request, status: "approved" }
          : request
      )
    );
    
    // Create a new payment entry for the approved request
    const approvedRequest = requests.find(request => request.id === requestId);
    if (approvedRequest) {
      const newPayment: Payment = {
        id: `PMT-${Math.floor(Math.random() * 1000)}`,
        invoiceId: `REQ-${approvedRequest.id}`,
        vendorName: approvedRequest.requester,
        amount: approvedRequest.amount,
        status: "authorized",
        date: new Date().toISOString().substring(0, 10),
        method: null,
        processedBy: "Current User",
      };
      setPayments([...payments, newPayment]);
    }
    
    toast({
      title: "Request Approved",
      description: `Payment request ${requestId} has been approved.`,
    });
  };

  const handleRejectRequest = (requestId: string) => {
    setRequests(
      requests.map(request =>
        request.id === requestId
          ? { ...request, status: "rejected" }
          : request
      )
    );
    
    toast({
      title: "Request Rejected",
      description: `Payment request ${requestId} has been rejected.`,
    });
  };

  const filterPayments = () => {
    if (filter === "all") return payments;
    return payments.filter(payment => payment.status === filter);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 px-2 py-1 rounded";
      case "authorized": return "bg-blue-100 text-blue-800 px-2 py-1 rounded";
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
                ? "border-bnkis-primary text-bnkis-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("payments")}
          >
            Payments
          </button>
          <button
            className={`py-4 border-b-2 ${
              activeTab === "requests"
                ? "border-bnkis-primary text-bnkis-primary"
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
                <option value="authorized">Authorized</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <CardDescription>
              Process and track payments for invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterPayments().map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.id}</TableCell>
                      <TableCell>{payment.invoiceId}</TableCell>
                      <TableCell>{payment.vendorName}</TableCell>
                      <TableCell>${payment.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={getStatusBadgeColor(payment.status)}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {(payment.status === "pending" || payment.status === "authorized") && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleProcessPayment(payment.id)}
                            >
                              Process
                            </Button>
                          )}
                          {payment.status === "pending" && (
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleCancelPayment(payment.id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.filter(request => request.status === "pending").map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.id}</TableCell>
                      <TableCell>
                        <div>{request.projectName}</div>
                        <div className="text-sm text-muted-foreground">ID: {request.projectId}</div>
                      </TableCell>
                      <TableCell>{request.requester}</TableCell>
                      <TableCell>${request.amount.toLocaleString()}</TableCell>
                      <TableCell>{request.purpose}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleApproveRequest(request.id)}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleRejectRequest(request.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {requests.filter(request => request.status === "pending").length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No pending payment requests
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentComponent;

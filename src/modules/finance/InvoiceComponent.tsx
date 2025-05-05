
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
import { getInvoices, createInvoice, updateInvoice, deleteInvoice, reportPotentialScam } from "@/services/billingService";
import { useAuth } from "@/contexts/auth";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

interface Invoice {
  id?: string;
  invoiceId?: string;
  vendorId: string;
  vendorName?: string;
  projectId?: string;
  projectName?: string;
  amount: number;
  invoiceNumber: string;
  description: string;
  status: "draft" | "pending" | "paid" | "overdue";
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  isScamSuspected?: boolean;
  createdBy?: string; // Added to match the backend
  createdAt?: Date;
  updatedAt?: Date;
}

const InvoiceComponent = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [formData, setFormData] = useState({
    vendorId: "",
    vendorName: "",
    projectId: "",
    projectName: "",
    amount: "",
    invoiceNumber: "",
    description: "",
    issueDate: "",
    dueDate: "",
    status: "draft",
  });
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Fetch invoices from Firebase
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const fetchedInvoices = await getInvoices();
        setInvoices(fetchedInvoices);
      } catch (error: any) {
        console.error("Error fetching invoices:", error);
        toast({
          title: "Error",
          description: `Failed to load invoices: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to create invoices",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Create new invoice
      const newInvoice: Invoice = {
        vendorId: formData.vendorId,
        vendorName: formData.vendorName,
        projectId: formData.projectId || undefined,
        projectName: formData.projectName || undefined,
        amount: parseFloat(formData.amount),
        invoiceNumber: formData.invoiceNumber,
        description: formData.description || "Invoice",
        status: "draft",
        issueDate: new Date(formData.issueDate),
        dueDate: new Date(formData.dueDate),
        createdBy: currentUser.id, // Changed from uid to id
      };
      
      setLoading(true);
      const createdInvoice = await createInvoice(newInvoice);
      
      setInvoices([...invoices, createdInvoice]);
      resetForm();
      
      toast({
        title: "Invoice Created",
        description: `Invoice ${createdInvoice.invoiceId || createdInvoice.id} has been created successfully.`,
      });
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: `Failed to create invoice: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      vendorId: "",
      vendorName: "",
      projectId: "",
      projectName: "",
      amount: "",
      invoiceNumber: "",
      description: "",
      issueDate: "",
      dueDate: "",
      status: "draft",
    });
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      setLoading(true);
      
      const updateData: Partial<Invoice> = {
        status: "paid",
        paidDate: new Date(), // Now included in the Invoice interface
      };
      
      await updateInvoice(invoiceId, updateData);
      
      setInvoices(
        invoices.map(invoice =>
          invoice.id === invoiceId
            ? { ...invoice, ...updateData }
            : invoice
        )
      );
      
      toast({
        title: "Invoice Marked as Paid",
        description: `Invoice ${invoiceId} has been marked as paid.`,
      });
    } catch (error: any) {
      console.error("Error updating invoice:", error);
      toast({
        title: "Error",
        description: `Failed to update invoice: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (invoiceId: string) => {
    try {
      setLoading(true);
      
      await deleteInvoice(invoiceId);
      
      setInvoices(invoices.filter(invoice => invoice.id !== invoiceId));
      
      toast({
        title: "Invoice Deleted",
        description: `Invoice ${invoiceId} has been deleted.`,
      });
    } catch (error: any) {
      console.error("Error deleting invoice:", error);
      toast({
        title: "Error",
        description: `Failed to delete invoice: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleReportScam = async (invoiceId: string) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      await reportPotentialScam(
        "invoices",
        invoiceId,
        currentUser.id, // Changed from uid to id
        "Invoice flagged as potentially fraudulent"
      );
      
      // Update local state
      setInvoices(
        invoices.map(invoice =>
          invoice.id === invoiceId
            ? { ...invoice, isScamSuspected: true }
            : invoice
        )
      );
      
      toast({
        title: "Scam Reported",
        description: `Invoice ${invoiceId} has been reported as potentially fraudulent.`,
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

  const filterInvoices = () => {
    if (filter === "all") return invoices;
    return invoices.filter(invoice => invoice.status === filter);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800 px-2 py-1 rounded";
      case "pending": return "bg-blue-100 text-blue-800 px-2 py-1 rounded";
      case "overdue": return "bg-red-100 text-red-800 px-2 py-1 rounded";
      case "draft": return "bg-gray-100 text-gray-800 px-2 py-1 rounded";
      default: return "bg-gray-100 text-gray-800 px-2 py-1 rounded";
    }
  };

  return (
    <div className="space-y-6 container">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Invoice Management</h2>
        <p className="text-muted-foreground">
          Create and manage invoices for vendor payments.
        </p>
      </div>
      
      <div className="">
        {/* Invoice Form */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Create New Invoice</CardTitle>
            <CardDescription>
              Generate a new invoice for a vendor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vendorId">Vendor ID</Label>
                <Input 
                  id="vendorId"
                  value={formData.vendorId}
                  onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vendorName">Vendor Name</Label>
                <Input 
                  id="vendorName"
                  value={formData.vendorName}
                  onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="projectId">Project ID</Label>
                <Input 
                  id="projectId"
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input 
                  id="projectName"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input 
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input 
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input 
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input 
                  id="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input 
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>
              
              <div className="flex justify-between mt-4">
                <Button variant="outline" type="button" onClick={resetForm}>
                  Clear
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Invoice
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Invoices List */}
        <Card className="md:col-span-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Invoices</CardTitle>
              <div className="flex space-x-2">
                <select 
                  className="border border-gray-300 rounded p-1"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
            <CardDescription>
              Manage existing invoices
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
                      <TableHead>Invoice</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterInvoices().length > 0 ? (
                      filterInvoices().map((invoice) => (
                        <TableRow key={invoice.id} className={invoice.isScamSuspected ? "bg-red-50" : ""}>
                          <TableCell>
                            <div className="font-medium">
                              {invoice.invoiceNumber} 
                              {invoice.isScamSuspected && (
                                <span className="ml-2 text-red-500">
                                  <AlertTriangle className="h-4 w-4 inline" />
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {invoice.projectName || invoice.projectId || "No project"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>{invoice.vendorName || "Unknown vendor"}</div>
                            <div className="text-sm text-muted-foreground">ID: {invoice.vendorId}</div>
                          </TableCell>
                          <TableCell>${invoice.amount?.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className={getStatusBadgeColor(invoice.status)}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col space-y-2">
                              {invoice.status !== "paid" && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleMarkAsPaid(invoice.id || "")}
                                  disabled={!invoice.id || loading}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Mark Paid
                                </Button>
                              )}
                              {!invoice.isScamSuspected && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleReportScam(invoice.id || "")}
                                  disabled={!invoice.id || loading}
                                  className="bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
                                >
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  Report Scam
                                </Button>
                              )}
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDelete(invoice.id || "")}
                                disabled={!invoice.id || loading}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No invoices found
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

export default InvoiceComponent;

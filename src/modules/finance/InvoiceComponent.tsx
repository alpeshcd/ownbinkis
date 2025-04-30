
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

// Mock invoice data
const initialInvoices = [
  {
    id: "INV-001",
    vendorId: "V-001",
    vendorName: "Tech Solutions Inc",
    projectId: "P-001",
    projectName: "Website Redesign",
    amount: 5000,
    status: "paid" as "draft" | "pending" | "paid" | "overdue",
    dueDate: "2024-05-15",
    paidDate: "2024-05-10",
  },
  {
    id: "INV-002",
    vendorId: "V-002",
    vendorName: "Digital Marketing Co",
    projectId: "P-002",
    projectName: "SEO Campaign",
    amount: 3500,
    status: "pending" as "draft" | "pending" | "paid" | "overdue",
    dueDate: "2024-05-30",
    paidDate: null,
  },
  {
    id: "INV-003",
    vendorId: "V-003",
    vendorName: "Creative Design Studios",
    projectId: "P-003",
    projectName: "Logo Creation",
    amount: 1200,
    status: "overdue" as "draft" | "pending" | "paid" | "overdue",
    dueDate: "2024-04-30",
    paidDate: null,
  },
  {
    id: "INV-004",
    vendorId: "V-004",
    vendorName: "IT Support Services",
    projectId: "P-004",
    projectName: "Network Upgrade",
    amount: 8500,
    status: "draft" as "draft" | "pending" | "paid" | "overdue",
    dueDate: "2024-06-15",
    paidDate: null,
  },
];

interface Invoice {
  id: string;
  vendorId: string;
  vendorName: string;
  projectId: string;
  projectName: string;
  amount: number;
  status: "draft" | "pending" | "paid" | "overdue";
  dueDate: string;
  paidDate: string | null;
}

const InvoiceComponent = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [formData, setFormData] = useState({
    vendorId: "",
    vendorName: "",
    projectId: "",
    projectName: "",
    amount: "",
    dueDate: "",
    status: "draft",
  });
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new invoice
    const newInvoice: Invoice = {
      id: `INV-${Math.floor(Math.random() * 1000)}`,
      vendorId: formData.vendorId,
      vendorName: formData.vendorName,
      projectId: formData.projectId,
      projectName: formData.projectName,
      amount: parseFloat(formData.amount),
      status: "draft" as "draft" | "pending" | "paid" | "overdue",
      dueDate: formData.dueDate,
      paidDate: null,
    };
    
    setInvoices([...invoices, newInvoice]);
    resetForm();
    
    toast({
      title: "Invoice Created",
      description: `Invoice ${newInvoice.id} has been created successfully.`,
    });
  };

  const resetForm = () => {
    setFormData({
      vendorId: "",
      vendorName: "",
      projectId: "",
      projectName: "",
      amount: "",
      dueDate: "",
      status: "draft",
    });
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    setInvoices(
      invoices.map(invoice =>
        invoice.id === invoiceId
          ? { ...invoice, status: "paid", paidDate: new Date().toISOString().substring(0, 10) }
          : invoice
      )
    );
    
    toast({
      title: "Invoice Marked as Paid",
      description: `Invoice ${invoiceId} has been marked as paid.`,
    });
  };

  const handleDelete = (invoiceId: string) => {
    setInvoices(invoices.filter(invoice => invoice.id !== invoiceId));
    
    toast({
      title: "Invoice Deleted",
      description: `Invoice ${invoiceId} has been deleted.`,
    });
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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Invoice Management</h2>
        <p className="text-muted-foreground">
          Create and manage invoices for vendor payments.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-12">
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
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input 
                  id="projectName"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
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
                <Button type="submit">
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
                  {filterInvoices().map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <div className="font-medium">{invoice.id}</div>
                        <div className="text-sm text-muted-foreground">{invoice.projectName}</div>
                      </TableCell>
                      <TableCell>
                        <div>{invoice.vendorName}</div>
                        <div className="text-sm text-muted-foreground">ID: {invoice.vendorId}</div>
                      </TableCell>
                      <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={getStatusBadgeColor(invoice.status)}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {invoice.status !== "paid" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleMarkAsPaid(invoice.id)}
                            >
                              Mark Paid
                            </Button>
                          )}
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDelete(invoice.id)}
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

export default InvoiceComponent;

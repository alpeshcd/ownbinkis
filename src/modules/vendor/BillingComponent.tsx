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

// Mock billing data
const initialBills = [
  {
    id: "BILL-001",
    vendorId: "VND-001",
    vendorName: "Tech Solutions Inc",
    projectId: "PRJ-001",
    projectName: "Website Redesign",
    amount: 5000,
    status: "paid" as "draft" | "pending" | "paid" | "overdue",
    dueDate: "2024-05-15",
    paidDate: "2024-05-10",
  },
  {
    id: "BILL-002",
    vendorId: "VND-002",
    vendorName: "Digital Marketing Co",
    projectId: "PRJ-002",
    projectName: "SEO Campaign",
    amount: 3500,
    status: "pending" as "draft" | "pending" | "paid" | "overdue",
    dueDate: "2024-05-30",
    paidDate: null,
  },
  {
    id: "BILL-003",
    vendorId: "VND-003",
    vendorName: "Creative Design Studios",
    projectId: "PRJ-003",
    projectName: "Logo Creation",
    amount: 1200,
    status: "overdue" as "draft" | "pending" | "paid" | "overdue",
    dueDate: "2024-04-30",
    paidDate: null,
  },
  {
    id: "BILL-004",
    vendorId: "VND-004",
    vendorName: "IT Support Services",
    projectId: "PRJ-004",
    projectName: "Network Upgrade",
    amount: 8500,
    status: "draft" as "draft" | "pending" | "paid" | "overdue",
    dueDate: "2024-06-15",
    paidDate: null,
  },
];

// Mock vendors and projects for dropdowns
const vendorOptions = [
  { id: "VND-001", name: "Tech Solutions Inc" },
  { id: "VND-002", name: "Digital Marketing Co" },
  { id: "VND-003", name: "Creative Design Studios" },
  { id: "VND-004", name: "IT Support Services" },
];

const projectOptions = [
  { id: "PRJ-001", name: "Website Redesign" },
  { id: "PRJ-002", name: "SEO Campaign" },
  { id: "PRJ-003", name: "Logo Creation" },
  { id: "PRJ-004", name: "Network Upgrade" },
];

interface Bill {
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

const BillingComponent = () => {
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    vendorId: "",
    projectId: "",
    amount: "",
    dueDate: "",
  });
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedVendor = vendorOptions.find(v => v.id === formData.vendorId);
    const selectedProject = projectOptions.find(p => p.id === formData.projectId);
    
    const newBill: Bill = {
      id: `BILL-${Math.floor(Math.random() * 1000)}`,
      vendorId: formData.vendorId,
      vendorName: selectedVendor?.name || "Unknown Vendor",
      projectId: formData.projectId,
      projectName: selectedProject?.name || "Unknown Project",
      amount: parseFloat(formData.amount),
      status: "draft",
      dueDate: formData.dueDate,
      paidDate: null,
    };
    
    setBills([...bills, newBill]);
    resetForm();
    
    toast({
      title: "Bill Created",
      description: `A draft bill has been created for ${selectedVendor?.name}.`,
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBill) return;
    
    const selectedVendor = vendorOptions.find(v => v.id === formData.vendorId);
    const selectedProject = projectOptions.find(p => p.id === formData.projectId);
    
    setBills(
      bills.map(bill =>
        bill.id === selectedBill.id
          ? {
              ...bill,
              vendorId: formData.vendorId,
              vendorName: selectedVendor?.name || bill.vendorName,
              projectId: formData.projectId,
              projectName: selectedProject?.name || bill.projectName,
              amount: parseFloat(formData.amount),
              dueDate: formData.dueDate,
            }
          : bill
      )
    );
    
    resetForm();
    
    toast({
      title: "Bill Updated",
      description: `The bill has been updated successfully.`,
    });
  };

  const handleEdit = (bill: Bill) => {
    setSelectedBill(bill);
    setFormData({
      vendorId: bill.vendorId,
      projectId: bill.projectId,
      amount: bill.amount.toString(),
      dueDate: bill.dueDate,
    });
    setIsEditing(true);
  };

  const handleDelete = (billId: string) => {
    setBills(bills.filter(bill => bill.id !== billId));
    
    toast({
      title: "Bill Deleted",
      description: `The bill has been deleted successfully.`,
    });
  };

  const handleStatusChange = (billId: string, newStatus: "draft" | "pending" | "paid" | "overdue") => {
    setBills(
      bills.map(bill =>
        bill.id === billId
          ? {
              ...bill,
              status: newStatus,
              paidDate: newStatus === "paid" ? new Date().toISOString().split("T")[0] : bill.paidDate,
            }
          : bill
      )
    );
    
    toast({
      title: "Status Updated",
      description: `Bill status has been changed to ${newStatus}.`,
    });
  };

  const resetForm = () => {
    setSelectedBill(null);
    setIsEditing(false);
    setFormData({
      vendorId: "",
      projectId: "",
      amount: "",
      dueDate: "",
    });
  };

  const filterBills = () => {
    if (filter === "all") return bills;
    return bills.filter(bill => bill.status === filter);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800 px-2 py-1 rounded";
      case "pending": return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded";
      case "paid": return "bg-green-100 text-green-800 px-2 py-1 rounded";
      case "overdue": return "bg-red-100 text-red-800 px-2 py-1 rounded";
      default: return "bg-gray-100 text-gray-800 px-2 py-1 rounded";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Vendor Billing</h2>
        <p className="text-muted-foreground">
          Create and manage bills for vendor services.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-12">
        {/* Bill Form */}
        <Card className="md:col-span-5">
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Bill" : "Create Bill"}</CardTitle>
            <CardDescription>
              {isEditing ? "Update bill details" : "Create a new bill for a vendor"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isEditing ? handleUpdate : handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vendorId">Vendor</Label>
                <select 
                  id="vendorId"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.vendorId}
                  onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                  required
                >
                  <option value="">Select a vendor</option>
                  {vendorOptions.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>
              
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
                      {project.name}
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
                  min="0.01"
                  step="0.01"
                  placeholder="Enter bill amount"
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
                  {isEditing ? "Cancel" : "Clear"}
                </Button>
                <Button type="submit">
                  {isEditing ? "Update Bill" : "Create Bill"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Bills List */}
        <Card className="md:col-span-7">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Bills</CardTitle>
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
            <CardDescription>
              Manage vendor bills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterBills().map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell>
                        <div className="font-medium">{bill.id}</div>
                        <div className="text-sm text-muted-foreground">Vendor: {bill.vendorName}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Project: {bill.projectName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>${bill.amount.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          Due: {new Date(bill.dueDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={getStatusBadgeColor(bill.status)}>
                          {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-2">
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEdit(bill)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDelete(bill.id)}
                            >
                              Delete
                            </Button>
                          </div>
                          
                          {bill.status === "draft" && (
                            <Button 
                              size="sm"
                              onClick={() => handleStatusChange(bill.id, "pending")}
                            >
                              Mark as Pending
                            </Button>
                          )}
                          
                          {(bill.status === "pending" || bill.status === "overdue") && (
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(bill.id, "paid")}
                            >
                              Mark as Paid
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
      </div>
    </div>
  );
};

export default BillingComponent;

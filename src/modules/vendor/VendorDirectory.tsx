
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

// Mock vendor data
const initialVendors = [
  {
    id: "VND-001",
    name: "Tech Solutions Inc",
    contactEmail: "contact@techsolutions.com",
    contactPhone: "555-123-4567",
    services: ["Web Development", "IT Support"],
    address: "123 Tech Blvd, San Francisco, CA",
    status: "active",
  },
  {
    id: "VND-002",
    name: "Digital Marketing Co",
    contactEmail: "info@digitalmarketing.com",
    contactPhone: "555-234-5678",
    services: ["SEO", "Social Media", "Content Marketing"],
    address: "456 Marketing St, New York, NY",
    status: "active",
  },
  {
    id: "VND-003",
    name: "Creative Design Studios",
    contactEmail: "hello@creativedesign.com",
    contactPhone: "555-345-6789",
    services: ["Graphic Design", "UI/UX Design", "Branding"],
    address: "789 Creative Ave, Portland, OR",
    status: "inactive",
  },
  {
    id: "VND-004",
    name: "IT Support Services",
    contactEmail: "support@itsupport.com",
    contactPhone: "555-456-7890",
    services: ["IT Support", "Network Setup", "Hardware Installation"],
    address: "101 Support Ln, Austin, TX",
    status: "active",
  },
];

interface Vendor {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  services: string[];
  address: string;
  status: "active" | "inactive";
}

const VendorDirectory = () => {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contactEmail: "",
    contactPhone: "",
    services: "",
    address: "",
    status: "active" as "active" | "inactive",
  });
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newVendor: Vendor = {
      id: `VND-${Math.floor(Math.random() * 1000)}`,
      name: formData.name,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      services: formData.services.split(",").map(s => s.trim()).filter(s => s),
      address: formData.address,
      status: formData.status,
    };
    
    setVendors([...vendors, newVendor]);
    resetForm();
    
    toast({
      title: "Vendor Created",
      description: `Vendor ${formData.name} has been added to the directory.`,
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVendor) return;
    
    setVendors(
      vendors.map(vendor =>
        vendor.id === selectedVendor.id
          ? {
              ...vendor,
              name: formData.name,
              contactEmail: formData.contactEmail,
              contactPhone: formData.contactPhone,
              services: formData.services.split(",").map(s => s.trim()).filter(s => s),
              address: formData.address,
              status: formData.status,
            }
          : vendor
      )
    );
    
    resetForm();
    
    toast({
      title: "Vendor Updated",
      description: `Vendor ${formData.name} has been updated successfully.`,
    });
  };

  const handleEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setFormData({
      name: vendor.name,
      contactEmail: vendor.contactEmail,
      contactPhone: vendor.contactPhone,
      services: vendor.services.join(", "),
      address: vendor.address,
      status: vendor.status,
    });
    setIsEditing(true);
  };

  const handleDelete = (vendorId: string) => {
    setVendors(vendors.filter(vendor => vendor.id !== vendorId));
    
    toast({
      title: "Vendor Deleted",
      description: `Vendor has been removed from the directory.`,
    });
  };

  const resetForm = () => {
    setSelectedVendor(null);
    setIsEditing(false);
    setFormData({
      name: "",
      contactEmail: "",
      contactPhone: "",
      services: "",
      address: "",
      status: "active",
    });
  };

  const filterVendors = () => {
    if (filter === "all") return vendors;
    return vendors.filter(vendor => vendor.status === filter);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Vendor Directory</h2>
        <p className="text-muted-foreground">
          Manage and track vendors and service providers.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-12">
        {/* Vendor Form */}
        <Card className="md:col-span-5">
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Vendor" : "Add Vendor"}</CardTitle>
            <CardDescription>
              {isEditing ? "Update vendor information" : "Add a new vendor to the directory"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isEditing ? handleUpdate : handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Vendor Name</Label>
                <Input 
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Company name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input 
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  required
                  placeholder="contact@company.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input 
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="555-123-4567"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="services">Services Provided</Label>
                <Input 
                  id="services"
                  value={formData.services}
                  onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                  required
                  placeholder="Web Development, IT Support, etc. (comma separated)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Company address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select 
                  id="status"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div className="flex justify-between mt-4">
                <Button variant="outline" type="button" onClick={resetForm}>
                  {isEditing ? "Cancel" : "Clear"}
                </Button>
                <Button type="submit">
                  {isEditing ? "Update Vendor" : "Add Vendor"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Vendors List */}
        <Card className="md:col-span-7">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Vendors</CardTitle>
              <select 
                className="border border-gray-300 rounded p-1"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Vendors</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
            <CardDescription>
              Browse and manage vendor directory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterVendors().map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell>
                        <div className="font-medium">{vendor.name}</div>
                        <div className="text-sm text-muted-foreground">{vendor.id}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Services: {vendor.services.join(", ")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{vendor.contactEmail}</div>
                        <div className="text-sm text-muted-foreground">{vendor.contactPhone}</div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded ${
                          vendor.status === "active" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(vendor)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDelete(vendor.id)}
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

export default VendorDirectory;

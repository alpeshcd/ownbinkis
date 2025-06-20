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
import { usePermissions } from "@/hooks/usePermissions";
import {
  getCollection,
  createDocument,
  updateDocument,
} from "@/firebase/firestore";
import { useAuth } from "@/contexts/auth";
import { Skeleton } from "@/components/ui/skeleton";
import PaginationControl from "@/components/common/Pagination";
import { Modal } from "antd";

interface Vendor {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  services: string[];
  address: string;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

const VendorDirectory = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();
  const { can } = usePermissions();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    contactEmail: "",
    contactPhone: "",
    services: "",
    address: "",
    status: "active" as "active" | "inactive",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  // Fetch vendors from Firebase
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setIsLoading(true);

        const options = {
          filters:
            currentUser?.role === "vendor"
              ? [{ field: "id", operator: "==", value: currentUser.id }]
              : [],
          orderByField: "name",
          orderDirection: "asc",
        };

        const vendorsData = await getCollection("vendors", options);
        setVendors(vendorsData);
        setTotalPages(
          Math.max(1, Math.ceil(vendorsData.length / itemsPerPage))
        );
      } catch (error) {
        console.error("Error fetching vendors:", error);
        toast({
          title: "Error",
          description: "Failed to load vendors. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendors();
  }, [currentUser, toast]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newVendor = {
        name: formData.name,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        services: formData.services
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        address: formData.address,
        status: formData.status,
        createdBy: currentUser?.id || "",
      };

      const createdVendor = await createDocument("vendors", newVendor);
      setVendors([createdVendor as Vendor, ...vendors]);
      const newTotalPages = Math.ceil((vendors.length + 1) / itemsPerPage);
      if (newTotalPages > totalPages) {
        setTotalPages(newTotalPages);
      }
      resetForm();

      toast({
        variant: "success",

        title: "Vendor Created",
      });
    } catch (error) {
      console.error("Error creating vendor:", error);
      toast({
        title: "Error",
        description: "Failed to create vendor. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVendor) return;

    try {
      const updatedVendor = {
        name: formData.name,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        services: formData.services
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        address: formData.address,
        status: formData.status,
      };

      await updateDocument("vendors", selectedVendor.id, updatedVendor);

      setVendors(
        vendors.map((vendor) =>
          vendor.id === selectedVendor.id
            ? { ...vendor, ...updatedVendor }
            : vendor
        )
      );

      resetForm();

      toast({
        variant: "success",

        title: "Vendor Updated",
      });
    } catch (error) {
      console.error("Error updating vendor:", error);
      toast({
        title: "Error",
        description: "Failed to update vendor. Please try again.",
        variant: "destructive",
      });
    }
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

  const confirmDelete = (userId: string) => {
    Modal.confirm({
      title: "Are you sure?",
      content: "This action will deactivate the vendor .",
      okText: "De Activate",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => handleDelete(userId),
    });
  };

  const handleDelete = async (vendorId: string) => {
    try {
      await updateDocument("vendors", vendorId, { status: "inactive" });
      setVendors(
        vendors.map((vendor) =>
          vendor.id === vendorId ? { ...vendor, status: "inactive" } : vendor
        )
      );
      toast({
        variant: "success",

        title: "Vendor Deactivated",
      });
    } catch (error) {
      console.error("Error deactivating vendor:", error);
      toast({
        title: "Error",
        variant: "destructive",
      });
    }
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
    return vendors.filter((vendor) => vendor.status === filter);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // page vendors
  const getCurrentPageVendors = () => {
    const filteredVendors = filterVendors();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredVendors.slice(startIndex, endIndex);
  };

  const canEditVendors = can("edit", "vendors", { isOwner: false });
  const canCreateVendors = can("create", "vendors");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vendor</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-12">
          <Card className="md:col-span-5">
            <CardHeader>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="md:col-span-7">
            <CardHeader>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-60 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className=" container mt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Vendor</h2>
      </div>

      <div className="">
        {/* Vendor Form */}
        {(canCreateVendors || canEditVendors) && (
          <Card className="md:col-span-5">
            <CardHeader>
              <CardTitle>{isEditing ? "Edit Vendor" : "Add Vendor"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={isEditing ? handleUpdate : handleCreate}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Vendor Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="Company"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, contactEmail: e.target.value })
                    }
                    required
                    placeholder="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPhone: e.target.value })
                    }
                    placeholder="phone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="services">Services Provided</Label>
                  <Input
                    id="services"
                    value={formData.services}
                    onChange={(e) =>
                      setFormData({ ...formData, services: e.target.value })
                    }
                    required
                    placeholder=""
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "active" | "inactive",
                      })
                    }
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
        )}

        {/* Vendors List */}
        <Card
          className={
            canCreateVendors || canEditVendors
              ? "md:col-span-7 mt-4"
              : "md:col-span-12 mt-4"
          }
        >
          <CardHeader>
            <div className="flex justify-between items-center ">
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
          </CardHeader>
          <CardContent>
            {vendors.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      {canEditVendors && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getCurrentPageVendors().map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell>
                          <div className="font-medium">{vendor.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {vendor.id}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Services: {vendor.services.join(", ")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{vendor.contactEmail}</div>
                          <div className="text-sm text-muted-foreground">
                            {vendor.contactPhone}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded ${
                              vendor.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {vendor.status.charAt(0).toUpperCase() +
                              vendor.status.slice(1)}
                          </span>
                        </TableCell>
                        {canEditVendors && (
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(vendor)}
                              >
                                Edit
                              </Button>
                              {vendor.status === "active" && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => confirmDelete(vendor.id)}
                                >
                                  Deactivate
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="cursor-pointer">
                  <PaginationControl
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No vendors found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorDirectory;

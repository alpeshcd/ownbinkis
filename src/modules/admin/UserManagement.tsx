import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "antd";

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
import {
  getCollection,
  createDocument,
  updateDocument,
  deleteDocument,
} from "@/firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/contexts/auth/types";
import PaginationControl from "@/components/common/Pagination";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user" as UserRole,
    password: "",
  });
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Search and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from Firebase
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getCollection("users");

      const formattedUsers = usersData.map((user: any) => ({
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        role: (user.role || "user") as UserRole,
        createdAt:
          user.createdAt && user.createdAt.seconds
            ? new Date(user.createdAt.seconds * 1000)
            : user.createdAt instanceof Date
            ? user.createdAt
            : new Date(),
      }));

      setUsers(formattedUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: `Failed to load users: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
    });
    setIsEditing(true);
  };

  const confirmDelete = (userId: string) => {
    Modal.confirm({
      title: "Are you sure?",
      content: "This action will delete the user permanently.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => handleDelete(userId),
    });
  };
  const handleDelete = async (userId: string) => {
    try {
      await deleteDocument("users", userId);
      setUsers(users.filter((u) => u.id !== userId));
      toast({
        variant: "success",

        title: "User Deleted",
        description: "User has been successfully deleted.",
      });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: `Failed to delete user: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && selectedUser) {
        const userData = {
          name: formData.name,
          role: formData.role as UserRole,
        };

        await updateDocument("users", selectedUser.id, userData);

        setUsers(
          users.map((user) =>
            user.id === selectedUser.id ? { ...user, ...userData } : user
          )
        );

        toast({
          variant: "success",

          title: "User Updated",
          description: "User has been successfully updated.",
        });
      } else {
        try {
          const userData = {
            name: formData.name,
            email: formData.email,
            role: formData.role as UserRole,
            createdAt: serverTimestamp(),
          };

          const newDocRef = doc(collection(db, "users"));
          const newUserId = newDocRef.id;

          await setDoc(newDocRef, userData);

          const newUser: User = {
            id: newUserId,
            ...userData,
            createdAt: new Date(),
          };

          setUsers([newUser, ...users]);

          toast({
            title: "✅ User Created",
            description: "New user has been successfully created.",
            variant: "default", // optional
          });
        } catch (error: any) {
          console.error("Error creating user:", error);
          toast({
            title: "Error",
            description: `Failed to create user: ${error.message}`,
            variant: "destructive",
          });
        }
      }

      // Reset form
      resetForm();
    } catch (error: any) {
      console.error("Error saving user:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} user: ${
          error.message
        }`,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setSelectedUser(null);
    setFormData({
      name: "",
      email: "",
      role: "user",
      password: "",
    });
    setIsEditing(false);
  };

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination values
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6 container mt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="">
        {/* User Form */}
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit User" : "Add New User"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  disabled={isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as UserRole,
                    })
                  }
                >
                  <option value="user">User</option>
                  <option value="vendor">Vendor</option>
                  <option value="finance">Finance</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {!isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required={!isEditing}
                  />
                </div>
              )}

              <div className="flex justify-between mt-4">
                <Button variant="outline" type="button" onClick={resetForm}>
                  {isEditing ? "Cancel" : "Clear"}
                </Button>
                <Button type="submit" disabled={loading}>
                  {isEditing ? "Update User" : "Add User"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>User Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedUsers.map((user) => {
                      console.log("User:", user);

                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-block px-2 py-1 text-xs font-medium rounded-full
                                ${
                                  user.role === "admin"
                                    ? "bg-red-100 text-red-800"
                                    : user.role === "supervisor"
                                    ? "bg-blue-100 text-blue-800"
                                    : user.role === "finance"
                                    ? "bg-green-100 text-green-800"
                                    : user.role === "vendor"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                            >
                              {user.role.charAt(0).toUpperCase() +
                                user.role.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatDate(user.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(user)}
                                disabled={currentUser?.id === user.id}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => confirmDelete(user.id)}
                                disabled={currentUser?.id === user.id}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination control */}
            {filteredUsers.length > ITEMS_PER_PAGE && (
              <div className="flex justify-center mt-4 cursor-pointer">
                <PaginationControl
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;

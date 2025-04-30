
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

// Mock user data
const initialUsers = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    createdAt: new Date("2023-01-15").toISOString(),
  },
  {
    id: "2",
    name: "Finance Manager",
    email: "finance@example.com",
    role: "finance",
    createdAt: new Date("2023-02-20").toISOString(),
  },
  {
    id: "3",
    name: "Project Supervisor",
    email: "supervisor@example.com",
    role: "supervisor",
    createdAt: new Date("2023-03-10").toISOString(),
  },
  {
    id: "4",
    name: "Vendor Company",
    email: "vendor@example.com",
    role: "vendor",
    createdAt: new Date("2023-04-05").toISOString(),
  },
  {
    id: "5",
    name: "Regular User",
    email: "user@example.com",
    role: "user",
    createdAt: new Date("2023-05-12").toISOString(),
  },
];

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
  });
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, this would fetch users from Firebase
    console.log("Loading users...");
  }, []);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setIsEditing(true);
  };

  const handleDelete = (userId: string) => {
    // In a real app, this would delete the user from Firebase
    setUsers(users.filter(u => u.id !== userId));
    toast({
      title: "User Deleted",
      description: "User has been successfully deleted.",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && selectedUser) {
      // Update existing user
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, ...formData } 
          : user
      ));
      toast({
        title: "User Updated",
        description: "User has been successfully updated.",
      });
    } else {
      // Add new user
      const newUser = {
        id: `user-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setUsers([...users, newUser]);
      toast({
        title: "User Created",
        description: "New user has been successfully created.",
      });
    }
    
    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setSelectedUser(null);
    setFormData({
      name: "",
      email: "",
      role: "user",
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">
          Add, edit, and manage user accounts in the system.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Form */}
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit User" : "Add New User"}</CardTitle>
            <CardDescription>
              {isEditing 
                ? "Update the user's information" 
                : "Create a new user account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isEditing} // Can't change email for existing users
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select 
                  id="role"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="vendor">Vendor</option>
                  <option value="finance">Finance</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="flex justify-between mt-4">
                <Button variant="outline" type="button" onClick={resetForm}>
                  {isEditing ? "Cancel" : "Clear"}
                </Button>
                <Button type="submit">
                  {isEditing ? "Update User" : "Add User"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>User Accounts</CardTitle>
            <CardDescription>
              Manage existing user accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="capitalize">{user.role}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(user)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDelete(user.id)}
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

export default UserManagement;


import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { UserRole } from "@/contexts/AuthContext";

// Sample user data
const initialUsers = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin" as UserRole,
    createdAt: new Date("2023-01-15"),
    status: "active",
  },
  {
    id: "2",
    name: "John Supervisor",
    email: "supervisor@example.com",
    role: "supervisor" as UserRole,
    createdAt: new Date("2023-02-20"),
    status: "active",
  },
  {
    id: "3",
    name: "Jane Finance",
    email: "finance@example.com",
    role: "finance" as UserRole,
    createdAt: new Date("2023-03-10"),
    status: "active",
  },
  {
    id: "4",
    name: "Robert Vendor",
    email: "vendor@example.com",
    role: "vendor" as UserRole,
    createdAt: new Date("2023-04-05"),
    status: "active",
  },
  {
    id: "5",
    name: "Lisa User",
    email: "user@example.com",
    role: "user" as UserRole,
    createdAt: new Date("2023-05-15"),
    status: "active",
  },
  {
    id: "6",
    name: "Tom Smith",
    email: "tom@example.com",
    role: "user" as UserRole,
    createdAt: new Date("2023-06-20"),
    status: "inactive",
  },
];

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  status: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // New user form data
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "user" as UserRole,
    password: "",
  });

  // Edit user form data
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Handle adding a new user
  const handleAddUser = () => {
    // Validation
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Create new user object
    const user: User = {
      id: `user-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: new Date(),
      status: "active",
    };

    // Add to users list
    setUsers([...users, user]);

    // Reset form and close dialog
    setNewUser({
      name: "",
      email: "",
      role: "user",
      password: "",
    });
    setIsAddUserOpen(false);

    toast({
      title: "User Added",
      description: `${user.name} has been added successfully.`,
    });
  };

  // Handle editing a user
  const handleEditUser = () => {
    if (!editingUser) return;

    const updatedUsers = users.map((user) =>
      user.id === editingUser.id ? editingUser : user
    );

    setUsers(updatedUsers);
    setIsEditUserOpen(false);

    toast({
      title: "User Updated",
      description: `${editingUser.name}'s information has been updated.`,
    });
  };

  // Handle deleting a user
  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find((user) => user.id === userId);
    if (!userToDelete) return;

    const updatedUsers = users.filter((user) => user.id !== userId);
    setUsers(updatedUsers);

    toast({
      title: "User Deleted",
      description: `${userToDelete.name} has been removed from the system.`,
    });
  };

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 pt-20 sm:pt-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button>Add New User</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account. The user will receive an email with login
                instructions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="john.doe@example.com"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">
                  Role
                </label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser}>Add User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 w-full max-w-sm">
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-red-100 text-red-800"
                          : user.role === "supervisor"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "finance"
                          ? "bg-green-100 text-green-800"
                          : user.role === "vendor"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-block w-2 h-2 mr-1 rounded-full ${
                        user.status === "active" ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></span>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </TableCell>
                  <TableCell>
                    {user.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Dialog open={isEditUserOpen && editingUser?.id === user.id} onOpenChange={(open) => {
                      setIsEditUserOpen(open);
                      if (open) setEditingUser(user);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Edit User</DialogTitle>
                          <DialogDescription>
                            Update user information.
                          </DialogDescription>
                        </DialogHeader>
                        {editingUser && (
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label htmlFor="edit-name" className="text-sm font-medium">
                                Full Name
                              </label>
                              <Input
                                id="edit-name"
                                value={editingUser.name}
                                onChange={(e) =>
                                  setEditingUser({
                                    ...editingUser,
                                    name: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <label htmlFor="edit-email" className="text-sm font-medium">
                                Email
                              </label>
                              <Input
                                id="edit-email"
                                type="email"
                                value={editingUser.email}
                                onChange={(e) =>
                                  setEditingUser({
                                    ...editingUser,
                                    email: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <label htmlFor="edit-role" className="text-sm font-medium">
                                Role
                              </label>
                              <Select
                                value={editingUser.role}
                                onValueChange={(value) =>
                                  setEditingUser({
                                    ...editingUser,
                                    role: value as UserRole,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="supervisor">Supervisor</SelectItem>
                                  <SelectItem value="finance">Finance</SelectItem>
                                  <SelectItem value="vendor">Vendor</SelectItem>
                                  <SelectItem value="user">User</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label htmlFor="edit-status" className="text-sm font-medium">
                                Status
                              </label>
                              <Select
                                value={editingUser.status}
                                onValueChange={(value) =>
                                  setEditingUser({
                                    ...editingUser,
                                    status: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleEditUser}>Save Changes</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserManagement;

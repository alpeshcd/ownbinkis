import React, { useState, useEffect } from "react";
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
import { UserRole, useAuth } from "@/contexts/AuthContext";
import {
  getCollection,
  createDocument,
  updateDocument,
  deleteDocument,
} from "@/firebase/firestore";
import { auth } from "@/firebase/auth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import PaginationControl from "@/components/common/Pagination";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  status: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // New user form data
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "user" as UserRole,
    password: "",
  });

  // Edit user form data
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from Firebase
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getCollection("users");

      const formattedUsers = usersData.map((user) => ({
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        role: (user.role || "user") as UserRole,
        createdAt: user.createdAt
          ? new Date(user.createdAt.seconds * 1000)
          : new Date(),
        status: "active", // Default status
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

  // Handle adding a new user
  const handleAddUser = async () => {
    // Validation
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      // 1. Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUser.email,
        newUser.password
      );

      const firebaseUser = userCredential.user;

      // 2. Create user document in Firestore
      const userData = {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      };

      await createDocument("users", userData, firebaseUser.uid);

      // 3. Add to local state
      const user: User = {
        id: firebaseUser.uid,
        ...userData,
        createdAt: new Date(),
        status: "active",
      };

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
    } catch (error: any) {
      console.error("Error adding user:", error);
      toast({
        title: "Error",
        description: `Failed to add user: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Handle editing a user
  const handleEditUser = async () => {
    if (!editingUser) return;

    try {
      // Update user in Firebase
      const userData = {
        name: editingUser.name,
        role: editingUser.role,
        // Email can't be updated
      };

      await updateDocument("users", editingUser.id, userData);

      // Update local state
      const updatedUsers = users.map((user) =>
        user.id === editingUser.id ? editingUser : user
      );

      setUsers(updatedUsers);
      setIsEditUserOpen(false);

      toast({
        title: "User Updated",
        description: `${editingUser.name}'s information has been updated.`,
      });
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: `Failed to update user: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Handle deleting a user
  const handleDeleteUser = async (userId: string) => {
    // Don't allow deleting the current user
    if (userId === currentUser?.id) {
      toast({
        title: "Error",
        description: "You cannot delete your own account.",
        variant: "destructive",
      });
      return;
    }

    const userToDelete = users.find((user) => user.id === userId);
    if (!userToDelete) return;

    try {
      // Delete from Firebase
      await deleteDocument("users", userId);

      // Update local state
      const updatedUsers = users.filter((user) => user.id !== userId);
      setUsers(updatedUsers);

      toast({
        title: "User Deleted",
        description: `${userToDelete.name} has been removed from the system.`,
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
    window.scrollTo(0, 0);
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-20 sm:pt-24">
      <div className=" mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button>Add New User</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account. The user will receive an email with
                login instructions.
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
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
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
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  placeholder="john.doe@example.com"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">
                  Role
                </label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) =>
                    setNewUser({ ...newUser, role: value as UserRole })
                  }
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
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
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
                  <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Dialog
                      open={isEditUserOpen && editingUser?.id === user.id}
                      onOpenChange={(open) => {
                        setIsEditUserOpen(open);
                        if (open) setEditingUser(user);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            currentUser?.id === user.id &&
                            currentUser?.role !== "admin"
                          }
                        >
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
                              <label
                                htmlFor="edit-name"
                                className="text-sm font-medium"
                              >
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
                              <label
                                htmlFor="edit-email"
                                className="text-sm font-medium"
                              >
                                Email
                              </label>
                              <Input
                                id="edit-email"
                                type="email"
                                value={editingUser.email}
                                disabled
                                className="bg-gray-100"
                              />
                              <p className="text-xs text-gray-500">
                                Email cannot be changed
                              </p>
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="edit-role"
                                className="text-sm font-medium"
                              >
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
                                disabled={currentUser?.role !== "admin"}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="supervisor">
                                    Supervisor
                                  </SelectItem>
                                  <SelectItem value="finance">
                                    Finance
                                  </SelectItem>
                                  <SelectItem value="vendor">Vendor</SelectItem>
                                  <SelectItem value="user">User</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="edit-status"
                                className="text-sm font-medium"
                              >
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
                                  <SelectItem value="inactive">
                                    Inactive
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsEditUserOpen(false)}
                          >
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
                      disabled={
                        currentUser?.id === user.id ||
                        currentUser?.role !== "admin"
                      }
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

      {/* Pagination control */}
      {filteredUsers.length > ITEMS_PER_PAGE && (
        <div className="flex justify-center mt-8">
          <PaginationControl
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default UserManagement;

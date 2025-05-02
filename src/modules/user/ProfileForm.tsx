
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { updateDocument } from "@/firebase/firestore";
import { updateProfile } from "firebase/auth";
import auth from "@/firebase/auth";
import { Loader2 } from "lucide-react";

const ProfileForm = () => {
  const { currentUser, reloadUser } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Initialize form data with current user data
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        role: currentUser.role || "",
      });
    }
  }, [currentUser]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Only update the fields the user is allowed to change
      const updateData: Record<string, any> = {
        name: formData.name,
        phone: formData.phone,
      };
      
      // Update user document in Firestore
      await updateDocument("users", currentUser.id, updateData);
      
      // If display name was updated, also update it in Firebase Auth
      if (formData.name !== currentUser.name) {
        const user = auth.currentUser;
        if (user) {
          await updateProfile(user, { displayName: formData.name });
        }
      }
      
      // Reload the user to get updated data
      await reloadUser();
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          disabled={!isEditing || isLoading}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          disabled={true} // Email can't be changed
          required
        />
        <p className="text-xs text-muted-foreground">
          Email cannot be changed
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone || ""}
          onChange={handleInputChange}
          disabled={!isEditing || isLoading}
          placeholder="Enter your phone number"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Input
          id="role"
          name="role"
          value={formData.role}
          disabled={true} // Role can't be changed by user
          required
        />
        <p className="text-xs text-muted-foreground">
          Only administrators can change roles
        </p>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        {isEditing ? (
          <>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </>
        ) : (
          <>
            <Button 
              type="button" 
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          </>
        )}
      </div>
    </form>
  );
};

export default ProfileForm;

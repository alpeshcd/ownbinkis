
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";

const Profile = () => {
  const { currentUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setEmail(currentUser.email || "");
    }
  }, [currentUser]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would update the user's profile in Firebase
      // await updateUserProfile(currentUser.id, { name });
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your account details here</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isEditing}
              placeholder="Your name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              value={email}
              disabled
              placeholder="Your email"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={currentUser?.role || "User"}
              disabled
            />
            <p className="text-xs text-muted-foreground">Contact an administrator to change your role</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="created">Account Created</Label>
            <Input
              id="created"
              value={currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : "Unknown"}
              disabled
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Profile;

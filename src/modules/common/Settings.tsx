
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { useAuth } from "@/contexts/auth";

const Settings = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="text-center">
          Please log in to access settings.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Settings</h2>
        <p className="text-muted-foreground">
          Manage your application preferences and configurations
        </p>
      </div>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          
          <PermissionGuard action="view" resource="users">
            <TabsTrigger value="users">Users</TabsTrigger>
          </PermissionGuard>
          
          <PermissionGuard action="view" resource="projects">
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </PermissionGuard>
          
          <PermissionGuard 
            action="view" 
            resource="bills"
            context={{ isOwner: currentUser.role === "vendor" }}
          >
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </PermissionGuard>
          
          <PermissionGuard action="view" resource="tickets">
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
          </PermissionGuard>
          
          <PermissionGuard action="view" resource="vendors">
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
          </PermissionGuard>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Account settings content will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <PermissionGuard action="view" resource="users" fallback={<AccessDenied />}>
            <Card>
              <CardHeader>
                <CardTitle>User Settings</CardTitle>
                <CardDescription>
                  Manage system users and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>User management content will be displayed here.</p>
              </CardContent>
            </Card>
          </PermissionGuard>
        </TabsContent>
        
        <TabsContent value="projects">
          <PermissionGuard action="view" resource="projects" fallback={<AccessDenied />}>
            <Card>
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
                <CardDescription>
                  Configure project defaults and options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Project settings content will be displayed here.</p>
              </CardContent>
            </Card>
          </PermissionGuard>
        </TabsContent>
        
        <TabsContent value="billing">
          <PermissionGuard 
            action="view" 
            resource="bills" 
            context={{ isOwner: currentUser.role === "vendor" }}
            fallback={<AccessDenied />}
          >
            <Card>
              <CardHeader>
                <CardTitle>Billing Settings</CardTitle>
                <CardDescription>
                  Manage billing preferences and payment options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Billing settings content will be displayed here.</p>
              </CardContent>
            </Card>
          </PermissionGuard>
        </TabsContent>
        
        <TabsContent value="tickets">
          <PermissionGuard action="view" resource="tickets" fallback={<AccessDenied />}>
            <Card>
              <CardHeader>
                <CardTitle>Ticket Settings</CardTitle>
                <CardDescription>
                  Configure ticket handling and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Ticket settings content will be displayed here.</p>
              </CardContent>
            </Card>
          </PermissionGuard>
        </TabsContent>
        
        <TabsContent value="vendors">
          <PermissionGuard action="view" resource="vendors" fallback={<AccessDenied />}>
            <Card>
              <CardHeader>
                <CardTitle>Vendor Settings</CardTitle>
                <CardDescription>
                  Manage vendor preferences and options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Vendor settings content will be displayed here.</p>
              </CardContent>
            </Card>
          </PermissionGuard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Component to display when access is denied
const AccessDenied = () => {
  return (
    <div className="p-6 text-center">
      <div className="text-red-500 font-medium mb-2">Access Denied</div>
      <p>You don't have permission to view this content.</p>
    </div>
  );
};

export default Settings;

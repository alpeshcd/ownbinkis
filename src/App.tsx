import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { Navigation } from "@/components/layout/Navigation";
import { PrivateRoute } from "@/components/auth/PrivateRoute";

// Auth Module
import { Login, Register, ForgotPassword } from "@/modules/auth";

// Common Module
import { Dashboard, Unauthorized } from "@/modules/common";
import Settings from "@/modules/common/Settings"; 

// User Module
import { Profile } from "@/modules/user";

// Admin Module
import { UserManagement, Reports, DatabaseInitializer } from "@/modules/admin";

// Finance Module
import { InvoiceComponent, PaymentComponent } from "@/modules/finance";

// Supervisor Module
import { FinancialRequestComponent } from "@/modules/supervisor";

// Project Module
import { ProjectList, ProjectDetail, NewProject } from "@/modules/projects";

// Vendor Module
import { VendorDirectory, BillingComponent } from "@/modules/vendor";

// AI Module
import { AIInsights } from "@/modules/ai";

import NotFound from "./pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ProjectProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col w-full">
              <Navigation />
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                
                {/* Protected Routes */}
                <Route 
                  path="/" 
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/profile" 
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  } 
                />

                {/* Settings Route */}
                <Route
                  path="/settings"
                  element={
                    <PrivateRoute>
                      <Settings />
                    </PrivateRoute>
                  }
                />
                
                {/* Admin Routes */}
                <Route 
                  path="/users" 
                  element={
                    <PrivateRoute requiredRoles={["admin"]}>
                      <UserManagement />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/reports" 
                  element={
                    <PrivateRoute requiredRoles={["admin"]}>
                      <Reports />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/database" 
                  element={
                    <PrivateRoute requiredRoles={["admin"]}>
                      <DatabaseInitializer />
                    </PrivateRoute>
                  } 
                />
                
                {/* Project Routes */}
                <Route
                  path="/projects"
                  element={
                    <PrivateRoute>
                      <ProjectList />
                    </PrivateRoute>
                  }
                />
                
                <Route
                  path="/projects/new"
                  element={
                    <PrivateRoute requiredRoles={["admin", "supervisor"]}>
                      <NewProject />
                    </PrivateRoute>
                  }
                />
                
                <Route
                  path="/projects/:projectId"
                  element={
                    <PrivateRoute>
                      <ProjectDetail />
                    </PrivateRoute>
                  }
                />
                
                {/* Supervisor Routes */}
                <Route
                  path="/financial-requests"
                  element={
                    <PrivateRoute requiredRoles={["admin", "supervisor", "finance"]}>
                      <FinancialRequestComponent />
                    </PrivateRoute>
                  }
                />
                
                {/* Finance Routes */}
                <Route
                  path="/invoices"
                  element={
                    <PrivateRoute requiredRoles={["admin", "finance", "vendor"]}>
                      <InvoiceComponent />
                    </PrivateRoute>
                  }
                />
                
                <Route
                  path="/payments"
                  element={
                    <PrivateRoute requiredRoles={["admin", "finance"]}>
                      <PaymentComponent />
                    </PrivateRoute>
                  }
                />
                
                {/* Vendor Routes */}
                <Route
                  path="/vendors"
                  element={
                    <PrivateRoute requiredRoles={["admin", "supervisor", "finance", "vendor"]}>
                      <VendorDirectory />
                    </PrivateRoute>
                  }
                />
                
                <Route
                  path="/billing"
                  element={
                    <PrivateRoute requiredRoles={["admin", "finance", "vendor"]}>
                      <BillingComponent />
                    </PrivateRoute>
                  }
                />
                
                {/* AI Insights Route */}
                <Route
                  path="/ai-insights"
                  element={
                    <PrivateRoute requiredRoles={["admin", "supervisor", "finance"]}>
                      <AIInsights />
                    </PrivateRoute>
                  }
                />
                
                {/* Settings Route - placeholder for future implementation */}
                <Route
                  path="/settings"
                  element={
                    <PrivateRoute>
                      <div className="p-6">
                        <h1 className="text-3xl font-bold">Settings</h1>
                        <p className="mt-4">This page is under development.</p>
                      </div>
                    </PrivateRoute>
                  }
                />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </ProjectProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

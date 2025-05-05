import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { Navigation } from "@/components/layout/Navigation";
import { PrivateRoute } from "@/components/auth/PrivateRoute";
import { Login, Register, ForgotPassword } from "@/modules/auth";
import { Unauthorized } from "@/modules/common";
import { Profile } from "@/modules/user";
import { UserManagement } from "@/modules/admin";
import { ProjectList, ProjectDetail, NewProject } from "@/modules/projects";
import { BillingComponent, VendorDirectory } from "@/modules/vendor";
import NotFound from "./pages/NotFound";
import "./App.css";
import TicketComponent from "./modules/supervisor/TicketComponent";
import { InvoiceComponent } from "./modules/finance";

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
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/"
                  element={
                    <PrivateRoute requiredRoles={["admin"]}>
                      <UserManagement />
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

                {/* Added Ticket Route */}
                <Route
                  path="/tickets"
                  element={
                    <PrivateRoute
                      requiredRoles={[
                        "admin",
                        "supervisor",
                        "finance",
                        "user",
                        "vendor",
                      ]}
                    >
                      <TicketComponent />
                    </PrivateRoute>
                  }
                />

                {/* Vendor Routes */}
                <Route
                  path="/vendors"
                  element={
                    <PrivateRoute
                      requiredRoles={[
                        "admin",
                        "supervisor",
                        "finance",
                        "vendor",
                      ]}
                    >
                      <VendorDirectory />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/invoices"
                  element={
                    <PrivateRoute
                      requiredRoles={["admin", "finance", "vendor"]}
                    >
                      <InvoiceComponent />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/billing"
                  element={
                    <PrivateRoute
                      requiredRoles={["admin", "finance", "vendor"]}
                    >
                      <BillingComponent />
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

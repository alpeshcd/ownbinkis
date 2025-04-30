
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, Avat arImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// Import Lucide React icons
import { 
  Home, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  ChevronRight,
  FileText,
  CreditCard,
  Building,
  Briefcase,
  Ticket,
  DollarSign,
  Database,
  BarChart,
  Lightbulb
} from "lucide-react";

export const Navigation = () => {
  const { currentUser, logout, hasRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const navItems = [
    {
      label: "Dashboard",
      path: "/",
      icon: <Home className="h-5 w-5" />,
      roles: ["admin", "supervisor", "finance", "vendor", "user"],
    },
    {
      label: "User Management",
      path: "/users",
      icon: <Users className="h-5 w-5" />,
      roles: ["admin"],
    },
    {
      label: "Reports",
      path: "/reports",
      icon: <BarChart className="h-5 w-5" />,
      roles: ["admin"],
    },
    {
      label: "Database Management",
      path: "/database",
      icon: <Database className="h-5 w-5" />,
      roles: ["admin"],
    },
    {
      label: "Projects",
      path: "/projects",
      icon: <Briefcase className="h-5 w-5" />,
      roles: ["admin", "supervisor"],
    },
    {
      label: "Tickets",
      path: "/tickets",
      icon: <Ticket className="h-5 w-5" />,
      roles: ["admin", "supervisor"],
    },
    {
      label: "Financial Requests",
      path: "/financial-requests",
      icon: <DollarSign className="h-5 w-5" />,
      roles: ["admin", "supervisor", "finance"],
    },
    {
      label: "Invoices",
      path: "/invoices",
      icon: <FileText className="h-5 w-5" />,
      roles: ["admin", "finance", "vendor"],
    },
    {
      label: "Payments",
      path: "/payments",
      icon: <CreditCard className="h-5 w-5" />,
      roles: ["admin", "finance"],
    },
    {
      label: "Vendor Directory",
      path: "/vendors",
      icon: <Building className="h-5 w-5" />,
      roles: ["admin", "supervisor", "finance", "vendor"],
    },
    {
      label: "Billing",
      path: "/billing",
      icon: <FileText className="h-5 w-5" />,
      roles: ["admin", "finance", "vendor"],
    },
    {
      label: "AI Insights",
      path: "/ai-insights",
      icon: <Lightbulb className="h-5 w-5" />,
      roles: ["admin", "supervisor", "finance"],
    },
    {
      label: "Settings",
      path: "/settings",
      icon: <Settings className="h-5 w-5" />,
      roles: ["admin", "supervisor", "finance", "vendor", "user"],
    },
  ];

  if (!currentUser) return null;

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-bnkis-primary flex items-center justify-between px-4 z-50">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="text-white hover:bg-bnkis-primary-dark mr-2"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-lg md:text-xl font-bold text-white">BNKIS</h1>
        </div>
        
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="hover:bg-bnkis-primary-dark">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-bnkis-primary-light text-white">
                    {currentUser.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-white hidden md:inline">{currentUser.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside 
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 z-40",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        <nav className="flex flex-col h-full py-4">
          {navItems.map((item) => {
            // Check if user has permission for this item
            if (!hasRole(item.roles as any[])) return null;
            
            // Determine if the current path matches the nav item path
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-4 py-3 mb-1 mx-2 rounded-md transition-colors",
                  isActive 
                    ? "bg-bnkis-primary bg-opacity-10 text-bnkis-primary" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <div className={cn("flex items-center", sidebarOpen ? "w-full" : "")}>
                  <span className="flex-shrink-0">{item.icon}</span>
                  {sidebarOpen && (
                    <>
                      <span className="ml-3">{item.label}</span>
                      {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};


import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  FileText,
  CreditCard,
  Building,
  Briefcase,
  Ticket,
  DollarSign,
  Settings
} from "lucide-react";

const Dashboard = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return null;
  }

  const roleBasedModules = () => {
    const modules = [];
    
    // Admin has access to everything
    if (currentUser.role === "admin") {
      modules.push(
        { name: "User Management", icon: <Users className="h-10 w-10" />, path: "/users", color: "bg-blue-100" },
        { name: "Projects", icon: <Briefcase className="h-10 w-10" />, path: "/projects", color: "bg-purple-100" },
        { name: "Tickets", icon: <Ticket className="h-10 w-10" />, path: "/tickets", color: "bg-green-100" },
        { name: "Financial Requests", icon: <DollarSign className="h-10 w-10" />, path: "/financial-requests", color: "bg-yellow-100" },
        { name: "Invoices", icon: <FileText className="h-10 w-10" />, path: "/invoices", color: "bg-pink-100" },
        { name: "Payments", icon: <CreditCard className="h-10 w-10" />, path: "/payments", color: "bg-indigo-100" },
        { name: "Vendor Directory", icon: <Building className="h-10 w-10" />, path: "/vendors", color: "bg-orange-100" },
        { name: "Settings", icon: <Settings className="h-10 w-10" />, path: "/settings", color: "bg-gray-100" },
      );
    }
    
    // Supervisor modules
    else if (currentUser.role === "supervisor") {
      modules.push(
        { name: "Projects", icon: <Briefcase className="h-10 w-10" />, path: "/projects", color: "bg-purple-100" },
        { name: "Tickets", icon: <Ticket className="h-10 w-10" />, path: "/tickets", color: "bg-green-100" },
        { name: "Financial Requests", icon: <DollarSign className="h-10 w-10" />, path: "/financial-requests", color: "bg-yellow-100" },
        { name: "Vendor Directory", icon: <Building className="h-10 w-10" />, path: "/vendors", color: "bg-orange-100" },
        { name: "Settings", icon: <Settings className="h-10 w-10" />, path: "/settings", color: "bg-gray-100" },
      );
    }
    
    // Finance modules
    else if (currentUser.role === "finance") {
      modules.push(
        { name: "Invoices", icon: <FileText className="h-10 w-10" />, path: "/invoices", color: "bg-pink-100" },
        { name: "Payments", icon: <CreditCard className="h-10 w-10" />, path: "/payments", color: "bg-indigo-100" },
        { name: "Financial Requests", icon: <DollarSign className="h-10 w-10" />, path: "/financial-requests", color: "bg-yellow-100" },
        { name: "Vendor Directory", icon: <Building className="h-10 w-10" />, path: "/vendors", color: "bg-orange-100" },
        { name: "Settings", icon: <Settings className="h-10 w-10" />, path: "/settings", color: "bg-gray-100" },
      );
    }
    
    // Vendor modules
    else if (currentUser.role === "vendor") {
      modules.push(
        { name: "Invoices", icon: <FileText className="h-10 w-10" />, path: "/invoices", color: "bg-pink-100" },
        { name: "Vendor Directory", icon: <Building className="h-10 w-10" />, path: "/vendors", color: "bg-orange-100" },
        { name: "Settings", icon: <Settings className="h-10 w-10" />, path: "/settings", color: "bg-gray-100" },
      );
    }
    
    // Regular user modules
    else {
      modules.push(
        { name: "Settings", icon: <Settings className="h-10 w-10" />, path: "/settings", color: "bg-gray-100" },
      );
    }
    
    return modules;
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-20 sm:pt-24 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {currentUser.name}!</h1>
        <p className="text-gray-600 mt-2">
          You are logged in as <span className="font-medium">{currentUser.role}</span>
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>
            Business Network and Knowledge Information System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">BNKIS provides a comprehensive platform for managing business operations, including:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>User management with role-based access control</li>
            <li>Project and task tracking</li>
            <li>Vendor management and directory</li>
            <li>Financial operations including invoices and payments</li>
            <li>Ticket system for issue tracking</li>
          </ul>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Modules</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {roleBasedModules().map((module, index) => (
          <Link key={index} to={module.path} className="group">
            <div className="border rounded-lg p-6 transition-all group-hover:shadow-md group-hover:border-bnkis-primary h-full flex flex-col items-center justify-center text-center">
              <div className={`rounded-full p-4 mb-4 ${module.color}`}>
                {module.icon}
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {module.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

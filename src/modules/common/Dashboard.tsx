
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

// Sample data for charts and stats
const recentActivityData = [
  { month: "Jan", activity: 65 },
  { month: "Feb", activity: 59 },
  { month: "Mar", activity: 80 },
  { month: "Apr", activity: 81 },
  { month: "May", activity: 56 },
  { month: "Jun", activity: 55 },
];

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    projects: 12,
    tickets: 42,
    vendors: 8,
    payments: "$24,500",
  });

  useEffect(() => {
    // In a real application, this would fetch data from your backend
    console.log("Dashboard loaded for user:", currentUser?.name);
    
    // Simulate different data based on user role
    if (currentUser?.role === "admin") {
      setStats({
        projects: 24,
        tickets: 86,
        vendors: 15,
        payments: "$48,350",
      });
    } else if (currentUser?.role === "finance") {
      setStats({
        projects: 18,
        tickets: 42,
        vendors: 12,
        payments: "$36,720",
      });
    }
  }, [currentUser]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {currentUser?.name}! Here's an overview of your system.
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Projects"
          value={stats.projects}
          description="Total active projects in the system"
        />
        <StatCard
          title="Open Tickets"
          value={stats.tickets}
          description="Tickets requiring attention"
        />
        <StatCard
          title="Registered Vendors"
          value={stats.vendors}
          description="Vendors in the system"
        />
        <StatCard
          title="Pending Payments"
          value={stats.payments}
          description="Payments awaiting processing"
        />
      </div>
      
      {/* Activity Chart */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Activity Overview</CardTitle>
          <CardDescription>System activity over the past 6 months</CardDescription>
        </CardHeader>
        <CardContent className="px-2">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="activity" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Role-specific content */}
      {currentUser?.role === "admin" && (
        <Card>
          <CardHeader>
            <CardTitle>Administrative Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This section is only visible to administrators.</p>
            <p>Here you can access system management functions and view comprehensive analytics.</p>
          </CardContent>
        </Card>
      )}
      
      {currentUser?.role === "finance" && (
        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This section is visible to users with finance roles.</p>
            <p>Review pending payments and financial metrics here.</p>
          </CardContent>
        </Card>
      )}
      
      {currentUser?.role === "supervisor" && (
        <Card>
          <CardHeader>
            <CardTitle>Project Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This section is for supervisors to track project progress.</p>
            <p>Monitor team performance and project metrics from this dashboard.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;

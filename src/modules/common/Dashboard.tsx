
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getCollection } from "@/firebase/firestore";
import { Loader, AlertTriangle } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon, isLoading }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-8">
            <Loader className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    projects: 0,
    tickets: 0,
    vendors: 0,
    payments: "$0",
  });
  const [activityData, setActivityData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch projects count
        const projects = await getCollection('projects');
        
        // Fetch tickets count
        const tickets = await getCollection('tickets');
        
        // Fetch vendors count
        const vendors = await getCollection('vendors');
        
        // Fetch payments (bills) data
        const bills = await getCollection('bills');
        
        // Calculate total pending payment amount
        const pendingPayments = bills
          .filter((bill) => bill.status === 'pending')
          .reduce((total, bill) => total + (bill.amount || 0), 0);
        
        // Generate activity data based on tickets created over time
        // Group tickets by month for the chart
        const ticketsByMonth = tickets.reduce((acc, ticket) => {
          if (!ticket.createdAt) return acc;
          
          const month = new Date(ticket.createdAt.seconds * 1000).toLocaleString('default', { month: 'short' });
          
          if (!acc[month]) {
            acc[month] = 0;
          }
          acc[month]++;
          return acc;
        }, {});
        
        // Convert to chart data format
        const chartData = Object.entries(ticketsByMonth).map(([month, count]) => ({
          month,
          activity: count,
        }));
        
        // Sort by month (simple approach)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        chartData.sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month));
        
        setStats({
          projects: projects.length,
          tickets: tickets.length,
          vendors: vendors.length,
          payments: `$${pendingPayments.toFixed(2)}`,
        });
        
        setActivityData(chartData.length > 0 ? chartData : []);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {currentUser?.name || 'User'}! Here's an overview of your system.
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Projects"
          value={isLoading ? "-" : stats.projects}
          description="Total active projects in the system"
          isLoading={isLoading}
        />
        <StatCard
          title="Open Tickets"
          value={isLoading ? "-" : stats.tickets}
          description="Tickets requiring attention"
          isLoading={isLoading}
        />
        <StatCard
          title="Registered Vendors"
          value={isLoading ? "-" : stats.vendors}
          description="Vendors in the system"
          isLoading={isLoading}
        />
        <StatCard
          title="Pending Payments"
          value={isLoading ? "-" : stats.payments}
          description="Payments awaiting processing"
          isLoading={isLoading}
        />
      </div>
      
      {/* Activity Chart */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Activity Overview</CardTitle>
          <CardDescription>System activity over time</CardDescription>
        </CardHeader>
        <CardContent className="px-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <Loader className="h-6 w-6 animate-spin" />
            </div>
          ) : activityData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="activity" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No activity data available
            </div>
          )}
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

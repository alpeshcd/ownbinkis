
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useToast } from "@/components/ui/use-toast";

// Sample data for reports
const userRoleData = [
  { name: "Admin", value: 4 },
  { name: "Supervisor", value: 15 },
  { name: "Finance", value: 8 },
  { name: "Vendor", value: 23 },
  { name: "User", value: 42 },
];

const activityData = [
  { name: "Jan", projects: 4, tickets: 24, vendors: 2 },
  { name: "Feb", projects: 3, tickets: 19, vendors: 3 },
  { name: "Mar", projects: 5, tickets: 32, vendors: 1 },
  { name: "Apr", projects: 7, tickets: 47, vendors: 4 },
  { name: "May", projects: 2, tickets: 29, vendors: 2 },
  { name: "Jun", projects: 8, tickets: 38, vendors: 5 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const Reports = () => {
  const [reportType, setReportType] = useState<"users" | "activity" | "finance">("users");
  const { toast } = useToast();

  const handleGeneratePDF = () => {
    toast({
      title: "Report Generated",
      description: "The report PDF has been generated and is ready for download.",
    });
    // In a real app, this would generate and download a PDF report
  };

  const handleExportCSV = () => {
    toast({
      title: "Data Exported",
      description: "The data has been exported to CSV format.",
    });
    // In a real app, this would export data to CSV
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Reports</h2>
        <p className="text-muted-foreground">
          Generate and view reports about system usage and activity.
        </p>
      </div>

      <div className="flex space-x-4">
        <Button 
          variant={reportType === "users" ? "default" : "outline"} 
          onClick={() => setReportType("users")}
        >
          User Reports
        </Button>
        <Button 
          variant={reportType === "activity" ? "default" : "outline"} 
          onClick={() => setReportType("activity")}
        >
          Activity Reports
        </Button>
        <Button 
          variant={reportType === "finance" ? "default" : "outline"} 
          onClick={() => setReportType("finance")}
        >
          Financial Reports
        </Button>
      </div>

      {reportType === "users" && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>User Distribution by Role</CardTitle>
            <CardDescription>Breakdown of users by their assigned roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userRoleData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {userRoleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleExportCSV}>Export CSV</Button>
            <Button onClick={handleGeneratePDF}>Generate PDF</Button>
          </CardFooter>
        </Card>
      )}

      {reportType === "activity" && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>System Activity</CardTitle>
            <CardDescription>Projects, tickets, and vendor activities over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activityData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="projects" fill="#8884d8" name="Projects" />
                  <Bar dataKey="tickets" fill="#82ca9d" name="Tickets" />
                  <Bar dataKey="vendors" fill="#ffc658" name="Vendors" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleExportCSV}>Export CSV</Button>
            <Button onClick={handleGeneratePDF}>Generate PDF</Button>
          </CardFooter>
        </Card>
      )}

      {reportType === "finance" && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Financial Reports</CardTitle>
            <CardDescription>Financial activity and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-12">
              <p>Finance reporting module is currently in development.</p>
              <p className="text-muted-foreground mt-2">This feature will be available in the next update.</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button disabled>Generate Reports</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default Reports;

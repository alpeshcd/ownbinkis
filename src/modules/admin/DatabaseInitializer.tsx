
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SchemaTableProps {
  tableName: string;
  fields: { name: string; type: string; description: string }[];
}

const SchemaTable: React.FC<SchemaTableProps> = ({ tableName, fields }) => {
  return (
    <AccordionItem value={tableName}>
      <AccordionTrigger>{tableName}</AccordionTrigger>
      <AccordionContent>
        <div className="border rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fields.map((field, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{field.name}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{field.type}</td>
                  <td className="px-6 py-2 text-sm text-gray-500">{field.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

const databaseSchema = [
  {
    tableName: "users",
    fields: [
      { name: "id", type: "string", description: "User ID (primary key)" },
      { name: "email", type: "string", description: "User email address" },
      { name: "name", type: "string", description: "User full name" },
      { name: "role", type: "string", description: "User role (admin, supervisor, finance, vendor, user)" },
      { name: "createdAt", type: "timestamp", description: "Account creation timestamp" },
      { name: "updatedAt", type: "timestamp", description: "Last update timestamp" },
    ],
  },
  {
    tableName: "vendors",
    fields: [
      { name: "id", type: "string", description: "Vendor ID (primary key)" },
      { name: "name", type: "string", description: "Vendor company name" },
      { name: "contactInfo", type: "object", description: "Contact information (email, phone, address)" },
      { name: "serviceCategories", type: "array", description: "Services provided by vendor" },
      { name: "createdBy", type: "string", description: "Reference to user who created the vendor" },
      { name: "createdAt", type: "timestamp", description: "Creation timestamp" },
    ],
  },
  {
    tableName: "projects",
    fields: [
      { name: "id", type: "string", description: "Project ID (primary key)" },
      { name: "name", type: "string", description: "Project name" },
      { name: "description", type: "string", description: "Project description" },
      { name: "status", type: "string", description: "Project status (active, completed, on-hold, cancelled)" },
      { name: "createdBy", type: "string", description: "Reference to user who created the project" },
      { name: "assignedVendors", type: "array", description: "References to assigned vendors" },
      { name: "startDate", type: "timestamp", description: "Project start date" },
      { name: "endDate", type: "timestamp", description: "Optional project end date" },
    ],
  },
  {
    tableName: "tickets",
    fields: [
      { name: "id", type: "string", description: "Ticket ID (primary key)" },
      { name: "projectId", type: "string", description: "Reference to associated project" },
      { name: "title", type: "string", description: "Ticket title" },
      { name: "description", type: "string", description: "Ticket description" },
      { name: "status", type: "string", description: "Ticket status (open, in-progress, resolved, closed)" },
      { name: "assignedTo", type: "string", description: "Reference to assigned user" },
      { name: "createdBy", type: "string", description: "Reference to ticket creator" },
      { name: "createdAt", type: "timestamp", description: "Creation timestamp" },
      { name: "updatedAt", type: "timestamp", description: "Last update timestamp" },
    ],
  },
  {
    tableName: "bills",
    fields: [
      { name: "id", type: "string", description: "Bill ID (primary key)" },
      { name: "vendorId", type: "string", description: "Reference to vendor" },
      { name: "projectId", type: "string", description: "Reference to project" },
      { name: "amount", type: "number", description: "Bill amount" },
      { name: "status", type: "string", description: "Bill status (draft, pending, paid, overdue)" },
      { name: "dueDate", type: "timestamp", description: "Due date for payment" },
      { name: "paidDate", type: "timestamp", description: "Optional payment date" },
      { name: "createdAt", type: "timestamp", description: "Creation timestamp" },
    ],
  },
];

const DatabaseInitializer = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isTestDataGenerating, setIsTestDataGenerating] = useState(false);
  const { toast } = useToast();

  const handleDatabaseInit = async () => {
    setIsInitializing(true);
    
    try {
      // In a real app, this would initialize the Firebase database schema
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate loading
      
      toast({
        title: "Database Initialized",
        description: "Database schema has been successfully initialized.",
      });
    } catch (error) {
      toast({
        title: "Initialization Failed",
        description: "An error occurred while initializing the database.",
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleGenerateTestData = async () => {
    setIsTestDataGenerating(true);
    
    try {
      // In a real app, this would generate test data in Firebase
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate loading
      
      toast({
        title: "Test Data Generated",
        description: "Test data has been successfully added to the database.",
      });
    } catch (error) {
      toast({
        title: "Data Generation Failed",
        description: "An error occurred while generating test data.",
        variant: "destructive",
      });
    } finally {
      setIsTestDataGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Database Management</h2>
        <p className="text-muted-foreground">
          Initialize and manage the system database schema.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Database Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Database Actions</CardTitle>
            <CardDescription>
              Initialize and manage the database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Initialize Database</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create the necessary collections and initial structure in the database.
                This should be run once when setting up the system.
              </p>
              <Button 
                onClick={handleDatabaseInit} 
                disabled={isInitializing}
              >
                {isInitializing ? "Initializing..." : "Initialize Database"}
              </Button>
            </div>
            
            <div>
              <h3 className="font-medium mb-2 mt-6">Generate Test Data</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create sample data for testing and demonstration purposes.
              </p>
              <Button 
                variant="outline" 
                onClick={handleGenerateTestData}
                disabled={isTestDataGenerating}
              >
                {isTestDataGenerating ? "Generating..." : "Generate Test Data"}
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Warning: Initializing the database multiple times may result in data loss. 
              Only perform these actions when setting up a new system.
            </p>
          </CardFooter>
        </Card>
        
        {/* Schema Documentation Card */}
        <Card>
          <CardHeader>
            <CardTitle>Database Schema</CardTitle>
            <CardDescription>
              Current database structure and field definitions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {databaseSchema.map((table) => (
                <SchemaTable 
                  key={table.tableName} 
                  tableName={table.tableName} 
                  fields={table.fields} 
                />
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseInitializer;


// Database initialization utility
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "../firebase/firestore";
import * as schemas from "../firebase/schema";

// Demo users for easier testing
const demoUsers = [
  { email: "admin@example.com", password: "password", name: "Admin User", role: "admin" },
  { email: "supervisor@example.com", password: "password", name: "Supervisor User", role: "supervisor" },
  { email: "finance@example.com", password: "password", name: "Finance User", role: "finance" },
  { email: "vendor@example.com", password: "password", name: "Vendor User", role: "vendor" },
  { email: "user@example.com", password: "password", name: "Regular User", role: "user" }
];

// Initialize demo data
export const initializeDemoData = async () => {
  try {
    // Check if we already have users
    const usersSnapshot = await getDocs(collection(db, "users"));
    if (usersSnapshot.docs.length > 0) {
      console.log("Database already initialized with users");
      return;
    }
    
    console.log("Initializing database with demo data...");
    
    // Create batch
    const batch = writeBatch(db);
    
    // Create demo users
    demoUsers.forEach(user => {
      const userId = `demo_${user.role}`;
      batch.set(doc(db, "users", userId), {
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: new Date()
      });
    });
    
    // Create demo projects
    const projects = [
      {
        id: "PRJ-001",
        name: "Website Redesign",
        description: "Complete overhaul of corporate website",
        status: "active",
        startDate: new Date("2024-01-15"),
        endDate: new Date("2024-08-30"),
        assignedVendors: ["VND-001", "VND-003"],
        tickets: 4
      },
      {
        id: "PRJ-002",
        name: "SEO Campaign",
        description: "Improve search engine rankings",
        status: "active",
        startDate: new Date("2024-03-01"),
        endDate: new Date("2024-09-30"),
        assignedVendors: ["VND-002"],
        tickets: 3
      }
    ];
    
    projects.forEach(project => {
      batch.set(doc(db, "projects", project.id), project);
    });
    
    // Create demo vendors
    const vendors = [
      {
        id: "VND-001",
        name: "Tech Solutions Inc",
        contactEmail: "contact@techsolutions.com",
        contactPhone: "555-123-4567",
        services: ["Web Development", "IT Support"],
        address: "123 Tech Blvd, San Francisco, CA",
        status: "active"
      },
      {
        id: "VND-002",
        name: "Digital Marketing Co",
        contactEmail: "info@digitalmarketing.com",
        contactPhone: "555-234-5678",
        services: ["SEO", "Social Media", "Content Marketing"],
        address: "456 Marketing St, New York, NY",
        status: "active"
      }
    ];
    
    vendors.forEach(vendor => {
      batch.set(doc(db, "vendors", vendor.id), vendor);
    });
    
    // Commit batch
    await batch.commit();
    console.log("Demo data initialized successfully");
  } catch (error) {
    console.error("Error initializing demo data:", error);
    throw error;
  }
};

export default initializeDemoData;

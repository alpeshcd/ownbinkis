
# Project Management System Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Authentication and Authorization](#authentication-and-authorization)
4. [Core Features](#core-features)
5. [Directory Structure](#directory-structure)
6. [Code Flow](#code-flow)
7. [Firebase Integration](#firebase-integration)
8. [User Roles and Permissions](#user-roles-and-permissions)
9. [Components Reference](#components-reference)
10. [API Reference](#api-reference)
11. [Troubleshooting](#troubleshooting)

## Introduction

This project management system is designed to streamline project workflow, task management, vendor relationships, financial operations, and ticketing. It provides role-based access control to ensure users can only access features relevant to their responsibilities.

### Key Features

- Project creation, management, and tracking
- Task assignment and progress monitoring
- User management with role-based permissions
- Vendor directory and management
- Financial request handling and invoicing
- Ticketing system for issue tracking
- Dashboard with analytics and insights

## Architecture Overview

The application is built using a modern React architecture with Firebase as the backend. It follows these key architectural principles:

- **Component-Based Structure**: Modular components for reusability
- **Context API for State Management**: Global state management using React Context
- **Firebase Integration**: Authentication, Firestore for database, Storage for files
- **Role-Based Access Control**: Permission checks at UI and API levels
- **Responsive Design**: Mobile-first approach using Tailwind CSS

### Technology Stack

- **Frontend**: React 18.x, TypeScript
- **UI Components**: Tailwind CSS, Shadcn UI
- **Routing**: React Router 6.x
- **State Management**: React Context API, React Query
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Data Visualization**: Recharts
- **Form Handling**: React Hook Form, Zod validation

## Authentication and Authorization

The application uses Firebase Authentication to manage user identity. Authorization is implemented through a custom role-based system.

### Authentication Flow

1. User attempts login/registration
2. Firebase Authentication verifies credentials
3. User profile is loaded from Firestore to determine roles
4. AuthContext provides authentication state to the app
5. PrivateRoute components enforce access control

### User Roles

- **Admin**: Full access to all system features
- **Supervisor**: Manage projects, tasks, and team members
- **Finance**: Handle financial transactions, invoices, and payments
- **User**: Regular team members who can work on assigned tasks
- **Vendor**: External partners who can view specific projects and submit invoices

## Core Features

### Projects Module

- Create, edit, and delete projects
- Assign team members and resources
- Track project progress and status
- Manage project tasks and attachments
- Add comments for team collaboration

### Tasks Management

- Create and assign tasks to team members
- Set task deadlines and priorities
- Track task status and completion
- Upload task-related attachments
- Comment on tasks for collaboration

### User Management

- User registration and account management
- Role assignment and permissions control
- User profile management
- Password reset functionality

### Vendor Directory

- Maintain a database of vendors
- Track vendor certifications and documents
- Manage vendor assignments to projects
- Handle vendor invoices and payments

### Financial Operations

- Process financial requests and approvals
- Generate and manage invoices
- Track payments and financial history
- Budget allocation and reporting

### Ticketing System

- Create and assign support tickets
- Track ticket status and resolution
- Add comments and attachments to tickets
- Prioritize tickets by urgency

## Directory Structure

```
src/
├── components/         # Shared/UI components
├── contexts/           # Context providers for state management
├── firebase/           # Firebase configuration and service modules
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── modules/            # Feature modules
│   ├── admin/          # Admin-specific features
│   ├── auth/           # Authentication-related components
│   ├── common/         # Shared module features
│   ├── finance/        # Financial operations
│   ├── projects/       # Project management
│   ├── supervisor/     # Supervisor-specific features
│   ├── user/           # User profile and settings
│   └── vendor/         # Vendor management
├── pages/              # Top-level page components
├── services/           # Business logic and API services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Code Flow

### Project Creation Flow

1. User navigates to `/projects/new`
2. `NewProject` component loads and fetches available users
3. User submits project data via `ProjectForm`
4. `ProjectContext.createNewProject()` is called
5. `projectService.createProject()` sends data to Firebase
6. Firebase creates document in `projects` collection
7. User is redirected to project details page

### Project Details Flow

1. User navigates to `/projects/:projectId`
2. `ProjectDetail` component loads
3. `useParams()` extracts project ID from URL
4. `useProject().fetchProject(projectId)` fetches project data
5. Project data is rendered with tabs for tasks, comments, etc.
6. User can interact with project data (edit, delete, add tasks)

### Authentication Flow

1. User visits login page
2. User enters credentials
3. `useAuth().login()` calls Firebase authentication
4. On success, user profile is loaded from Firestore
5. User is redirected to dashboard or requested page

## Firebase Integration

The application integrates with Firebase services through custom utility functions:

### Firestore Operations

- `getDocument`: Fetch single document by ID
- `getCollection`: Query collection with filters
- `createDocument`: Create new documents
- `updateDocument`: Update existing documents
- `deleteDocument`: Remove documents

### Firebase Authentication

User authentication is managed through Firebase Auth with custom hooks to integrate with the application:

```typescript
// Authentication flow
const { currentUser, login, logout, register } = useAuth();

// Login example
await login(email, password);

// Register example
await register(email, password, userData);
```

### Storage

File uploads (attachments, user avatars) use Firebase Storage:

```typescript
// Example storage operation
const fileUrl = await uploadFile(file, `projects/${projectId}/attachments`);
```

## User Roles and Permissions

The application implements a comprehensive role-based access control system:

### Role Hierarchy

1. **Admin**: Full system access
2. **Supervisor**: Project and team management
3. **Finance**: Financial operations
4. **User**: Basic access to assigned tasks
5. **Vendor**: Limited access to relevant projects

### Permission Checks

Permissions are enforced at multiple levels:

1. **Route Level**: `<PrivateRoute>` components restrict page access
2. **Component Level**: Conditional rendering based on user roles
3. **API Level**: Server-side checks before performing operations

```typescript
// Example role check
const canEditProject = hasRole(["admin", "supervisor"]) || 
  project.supervisor === currentUser?.id;
```

## Components Reference

### Core Components

- **Navigation**: Main application navigation with role-based menu items
- **ProjectCard**: Card displaying project summary information
- **TaskCard**: Individual task display with status controls
- **PrivateRoute**: Route wrapper for authentication/authorization

### Form Components

- **ProjectForm**: Create/edit project information
- **TaskForm**: Create/edit task details
- **UserForm**: User profile management
- **VendorForm**: Vendor information management

### Utility Components

- **AttachmentsList**: Display and manage file attachments
- **CommentSection**: Display and manage comments
- **FileUploadButton**: Handle file uploads
- **PaginationControl**: Pagination for lists

## API Reference

### Project API

- `getProjects()`: Fetch all projects
- `getUserProjects(user)`: Fetch projects for specific user
- `getProject(projectId)`: Fetch single project by ID
- `createProject(projectData)`: Create new project
- `updateProject(projectId, projectData)`: Update project
- `deleteProject(projectId)`: Delete project

### User API

- `getUsers()`: Fetch all users
- `getUser(userId)`: Fetch user by ID
- `updateUser(userId, userData)`: Update user information
- `deleteUser(userId)`: Delete user account

### Vendor API

- `getVendors()`: Fetch all vendors
- `getVendor(vendorId)`: Fetch vendor by ID
- `createVendor(vendorData)`: Create new vendor
- `updateVendor(vendorId, vendorData)`: Update vendor information
- `deleteVendor(vendorId)`: Delete vendor

### Financial API

- `getInvoices()`: Fetch invoices
- `createInvoice(invoiceData)`: Create new invoice
- `updateInvoice(invoiceId, invoiceData)`: Update invoice
- `deleteInvoice(invoiceId)`: Delete invoice

## Troubleshooting

### Common Issues

1. **Authentication Issues**
   - Check if Firebase configuration is correct
   - Verify user permissions in Firestore

2. **Data Not Loading**
   - Check network requests in console
   - Verify Firestore rules allow the operation
   - Check if user has required permissions

3. **Project Creation Failures**
   - Ensure all required fields are provided
   - Check for console errors during submission

4. **File Upload Problems**
   - Verify Firebase Storage rules
   - Check file size limits
   - Ensure proper file types are used

### Debugging Tips

1. Use browser developer tools to inspect network requests
2. Check console logs for error messages
3. Verify Firebase rules in the Firebase console
4. Test API endpoints with mock data

### Support

For additional support, contact the development team or create a ticket in the system.

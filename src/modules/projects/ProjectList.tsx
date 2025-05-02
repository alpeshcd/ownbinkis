
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Settings, Filter } from "lucide-react";
import { ProjectCard } from "./components/ProjectCard";
import { useProject } from "@/contexts/ProjectContext";
import { useAuth } from "@/contexts/auth";
import { ProjectStatus } from "@/types/project";
import { Skeleton } from "@/components/ui/skeleton";
import PaginationControl from "@/components/common/Pagination";

const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const { projects, loading, fetchProjects } = useProject();
  const { currentUser, hasRole } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | ProjectStatus>("all");
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [activeTab, setActiveTab] = useState("all");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Filter projects based on search term and status
  useEffect(() => {
    let result = [...projects];
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(project => project.status === statusFilter);
    }
    
    // Filter by tab
    if (activeTab === "my-tasks") {
      result = result.filter(project => 
        project.team.includes(currentUser?.id || "") || 
        project.supervisor === currentUser?.id
      );
    }
    
    setFilteredProjects(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [projects, searchTerm, statusFilter, activeTab, currentUser]);

  const handleCreateProject = () => {
    navigate("/projects/new");
  };
  
  // Calculate pagination values
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll to top when page changes
  };
  
  const isLoading = loading && projects.length === 0;
  
  // Check if user can create projects
  const canCreateProject = hasRole(["admin", "supervisor"]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage and track all your projects</p>
        </div>
        
        {canCreateProject && (
          <Button onClick={handleCreateProject} className="mt-4 md:mt-0">
            <Plus className="mr-2 h-4 w-4" /> Create Project
          </Button>
        )}
      </div>
      
      <div className="mb-6">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-48">
          <Select 
            value={statusFilter} 
            onValueChange={setStatusFilter}
          >
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <span>Status</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="not-started">Not Started</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="border rounded-md p-4">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <Skeleton className="h-2 w-full mb-6" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">No projects found</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm || statusFilter !== "all" 
              ? "Try adjusting your search or filters"
              : "Get started by creating your first project"}
          </p>
          {canCreateProject && (
            <Button onClick={handleCreateProject}>
              <Plus className="mr-2 h-4 w-4" /> Create Project
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          
          {/* Pagination control */}
          {filteredProjects.length > ITEMS_PER_PAGE && (
            <div className="flex justify-center mt-8">
              <PaginationControl
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProjectList;

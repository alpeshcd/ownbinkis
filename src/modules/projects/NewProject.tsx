
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import { ProjectForm } from "./components/ProjectForm";
import { getCollection } from "@/firebase/firestore";
import { UserRole } from "@/contexts/auth";

const NewProject: React.FC = () => {
  const navigate = useNavigate();
  const { createNewProject, loading } = useProject();
  const [users, setUsers] = useState<Array<{ id: string; name: string; role: UserRole }>>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const usersData = await getCollection("users");
        
        const formattedUsers = usersData.map(user => ({
          id: user.id,
          name: user.name || "",
          email: user.email || "",
          role: user.role as UserRole || "user",
        }));
        
        setUsers(formattedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  const handleSubmit = async (data: any) => {
    const newProject = await createNewProject(data);
    
    if (newProject) {
      navigate(`/projects/${newProject.id}`);
    }
  };
  
  const handleCancel = () => {
    navigate("/projects");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate("/projects")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Projects
      </Button>
      
      <h1 className="text-3xl font-bold mb-6">Create New Project</h1>
      
      {loadingUsers ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading users...</span>
        </div>
      ) : (
        <ProjectForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
          availableUsers={users.map(user => ({ id: user.id, name: user.name }))}
        />
      )}
    </div>
  );
};

export default NewProject;

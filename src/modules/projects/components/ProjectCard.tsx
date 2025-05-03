
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, CheckCircle } from "lucide-react";
import { Project, ProjectStatus } from "@/types/project";
import { format } from "date-fns";

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  // Calculate project progress
  const calculateProgress = () => {
    if (!project.tasks.length) return 0;
    
    const completedTasks = project.tasks.filter(task => task.status === "completed").length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };
  
  const progress = calculateProgress();
  
  // Handle status color
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case "not-started":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{project.name}</CardTitle>
          <Badge variant="outline" className={getStatusColor(project.status)}>
            {project.status.replace("-", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{project.description}</p>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>
                {progress}%
              </span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              <span>
                {format(project.startDate, "MMM d, yyyy")}
              </span>
            </div>
            
            <div className="flex -space-x-2">
              {project.team.slice(0, 3).map((userId, index) => (
                <Avatar key={userId} className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-xs">
                    {index + 1}
                  </AvatarFallback>
                </Avatar>
              ))}
              {project.team.length > 3 && (
                <Avatar className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-xs bg-muted">
                    +{project.team.length - 3}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex justify-between items-center w-full text-xs text-muted-foreground">
          <div className="flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            <span>
              {project.tasks.filter(task => task.status === "completed").length} / {project.tasks.length} tasks
            </span>
          </div>
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>
              {format(project.createdAt, "MMM d")}
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

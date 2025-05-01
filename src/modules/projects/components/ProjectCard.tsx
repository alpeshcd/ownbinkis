
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Users, CheckCircle } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Project, ProjectStatus } from "@/types/project";

interface ProjectCardProps {
  project: Project;
}

// Helper function to get status color
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

// Helper function to calculate project progress
const calculateProgress = (project: Project) => {
  if (!project.tasks.length) return 0;
  
  const completedTasks = project.tasks.filter(task => task.status === "completed").length;
  return Math.round((completedTasks / project.tasks.length) * 100);
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const progress = calculateProgress(project);
  const statusClass = getStatusColor(project.status);
  const taskCount = project.tasks.length;
  const teamCount = project.team.length;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            <Link to={`/projects/${project.id}`} className="hover:underline">
              {project.name}
            </Link>
          </CardTitle>
          <Badge variant="outline" className={statusClass}>
            {project.status.replace("-", " ")}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {project.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                {format(project.startDate, "MMM d, yyyy")} 
                {project.endDate && ` - ${format(project.endDate, "MMM d, yyyy")}`}
              </span>
            </div>
            
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>{taskCount} Task{taskCount !== 1 ? "s" : ""}</span>
            </div>
            
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{teamCount} Member{teamCount !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-1 text-xs text-muted-foreground">
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          <span>Updated {formatDistanceToNow(project.updatedAt, { addSuffix: true })}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

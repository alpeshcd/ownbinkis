
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar, MessageSquare, Paperclip, ChevronUp, ChevronDown, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ProjectTask, ProjectStatus } from "@/types/project";
import { useAuth } from "@/contexts/auth";

interface TaskCardProps {
  task: ProjectTask;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: ProjectStatus) => void;
  userNames: Record<string, string>;
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

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  onStatusChange,
  userNames
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, hasRole } = useAuth();
  
  const statusClass = getStatusColor(task.status);
  const commentCount = task.comments.length;
  const attachmentCount = task.attachments.length;
  
  // Check if current user can edit this task
  const canEdit = hasRole(["admin", "supervisor"]) || 
    task.assignedTo.includes(currentUser?.id || '');
  
  return (
    <Card className="mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className={statusClass}>
                  {task.status.replace("-", " ")}
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Due: {format(task.dueDate, "MMM d, yyyy")}</span>
                </div>
                {commentCount > 0 && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>{commentCount}</span>
                  </div>
                )}
                {attachmentCount > 0 && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Paperclip className="h-4 w-4 mr-1" />
                    <span>{attachmentCount}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description:</p>
                <p>{task.description}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Assigned to:</p>
                <div className="flex flex-wrap gap-2">
                  {task.assignedTo.map(userId => (
                    <div key={userId} className="flex items-center gap-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>
                          {userNames[userId]?.substring(0, 2) || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{userNames[userId] || "Unknown User"}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {canEdit && (
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-2">Change Status:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant={task.status === "not-started" ? "default" : "outline"}
                      onClick={() => onStatusChange("not-started")}
                    >
                      Not Started
                    </Button>
                    <Button 
                      size="sm" 
                      variant={task.status === "in-progress" ? "default" : "outline"}
                      onClick={() => onStatusChange("in-progress")}
                    >
                      In Progress
                    </Button>
                    <Button 
                      size="sm" 
                      variant={task.status === "completed" ? "default" : "outline"}
                      onClick={() => onStatusChange("completed")}
                    >
                      Completed
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Comments section would go here */}
              {/* Attachments section would go here */}
            </div>
          </CardContent>
          
          {canEdit && (
            <CardFooter className="flex justify-end space-x-2">
              <Button size="sm" variant="outline" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </CardFooter>
          )}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

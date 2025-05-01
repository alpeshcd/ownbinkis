
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Paperclip, File, Download, Trash2, FileText, FileImage, FileCode, FileArchive } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ProjectAttachment } from "@/types/project";
import { useAuth } from "@/contexts/auth";
import { FileUploadButton } from "./FileUploadButton";

interface AttachmentsListProps {
  attachments: ProjectAttachment[];
  onUpload: (file: File) => Promise<void>;
  onDelete: (attachmentId: string) => Promise<void>;
  loading?: boolean;
}

// Helper function to get file icon based on file type
const getFileIcon = (fileType: string) => {
  if (fileType.startsWith("image/")) {
    return <FileImage className="h-5 w-5" />;
  } else if (fileType.startsWith("text/") || fileType.includes("document")) {
    return <FileText className="h-5 w-5" />;
  } else if (fileType.includes("zip") || fileType.includes("compressed")) {
    return <FileArchive className="h-5 w-5" />;
  } else if (fileType.includes("code") || fileType.includes("javascript") || fileType.includes("html")) {
    return <FileCode className="h-5 w-5" />;
  }
  return <File className="h-5 w-5" />;
};

export const AttachmentsList: React.FC<AttachmentsListProps> = ({
  attachments,
  onUpload,
  onDelete,
  loading = false,
}) => {
  const { currentUser, hasRole } = useAuth();
  
  const canDeleteFile = (attachment: ProjectAttachment) => {
    return hasRole(["admin", "supervisor"]) || currentUser?.id === attachment.uploadedBy;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center">
          <Paperclip className="h-5 w-5 mr-2" />
          Attachments ({attachments.length})
        </CardTitle>
        <FileUploadButton onUpload={onUpload} loading={loading} />
      </CardHeader>
      <CardContent>
        {attachments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No files attached yet.
          </div>
        ) : (
          <ul className="divide-y">
            {attachments.map((attachment) => (
              <li key={attachment.id} className="py-3 flex justify-between items-center">
                <div className="flex items-center">
                  {getFileIcon(attachment.fileType)}
                  <div className="ml-3">
                    <p className="font-medium">{attachment.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded {formatDistanceToNow(attachment.uploadedAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    asChild
                  >
                    <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer" download>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                  {canDeleteFile(attachment) && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(attachment.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};


import { uploadFile, deleteFile, getFileURL } from "@/firebase/storage";
import { createDocument, updateDocument, deleteDocument } from "@/firebase/firestore";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";

// Define file attachment interface
export interface FileAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: Date;
  parentId: string;
  parentType: string;
}

/**
 * Upload a file to Firebase Storage and record its metadata in Firestore
 */
export const uploadFileWithMetadata = async (
  file: File,
  parentType: string,
  parentId: string,
  userId: string,
  userName: string
): Promise<FileAttachment> => {
  try {
    // Generate a unique ID for the file
    const fileId = uuidv4();
    
    // Create storage path
    const storagePath = `${parentType}/${parentId}/attachments/${fileId}-${file.name}`;
    
    // Upload file to Firebase Storage
    const fileUrl = await uploadFile(storagePath, file);
    
    // Create file metadata
    const fileData: FileAttachment = {
      id: fileId,
      fileName: file.name,
      fileUrl,
      fileType: file.type,
      fileSize: file.size,
      uploadedBy: userId,
      uploadedByName: userName,
      uploadedAt: new Date(),
      parentId,
      parentType
    };
    
    // Store file metadata in Firestore
    await createDocument("attachments", fileData, fileId);
    
    // Return the file metadata
    return fileData;
  } catch (error: any) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

/**
 * Delete a file from Firebase Storage and its metadata from Firestore
 */
export const deleteFileWithMetadata = async (
  fileId: string,
  storagePath: string
): Promise<void> => {
  try {
    // Delete file from Firebase Storage
    await deleteFile(storagePath);
    
    // Delete file metadata from Firestore
    await deleteDocument("attachments", fileId);
  } catch (error: any) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

/**
 * Custom hook for file upload operations with permissions check
 */
export const useFileUpload = () => {
  const { currentUser } = useAuth();
  
  const uploadFileToResource = async (
    file: File,
    parentType: string,
    parentId: string
  ): Promise<FileAttachment | null> => {
    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to upload files.",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      const fileAttachment = await uploadFileWithMetadata(
        file,
        parentType,
        parentId,
        currentUser.id,
        currentUser.name
      );
      
      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
      
      return fileAttachment;
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
      return null;
    }
  };
  
  const deleteFileFromResource = async (
    fileId: string,
    storagePath: string
  ): Promise<boolean> => {
    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to delete files.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      await deleteFileWithMetadata(fileId, storagePath);
      
      toast({
        title: "File Deleted",
        description: "The file has been deleted successfully.",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete file",
        variant: "destructive",
      });
      return false;
    }
  };
  
  return {
    uploadFileToResource,
    deleteFileFromResource,
  };
};

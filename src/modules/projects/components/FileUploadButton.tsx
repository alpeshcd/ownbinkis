
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Upload } from "lucide-react";

interface FileUploadButtonProps {
  onUpload: (file: File) => Promise<void>;
  loading?: boolean;
  acceptedFileTypes?: string;
  multiple?: boolean;
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  onUpload,
  loading = false,
  acceptedFileTypes = "*",
  multiple = false,
}) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      if (multiple) {
        for (let i = 0; i < files.length; i++) {
          await onUpload(files[i]);
        }
      } else {
        await onUpload(files[0]);
      }
    } finally {
      setIsUploading(false);
      // Reset file input so the same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        multiple={multiple}
        style={{ display: "none" }}
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={loading || isUploading}
      >
        {loading || isUploading ? (
          <>
            <Upload className="h-4 w-4 mr-2 animate-pulse" />
            Uploading...
          </>
        ) : (
          <>
            <Paperclip className="h-4 w-4 mr-2" />
            Attach File
          </>
        )}
      </Button>
    </>
  );
};

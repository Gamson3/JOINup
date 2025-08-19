"use client";

import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  File, 
  X, 
  AlertCircle, 
  CheckCircle, 
  FileText, 
  UploadCloud 
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDropzone } from "react-dropzone";

interface UploadsStepProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  conference: {
    submissionSettings?: {
      requireFullPaper: boolean;
      allowedFileTypes: string[];
      maxFileSize: number;
    };
  };
}

export function UploadsStep({ files, onFilesChange, conference }: UploadsStepProps) {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<string[]>([]);
  
  const settings = conference.submissionSettings || {
    requireFullPaper: false,
    allowedFileTypes: ['.pdf', '.doc', '.docx'],
    maxFileSize: 10 // MB
  };
  
  const maxSizeMB = settings.maxFileSize || 10;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const allowedTypes = settings.allowedFileTypes || ['.pdf', '.doc', '.docx'];
  
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle errors from rejected files
    const errorMessages: string[] = [];
    rejectedFiles.forEach(rejected => {
      rejected.errors.forEach((error: any) => {
        if (error.code === 'file-too-large') {
          errorMessages.push(`${rejected.file.name} is too large. Maximum size is ${maxSizeMB}MB.`);
        } else if (error.code === 'file-invalid-type') {
          errorMessages.push(`${rejected.file.name} has an invalid file type.`);
        } else {
          errorMessages.push(`${rejected.file.name}: ${error.message}`);
        }
      });
    });
    setErrors(errorMessages);
    
    // Add new files and simulate progress
    const newFiles = [...files, ...acceptedFiles];
    onFilesChange(newFiles);
    
    // Simulate upload progress for demonstration
    acceptedFiles.forEach(file => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: progress
        }));
      }, 200);
    });
  }, [files, maxSizeMB, onFilesChange]);
  
  const removeFile = (fileToRemove: File) => {
    const updatedFiles = files.filter(file => file !== fileToRemove);
    onFilesChange(updatedFiles);
    
    // Also remove from progress tracking
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileToRemove.name];
      return newProgress;
    });
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: maxSizeBytes
  });
  
  // Format file size to human readable format
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Upload Files</h3>
        <p className="text-sm text-gray-500">
          {settings.requireFullPaper 
            ? "Please upload your full paper and any supporting materials."
            : "Upload your presentation files or supporting materials."}
        </p>
      </div>
      
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Upload failed</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 mt-2">
              {errors.map((error, idx) => (
                <li key={idx} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center">
          <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm font-medium">
            {isDragActive ? "Drop files here" : "Drag & drop files here, or click to select files"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Allowed file types: {allowedTypes.join(', ')} (Max: {maxSizeMB}MB)
          </p>
        </div>
      </div>
      
      {files.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {files.map((file, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {uploadProgress[file.name] !== undefined && uploadProgress[file.name] < 100 ? (
                      <div className="w-20">
                        <Progress value={uploadProgress[file.name]} className="h-2" />
                      </div>
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file);
                      }}
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {settings.requireFullPaper && files.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Full paper required</AlertTitle>
          <AlertDescription>
            This conference requires a full paper submission.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, AlertCircle, FileText, Users, Clock, Tag } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SubmissionReviewStepProps {
  formData: any;
  conference: any;
  files: File[];
}

export function SubmissionReviewStep({ formData, conference, files }: SubmissionReviewStepProps) {
  const selectedCategory = conference.categories.find(
    (cat: any) => cat.id === parseInt(formData.categoryId)
  );
  
  const selectedPresentationType = conference.presentationTypes.find(
    (type: any) => type.id === parseInt(formData.presentationTypeId)
  );

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Please review your submission</AlertTitle>
        <AlertDescription>
          Check all details before submitting. You can make changes to your submission until the conference deadline.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Title</h4>
            <p>{formData.title}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Abstract</h4>
            <p className="text-sm whitespace-pre-wrap">{formData.abstract}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Keywords</h4>
            <div className="flex flex-wrap gap-2 mt-1">
              {formData.keywords.map((keyword: string, idx: number) => (
                <Badge key={idx} variant="outline">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
          
          {selectedCategory && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Category</h4>
              <p>{selectedCategory.name}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Authors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formData.authors.map((author: any, idx: number) => (
              <div key={idx} className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3 text-sm">
                  {idx + 1}
                </div>
                <div>
                  <div className="flex items-center">
                    <h4 className="font-medium">{author.authorName}</h4>
                    {author.isPresenter && (
                      <Badge className="ml-2" variant="secondary">Presenter</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{author.authorEmail}</p>
                  {author.affiliation && (
                    <p className="text-sm text-gray-500">{author.affiliation}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {files.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{file.name}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Presentation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedPresentationType && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Format</h4>
                <p>{selectedPresentationType.name}</p>
              </div>
            )}
            
            {formData.requestedDuration && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Requested Duration</h4>
                <p>{formData.requestedDuration} minutes</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
        <Check className="h-5 w-5 text-green-500 mr-2" />
        <p className="text-sm font-medium">
          Ready to submit to {conference.name}
        </p>
      </div>
    </div>
  );
}
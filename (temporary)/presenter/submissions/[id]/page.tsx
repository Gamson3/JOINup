"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createAuthenticatedApi } from "@/lib/utils";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Clock, 
  FileText, 
  Users, 
  Tag, 
  Download, 
  Calendar, 
  AlertTriangle 
} from "lucide-react";

interface SubmissionDetail {
  id: number;
  title: string;
  abstract: string;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
  reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';
  reviewComments?: string;
  reviewedAt?: string;
  category?: {
    id: number;
    name: string;
  };
  presentationType?: {
    id: number;
    name: string;
    defaultDuration: number;
  };
  authors: {
    id: number;
    authorName: string;
    authorEmail: string;
    affiliation?: string;
    isPresenter: boolean;
  }[];
  conference: {
    id: number;
    name: string;
    submissionDeadline?: string;
  };
  timeSlot?: {
    startTime: string;
    endTime: string;
    sectionName: string;
    room?: string;
  };
  materials?: {
    id: number;
    title: string;
    fileUrl: string;
    fileType: string;
    uploadedAt: string;
  }[];
  statusHistory?: {
    status: string;
    date: string;
    comments?: string;
  }[];
}

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.id as string;
  
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchSubmissionDetails();
  }, [submissionId]);
  
  const fetchSubmissionDetails = async () => {
    try {
      setLoading(true);
      const api = await createAuthenticatedApi();
      const response = await api.get(`/api/presenter/submissions/${submissionId}`);
      setSubmission(response.data);
    } catch (error) {
      console.error("Failed to fetch submission details:", error);
      toast.error("Could not load submission details");
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Under Review</Badge>;
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Accepted</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      case 'REVISION_REQUESTED':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Revision Requested</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="p-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }
  
  if (!submission) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Could not find submission details. It may have been deleted or you might not have permission to view it.
          </AlertDescription>
        </Alert>
        <Button 
          className="mt-4" 
          onClick={() => router.push('/presenter/dashboard')}
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="p-0"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">{submission.title}</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Submission Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Submission Overview</CardTitle>
              <CardDescription>
                Submitted to {submission.conference.name} on {formatDate(submission.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Abstract</h3>
                <p className="text-sm whitespace-pre-line">{submission.abstract}</p>
              </div>
              
              {submission.keywords.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {submission.keywords.map((kw, idx) => (
                      <Badge key={idx} variant="outline">{kw}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {submission.category && (
                  <div className="flex items-start gap-2">
                    <Tag className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Category</h3>
                      <p className="text-sm">{submission.category.name}</p>
                    </div>
                  </div>
                )}
                
                {submission.presentationType && (
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Presentation Type</h3>
                      <p className="text-sm">
                        {submission.presentationType.name} ({submission.presentationType.defaultDuration} min)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Authors */}
          <Card>
            <CardHeader>
              <CardTitle>Authors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {submission.authors.map((author, idx) => (
                  <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className="bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center text-gray-600 font-medium flex-shrink-0">
                      {author.authorName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{author.authorName}</p>
                        {author.isPresenter && (
                          <Badge variant="outline" className="bg-primary/10 text-primary">Presenter</Badge>
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
          
          {/* Uploaded Materials */}
          {submission.materials && submission.materials.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {submission.materials.map((material, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{material.title}</p>
                          <p className="text-xs text-gray-500">
                            {material.fileType.toUpperCase()} • Uploaded on {formatDate(material.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <a href={material.fileUrl} download target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Schedule Information (if accepted) */}
          {submission.reviewStatus === 'APPROVED' && submission.timeSlot && (
            <Card>
              <CardHeader>
                <CardTitle>Presentation Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-md bg-green-50 border-green-200">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-green-800">
                        {formatDate(submission.timeSlot.startTime)}
                      </h3>
                      <p className="text-sm text-green-700">
                        {new Date(submission.timeSlot.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                        {new Date(submission.timeSlot.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        <span className="font-medium">{submission.timeSlot.sectionName}</span>
                        {submission.timeSlot.room && ` • Room: ${submission.timeSlot.room}`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Status Column */}
        <div className="space-y-6">
          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center text-center p-4">
                <div className="mb-2">
                  {getStatusBadge(submission.reviewStatus)}
                </div>
                <h3 className="font-semibold mt-2">
                  {submission.reviewStatus === 'PENDING' && "Under Review"}
                  {submission.reviewStatus === 'APPROVED' && "Accepted"}
                  {submission.reviewStatus === 'REJECTED' && "Rejected"}
                  {submission.reviewStatus === 'REVISION_REQUESTED' && "Revision Requested"}
                </h3>
                {submission.reviewedAt && (
                  <p className="text-sm text-gray-500 mt-1">
                    Last updated: {formatDate(submission.reviewedAt)}
                  </p>
                )}
              </div>
              
              {submission.reviewComments && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="text-sm font-medium mb-2">Reviewer Comments:</h3>
                  <div className="bg-gray-50 p-3 rounded-md text-sm whitespace-pre-line">
                    {submission.reviewComments}
                  </div>
                </div>
              )}
              
              {submission.reviewStatus === 'REVISION_REQUESTED' && (
                <Button 
                  className="w-full mt-4"
                  onClick={() => router.push(`/presenter/submissions/${submission.id}/revise`)}
                >
                  Submit Revision
                </Button>
              )}
            </CardContent>
          </Card>
          
          {/* Status Timeline */}
          {submission.statusHistory && submission.statusHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Status History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative pl-6 space-y-4">
                  <div className="absolute top-0 bottom-0 left-2 w-px bg-gray-200" />
                  {submission.statusHistory.map((event, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[22px] top-0 h-4 w-4 rounded-full bg-white border-2 border-primary" />
                      <div>
                        <div className="flex items-center text-sm">
                          <span className="font-medium">
                            {event.status === 'PENDING' && "Submitted"}
                            {event.status === 'APPROVED' && "Accepted"}
                            {event.status === 'REJECTED' && "Rejected"}
                            {event.status === 'REVISION_REQUESTED' && "Revision Requested"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{formatDateTime(event.date)}</div>
                        {event.comments && (
                          <p className="text-sm mt-1 text-gray-600">{event.comments}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.print()}
              >
                Print Submission
              </Button>
              
              {submission.reviewStatus === 'APPROVED' && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push(`/presenter/submissions/${submission.id}/materials`)}
                >
                  Manage Presentation Materials
                </Button>
              )}
              
              {/* Only show this for pending submissions */}
              {submission.reviewStatus === 'PENDING' && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push(`/presenter/submissions/${submission.id}/edit`)}
                >
                  Edit Submission
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
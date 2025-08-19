"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createAuthenticatedApi } from "@/lib/utils";
import { toast } from "sonner";
import { 
  CalendarClock, Clock, Plus, RefreshCw, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// Type for submission with conference info
interface PresenterSubmission {
  id: number;
  title: string;
  abstract?: string;
  reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';
  reviewComments?: string;
  reviewedAt?: string;
  updatedAt: string;
  createdAt: string;
  conference: {
    id: number;
    name: string;
    submissionDeadline?: string;
  };
}

// Type for open CFPs
interface OpenCFP {
  id: number;
  name: string;
  submissionDeadline: string;
  daysRemaining: number;
}

export default function PresenterDashboard() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<PresenterSubmission[]>([]);
  const [openCFPs, setOpenCFPs] = useState<OpenCFP[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  
  useEffect(() => {
    fetchSubmissions();
    fetchOpenCFPs();
  }, []);
  
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const api = await createAuthenticatedApi();
      const response = await api.get('/api/presenter/submissions');
      setSubmissions(response.data);
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
      toast.error("Could not load your submissions");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchOpenCFPs = async () => {
    try {
      const api = await createAuthenticatedApi();
      const response = await api.get('/api/conferences/open-cfp');
      
      // Calculate days remaining for each CFP
      const cfpsWithDaysRemaining = response.data.map((cfp: any) => {
        const deadline = new Date(cfp.submissionDeadline);
        const today = new Date();
        const diffTime = deadline.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
          ...cfp,
          daysRemaining: diffDays > 0 ? diffDays : 0
        };
      });
      
      setOpenCFPs(cfpsWithDaysRemaining);
    } catch (error) {
      console.error("Failed to fetch open CFPs:", error);
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
  
  const filteredSubmissions = () => {
    if (activeTab === "all") return submissions;
    return submissions.filter(sub => sub.reviewStatus === activeTab);
  };
  
  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Submissions</h1>
        <div className="grid gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Submissions</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchSubmissions}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            onClick={() => router.push('/presenter/new-submission')}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            New Submission
          </Button>
        </div>
      </div>
      
      {/* Open CFPs Section */}
      {openCFPs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Open Calls for Papers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {openCFPs.map(cfp => (
              <Card key={cfp.id} className={cfp.daysRemaining < 3 ? "border-red-300" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{cfp.name}</CardTitle>
                  <CardDescription>Submission deadline</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-gray-500" />
                    <span>{formatDate(cfp.submissionDeadline)}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {cfp.daysRemaining < 3 ? (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-blue-500" />
                    )}
                    <span className={cfp.daysRemaining < 3 ? "text-red-600 font-medium" : ""}>
                      {cfp.daysRemaining} days remaining
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => router.push(`/presenter/new-submission?conference=${cfp.id}`)}
                    variant="outline" 
                    className="w-full"
                  >
                    Submit Abstract
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Submissions Tabs */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Submissions</TabsTrigger>
          <TabsTrigger value="PENDING">Under Review</TabsTrigger>
          <TabsTrigger value="APPROVED">Accepted</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
          <TabsTrigger value="REVISION_REQUESTED">Needs Revision</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Submissions List */}
      {filteredSubmissions().length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500">No submissions found</p>
          <Button 
            variant="link" 
            onClick={() => router.push('/presenter/new-submission')}
            className="mt-2"
          >
            Create your first submission
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions().map((submission) => (
            <Card key={submission.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold">{submission.title}</h3>
                      <p className="text-sm text-gray-500">{submission.conference.name}</p>
                    </div>
                    {getStatusBadge(submission.reviewStatus)}
                  </div>
                  
                  <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                    {submission.abstract || "No abstract provided"}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    <span>Submitted: {formatDate(submission.createdAt)}</span>
                    {submission.reviewedAt && (
                      <span>• Reviewed: {formatDate(submission.reviewedAt)}</span>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 flex flex-row md:flex-col justify-end items-center gap-2 md:min-w-[150px]">
                  <Button 
                    onClick={() => router.push(`/presenter/submissions/${submission.id}`)}
                    variant="default" 
                    size="sm"
                    className="w-full"
                  >
                    View Details
                  </Button>
                  
                  {submission.reviewStatus === 'REVISION_REQUESTED' && (
                    <Button 
                      onClick={() => router.push(`/presenter/submissions/${submission.id}/revise`)}
                      variant="outline" 
                      size="sm"
                      className="w-full"
                    >
                      Submit Revision
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
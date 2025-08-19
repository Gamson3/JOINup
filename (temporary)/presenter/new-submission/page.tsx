"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createAuthenticatedApi } from "@/lib/utils";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthorManagement } from "@/components/presentation/AuthorManagement";
import { BasicInfoStep } from "@/components/presenter/BasicInfoStep";
import { UploadsStep } from "@/components/presenter/UploadsStep";
import { PresentationDetailsStep } from "@/components/presenter/PresentationDetailsStep";
import { SubmissionReviewStep } from "@/components/presenter/SubmissionReviewStep";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, ArrowLeft } from "lucide-react";

// This is a simplified schema - you would expand this based on your requirements
const submissionFormSchema = z.object({
  conferenceId: z.number(),
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  abstract: z.string().min(50, "Abstract must be at least 50 characters").max(2000),
  keywords: z.array(z.string()).min(3, "At least 3 keywords are required"),
  categoryId: z.number().optional(),
  presentationTypeId: z.number(),
  requestedDuration: z.number().optional(),
  authors: z.array(
    z.object({
      authorName: z.string().min(2),
      authorEmail: z.string().email(),
      affiliation: z.string().optional(),
      isPresenter: z.boolean().optional(),
      order: z.number(),
    })
  ).min(1, "At least one author is required"),
  files: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      size: z.number(),
      url: z.string().optional(),
    })
  ).optional(),
});

type SubmissionFormValues = z.infer<typeof submissionFormSchema>;

interface Conference {
  id: number;
  name: string;
  description?: string;
  categories: {
    id: number;
    name: string;
  }[];
  presentationTypes: {
    id: number;
    name: string;
    defaultDuration: number;
    minDuration?: number;
    maxDuration?: number;
  }[];
  submissionSettings?: {
    submissionDeadline: string;
    requireAbstract: boolean;
    maxAbstractLength: number;
    requireKeywords: boolean;
    minKeywords: number;
    maxKeywords: number;
    requireFullPaper: boolean;
    allowedFileTypes: string[];
    maxFileSize: number;
    requireAuthorBio: boolean;
    requireAffiliation: boolean;
    maxCoAuthors: number;
    submissionGuidelines?: string;
  };
}

export default function NewSubmissionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedConferenceId = searchParams.get('conference');
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [selectedConference, setSelectedConference] = useState<Conference | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  const steps = ["Basic Information", "Authors", "Uploads", "Presentation Details", "Review & Submit"];
  
  const form = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionFormSchema),
    defaultValues: {
      title: "",
      abstract: "",
      keywords: [],
      authors: [{
        authorName: "",
        authorEmail: "",
        isPresenter: true,
        order: 0
      }],
      files: [],
    }
  });
  
  useEffect(() => {
    fetchConferences();
  }, []);
  
  useEffect(() => {
    if (preselectedConferenceId && conferences.length > 0) {
      const conference = conferences.find(c => c.id === Number(preselectedConferenceId));
      if (conference) {
        handleConferenceSelect(conference);
      }
    }
  }, [preselectedConferenceId, conferences]);
  
  const fetchConferences = async () => {
    try {
      setLoading(true);
      const api = await createAuthenticatedApi();
      const response = await api.get('/api/conferences/open-cfp');
      setConferences(response.data);
    } catch (error) {
      console.error("Failed to fetch conferences:", error);
      toast.error("Could not load available conferences");
    } finally {
      setLoading(false);
    }
  };
  
  const handleConferenceSelect = (conference: Conference) => {
    setSelectedConference(conference);
    form.setValue('conferenceId', conference.id);
    
    // Set default presentation type if only one is available
    if (conference.presentationTypes && conference.presentationTypes.length === 1) {
      form.setValue('presentationTypeId', conference.presentationTypes[0].id);
    }
  };
  
  const handleNext = () => {
    // Validate current step before proceeding
    if (activeStep === 0) {
      form.trigger(['title', 'abstract', 'keywords', 'categoryId']);
      if (form.formState.errors.title || form.formState.errors.abstract || 
          form.formState.errors.keywords || form.formState.errors.categoryId) {
        return;
      }
    } else if (activeStep === 1) {
      form.trigger(['authors']);
      if (form.formState.errors.authors) {
        return;
      }
    } else if (activeStep === 3) {
      form.trigger(['presentationTypeId', 'requestedDuration']);
      if (form.formState.errors.presentationTypeId || form.formState.errors.requestedDuration) {
        return;
      }
    }
    
    setActiveStep(prev => prev + 1);
  };
  
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };
  
  const onSubmit = async (data: SubmissionFormValues) => {
    try {
      const api = await createAuthenticatedApi();
      
      // First, upload files if any
      let fileRefs = [];
      if (uploadedFiles.length > 0) {
        const formData = new FormData();
        uploadedFiles.forEach(file => {
          formData.append('files', file);
        });
        
        const uploadResponse = await api.post('/api/presenter/upload-files', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        fileRefs = uploadResponse.data.fileUrls;
      }
      
      // Then submit the presentation with file references
      const submissionData = {
        ...data,
        fileUrls: fileRefs
      };
      
      const response = await api.post('/api/presenter/submissions', submissionData);
      
      toast.success("Submission created successfully!");
      router.push(`/presenter/submissions/${response.data.id}`);
    } catch (error) {
      console.error("Failed to submit:", error);
      toast.error("Failed to create submission");
    }
  };
  
  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">New Submission</h1>
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }
  
  // If no conference is selected yet, show the conference selection screen
  if (!selectedConference) {
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
          <h1 className="text-2xl font-bold">New Submission</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Select a Conference</CardTitle>
            <CardDescription>
              Choose the conference you want to submit to
            </CardDescription>
          </CardHeader>
          <CardContent>
            {conferences.length === 0 ? (
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>No open calls for papers</AlertTitle>
                <AlertDescription>
                  There are currently no conferences accepting submissions.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-4">
                {conferences.map(conference => (
                  <Card 
                    key={conference.id} 
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleConferenceSelect(conference)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{conference.name}</CardTitle>
                      <CardDescription>
                        Deadline: {new Date(conference.submissionSettings?.submissionDeadline || "").toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {conference.description || "No description provided"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="ghost"
          onClick={() => activeStep === 0 ? setSelectedConference(null) : handleBack()}
          className="p-0"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {activeStep === 0 ? "Back to Conferences" : "Back"}
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Submission</h1>
          <p className="text-gray-500">{selectedConference.name}</p>
        </div>
      </div>
      
      {/* Step Indicator */}
      <div className="mb-6">
        <div className="flex justify-between">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center relative">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  idx < activeStep 
                    ? "bg-primary text-white" 
                    : idx === activeStep 
                      ? "bg-primary/20 text-primary border-2 border-primary" 
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {idx < activeStep ? "✓" : idx + 1}
              </div>
              <span className={`text-xs mt-1 text-center ${
                idx <= activeStep ? "text-primary" : "text-gray-400"
              }`}>
                {step}
              </span>
              {idx < steps.length - 1 && (
                <div className={`absolute top-4 left-8 w-[calc(100%-32px)] h-0.5 ${
                  idx < activeStep ? "bg-primary" : "bg-gray-200"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>{steps[activeStep]}</CardTitle>
              <CardDescription>
                {activeStep === 0 && "Enter the basic information about your submission"}
                {activeStep === 1 && "Add authors and affiliations"}
                {activeStep === 2 && "Upload your paper and supporting materials"}
                {activeStep === 3 && "Specify presentation details and preferences"}
                {activeStep === 4 && "Review your submission before finalizing"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Step 1 - Basic Info */}
              {activeStep === 0 && (
                <BasicInfoStep 
                  form={form} 
                  conference={selectedConference} 
                />
              )}
              
              {/* Step 2 - Authors */}
              {activeStep === 1 && (
                <AuthorManagement 
                  authors={form.watch('authors')} 
                  onChange={(authors) => form.setValue('authors', authors)}
                  errors={form.formState.errors.authors}
                  requireAffiliation={selectedConference.submissionSettings?.requireAffiliation || false}
                  maxCoAuthors={selectedConference.submissionSettings?.maxCoAuthors || 10}
                />
              )}
              
              {/* Step 3 - Uploads */}
              {activeStep === 2 && (
                <UploadsStep 
                  files={uploadedFiles}
                  onFilesChange={setUploadedFiles}
                  conference={selectedConference}
                />
              )}
              
              {/* Step 4 - Presentation Details */}
              {activeStep === 3 && (
                <PresentationDetailsStep 
                  form={form}
                  conference={selectedConference}
                />
              )}
              
              {/* Step 5 - Review */}
              {activeStep === 4 && (
                <SubmissionReviewStep 
                  formData={form.getValues()}
                  conference={selectedConference}
                  files={uploadedFiles}
                />
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={activeStep === 0 ? () => setSelectedConference(null) : handleBack}
              >
                {activeStep === 0 ? "Back to Conferences" : "Previous"}
              </Button>
              
              {activeStep < steps.length - 1 ? (
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button type="submit">
                  Submit
                </Button>
              )}
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
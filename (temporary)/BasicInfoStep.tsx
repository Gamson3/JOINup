import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface BasicInfoStepProps {
  form: UseFormReturn<any>;
  conference: {
    id: number;
    categories: {
      id: number;
      name: string;
    }[];
    submissionSettings?: {
      maxAbstractLength: number;
      minKeywords: number;
      maxKeywords: number;
    };
  };
}

export function BasicInfoStep({ form, conference }: BasicInfoStepProps) {
  const [keyword, setKeyword] = useState("");
  
  const maxAbstractLength = conference.submissionSettings?.maxAbstractLength || 500;
  const minKeywords = conference.submissionSettings?.minKeywords || 3;
  const maxKeywords = conference.submissionSettings?.maxKeywords || 10;
  
  const handleAddKeyword = () => {
    if (!keyword.trim()) return;
    
    const currentKeywords = form.getValues("keywords") || [];
    if (currentKeywords.length >= maxKeywords) return;
    
    if (!currentKeywords.includes(keyword.trim())) {
      form.setValue("keywords", [...currentKeywords, keyword.trim()]);
      form.trigger("keywords");
    }
    
    setKeyword("");
  };
  
  const handleRemoveKeyword = (keywordToRemove: string) => {
    const currentKeywords = form.getValues("keywords") || [];
    form.setValue(
      "keywords", 
      currentKeywords.filter(k => k !== keywordToRemove)
    );
    form.trigger("keywords");
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };
  
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title *</FormLabel>
            <FormControl>
              <Input placeholder="Enter the title of your presentation" {...field} />
            </FormControl>
            <FormDescription>
              Provide a clear, descriptive title for your submission
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="abstract"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Abstract *</FormLabel>
            <FormControl>
              <div className="relative">
                <Textarea 
                  placeholder="Enter your abstract" 
                  className="min-h-[200px]"
                  maxLength={maxAbstractLength}
                  {...field} 
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {field.value?.length || 0}/{maxAbstractLength}
                </div>
              </div>
            </FormControl>
            <FormDescription>
              Summarize your research, methodology, and findings
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="keywords"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Keywords *</FormLabel>
            <FormControl>
              <div>
                <div className="flex mb-2">
                  <Input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter a keyword and press Enter"
                    className="rounded-r-none"
                    disabled={(field.value?.length || 0) >= maxKeywords}
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyword}
                    className="px-4 py-2 bg-primary text-white rounded-r-md disabled:opacity-50"
                    disabled={(field.value?.length || 0) >= maxKeywords}
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {field.value?.map((kw: string) => (
                    <Badge key={kw} variant="secondary" className="flex items-center gap-1">
                      {kw}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(kw)}
                        className="h-4 w-4 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </FormControl>
            <FormDescription>
              Add {minKeywords}-{maxKeywords} keywords that describe your submission
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {conference.categories.length > 0 && (
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {conference.categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the category that best fits your submission
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
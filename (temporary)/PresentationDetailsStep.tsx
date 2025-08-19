"use client";

import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
// import { Slider } from "@/components/ui/slider";
import { Clock, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PresentationDetailsStepProps {
  form: any;
  conference: {
    id: number;
    name: string;
    presentationTypes: {
      id: number;
      name: string;
      defaultDuration: number;
      minDuration?: number;
      maxDuration?: number;
    }[];
  };
}

export function PresentationDetailsStep({ form, conference }: PresentationDetailsStepProps) {
  const selectedTypeId = form.watch('presentationTypeId');
  const selectedType = conference.presentationTypes.find(
    type => type.id === parseInt(selectedTypeId)
  );
  
  // Set default duration when type changes
  React.useEffect(() => {
    if (selectedType) {
      form.setValue('requestedDuration', selectedType.defaultDuration);
    }
  }, [selectedTypeId, selectedType, form]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Presentation Preferences</h3>
        <p className="text-sm text-gray-500">
          Specify how you would like to present your work.
        </p>
      </div>
      
      <FormField
        control={form.control}
        name="presentationTypeId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Presentation Format*</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value?.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select presentation format" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {conference.presentationTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              The type of presentation you would like to deliver.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {selectedType && (
        <FormField
          control={form.control}
          name="requestedDuration"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>Requested Duration (minutes)*</FormLabel>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This is your preferred presentation length. The final duration may be adjusted by organizers.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Slider
                    min={selectedType.minDuration || 5}
                    max={selectedType.maxDuration || 60}
                    step={5}
                    value={[field.value || selectedType.defaultDuration]}
                    onValueChange={(values) => field.onChange(values[0])}
                  />
                </div>
                <div className="w-16">
                  <div className="flex items-center">
                    <Input
                      type="number"
                      min={selectedType.minDuration || 5}
                      max={selectedType.maxDuration || 60}
                      step={5}
                      value={field.value || selectedType.defaultDuration}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      className="w-16"
                    />
                    <Clock className="ml-2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
              <FormDescription>
                Default: {selectedType.defaultDuration} minutes. Range: {selectedType.minDuration || 5}-{selectedType.maxDuration || 60} minutes.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
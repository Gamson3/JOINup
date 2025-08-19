'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/auth';
import { z } from 'zod';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  Users, 
  ArrowRight, 
  Loader2, 
  Sparkles,
  ArrowLeft,
  User
} from 'lucide-react';

// Reuse city options from your existing patterns
const cityOptions = [
  'New York', 'London', 'Berlin', 'Tokyo', 'Nairobi', 'Lagos',
  'San Francisco', 'Toronto', 'Sydney', 'Mumbai', 'São Paulo',
  'Amsterdam', 'Singapore', 'Dubai', 'Cape Town', 'Mexico City'
];

// Validation schema that matches backend expectations
const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  bio: z.string().optional(),
  title: z.string().optional(),
  city: z.string().optional(),
  organizationName: z.string().optional(),
  organizationWebsite: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  fieldOfInterest: z.string().optional(),
  role: z.enum(['ORGANIZER', 'ATTENDEE']),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<'ORGANIZER' | 'ATTENDEE' | ''>('');
  const [localLoading, setLocalLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [form, setForm] = useState<ProfileFormData>({
    fullName: '',
    title: '',
    bio: '',
    organizationName: '',
    organizationWebsite: '',
    city: '',
    fieldOfInterest: '',
    role: 'ATTENDEE',
  });

  // Redirect if user already has a role selected
  useEffect(() => {
    if (user && user.role !== 'PENDING') {
      router.push(user.role === 'ORGANIZER' ? '/organizer' : '/attendee');
      return;
    }

    // Pre-fill user's name
    if (user?.name) {
      setForm(prev => ({ 
        ...prev, 
        fullName: user.name 
      }));
    }
  }, [user, router]);

  // Simple role options - focused on core functionality
  const roleOptions = [
    {
      id: 'ATTENDEE' as const,
      title: 'Event Attendee',
      description: 'Join and participate in events',
      icon: Users,
      color: 'blue'
    },
    {
      id: 'ORGANIZER' as const,
      title: 'Event Organizer',
      description: 'Create and manage events',
      icon: Building,
      color: 'purple'
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleSelect = (role: 'ORGANIZER' | 'ATTENDEE') => {
    setSelectedRole(role);
    setForm(prev => ({ ...prev, role }));
    setStep(2);
  };

  const validateForm = (): boolean => {
    const result = profileSchema.safeParse(form);
    
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((error) => {
        if (error.path[0]) {
          newErrors[error.path[0] as string] = error.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
    
    // Business logic validation
    if (selectedRole === 'ORGANIZER') {
      if (!form.title?.trim()) {
        setErrors(prev => ({ ...prev, title: 'Professional title is required for organizers' }));
        return false;
      }
      if (!form.organizationName?.trim()) {
        setErrors(prev => ({ ...prev, organizationName: 'Organization name is required for organizers' }));
        return false;
      }
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLocalLoading(true);
      
      // Use the new complete profile endpoint that saves all data
      const result = await apiClient.completeProfile(form);
      
      // Update user context with new data
      if (result.user) {
        // Trigger a refresh of user context if needed
        window.location.reload(); // Simple refresh, or implement proper context update
      }
      
      // Redirect to appropriate dashboard
      if (selectedRole === 'ORGANIZER') {
        router.push('/organizer');
      } else {
        router.push('/attendee');
      }
    } catch (error: any) {
      console.error('Onboarding error:', error);
      setErrors({ general: error.message || 'Something went wrong. Please try again.' });
    } finally {
      setLocalLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto px-4 py-12">
        
        {/* Progress indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className={clsx(
                  "h-8 w-8 rounded-full flex items-center justify-center",
                  step >= 1 ? "bg-blue-500" : "bg-gray-300"
                )}>
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className={clsx(
                  "ml-2 text-sm font-medium",
                  step >= 1 ? "text-blue-600" : "text-gray-400"
                )}>
                  Choose Role
                </span>
              </div>
              <div className={clsx(
                "h-0.5 w-16",
                step === 2 ? "bg-blue-500" : "bg-gray-300"
              )}></div>
              <div className="flex items-center">
                <div className={clsx(
                  "h-8 w-8 rounded-full flex items-center justify-center",
                  step === 2 ? "bg-blue-500" : "bg-gray-300"
                )}>
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className={clsx(
                  "ml-2 text-sm font-medium",
                  step === 2 ? "text-blue-600" : "text-gray-400"
                )}>
                  Complete Profile
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to <span className="text-blue-600">JOINup</span>, {user.name?.split(' ')[0]}!
              </h1>
              <p className="text-lg text-gray-600">
                How do you plan to use our platform?
              </p>
            </div>

            <div className="grid gap-4 max-w-md mx-auto">
              {roleOptions.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`
                      p-6 border-2 border-gray-200 rounded-xl cursor-pointer transition-all duration-200 
                      hover:border-${role.color}-500 hover:bg-${role.color}-50 group
                    `}
                  >
                    <div className="flex items-center">
                      <div className={`
                        h-12 w-12 rounded-lg flex items-center justify-center bg-${role.color}-100 
                        group-hover:bg-${role.color}-500 transition-colors
                      `}>
                        <Icon className={`h-6 w-6 text-${role.color}-600 group-hover:text-white`} />
                      </div>
                      <div className="ml-4 text-left">
                        <h3 className="text-lg font-semibold text-gray-900">{role.title}</h3>
                        <p className="text-gray-600">{role.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Profile Form */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Complete Your Profile
              </h2>
              <p className="text-gray-600">
                This information helps us personalize your experience
              </p>
            </div>

            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Your full name"
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>

              {/* Role-specific fields */}
              {selectedRole === 'ORGANIZER' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Professional Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g., Event Manager, Conference Director"
                      className={clsx(
                        "w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none",
                        errors.title ? "border-red-300" : "border-gray-300"
                      )}
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="organizationName"
                      value={form.organizationName}
                      onChange={handleChange}
                      placeholder="Your organization or company name"
                      className={clsx(
                        "w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none",
                        errors.organizationName ? "border-red-300" : "border-gray-300"
                      )}
                    />
                    {errors.organizationName && <p className="text-red-500 text-sm mt-1">{errors.organizationName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Website
                    </label>
                    <input
                      type="url"
                      name="organizationWebsite"
                      value={form.organizationWebsite}
                      onChange={handleChange}
                      placeholder="https://yourorganization.com"
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    {errors.organizationWebsite && <p className="text-red-500 text-sm mt-1">{errors.organizationWebsite}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary City
                    </label>
                    <select
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select your city</option>
                      {cityOptions.map(city => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {selectedRole === 'ATTENDEE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field of Interest
                  </label>
                  <input
                    type="text"
                    name="fieldOfInterest"
                    value={form.fieldOfInterest}
                    onChange={handleChange}
                    placeholder="e.g., Technology, Healthcare, Education"
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              )}

              {/* Bio - for both roles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brief Bio
                </label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Tell us a bit about yourself..."
                  rows={3}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>

                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={localLoading || loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
                >
                  {localLoading || loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
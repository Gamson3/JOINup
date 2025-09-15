'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAppSelector } from '@/state/redux';
import { selectAuthError } from '@/state/authSlice';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Loader2, User, Mail, Lock, Building, CheckCircle } from 'lucide-react';
import { validateEmail, validatePassword, validateName, validatePasswordMatch } from '@/utils/validation';

export default function RegisterPage() {
  const { registerAttendee, loading, clearAuthError } = useAuth();
  const globalError = useAppSelector(selectAuthError);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string[]}>({});
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  useEffect(() => {
    return () => {
      clearAuthError();
    };
  }, [clearAuthError]);

  useEffect(() => {
    if (formData.confirmPassword) {
      const matchResult = validatePasswordMatch(formData.password, formData.confirmPassword);
      setPasswordMatch(matchResult.isValid);
      if (!matchResult.isValid) {
        setFieldErrors(prev => ({ ...prev, confirmPassword: matchResult.errors }));
      } else {
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.confirmPassword;
          return newErrors;
        });
      }
    }
  }, [formData.password, formData.confirmPassword]);

  const validateField = (name: string, value: string) => {
    let validation;
    
    switch (name) {
      case 'firstName':
        validation = validateName(value, 'First name');
        break;
      case 'lastName':
        validation = validateName(value, 'Last name');
        break;
      case 'email':
        validation = validateEmail(value);
        break;
      case 'password':
        validation = validatePassword(value);
        break;
      default:
        return;
    }

    setFieldErrors(prev => ({
      ...prev,
      [name]: validation.isValid ? [] : validation.errors
    }));
  };

  const validateForm = () => {
    const firstNameValidation = validateName(formData.firstName, 'First name');
    const lastNameValidation = validateName(formData.lastName, 'Last name');
    const emailValidation = validateEmail(formData.email);
    const passwordValidation = validatePassword(formData.password);
    const passwordMatchValidation = validatePasswordMatch(formData.password, formData.confirmPassword);

    const allErrors = {
      firstName: firstNameValidation.errors,
      lastName: lastNameValidation.errors,
      email: emailValidation.errors,
      password: passwordValidation.errors,
      confirmPassword: passwordMatchValidation.errors,
    };

    setFieldErrors(allErrors);

    const hasErrors = Object.values(allErrors).some(errors => errors.length > 0);
    
    if (!isTermsAccepted) {
      setLocalError('Please accept the Terms of Service and Privacy Policy');
      return false;
    }

    if (hasErrors) {
      setLocalError('Please fix the errors above');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLocalError('');
      clearAuthError();
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
      await registerAttendee(formData.email.trim(), formData.password, fullName);
    } catch (err: any) {
      setLocalError(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear local error when user starts typing
    if (localError) setLocalError('');
    if (globalError) clearAuthError();
    
    // Validate field on change (after initial blur)
    if (fieldErrors[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const displayError = localError || globalError;
  const hasFieldErrors = Object.values(fieldErrors).some(errors => errors.length > 0);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        
        {/* Card */}
        <div className="bg-card rounded-xl shadow-3xl p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent mb-3">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Welcome to JOINup
            </h2>
            <p className="mt-1 text-muted-foreground text-sm">
              Create your account to get started
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* First Name & Last Name Fields - Side by side */}
            <div className="grid grid-cols-2 gap-3">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-foreground/80 mb-1">
                  First Name <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className={`w-full pl-10 pr-4 py-1.5 border rounded outline-none bg-background text-foreground placeholder:text-muted-foreground ${
                      fieldErrors.firstName?.length > 0 ? 'border-destructive/50' : 'border-border'
                    }`}
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {fieldErrors.firstName?.length === 0 && formData.firstName && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {fieldErrors.firstName && fieldErrors.firstName.map((error, index) => (
                  <p key={index} className="mt-1 text-xs text-destructive">{error}</p>
                ))}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-foreground/80 mb-1">
                  Last Name <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className={`w-full pl-10 pr-4 py-1.5 border rounded outline-none bg-background text-foreground placeholder:text-muted-foreground ${
                      fieldErrors.lastName?.length > 0 ? 'border-destructive/50' : 'border-border'
                    }`}
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {fieldErrors.lastName?.length === 0 && formData.lastName && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {fieldErrors.lastName && fieldErrors.lastName.map((error, index) => (
                  <p key={index} className="mt-1 text-xs text-destructive">{error}</p>
                ))}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-1">
                Email Address <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={`w-full pl-10 pr-10 py-1.5 border rounded outline-none bg-background text-foreground placeholder:text-muted-foreground ${
                    fieldErrors.email?.length > 0 ? 'border-destructive/50' : 'border-border'
                  }`}
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {fieldErrors.email?.length === 0 && formData.email && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
              {fieldErrors.email && fieldErrors.email.map((error, index) => (
                <p key={index} className="mt-1 text-xs text-destructive">{error}</p>
              ))}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground/80 mb-1">
                Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className={`w-full pl-10 pr-16 py-1.5 border rounded outline-none bg-background text-foreground placeholder:text-muted-foreground ${
                    fieldErrors.password?.length > 0 ? 'border-destructive/50' : 'border-border'
                  }`}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                {fieldErrors.password?.length === 0 && formData.password && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
              {fieldErrors.password && fieldErrors.password.map((error, index) => (
                <p key={index} className="mt-1 text-xs text-destructive">{error}</p>
              ))}
              {!fieldErrors.password?.length && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground/80 mb-1">
                Confirm Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className={`w-full pl-10 pr-16 py-1.5 border rounded outline-none bg-background text-foreground placeholder:text-muted-foreground ${
                    !passwordMatch && formData.confirmPassword ? 'border-destructive/50' : 'border-border'
                  }`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                {passwordMatch && formData.confirmPassword && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
              {fieldErrors.confirmPassword && fieldErrors.confirmPassword.map((error, index) => (
                <p key={index} className="mt-1 text-xs text-destructive">{error}</p>
              ))}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start text-sm">
              <input
                id="terms"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 text-primary border-border rounded"
                checked={isTermsAccepted}
                onChange={(e) => setIsTermsAccepted(e.target.checked)}
              />
              <label htmlFor="terms" className="ml-3 text-muted-foreground">
                I agree to the{' '}
                <Link href="/terms" className="text-primary hover:text-primary/90 underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary hover:text-primary/90 underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Error Display */}
            {displayError && (
              <div className="rounded bg-destructive/10 p-3 border border-destructive/30">
                <div className="text-sm text-destructive">{displayError}</div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || hasFieldErrors || !isTermsAccepted}
              className="w-full py-2.5 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold rounded shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            {/* Info about next steps */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                After registration, you'll choose how you want to use JOINup
              </p>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link 
                href="/auth/login" 
                className="font-medium text-primary hover:text-primary/90 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
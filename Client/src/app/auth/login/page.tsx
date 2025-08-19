'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAppSelector } from '@/state/redux';
import { selectAuthError } from '@/state/authSlice';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Loader2, User, Mail, Lock, Building } from 'lucide-react';

export default function LoginPage() {
  const { login, loading, clearAuthError } = useAuth();
  const globalError = useAppSelector(selectAuthError);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  // Clear errors when component mounts or form changes
  useEffect(() => {
    return () => {
      clearAuthError();
    };
  }, [clearAuthError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLocalError('');
      clearAuthError();
      await login(formData.email, formData.password);
    } catch (err: any) {
      setLocalError(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    
    // Clear errors when user starts typing
    if (localError) setLocalError('');
    if (globalError) clearAuthError();
  };

  const fillTestCredentials = () => {
    setFormData({
      email: 'attendee@example.com',
      password: 'password123',
    });
  };

  const displayError = localError || globalError;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        
        {/* Card */}
        <div className="bg-white rounded-xl shadow-3xl p-6">
          {/* Header - Reduced spacing */}
          <div className="text-center mb-6">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gradient-to-r from-[#6A011D] to-[#8B0000] mb-3">
              <User className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Welcome to JOINup
            </h2>
            <p className="mt-1 text-gray-600 text-sm">
              Discover and join amazing events
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Field - Reduced spacing */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded outline-none"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Field - Reduced spacing */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-10 pr-12 py-1.5 border border-gray-300 rounded outline-none"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password - Reduced spacing */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-3 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-gray-700">
                  Remember me
                </label>
              </div>
              <Link 
                href="/auth/forgot-password" 
                className="text-[#6A011D] hover:text-[#550117] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error Display - Compact */}
            {displayError && (
              <div className="rounded bg-red-50 p-3 border border-red-200">
                <div className="text-sm text-red-700">{displayError}</div>
              </div>
            )}

            {/* Submit Button - Reduced padding */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-[#6A011D] to-[#8B0000] hover:from-[#550117] hover:to-[#7A0000] text-white font-semibold rounded shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            {/* Test Credentials - More compact */}
            <div className="text-center">
              <button
                type="button"
                onClick={fillTestCredentials}
                className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                Fill Test Credentials
              </button>
              <p className="mt-1 text-xs text-gray-500">
                attendee@example.com / password123
              </p>
            </div>
          </form>

          {/* Footer - Reduced spacing and more compact */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                href="/auth/register" 
                className="font-medium text-[#6A011D] hover:text-[#550117] transition-colors"
              >
                Sign up here
              </Link>
            </p>
            
            {/* Organizer Link - More compact */}
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-2">
                Want to organize events?
              </p>
              <Link 
                href="/auth/organizer/login" 
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-[#6A011D] bg-[#6A011D]/10 hover:bg-[#6A011D]/20 rounded transition-colors"
              >
                <Building className="h-3 w-3 mr-1.5" />
                Organizer Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
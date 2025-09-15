'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAppSelector } from '@/state/redux';
import { selectAuthError } from '@/state/authSlice';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Loader2, Building, Mail, Lock } from 'lucide-react';

export default function OrganizerLoginPage() {
  const { loginOrganizer, loading, clearAuthError } = useAuth();
  const globalError = useAppSelector(selectAuthError);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [remember, setRemember] = useState(false);

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
      await loginOrganizer(formData.email, formData.password, remember);
    } catch (err: any) {
      setLocalError(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    
    if (localError) setLocalError('');
    if (globalError) clearAuthError();
  };

  const fillTestCredentials = () => {
    setFormData({
      email: 'organizer@example.com',
      password: 'password123',
    });
  };

  const displayError = localError || globalError;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-card rounded-xl shadow-3xl p-6">
          <div className="text-center mb-6">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent mb-3">
              <Building className="h-4 w-4 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Organizer Dashboard Login
            </h2>
            <p className="mt-1 text-muted-foreground text-sm">
              Access your conference management dashboard
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-1.5 border border-border rounded outline-none bg-background text-foreground placeholder:text-muted-foreground"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground/80 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-10 pr-12 py-1.5 border border-border rounded outline-none bg-background text-foreground placeholder:text-muted-foreground"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-3 w-4 text-primary border-border rounded"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 text-foreground/80">Remember me</label>
              </div>
              <Link href="/auth/forgot-password" className="text-primary hover:text-primary/90 transition-colors">
                Forgot password?
              </Link>
            </div>

            {displayError && (
              <div className="rounded bg-destructive/10 p-3 border border-destructive/30">
                <div className="text-sm text-destructive">{displayError}</div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold rounded shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In to Your Account'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={fillTestCredentials}
                className="text-xs px-3 py-1.5 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors"
              >
                Fill Test Credentials
              </button>
              <p className="mt-1 text-xs text-muted-foreground">
                organizer@example.com / password123
              </p>
            </div>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Don't have an organizer account?{' '}
              <Link href="/auth/organizer/register" className="font-medium text-primary hover:text-primary/90 transition-colors">
                Sign up here
              </Link>
            </p>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Looking to attend events?{' '}
                <Link href="/auth/login" className="text-primary hover:text-primary/90 underline">
                  Attendee Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
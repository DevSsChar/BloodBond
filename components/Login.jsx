"use client"
import React from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, LogIn } from 'lucide-react';

const LoginPage = () => {
  const router = useRouter();

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/login' });
  };

  const handleGithubSignIn = () => {
    signIn('github', { callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4 sm:p-6">
      <div className="w-full max-w-md space-y-8 bg-[var(--card-background)] p-6 sm:p-8 rounded-xl shadow-md border border-[var(--border-color)] transition-colors duration-200">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <Heart className="h-7 w-7 text-[#ef4444]" aria-hidden="true" />
            <h1 className="font-heading text-2xl font-bold text-[#ef4444]">BloodBond</h1>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-[var(--text-primary)]">Welcome back</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Sign in to your account to continue saving lives
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-[var(--border-color)] rounded-md shadow-sm bg-[var(--card-background)] text-sm font-medium text-[var(--text-primary)] hover:!bg-red-100 hover:border-red-200 dark:hover:!bg-gray-400 dark:hover:border-red-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ef4444] focus:ring-offset-[var(--background)]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
          
          {/* Email Sign In */}
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-color)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[var(--card-background)] text-[var(--text-secondary)]">
                Or continue with
              </span>
            </div>
          </div>

          <Link href="/login/credentials">
            <button className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-[#ef4444] hover:bg-[#ef4444]/90 text-white text-sm font-medium transition-colors">
              <LogIn className="w-5 h-5" />
              Sign in with Email
            </button>
          </Link>
        </div>

        {/* Registration link */}
        <div className="mt-6 text-center">
          <div className="flex flex-col space-y-2 items-center text-sm">
            <p className="text-[var(--text-secondary)]">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-medium text-[#ef4444] hover:text-[#ef4444]/80 underline-offset-2 hover:underline">
                Register now
              </Link>
            </p>
            
            <Link href="/" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline underline-offset-2">
              Return to home page
            </Link>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-xs text-center text-[var(--text-secondary)]">
          <p>By signing in, you agree to our <Link href="/terms" className="text-[#ef4444] hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-[#ef4444] hover:underline">Privacy Policy</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
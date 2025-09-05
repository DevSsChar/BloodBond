"use client"
import React from 'react';
import Link from 'next/link';
import { Heart, AlertTriangle, ArrowLeft } from 'lucide-react';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4 sm:p-6">
      <div className="w-full max-w-md space-y-8 bg-[var(--card-background)] p-6 sm:p-8 rounded-xl shadow-md border border-[var(--border-color)] transition-colors duration-200 text-center">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Heart className="h-8 w-8 text-[#ef4444]" aria-hidden="true" />
            <h1 className="font-heading text-3xl font-bold text-[#ef4444]">BloodBond</h1>
          </div>
          
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-orange-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Access Denied
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">
            You don't have permission to access this page. Please make sure you have the correct role assigned.
          </p>
          
          <div className="space-y-4">
            <Link href="/">
              <button className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md bg-[#ef4444] hover:bg-[#ef4444]/90 text-white font-medium transition-colors">
                <ArrowLeft className="w-5 h-5" />
                Go Back Home
              </button>
            </Link>
            
            <Link href="/register">
              <button className="w-full py-3 px-4 rounded-md border border-[var(--border-color)] hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--text-primary)] font-medium transition-colors">
                Set Your Role
              </button>
            </Link>
            
            <p className="text-sm text-[var(--text-secondary)]">
              Need help? Contact support for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;

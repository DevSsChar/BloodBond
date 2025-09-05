"use client"
import React from 'react';
import { TriangleAlert, Heart } from 'lucide-react';

const EmergencyPage = () => {
  return (
    <div className="min-h-screen bg-[var(--background)] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <TriangleAlert className="h-16 w-16 text-[#ef4444] mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">Emergency Blood Request</h1>
          <p className="text-xl text-[var(--text-secondary)]">Request urgent blood supply for critical situations</p>
        </div>
        
        <div className="bg-[var(--card-background)] p-8 rounded-lg border border-[var(--border-color)]">
          <div className="text-center">
            <Heart className="h-12 w-12 text-[#ef4444] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Coming Soon</h2>
            <p className="text-[var(--text-secondary)]">
              Emergency blood request functionality is currently under development.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyPage;

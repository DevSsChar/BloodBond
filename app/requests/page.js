"use client"
import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { TriangleAlert, Building2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

const BloodRequestsPage = () => {
  const { data: session, status } = useSession();
  const { userRole, loading: roleLoading, hasRole } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading' || roleLoading) return;

    if (!session) {
      router.push('/login');
      return;
    }

    // Only blood banks and hospitals can access this page
    if (!hasRole || (userRole !== 'bloodbank_admin' && userRole !== 'hospital')) {
      router.push('/register');
      return;
    }
  }, [session, status, userRole, hasRole, roleLoading, router]);

  const isLoading = status === "loading" || roleLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ef4444]"></div>
      </div>
    );
  }

  if (!session || !hasRole || (userRole !== 'bloodbank_admin' && userRole !== 'hospital')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <TriangleAlert className="h-8 w-8 text-[#ef4444]" />
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Blood Requests</h1>
          </div>
          <p className="text-[var(--text-secondary)]">
            {userRole === 'bloodbank_admin' 
              ? 'Manage incoming blood requests from hospitals and patients'
              : 'View and manage your hospital\'s blood requests'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Pending Requests</p>
                <p className="text-2xl font-bold text-[#ef4444]">0</p>
              </div>
              <Clock className="h-8 w-8 text-[#ef4444]" />
            </div>
          </div>
          
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Fulfilled Today</p>
                <p className="text-2xl font-bold text-green-600">0</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Emergency Requests</p>
                <p className="text-2xl font-bold text-[#ef4444]">0</p>
              </div>
              <TriangleAlert className="h-8 w-8 text-[#ef4444]" />
            </div>
          </div>
          
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Rejected</p>
                <p className="text-2xl font-bold text-red-600">0</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8">
          {/* Requests List */}
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center">
              <TriangleAlert className="h-5 w-5 mr-2" />
              Recent Blood Requests
            </h2>
            <div className="text-center py-12">
              <TriangleAlert className="h-16 w-16 text-[var(--text-secondary)] mx-auto mb-4 opacity-50" />
              <p className="text-[var(--text-secondary)] text-lg mb-2">No blood requests found</p>
              <p className="text-sm text-[var(--text-secondary)]">
                {userRole === 'bloodbank_admin' 
                  ? 'Blood requests from hospitals and patients will appear here'
                  : 'Your hospital\'s blood requests will appear here'
                }
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          {userRole === 'hospital' && (
            <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full text-left p-4 bg-[#ef4444] text-white rounded-lg hover:bg-[#ef4444]/90 transition-colors">
                  <div className="flex items-center">
                    <TriangleAlert className="h-5 w-5 mr-3" />
                    <div>
                      <div className="font-medium">Create Emergency Request</div>
                      <div className="text-sm opacity-90">Submit an urgent blood request</div>
                    </div>
                  </div>
                </button>
                
                <button className="w-full text-left p-4 bg-[var(--background)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--card-background)] transition-colors">
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 mr-3 text-[var(--text-secondary)]" />
                    <div>
                      <div className="font-medium text-[var(--text-primary)]">Standard Request</div>
                      <div className="text-sm text-[var(--text-secondary)]">Submit a regular blood request</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BloodRequestsPage;

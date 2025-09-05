"use client"
import React from 'react';
import { useSession } from 'next-auth/react';
import { Hospital, Users, Activity, AlertTriangle } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

const HospitalDashboard = () => {
  const { data: session } = useSession();

  return (
    <ProtectedRoute allowedRoles={['hospital']}>
      <div className="min-h-screen bg-[var(--background)] py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Hospital className="h-8 w-8 text-[#ef4444]" />
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">Hospital Dashboard</h1>
            </div>
            <p className="text-[var(--text-secondary)]">Welcome back, {session?.user?.name || session?.user?.email}!</p>
          </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Active Requests</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">0</p>
              </div>
              <Activity className="h-8 w-8 text-[#ef4444]" />
            </div>
          </div>
          
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Patients Helped</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">0</p>
              </div>
              <Users className="h-8 w-8 text-[#ef4444]" />
            </div>
          </div>
          
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Emergency Requests</p>
                <p className="text-2xl font-bold text-[#ef4444]">0</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-[#ef4444]" />
            </div>
          </div>
          
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Fulfilled Today</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">0</p>
              </div>
              <Activity className="h-8 w-8 text-[#ef4444]" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Requests */}
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Requests
            </h2>
            <div className="text-center py-8">
              <p className="text-[var(--text-secondary)]">No recent requests</p>
              <p className="text-sm text-[var(--text-secondary)] mt-2">
                Start by creating a new blood request
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full text-left p-4 bg-[#ef4444] text-white rounded-lg hover:bg-[#ef4444]/90 transition-colors">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-3" />
                  <div>
                    <div className="font-medium">Emergency Request</div>
                    <div className="text-sm opacity-90">Create urgent blood request</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-4 bg-[var(--background)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--card-background)] transition-colors">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 mr-3 text-[var(--text-secondary)]" />
                  <div>
                    <div className="font-medium text-[var(--text-primary)]">View All Requests</div>
                    <div className="text-sm text-[var(--text-secondary)]">Manage blood requests</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
};

export default HospitalDashboard;

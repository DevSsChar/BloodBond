"use client"
import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Building2, Users, Activity, TrendingUp } from 'lucide-react';

const BloodBankDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    // Check if user has the correct role
    if (session.user.role !== 'bloodbank_admin') {
      router.push('/register');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ef4444]"></div>
      </div>
    );
  }

  if (!session || session.user.role !== 'bloodbank_admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Building2 className="h-8 w-8 text-[#ef4444]" />
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Blood Bank Dashboard</h1>
          </div>
          <p className="text-[var(--text-secondary)]">Welcome back, {session.user.name || session.user.email}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Total Units</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">0</p>
              </div>
              <Activity className="h-8 w-8 text-[#ef4444]" />
            </div>
          </div>
          
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Active Donors</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">0</p>
              </div>
              <Users className="h-8 w-8 text-[#ef4444]" />
            </div>
          </div>
          
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Requests Today</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">0</p>
              </div>
              <TrendingUp className="h-8 w-8 text-[#ef4444]" />
            </div>
          </div>
          
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Critical Stock</p>
                <p className="text-2xl font-bold text-[#ef4444]">2</p>
              </div>
              <Activity className="h-8 w-8 text-[#ef4444]" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inventory Overview */}
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Blood Inventory
            </h2>
            <div className="text-center py-8">
              <p className="text-[var(--text-secondary)]">No inventory data available</p>
              <p className="text-sm text-[var(--text-secondary)] mt-2">
                Start by adding blood units to your inventory
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full text-left p-4 bg-[#ef4444] text-white rounded-lg hover:bg-[#ef4444]/90 transition-colors">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 mr-3" />
                  <div>
                    <div className="font-medium">Manage Inventory</div>
                    <div className="text-sm opacity-90">Add or update blood units</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-4 bg-[var(--background)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--card-background)] transition-colors">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-3 text-[var(--text-secondary)]" />
                  <div>
                    <div className="font-medium text-[var(--text-primary)]">View Donors</div>
                    <div className="text-sm text-[var(--text-secondary)]">Manage donor records</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodBankDashboard;

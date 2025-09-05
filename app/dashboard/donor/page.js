"use client"
import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Heart, Calendar, Activity, Award } from 'lucide-react';

const DonorDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    // Check if user has the correct role
    if (session.user.role !== 'user') {
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

  if (!session || session.user.role !== 'user') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Heart className="h-8 w-8 text-[#ef4444]" />
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Donor Dashboard</h1>
          </div>
          <p className="text-[var(--text-secondary)]">Welcome back, {session.user.name || session.user.email}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Total Donations</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">0</p>
              </div>
              <Heart className="h-8 w-8 text-[#ef4444]" />
            </div>
          </div>
          
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Lives Saved</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">0</p>
              </div>
              <Award className="h-8 w-8 text-[#ef4444]" />
            </div>
          </div>
          
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Next Eligible</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">Now</p>
              </div>
              <Calendar className="h-8 w-8 text-[#ef4444]" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activity
            </h2>
            <div className="text-center py-8">
              <p className="text-[var(--text-secondary)]">No recent activity</p>
              <p className="text-sm text-[var(--text-secondary)] mt-2">
                Start by scheduling your first donation!
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full text-left p-4 bg-[#ef4444] text-white rounded-lg hover:bg-[#ef4444]/90 transition-colors">
                <div className="flex items-center">
                  <Heart className="h-5 w-5 mr-3" />
                  <div>
                    <div className="font-medium">Schedule Donation</div>
                    <div className="text-sm opacity-90">Book your next blood donation</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-4 bg-[var(--background)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--card-background)] transition-colors">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-[var(--text-secondary)]" />
                  <div>
                    <div className="font-medium text-[var(--text-primary)]">View History</div>
                    <div className="text-sm text-[var(--text-secondary)]">See your donation history</div>
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

export default DonorDashboard;

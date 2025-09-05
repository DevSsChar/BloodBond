"use client"
import React from 'react';
import { useSession } from 'next-auth/react';
import { useUserRole } from '@/hooks/useUserRole';

const DebugPage = () => {
  const { data: session, status } = useSession();
  const { userRole, loading: roleLoading, hasRole, isDonor, isBloodBank, isHospital } = useUserRole();

  return (
    <div className="min-h-screen bg-[var(--background)] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Debug Information</h1>
        
        <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)] mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Session Information</h2>
          <div className="space-y-2 font-mono text-sm">
            <div><strong>Status:</strong> {status}</div>
            <div><strong>Session exists:</strong> {session ? 'Yes' : 'No'}</div>
            <div><strong>User ID:</strong> {session?.user?.id || 'None'}</div>
            <div><strong>User Email:</strong> {session?.user?.email || 'None'}</div>
            <div><strong>User Name:</strong> {session?.user?.name || 'None'}</div>
            <div><strong>User Role from Session:</strong> {session?.user?.role || 'None'}</div>
          </div>
        </div>

        <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)] mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">useUserRole Hook Results</h2>
          <div className="space-y-2 font-mono text-sm">
            <div><strong>Role Loading:</strong> {roleLoading ? 'Yes' : 'No'}</div>
            <div><strong>User Role:</strong> {userRole || 'null'}</div>
            <div><strong>Has Role:</strong> {hasRole ? 'Yes' : 'No'}</div>
            <div><strong>Is Donor:</strong> {isDonor ? 'Yes' : 'No'}</div>
            <div><strong>Is Blood Bank:</strong> {isBloodBank ? 'Yes' : 'No'}</div>
            <div><strong>Is Hospital:</strong> {isHospital ? 'Yes' : 'No'}</div>
          </div>
        </div>

        <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Expected Behavior</h2>
          <div className="space-y-2 text-sm">
            <div><strong>If hasRole is false:</strong> User should see "Select Role" in navbar and be redirected to /register</div>
            <div><strong>If hasRole is true and isDonor:</strong> User should see donor navigation items</div>
            <div><strong>If hasRole is true and isBloodBank:</strong> User should see blood bank navigation items</div>
            <div><strong>If hasRole is true and isHospital:</strong> User should see hospital navigation items</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPage;

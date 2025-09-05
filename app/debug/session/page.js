"use client"
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useUserRole } from '@/hooks/useUserRole';

const SessionDebugPage = () => {
  const { data: session, status, update } = useSession();
  const { userRole, hasRole, isRegistrationComplete, loading } = useUserRole();
  const [dbStatus, setDbStatus] = useState(null);

  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch('/api/users/status');
      const result = await response.json();
      setDbStatus(result);
    } catch (error) {
      console.error('Error checking database status:', error);
      setDbStatus({ error: error.message });
    }
  };

  const forceSessionUpdate = async () => {
    try {
      await update();
      console.log('Session update triggered');
    } catch (error) {
      console.error('Session update failed:', error);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-[var(--background)]">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Session Debug Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Session Data */}
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Session Data</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Status:</strong> {status}</p>
              <p><strong>Loading:</strong> {loading.toString()}</p>
              <p><strong>User ID:</strong> {session?.user?.id || 'null'}</p>
              <p><strong>Email:</strong> {session?.user?.email || 'null'}</p>
              <p><strong>Name:</strong> {session?.user?.name || 'null'}</p>
              <p><strong>Role:</strong> {session?.user?.role || 'null'}</p>
              <p><strong>Registration Complete:</strong> {session?.user?.isRegistrationComplete?.toString() || 'null'}</p>
            </div>
          </div>

          {/* Hook Data */}
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">useUserRole Hook</h2>
            <div className="space-y-2 text-sm">
              <p><strong>User Role:</strong> {userRole || 'null'}</p>
              <p><strong>Has Role:</strong> {hasRole.toString()}</p>
              <p><strong>Registration Complete:</strong> {isRegistrationComplete.toString()}</p>
              <p><strong>Is Donor:</strong> {(userRole === 'user').toString()}</p>
              <p><strong>Is Blood Bank:</strong> {(userRole === 'bloodbank_admin').toString()}</p>
              <p><strong>Is Hospital:</strong> {(userRole === 'hospital').toString()}</p>
            </div>
          </div>

          {/* Database Status */}
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Database Status</h2>
            <button 
              onClick={checkDatabaseStatus}
              className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Check Database
            </button>
            {dbStatus && (
              <div className="space-y-2 text-sm">
                {dbStatus.error ? (
                  <p className="text-red-500"><strong>Error:</strong> {dbStatus.error}</p>
                ) : (
                  <>
                    <p><strong>ID:</strong> {dbStatus.user?.id || 'null'}</p>
                    <p><strong>Email:</strong> {dbStatus.user?.email || 'null'}</p>
                    <p><strong>Role:</strong> {dbStatus.user?.role || 'null'}</p>
                    <p><strong>Registration Complete:</strong> {dbStatus.user?.isRegistrationComplete?.toString() || 'null'}</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={forceSessionUpdate}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Force Session Update
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>

        {/* Raw Session Object */}
        <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
          <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Raw Session Object</h2>
          <pre className="text-xs overflow-auto bg-gray-100 dark:bg-gray-800 p-4 rounded">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default SessionDebugPage;

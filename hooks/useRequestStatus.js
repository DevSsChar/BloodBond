"use client"
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export const useRequestStatus = () => {
  const { data: session } = useSession();
  const [pendingRequests, setPendingRequests] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session || session.user?.role !== 'user') return;

    const fetchPendingRequests = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/requests?status=pending');
        if (response.ok) {
          const data = await response.json();
          setPendingRequests(data.requests?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching pending requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingRequests, 30000);
    
    return () => clearInterval(interval);
  }, [session]);

  return { pendingRequests, loading };
};

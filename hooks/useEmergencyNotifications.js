"use client"
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/context/ToastContext';

export const useEmergencyNotifications = () => {
  const { data: session } = useSession();
  const { warning } = useToast();
  const [lastNotificationTime, setLastNotificationTime] = useState(null);

  useEffect(() => {
    if (!session?.user || session.user.role !== 'bloodbank_admin') {
      return;
    }

    const checkForNewEmergencyRequests = async () => {
      try {
        const response = await fetch('/api/requests?request_type=emergency&status=pending', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          const emergencyRequests = data.requests || [];
          
          // Check for new emergency requests
          emergencyRequests.forEach(request => {
            const requestTime = new Date(request.requested_date).getTime();
            
            // Only notify for requests made in the last 30 seconds and after last notification
            const now = Date.now();
            const thirtySecondsAgo = now - 30000;
            
            if (requestTime > thirtySecondsAgo && 
                (!lastNotificationTime || requestTime > lastNotificationTime)) {
              
              const requesterName = request.requested_by_user?.name || 
                                   request.emergency_requester_name || 
                                   'Someone';
              
              warning(
                `🚨 EMERGENCY: ${requesterName} needs ${request.units_required} units of ${request.blood_type} blood!`,
                10000 // Show for 10 seconds
              );
              
              setLastNotificationTime(requestTime);
            }
          });
        }
      } catch (error) {
        console.error('Error checking for emergency requests:', error);
      }
    };

    // Check immediately
    checkForNewEmergencyRequests();

    // Then check every 15 seconds
    const interval = setInterval(checkForNewEmergencyRequests, 15000);

    return () => clearInterval(interval);
  }, [session, warning, lastNotificationTime]);

  return null;
};

export default useEmergencyNotifications;

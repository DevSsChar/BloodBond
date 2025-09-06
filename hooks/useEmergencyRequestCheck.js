import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export const useEmergencyRequestCheck = () => {
  const { data: session } = useSession();
  const [hasEmergencyRequest, setHasEmergencyRequest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEmergencyRequests = async () => {
      if (!session?.user?.email) {
        setLoading(false);
        return;
      }

      try {
        // Check if user has made any emergency requests
        const response = await fetch(`/api/requests/track?email=${encodeURIComponent(session.user.email)}&checkEmergency=true`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Check if any of the requests are emergency requests
          const hasEmergency = data.requests && data.requests.some(req => req.request_type === 'emergency');
          setHasEmergencyRequest(hasEmergency);
        }
      } catch (error) {
        console.error('Error checking emergency requests:', error);
        setHasEmergencyRequest(false);
      } finally {
        setLoading(false);
      }
    };

    checkEmergencyRequests();
  }, [session?.user?.email]);

  return { hasEmergencyRequest, loading };
};

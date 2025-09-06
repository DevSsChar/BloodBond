"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const RequestTrackingContext = createContext();

export const useRequestTracking = () => {
  const context = useContext(RequestTrackingContext);
  if (!context) {
    throw new Error('useRequestTracking must be used within a RequestTrackingProvider');
  }
  return context;
};

export const RequestTrackingProvider = ({ children }) => {
  const { data: session } = useSession();
  const [hasSubmittedRequest, setHasSubmittedRequest] = useState(false);
  const [latestRequestId, setLatestRequestId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  // Check if user has any requests when they log in
  useEffect(() => {
    const checkUserRequests = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch(`/api/requests/track?email=${encodeURIComponent(session.user.email)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.request) {
              setHasSubmittedRequest(true);
              setLatestRequestId(data.request._id);
              setUserEmail(session.user.email);
            }
          }
        } catch (error) {
          console.error('Error checking user requests:', error);
        }
      }
    };

    checkUserRequests();
  }, [session]);

  // Function to mark that user has submitted a request
  const markRequestSubmitted = (requestId, email = null) => {
    setHasSubmittedRequest(true);
    setLatestRequestId(requestId);
    setUserEmail(email || session?.user?.email);
    
    // Store in localStorage for persistence across sessions
    if (typeof window !== 'undefined') {
      const trackingData = {
        hasSubmitted: true,
        requestId,
        email: email || session?.user?.email,
        timestamp: Date.now()
      };
      localStorage.setItem('bloodbond_request_tracking', JSON.stringify(trackingData));
    }
  };

  // Check localStorage on mount for non-logged users
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('bloodbond_request_tracking');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          // Only use stored data if it's less than 30 days old
          if (data.timestamp && (Date.now() - data.timestamp) < 30 * 24 * 60 * 60 * 1000) {
            setHasSubmittedRequest(data.hasSubmitted);
            setLatestRequestId(data.requestId);
            setUserEmail(data.email);
          } else {
            // Clear old data
            localStorage.removeItem('bloodbond_request_tracking');
          }
        } catch (error) {
          console.error('Error parsing stored tracking data:', error);
        }
      }
    }
  }, []);

  const clearRequestTracking = () => {
    setHasSubmittedRequest(false);
    setLatestRequestId(null);
    setUserEmail(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bloodbond_request_tracking');
    }
  };

  return (
    <RequestTrackingContext.Provider value={{
      hasSubmittedRequest,
      latestRequestId,
      userEmail,
      markRequestSubmitted,
      clearRequestTracking
    }}>
      {children}
    </RequestTrackingContext.Provider>
  );
};

export default RequestTrackingProvider;

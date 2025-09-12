"use client"
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  XCircle,
  User,
  Droplet,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

const DonorRequests = () => {
  const { data: session } = useSession();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/donor-contact-request?type=received');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (requestId, action) => {
    setResponding(requestId);
    try {
      const response = await fetch('/api/donor-contact-request/respond', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          action
        })
      });

      if (response.ok) {
        alert(`Request ${action}ed successfully!`);
        fetchRequests(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(errorData.error || `Failed to ${action} request`);
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      alert(`Error ${action}ing request`);
    } finally {
      setResponding(null);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Critical': return 'text-red-600 bg-red-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return Clock;
      case 'accepted': return CheckCircle;
      case 'rejected': return XCircle;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['donor']}>
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ef4444] mx-auto"></div>
            <p className="mt-4 text-[var(--text-secondary)]">Loading requests...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['donor']}>
      <div className="min-h-screen bg-[var(--background)] py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center space-x-2 mb-8">
            <MessageCircle className="h-8 w-8 text-[#ef4444]" />
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Contact Requests</h1>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-24 w-24 text-[var(--text-secondary)] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No contact requests</h3>
              <p className="text-[var(--text-secondary)]">You have not received any contact requests yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(request => {
                const StatusIcon = getStatusIcon(request.status);
                
                return (
                  <div key={request._id} className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-[#ef4444]/10 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-[#ef4444]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                            {request.requesterId.name}
                          </h3>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {request.requesterId.email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgencyLevel)}`}>
                          {request.urgencyLevel}
                        </span>
                        <div className="flex items-center space-x-1">
                          <StatusIcon className="h-4 w-4 text-[var(--text-secondary)]" />
                          <span className="text-sm text-[var(--text-secondary)] capitalize">
                            {request.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Droplet className="h-4 w-4 text-[#ef4444]" />
                        <span className="text-sm text-[var(--text-secondary)]">
                          Blood Type: <span className="font-semibold text-[#ef4444]">{request.bloodType}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-[var(--text-secondary)]" />
                        <span className="text-sm text-[var(--text-secondary)]">
                          Requested: {new Date(request.requestDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {request.message && (
                      <div className="bg-[var(--background)] p-3 rounded-lg mb-4">
                        <p className="text-sm text-[var(--text-primary)]">{request.message}</p>
                      </div>
                    )}

                    {request.status === 'pending' && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => respondToRequest(request._id, 'reject')}
                          disabled={responding === request._id}
                          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => respondToRequest(request._id, 'accept')}
                          disabled={responding === request._id}
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Accept</span>
                        </button>
                      </div>
                    )}

                    {request.status !== 'pending' && request.responseDate && (
                      <div className="text-sm text-[var(--text-secondary)] mt-2">
                        Responded on: {new Date(request.responseDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DonorRequests;
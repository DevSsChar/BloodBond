"use client"
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TriangleAlert, Building2, Clock, CheckCircle, XCircle, User, Phone, MapPin, Calendar, MessageSquare } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useToast } from '@/context/ToastContext';

const BloodRequestsPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { success, error } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    accepted: 0,
    rejected: 0,
    emergency: 0
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/requests', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for NextAuth
      });
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
        
        // Calculate stats
        const requestStats = {
          pending: data.requests.filter(r => r.status === 'pending').length,
          accepted: data.requests.filter(r => r.status === 'accepted').length,
          rejected: data.requests.filter(r => r.status === 'rejected').length,
          emergency: data.requests.filter(r => r.request_type === 'emergency').length
        };
        setStats(requestStats);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch requests:', errorData.error || response.statusText);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setShowActionModal(true);
    setRejectionReason('');
  };

  const confirmAction = async () => {
    if (actionType === 'rejected' && !rejectionReason.trim()) {
      error('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('/api/requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          request_id: selectedRequest._id,
          status: actionType,
          rejection_reason: actionType === 'rejected' ? rejectionReason : null
        })
      });

      if (response.ok) {
        if (actionType === 'accepted') {
          success(`✅ Request accepted successfully! Contact details have been shared.`);
        } else if (actionType === 'rejected') {
          success(`❌ Request rejected. Reason has been sent to the requester.`);
        }
        setShowActionModal(false);
        fetchRequests(); // Refresh the list
      } else {
        const data = await response.json();
        error('Failed to update request: ' + data.error);
      }
    } catch (err) {
      console.error('Error updating request:', err);
      error('Failed to update request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'accepted': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['bloodbank_admin', 'hospital', 'user']}>
      <div className="min-h-screen bg-[var(--background)] py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <TriangleAlert className="h-8 w-8 text-[#ef4444]" />
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">Blood Requests</h1>
            </div>
            <p className="text-[var(--text-secondary)]">
              {session?.user?.role === 'bloodbank_admin' 
                ? 'Manage incoming blood requests from hospitals and patients'
                : session?.user?.role === 'user'
                ? 'Track your blood request status'
                : 'View and manage your hospital\'s blood requests'
              }
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Pending Requests</p>
                  <p className="text-2xl font-bold text-[#ef4444]">{loading ? '...' : stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-[#ef4444]" />
              </div>
            </div>
            
            <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Accepted</p>
                  <p className="text-2xl font-bold text-green-600">{loading ? '...' : stats.accepted}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Emergency Requests</p>
                  <p className="text-2xl font-bold text-[#ef4444]">{loading ? '...' : stats.emergency}</p>
                </div>
                <TriangleAlert className="h-8 w-8 text-[#ef4444]" />
              </div>
            </div>
            
            <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{loading ? '...' : stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Requests List */}
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center">
              <TriangleAlert className="h-5 w-5 mr-2" />
              Blood Requests
            </h2>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ef4444] mx-auto"></div>
                <p className="text-[var(--text-secondary)] mt-4">Loading requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <TriangleAlert className="h-16 w-16 text-[var(--text-secondary)] mx-auto mb-4 opacity-50" />
                <p className="text-[var(--text-secondary)] text-lg mb-2">No blood requests found</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {session?.user?.role === 'bloodbank_admin' 
                    ? 'Blood requests from hospitals and patients will appear here'
                    : session?.user?.role === 'user'
                    ? 'Your blood requests will appear here'
                    : 'Your hospital\'s blood requests will appear here'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request._id} className="border border-[var(--border-color)] rounded-lg p-4 hover:bg-[var(--background)] transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`flex items-center space-x-1 ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="font-medium capitalize">{request.status}</span>
                        </div>
                        {request.request_type === 'emergency' && (
                          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                            EMERGENCY
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-[var(--text-secondary)]">
                        {formatDate(request.requested_date)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-[var(--text-secondary)]" />
                        <div>
                          <p className="text-sm text-[var(--text-secondary)]">Patient</p>
                          <p className="font-medium text-[var(--text-primary)]">
                            {request.emergency_contact_name || request.requested_by_user?.name || 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-[var(--text-secondary)]" />
                        <div>
                          <p className="text-sm text-[var(--text-secondary)]">Contact</p>
                          <p className="font-medium text-[var(--text-primary)]">
                            {request.emergency_contact_mobile || request.requested_by_user?.mobile_number || 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-red-600"></div>
                        <div>
                          <p className="text-sm text-[var(--text-secondary)]">Blood Type</p>
                          <p className="font-medium text-[var(--text-primary)]">{request.blood_type} - {request.units_required} units</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-[var(--text-secondary)]" />
                        <div>
                          <p className="text-sm text-[var(--text-secondary)]">Location</p>
                          <p className="font-medium text-[var(--text-primary)]">{request.hospital_location || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {request.emergency_details && (
                      <div className="mb-4 p-3 bg-[var(--background)] rounded border border-[var(--border-color)]">
                        <p className="text-sm text-[var(--text-secondary)] mb-1">Emergency Details:</p>
                        <p className="text-[var(--text-primary)]">{request.emergency_details}</p>
                      </div>
                    )}

                    {request.status === 'accepted' && request.bloodbank_id && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-green-700 mb-2">✅ Request Accepted - Blood Bank Contact:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <p><strong>Name:</strong> {request.bloodbank_id.name}</p>
                          <p><strong>Phone:</strong> {request.bloodbank_id.contact_number || 'N/A'}</p>
                          <p><strong>Email:</strong> {request.bloodbank_id.email || 'N/A'}</p>
                          <p><strong>Address:</strong> {request.bloodbank_id.address || 'N/A'}</p>
                        </div>
                      </div>
                    )}

                    {request.status === 'rejected' && request.rejection_reason && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-700 mb-1">❌ Request Rejected:</p>
                        <p className="text-red-800">{request.rejection_reason}</p>
                      </div>
                    )}

                    {/* Action buttons for blood bank admins */}
                    {session?.user?.role === 'bloodbank_admin' && request.status === 'pending' && (
                      <div className="flex space-x-2 pt-4 border-t border-[var(--border-color)]">
                        <button
                          onClick={() => handleAction(request, 'accepted')}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                        >
                          Accept Request
                        </button>
                        <button
                          onClick={() => handleAction(request, 'rejected')}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                        >
                          Reject Request
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Modal */}
        {showActionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)] max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                {actionType === 'accepted' ? 'Accept Request' : 'Reject Request'}
              </h3>
              
              {actionType === 'rejected' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Reason for rejection (required):
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejecting this request..."
                    className="w-full p-3 border border-[var(--border-color)] rounded-md focus:ring-2 focus:ring-[#ef4444] focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={confirmAction}
                  disabled={actionLoading || (actionType === 'rejected' && !rejectionReason.trim())}
                  className="bg-[#ef4444] hover:bg-[#ef4444]/90 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium transition-colors"
                >
                  {actionLoading ? 'Processing...' : `Confirm ${actionType === 'accepted' ? 'Accept' : 'Reject'}`}
                </button>
                <button
                  onClick={() => setShowActionModal(false)}
                  disabled={actionLoading}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default BloodRequestsPage;

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
  const [showDonorSelectModal, setShowDonorSelectModal] = useState(false);
  const [availableDonors, setAvailableDonors] = useState([]);
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
          pending: data.requests.filter(r => r.status === 'pending' || r.status === 'shortage_pending').length,
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
        const data = await response.json();
        if (actionType === 'accepted') {
          let msg = `✅ Request accepted successfully! Contact details have been shared.`;
          if (data.replacementDonorAssigned) {
             msg += ` A replacement donor was also assigned to replenish your inventory!`;
          }
          success(msg);
        } else if (actionType === 'rejected') {
          success(`❌ Request rejected. Reason has been sent to the requester.`);
        }
        setShowActionModal(false);
        fetchRequests(); // Refresh the list
      } else if (response.status === 409) {
        const data = await response.json();
        // If it requires manual replacement selection
        if (data.requiresManualReplacement) {
          setShowActionModal(false);
          await fetchDonorsForReplacement(selectedRequest.blood_type);
          setShowDonorSelectModal(true);
          return;
        }

        // Auto shortage_pending fallback
        let message = `⚠️ Request moved to Shortage Pending due to insufficient inventory.`;
        if (data.replacementDonorAssigned) {
           message += ` A replacement donor has been assigned automatically!`;
        }
        success(message);
        setShowActionModal(false);
        fetchRequests();
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

  const fetchDonorsForReplacement = async (bloodType) => {
    try {
      // Use API to fetch donors matching blood type
      const response = await fetch(`/api/donors?bloodType=${encodeURIComponent(bloodType)}&criticalOnly=true&maxDistance=100`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableDonors(data.donors || []);
      }
    } catch (err) {
      console.error('Failed to fetch donors', err);
    }
  };

  const confirmManualReplacement = async (donorId) => {
    if (!donorId) {
      error('Please select a donor to continue.');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('/api/requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          request_id: selectedRequest._id,
          status: 'accepted',
          replacement_donor_id: donorId
        })
      });
      
      if (response.ok) {
        success('Shortage recorded and replacement donor assigned successfully.');
        setShowActionModal(false);
        setShowDonorSelectModal(false);
        fetchRequests();
      } else {
        const errData = await response.json();
        error(errData.error || 'Failed to assign replacement donor');
      }
    } catch (err) {
      error('Failed to confirm manual replacement');
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
      case 'shortage_pending': return 'text-orange-600';
      case 'accepted': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'shortage_pending': return <TriangleAlert className="h-4 w-4" />;
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

                    {request.status === 'accepted' && request.bloodbank_id && session?.user?.role !== 'user' && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-green-700 mb-2">✅ Request Accepted - Blood Bank Contact:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-700">
                          <p><strong>Name:</strong> {request.bloodbank_id.name}</p>
                          <p><strong>Phone:</strong> {request.bloodbank_id.contact_number || 'N/A'}</p>
                          <p><strong>Email:</strong> {request.bloodbank_id.email || 'N/A'}</p>
                          <p><strong>Address:</strong> {request.bloodbank_id.address || 'N/A'}</p>
                        </div>
                      </div>
                    )}

                    {request.status === 'accepted' && request.replacement_assignment_status === 'assigned' && request.replacement_donor_id && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm font-semibold text-green-800">✅ Replacement Donor Assigned</p>
                        <div className="text-xs text-green-700 mt-1 space-y-1">
                          <p><strong>Name:</strong> {request.replacement_donor_id?.user_id?.name || request.replacement_donor_id?.name || 'N/A'}</p>
                          <p><strong>Email:</strong> {request.replacement_donor_id?.user_id?.email || request.replacement_donor_id?.email || 'N/A'}</p>
                          <p><strong>Phone:</strong> {request.replacement_donor_id?.user_id?.mobile_number || request.replacement_donor_id?.mobile_number || 'N/A'}</p>
                        </div>
                      </div>
                    )}

                    {request.status === 'shortage_pending' && request.shortage_reason && (
                      <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded">
                        <p className="text-sm text-orange-700 mb-1">⚠️ Inventory Shortage:</p>
                        <p className="text-orange-800 text-sm mb-2">{request.shortage_reason}</p>
                        {request.replacement_assignment_status === 'assigned' && request.replacement_donor_id ? (
                          <div className="bg-green-100 p-2 rounded border border-green-300 mt-2">
                            <p className="text-sm font-semibold text-green-800">✅ Replacement Donor Assigned</p>
                            <div className="text-xs text-green-700 mt-1 space-y-1">
                              <p><strong>Name:</strong> {request.replacement_donor_id?.user_id?.name || request.replacement_donor_id?.name || 'N/A'}</p>
                              <p><strong>Email:</strong> {request.replacement_donor_id?.user_id?.email || request.replacement_donor_id?.email || 'N/A'}</p>
                              <p><strong>Phone:</strong> {request.replacement_donor_id?.user_id?.mobile_number || request.replacement_donor_id?.mobile_number || 'N/A'}</p>
                            </div>
                          </div>
                        ) : request.replacement_assignment_status === 'not_found' ? (
                          <div className="bg-red-100 p-2 rounded border border-red-300 mt-2">
                            <p className="text-sm font-semibold text-red-800">❌ Replacement Failed</p>
                            <p className="text-xs text-red-700 mt-1">Could not find a suitable donor nearby to replace this shortage automatically.</p>
                          </div>
                        ) : null}
                      </div>
                    )}

                    {request.status === 'rejected' && request.rejection_reason && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-700 mb-1">❌ Request Rejected:</p>
                        <p className="text-red-800">{request.rejection_reason}</p>
                      </div>
                    )}

                    {/* Action buttons for blood bank admins */}
                    {session?.user?.role === 'bloodbank_admin' && (request.status === 'pending' || request.status === 'shortage_pending') && (
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

        {/* Replacement Donor Select Modal */}
        {showDonorSelectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)] max-w-lg w-full mx-4 max-h-[80vh] flex flex-col">
              <h3 className="text-xl font-semibold text-[#ef4444] mb-2 flex items-center gap-2">
                <TriangleAlert className="h-5 w-5" /> Shortage: Select Replacement Donor
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                You have insufficient {selectedRequest?.blood_type} inventory. Please assign a replacement donor to keep your stock balanced.
              </p>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {availableDonors.length === 0 ? (
                  <div className="text-center py-6 text-[var(--text-secondary)]">
                    No eligible donors found nearby. You must replenish manually.
                  </div>
                ) : (
                  availableDonors.map(donor => (
                    <div key={donor._id} className="border border-[var(--border-color)] rounded p-3 flex justify-between items-center hover:bg-[var(--hover-color)]">
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{donor.name || 'Anonymous'}</p>
                        <p className="text-xs text-[var(--text-secondary)]">Blood Type: <span className="text-[#ef4444] font-semibold">{donor.blood_type}</span></p>
                        <p className="text-xs text-[var(--text-secondary)]">Contact: {donor.mobile_number || 'N/A'}</p>
                        {donor.distance != null && (
                          <p className="text-xs text-[var(--text-secondary)]"><MapPin className="inline w-3 h-3"/> {donor.distance} km away</p>
                        )}
                      </div>
                      <button 
                        onClick={() => confirmManualReplacement(donor._id)}
                        disabled={actionLoading}
                        className="bg-[#ef4444] hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm transition-colors"
                      >
                        Assign
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-[var(--border-color)]">
                <button
                  onClick={() => setShowDonorSelectModal(false)}
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

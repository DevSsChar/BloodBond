"use client"
import ProtectedRoute from '@/components/ProtectedRoute';
import { useToast } from '@/context/ToastContext';
import {
    Building2,
    CheckCircle,
    Clock,
    Droplet,
    Hospital,
    Package,
    Phone,
    User,
    XCircle
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

const HospitalRequestAcceptance = () => {
  const { data: session } = useSession();
  const { success, error } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseData, setResponseData] = useState({
    action: '',
    message: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/hospital-requests?role=bloodbank');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseRequest = (request, action) => {
    setSelectedRequest(request);
    setResponseData({ action, message: '' });
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async () => {
    if (!responseData.message.trim()) {
      error('Please provide a response message');
      return;
    }

    try {
      const response = await fetch('/api/hospital-requests/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request_id: selectedRequest._id,
          action: responseData.action,
          message: responseData.message
        })
      });

      if (response.ok) {
        const actionText = responseData.action === 'accepted' ? 'accepted' : 'declined';
        success(`Request ${actionText} successfully`);
        setShowResponseModal(false);
        setSelectedRequest(null);
        setResponseData({ action: '', message: '' });
        fetchRequests();
      } else {
        const data = await response.json();
        error(data.error || 'Failed to respond to request');
      }
    } catch (error) {
      console.error('Error responding to request:', error);
      error('Failed to respond to request');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ef4444]"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['bloodbank_admin']}>
      <div className="min-h-screen bg-[var(--background)] py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Hospital className="h-8 w-8 text-[#ef4444]" />
              <div>
                <h1 className="text-3xl font-bold text-[var(--foreground)]">
                  Hospital Request Acceptance
                </h1>
                <p className="text-[var(--muted-foreground)] mt-1">
                  Review and respond to hospital blood requests directed to your blood bank
                </p>
              </div>
            </div>
          </div>

          {/* Requests List */}
          <div className="space-y-6">
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <Hospital className="h-24 w-24 text-[var(--muted-foreground)] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                  No Hospital Requests
                </h3>
                <p className="text-[var(--muted-foreground)]">
                  There are currently no hospital requests directed to your blood bank.
                </p>
              </div>
            ) : (
              requests.map((request) => (
                <div key={request._id} className="bg-[var(--card)] rounded-lg shadow-md border border-[var(--border)] p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Request Header */}
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(request.status)}
                          <span className="font-medium text-[var(--foreground)]">
                            Request #{request._id.slice(-6)}
                          </span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(request.urgency_level)}`}>
                          {request.urgency_level.toUpperCase()}
                        </span>
                        <span className="text-sm text-[var(--muted-foreground)]">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Hospital Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-[var(--muted-foreground)]" />
                          <span className="text-[var(--foreground)]">
                            {request.hospital_id?.name || 'Unknown Hospital'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-[var(--muted-foreground)]" />
                          <span className="text-[var(--foreground)]">
                            {request.hospital_id?.email || 'No contact'}
                          </span>
                        </div>
                      </div>

                      {/* Request Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Droplet className="h-4 w-4 text-[#ef4444]" />
                          <span className="font-medium text-[var(--foreground)]">
                            {request.blood_type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-[var(--muted-foreground)]" />
                          <span className="text-[var(--foreground)]">
                            {request.units_requested} units
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-[var(--muted-foreground)]" />
                          <span className="text-[var(--foreground)]">
                            {request.request_type}
                          </span>
                        </div>
                      </div>

                      {/* Patient Details (if available) */}
                      {request.patient_details && (
                        <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--border)] mb-4">
                          <h4 className="font-medium text-[var(--foreground)] mb-2">Patient Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-[var(--muted-foreground)]">Name: </span>
                              <span className="text-[var(--foreground)]">{request.patient_details.name}</span>
                            </div>
                            <div>
                              <span className="text-[var(--muted-foreground)]">Age: </span>
                              <span className="text-[var(--foreground)]">{request.patient_details.age}</span>
                            </div>
                            <div>
                              <span className="text-[var(--muted-foreground)]">Condition: </span>
                              <span className="text-[var(--foreground)]">{request.patient_details.condition}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Reason */}
                      <div className="mb-4">
                        <h4 className="font-medium text-[var(--foreground)] mb-2">Request Reason</h4>
                        <p className="text-[var(--muted-foreground)] text-sm bg-[var(--background)] p-3 rounded-lg border border-[var(--border)]">
                          {request.reason}
                        </p>
                      </div>

                      {/* Response (if any) */}
                      {request.response_message && (
                        <div className="mb-4">
                          <h4 className="font-medium text-[var(--foreground)] mb-2">Your Response</h4>
                          <p className="text-[var(--muted-foreground)] text-sm bg-[var(--background)] p-3 rounded-lg border border-[var(--border)]">
                            {request.response_message}
                          </p>
                          {request.responded_by && (
                            <p className="text-xs text-[var(--muted-foreground)] mt-2">
                              Responded by: {request.responded_by.name} on {new Date(request.responded_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {request.status === 'pending' && (
                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => handleResponseRequest(request, 'accepted')}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleResponseRequest(request, 'rejected')}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Decline</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Response Modal */}
        {showResponseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[var(--card)] rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                {responseData.action === 'accepted' ? 'Accept' : 'Decline'} Request
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Response Message
                </label>
                <textarea
                  value={responseData.message}
                  onChange={(e) => setResponseData({ ...responseData, message: e.target.value })}
                  className="w-full p-3 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:ring-2 focus:ring-[#ef4444] focus:border-transparent"
                  rows="4"
                  placeholder={`Provide a reason for ${responseData.action === 'accepted' ? 'accepting' : 'declining'} this request...`}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleSubmitResponse}
                  className={`flex-1 py-2 px-4 rounded-lg text-white transition-colors ${
                    responseData.action === 'accepted' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {responseData.action === 'accepted' ? 'Accept' : 'Decline'} Request
                </button>
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="flex-1 py-2 px-4 border border-[var(--border)] rounded-lg text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
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

export default HospitalRequestAcceptance;

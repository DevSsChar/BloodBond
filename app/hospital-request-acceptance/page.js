"use client"
import ProtectedRoute from '@/components/ProtectedRoute';
import { useToast } from '@/context/ToastContext';
import {
    Building2,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Clock,
    Droplet,
    Filter,
    Hospital,
    Package,
    Phone,
    TrendingUp,
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedCard, setExpandedCard] = useState(null);

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
      case 'fulfilled':
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
      case 'critical': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
      case 'low': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700';
      default: return 'bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700';
    }
  };

  // Calculate statistics
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const acceptedRequests = requests.filter(r => r.status === 'accepted' || r.status === 'fulfilled').length;
  const rejectedRequests = requests.filter(r => r.status === 'rejected').length;

  // Filter requests based on selected status
  const filteredRequests = statusFilter === 'all' 
    ? requests 
    : statusFilter === 'accepted' 
      ? requests.filter(r => r.status === 'accepted' || r.status === 'fulfilled')
      : requests.filter(r => r.status === statusFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ef4444]"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['bloodbank_admin']}>
      <div className="min-h-screen bg-gray-100 dark:bg-[var(--background)] py-8">
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

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-gray-300 dark:border-gray-600 p-6 hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-semibold">Total Requests</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{totalRequests}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full border-2 border-blue-300 dark:border-blue-700">
                  <TrendingUp className="h-6 w-6 text-blue-700 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-gray-300 dark:border-gray-600 p-6 hover:shadow-xl hover:border-orange-400 dark:hover:border-yellow-500 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-semibold">Pending</p>
                  <p className="text-3xl font-bold text-orange-700 dark:text-yellow-400 mt-2">{pendingRequests}</p>
                </div>
                <div className="bg-orange-100 dark:bg-yellow-900/30 p-3 rounded-full border-2 border-orange-300 dark:border-yellow-700">
                  <Clock className="h-6 w-6 text-orange-700 dark:text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-gray-300 dark:border-gray-600 p-6 hover:shadow-xl hover:border-green-400 dark:hover:border-green-500 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-semibold">Accepted</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-400 mt-2">{acceptedRequests}</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full border-2 border-green-300 dark:border-green-700">
                  <CheckCircle className="h-6 w-6 text-green-700 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-gray-300 dark:border-gray-600 p-6 hover:shadow-xl hover:border-red-400 dark:hover:border-red-500 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-semibold">Rejected</p>
                  <p className="text-3xl font-bold text-red-700 dark:text-red-400 mt-2">{rejectedRequests}</p>
                </div>
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full border-2 border-red-300 dark:border-red-700">
                  <XCircle className="h-6 w-6 text-red-700 dark:text-red-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-gray-300 dark:border-gray-600 p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <span className="font-semibold text-gray-900 dark:text-white">Filter Requests</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'accepted', 'rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      statusFilter === status
                        ? 'bg-[#ef4444] text-white shadow-lg border-2 border-[#ef4444]'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 border-2 border-gray-400 dark:border-gray-500'
                    }`}
                  >
                    {status === 'all' ? 'All Requests' : status.charAt(0).toUpperCase() + status.slice(1)}
                    {status !== 'all' && (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-white/30 dark:bg-black/30">
                        {status === 'pending' && pendingRequests}
                        {status === 'accepted' && acceptedRequests}
                        {status === 'rejected' && rejectedRequests}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <Hospital className="h-24 w-24 text-gray-400 dark:text-[var(--muted-foreground)] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-[var(--foreground)] mb-2">
                  {statusFilter === 'all' 
                    ? 'No Hospital Requests' 
                    : `No ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Requests`}
                </h3>
                <p className="text-gray-600 dark:text-[var(--muted-foreground)]">
                  {statusFilter === 'all' 
                    ? 'There are currently no hospital requests directed to your blood bank.' 
                    : `There are no ${statusFilter} requests at the moment.`}
                </p>
              </div>
            ) : (
              filteredRequests.map((request) => (
                <div key={request._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300">
                  {/* Compact Card Header */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-700 dark:hover:bg-gray-750 transition-colors duration-200"
                    onClick={() => setExpandedCard(expandedCard === request._id ? null : request._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Status Icon */}
                        <div className={`p-2 rounded-full ${
                          request.status === 'accepted' || request.status === 'fulfilled' ? 'bg-green-100 dark:bg-green-900/30' :
                          request.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30' :
                          'bg-orange-100 dark:bg-yellow-900/30'
                        }`}>
                          {getStatusIcon(request.status)}
                        </div>
                        
                        {/* Request Info */}
                        <div className="flex items-center space-x-6">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              Request #{request._id.slice(-6)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {request.hospital_id?.name || 'Unknown Hospital'}
                            </p>
                          </div>
                          
                          {/* Blood Type */}
                          <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                            <Droplet className="h-4 w-4 text-red-600" />
                            <span className="font-bold text-red-600 dark:text-red-400">{request.blood_type}</span>
                          </div>
                          
                          {/* Units */}
                          <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="font-semibold text-blue-600 dark:text-blue-400">{request.units_requested} units</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {/* Urgency Badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getUrgencyColor(request.urgency_level)}`}>
                          {request.urgency_level.toUpperCase()}
                        </span>
                        
                        {/* Status Badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          request.status === 'accepted' || request.status === 'fulfilled' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                          request.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                          'bg-orange-100 dark:bg-yellow-900/30 text-orange-700 dark:text-yellow-300'
                        }`}>
                          {request.status === 'fulfilled' ? 'ACCEPTED' : request.status.toUpperCase()}
                        </span>
                        
                        {/* Expand Icon */}
                        {expandedCard === request._id ? (
                          <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedCard === request._id && (
                    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                      <div className="p-6 space-y-6">
                        {/* Request Details */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Hospital & Request Info */}
                          <div className="space-y-4">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                <Building2 className="h-4 w-4 text-blue-600 mr-2" />
                                Hospital Information
                              </h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Name:</span>
                                  <span className="text-gray-900 dark:text-white font-medium">{request.hospital_id?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Contact:</span>
                                  <span className="text-gray-900 dark:text-white">{request.hospital_id?.email}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Request Type:</span>
                                  <span className="text-gray-900 dark:text-white font-medium">{request.request_type}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Date:</span>
                                  <span className="text-gray-900 dark:text-white">{new Date(request.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>

                            {/* Patient Details */}
                            {request.patient_details && (
                              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                  <User className="h-4 w-4 text-green-600 mr-2" />
                                  Patient Information
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Name:</span>
                                    <span className="text-gray-900 dark:text-white font-medium">{request.patient_details.name}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Age:</span>
                                    <span className="text-gray-900 dark:text-white">{request.patient_details.age} years</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Condition:</span>
                                    <span className="text-gray-900 dark:text-white">{request.patient_details.condition}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Request Reason & Response */}
                          <div className="space-y-4">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                <Package className="h-4 w-4 text-orange-600 mr-2" />
                                Request Reason
                              </h4>
                              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {request.reason}
                              </p>
                            </div>

                            {/* Response */}
                            {request.response_message && (
                              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                  Your Response
                                </h4>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                                  {request.response_message}
                                </p>
                                {request.responded_by && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-600">
                                    <p>Responded by: {request.responded_by.name}</p>
                                    <p>{new Date(request.responded_at).toLocaleString()}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {request.status === 'pending' && (
                          <div className="flex justify-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                              onClick={() => handleResponseRequest(request, 'accepted')}
                              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-2 transition-colors font-semibold"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Accept Request</span>
                            </button>
                            <button
                              onClick={() => handleResponseRequest(request, 'rejected')}
                              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-2 transition-colors font-semibold"
                            >
                              <XCircle className="h-4 w-4" />
                              <span>Decline Request</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Enhanced Response Modal */}
        {showResponseModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--card)] rounded-2xl shadow-2xl w-full max-w-lg mx-4 transform transition-all duration-300 scale-100">
              <div className={`p-6 rounded-t-2xl ${
                responseData.action === 'accepted' 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-b border-green-200 dark:border-green-800' 
                  : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-b border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full ${
                    responseData.action === 'accepted' 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    {responseData.action === 'accepted' ? (
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--foreground)]">
                      {responseData.action === 'accepted' ? 'Accept' : 'Decline'} Request
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Provide a detailed response to the hospital
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-3">
                    Response Message *
                  </label>
                  <textarea
                    value={responseData.message}
                    onChange={(e) => setResponseData({ ...responseData, message: e.target.value })}
                    className="w-full p-4 border-2 border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--foreground)] focus:ring-2 focus:ring-[#ef4444] focus:border-[#ef4444] transition-all duration-200 resize-none"
                    rows="5"
                    placeholder={`Provide a detailed reason for ${responseData.action === 'accepted' ? 'accepting' : 'declining'} this blood request. This will be sent to the hospital.`}
                  />
                  <p className="text-xs text-[var(--muted-foreground)] mt-2">
                    This message will be shared with the requesting hospital.
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleSubmitResponse}
                    className={`flex-1 py-3 px-6 rounded-xl text-white font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${
                      responseData.action === 'accepted' 
                        ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' 
                        : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                    }`}
                  >
                    {responseData.action === 'accepted' ? 'Accept' : 'Decline'} Request
                  </button>
                  <button
                    onClick={() => setShowResponseModal(false)}
                    className="flex-1 py-3 px-6 border-2 border-[var(--border)] rounded-xl text-[var(--foreground)] hover:bg-[var(--muted)] transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default HospitalRequestAcceptance;

"use client"
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Search, Clock, CheckCircle, XCircle, User, Phone, MapPin, Building2, MessageSquare, RefreshCw } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const TrackRequestPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { success, error } = useToast();
  const [searchInput, setSearchInput] = useState('');
  const [searchType, setSearchType] = useState('email'); // 'email' or 'id'
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState(null); // For single ID search
  const [searchResults, setSearchResults] = useState([]); // For email search results
  const [requestType, setRequestType] = useState(null); // 'active', 'fulfilled', or null
  const [statusMessage, setStatusMessage] = useState('');
  const [notFound, setNotFound] = useState(false);

  // Auto-load user's requests if authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      // Auto-search for authenticated user's email
      setSearchInput(session.user.email);
      setSearchType('email');
      // Trigger search automatically
      autoSearchForUser(session.user.email);
    }
  }, [status, session]);

  const autoSearchForUser = async (email) => {
    setLoading(true);
    setNotFound(false);
    setRequest(null);
    setSearchResults([]);

    try {
      const response = await fetch(`/api/requests/track?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.requests && data.requests.length > 0) {
          setSearchResults(data.requests);
          setRequestType(data.type);
          setStatusMessage(data.message);
        }
      }
    } catch (err) {
      console.error('Error auto-loading user requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchInput.trim()) {
      error('Please enter an email address or request ID');
      return;
    }

    setLoading(true);
    setNotFound(false);
    setRequest(null);
    setSearchResults([]);

    try {
      const response = await fetch(`/api/requests/track?${searchType}=${encodeURIComponent(searchInput.trim())}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (searchType === 'email') {
          // Email search returns multiple requests
          if (data.requests && data.requests.length > 0) {
            setSearchResults(data.requests);
            setRequestType(data.type);
            setStatusMessage(data.message);
            success(data.message);
          } else {
            setNotFound(true);
            error('No requests found for this email address');
          }
        } else {
          // ID search returns single request
          if (data.request) {
            setRequest(data.request);
            success('Request found successfully!');
          } else {
            setNotFound(true);
            error('No request found with the provided ID');
          }
        }
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Failed to search for request');
        setNotFound(true);
      }
    } catch (err) {
      console.error('Error searching for request:', err);
      error('Failed to search for request. Please try again.');
      setNotFound(true);
    } finally {
      setLoading(false);
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
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'accepted': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
            Track Blood Request Status
          </h1>
          <p className="text-[var(--text-secondary)] text-lg">
            Enter an email address to see all requests made with that email, or enter a request ID to track a specific request
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-[var(--card-background)] rounded-lg shadow-sm border border-[var(--border-color)] p-6 mb-8">
          {/* User info for authenticated users */}
          {status === 'authenticated' && session?.user?.email && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <span className="font-medium">💡 Tip:</span> Your email ({session.user.email}) is pre-filled below. 
                We'll automatically show your requests when you first visit this page.
              </p>
            </div>
          )}
          
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Type Toggle */}
            <div className="flex space-x-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="email"
                  checked={searchType === 'email'}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="mr-2"
                />
                Search by Email
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="id"
                  checked={searchType === 'id'}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="mr-2"
                />
                Search by Request ID
              </label>
            </div>

            {/* Search Input */}
            <div className="flex gap-3">
              <input
                type={searchType === 'email' ? 'email' : 'text'}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={searchType === 'email' ? 'Enter your email address' : 'Enter your request ID'}
                className="flex-1 px-4 py-3 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[#ef4444] focus:border-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#ef4444] text-white rounded-lg hover:bg-[#ef4444]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Search
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Request Details */}
        {request && (
          <div className="bg-[var(--card-background)] rounded-lg shadow-sm border border-[var(--border-color)] p-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Request Details</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-[var(--text-primary)] mb-3">Basic Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[var(--text-secondary)]" />
                      <span className="text-sm text-[var(--text-secondary)]">Request ID:</span>
                      <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {request._id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[var(--text-secondary)]" />
                      <span className="text-sm text-[var(--text-secondary)]">Blood Type:</span>
                      <span className="text-sm font-semibold text-[#ef4444]">{request.blood_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[var(--text-secondary)]" />
                      <span className="text-sm text-[var(--text-secondary)]">Units Required:</span>
                      <span className="text-sm font-semibold">{request.units_required}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[var(--text-secondary)]" />
                      <span className="text-sm text-[var(--text-secondary)]">Requested:</span>
                      <span className="text-sm">{formatDate(request.requested_date)}</span>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h3 className="font-medium text-[var(--text-primary)] mb-3">Status</h3>
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                    <span className="capitalize font-medium">{request.status}</span>
                  </div>
                </div>
              </div>

              {/* Blood Bank Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-[var(--text-primary)] mb-3">Blood Bank</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[var(--text-secondary)]" />
                      <span className="text-sm font-semibold">{request.bloodbank_id?.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[var(--text-secondary)]" />
                      <span className="text-sm">{request.bloodbank_id?.address || 'N/A'}</span>
                    </div>
                    {request.status === 'accepted' && request.bloodbank_id?.contact_number && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[var(--text-secondary)]" />
                        <span className="text-sm font-semibold text-[#ef4444]">
                          {request.bloodbank_id.contact_number}
                        </span>
                      </div>
                    )}
                    {request.status === 'accepted' && request.bloodbank_id?.email && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[var(--text-secondary)]" />
                        <span className="text-sm text-[#ef4444]">
                          {request.bloodbank_id.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rejection Reason */}
                {request.status === 'rejected' && request.rejection_reason && (
                  <div>
                    <h3 className="font-medium text-[var(--text-primary)] mb-3">Rejection Reason</h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-red-600 mt-0.5" />
                        <span className="text-sm text-red-800">{request.rejection_reason}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Acceptance Message */}
                {request.status === 'accepted' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-medium text-green-800 mb-2">✅ Request Accepted!</h3>
                    <p className="text-sm text-green-700">
                      Your blood request has been accepted. Please contact the blood bank using the provided details to coordinate the blood collection.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Multiple Requests Results (for email search) */}
        {searchResults.length > 0 && (
          <div className="space-y-6">
            <div className="bg-[var(--card-background)] rounded-lg shadow-sm border border-[var(--border-color)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                  {requestType === 'fulfilled' ? 'Fulfilled Requests' : 'Active Requests'}
                </h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  requestType === 'fulfilled' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}>
                  {searchResults.length} request{searchResults.length !== 1 ? 's' : ''}
                </div>
              </div>
              <p className="text-[var(--text-secondary)] mb-6">{statusMessage}</p>
            </div>

            {/* Request Cards */}
            <div className="grid gap-6">
              {searchResults.map((req, index) => (
                <div key={req._id} className="bg-[var(--card-background)] rounded-lg shadow-sm border border-[var(--border-color)] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                      Request #{index + 1}
                    </h3>
                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor(req.status)}`}>
                      {getStatusIcon(req.status)}
                      <span className="capitalize font-medium">{req.status}</span>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[var(--text-secondary)]" />
                        <span className="text-sm text-[var(--text-secondary)]">Request ID:</span>
                        <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {req._id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[var(--text-secondary)]" />
                        <span className="text-sm text-[var(--text-secondary)]">Blood Type:</span>
                        <span className="text-sm font-semibold text-[#ef4444]">{req.blood_type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[var(--text-secondary)]" />
                        <span className="text-sm text-[var(--text-secondary)]">Units Required:</span>
                        <span className="text-sm font-semibold">{req.units_required}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[var(--text-secondary)]" />
                        <span className="text-sm text-[var(--text-secondary)]">Requested:</span>
                        <span className="text-sm">{formatDate(req.requested_date)}</span>
                      </div>
                    </div>

                    {/* Blood Bank Information */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[var(--text-secondary)]" />
                        <span className="text-sm font-semibold">{req.bloodbank_id?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[var(--text-secondary)]" />
                        <span className="text-sm">{req.bloodbank_id?.address || 'N/A'}</span>
                      </div>
                      {req.status === 'accepted' && req.bloodbank_id?.contact_number && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-[var(--text-secondary)]" />
                          <span className="text-sm font-semibold text-[#ef4444]">
                            {req.bloodbank_id.contact_number}
                          </span>
                        </div>
                      )}
                      {req.status === 'accepted' && req.bloodbank_id?.email && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[var(--text-secondary)]" />
                          <span className="text-sm text-[#ef4444]">
                            {req.bloodbank_id.email}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status-specific messages */}
                  {req.status === 'rejected' && req.rejection_reason && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-red-600 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-red-800">Rejection Reason:</span>
                          <span className="text-sm text-red-800 ml-2">{req.rejection_reason}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {req.status === 'accepted' && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                      <h4 className="font-medium text-green-800 mb-1">✅ Request Accepted!</h4>
                      <p className="text-sm text-green-700">
                        Your blood request has been accepted. Please contact the blood bank using the provided details to coordinate the blood collection.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Not Found Message */}
        {notFound && (
          <div className="bg-[var(--card-background)] rounded-lg shadow-sm border border-[var(--border-color)] p-8 text-center">
            <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Request Not Found</h3>
            <p className="text-[var(--text-secondary)] mb-4">
              We couldn't find a request with the provided {searchType === 'email' ? 'email address' : 'request ID'}.
            </p>
            <div className="text-sm text-[var(--text-secondary)]">
              <p>• Make sure you entered the correct {searchType === 'email' ? 'email address' : 'request ID'}</p>
              <p>• Try using the other search method</p>
              <p>• Contact support if you continue having issues</p>
            </div>
          </div>
        )}

        {/* Information */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">ℹ️ How to Track Status</h3>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <p>• Enter any email address used when making a request</p>
            <p>• Or enter any request ID to see its status</p>
            <p>• Track any request - no login required</p>
            <p>• See pending status, acceptance details, or rejection reasons</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackRequestPage;

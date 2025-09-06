"use client"
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { TriangleAlert, Clock, CheckCircle, XCircle, User, Phone, MapPin, Building2 } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

const UserRequestsPage = () => {
  const { data: session } = useSession();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRequests();
  }, []);

  const fetchUserRequests = async () => {
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
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch user requests:', errorData.error || response.statusText);
      }
    } catch (error) {
      console.error('Error fetching user requests:', error);
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

  const getStatusMessage = (request) => {
    switch (request.status) {
      case 'pending':
        return `Your ${request.request_type} request for ${request.blood_type} blood is being reviewed by ${request.bloodbank_id?.name || 'the blood bank'}.`;
      case 'accepted':
        return `Great news! Your request has been accepted. Please contact the blood bank immediately.`;
      case 'rejected':
        return `Unfortunately, your request was rejected. ${request.rejection_reason || 'Please try contacting other blood banks.'}`;
      default:
        return 'Request status unknown.';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['user']}>
      <div className="min-h-screen bg-[var(--background)] py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <User className="h-8 w-8 text-[#ef4444]" />
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">My Blood Requests</h1>
            </div>
            <p className="text-[var(--text-secondary)]">
              Track the status of your blood requests and emergency submissions
            </p>
          </div>

          {/* Quick Action */}
          <div className="mb-8">
            <Link href="/emergency">
              <button className="bg-[#ef4444] hover:bg-[#ef4444]/90 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2">
                <TriangleAlert className="h-5 w-5" />
                <span>Submit Emergency Request</span>
              </button>
            </Link>
          </div>

          {/* Requests List */}
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Your Requests</h2>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ef4444] mx-auto"></div>
                <p className="text-[var(--text-secondary)] mt-4">Loading your requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-16 w-16 text-[var(--text-secondary)] mx-auto mb-4 opacity-50" />
                <p className="text-[var(--text-secondary)] text-lg mb-2">No requests found</p>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  You haven't submitted any blood requests yet
                </p>
                <Link href="/emergency">
                  <button className="bg-[#ef4444] hover:bg-[#ef4444]/90 text-white px-4 py-2 rounded font-medium transition-colors">
                    Submit Your First Request
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {requests.map((request) => (
                  <div key={request._id} className="border border-[var(--border-color)] rounded-lg p-6">
                    {/* Request Header */}
                    <div className="flex justify-between items-start mb-4">
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
                        Submitted: {formatDate(request.requested_date)}
                      </div>
                    </div>

                    {/* Status Message */}
                    <div className={`p-4 rounded-lg mb-4 ${
                      request.status === 'accepted' ? 'bg-green-50 border border-green-200' :
                      request.status === 'rejected' ? 'bg-red-50 border border-red-200' :
                      'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <p className={`${
                        request.status === 'accepted' ? 'text-green-800' :
                        request.status === 'rejected' ? 'text-red-800' :
                        'text-yellow-800'
                      }`}>
                        {getStatusMessage(request)}
                      </p>
                    </div>

                    {/* Request Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-red-600"></div>
                        <div>
                          <p className="text-sm text-[var(--text-secondary)]">Blood Type & Units</p>
                          <p className="font-medium text-[var(--text-primary)]">{request.blood_type} - {request.units_required} units</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-[var(--text-secondary)]" />
                        <div>
                          <p className="text-sm text-[var(--text-secondary)]">Blood Bank</p>
                          <p className="font-medium text-[var(--text-primary)]">{request.bloodbank_id?.name || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-[var(--text-secondary)]" />
                        <div>
                          <p className="text-sm text-[var(--text-secondary)]">Patient Name</p>
                          <p className="font-medium text-[var(--text-primary)]">{request.emergency_contact_name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-[var(--text-secondary)]" />
                        <div>
                          <p className="text-sm text-[var(--text-secondary)]">Hospital Location</p>
                          <p className="font-medium text-[var(--text-primary)]">{request.hospital_location}</p>
                        </div>
                      </div>
                    </div>

                    {/* Emergency Details */}
                    {request.emergency_details && (
                      <div className="mb-4 p-3 bg-[var(--background)] rounded border border-[var(--border-color)]">
                        <p className="text-sm text-[var(--text-secondary)] mb-1">Emergency Details:</p>
                        <p className="text-[var(--text-primary)]">{request.emergency_details}</p>
                      </div>
                    )}

                    {/* Blood Bank Contact (if accepted) */}
                    {request.status === 'accepted' && request.bloodbank_id && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded">
                        <h4 className="font-medium text-green-800 mb-2">📞 Blood Bank Contact Details:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-700">
                          <p><strong>Name:</strong> {request.bloodbank_id.name}</p>
                          <p><strong>Phone:</strong> {request.bloodbank_id.contact_number || 'Not provided'}</p>
                          <p><strong>Email:</strong> {request.bloodbank_id.email || 'Not provided'}</p>
                          <p className="md:col-span-2"><strong>Address:</strong> {request.bloodbank_id.address || 'Not provided'}</p>
                        </div>
                        <div className="mt-3 p-2 bg-green-100 rounded">
                          <p className="text-green-800 text-sm font-medium">
                            🚨 Action Required: Please contact the blood bank immediately to coordinate pickup or delivery.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default UserRequestsPage;

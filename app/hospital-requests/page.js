"use client"
import ProtectedRoute from '@/components/ProtectedRoute';
import { useToast } from '@/context/ToastContext';
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Heart,
  Hospital,
  Package,
  Plus,
  Send,
  User,
  XCircle
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

const HospitalRequests = () => {
  const { data: session } = useSession();
  const { success, error } = useToast();
  const [requests, setRequests] = useState([]);
  const [availableBloodBanks, setAvailableBloodBanks] = useState([]);
  const [nearestBloodBanks, setNearestBloodBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchingBloodBanks, setSearchingBloodBanks] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showBloodBankSelector, setShowBloodBankSelector] = useState(false);
  const [viewMode, setViewMode] = useState('hospital'); // 'hospital' or 'bloodbank'
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseData, setResponseData] = useState({
    action: '',
    message: ''
  });
  const [searchRadius, setSearchRadius] = useState(10);
  const [hospitalLocation, setHospitalLocation] = useState({
    latitude: null,
    longitude: null,
    address: ''
  });
  const [formData, setFormData] = useState({
    bloodbank_id: '',
    request_type: 'patient',
    blood_type: '',
    units_requested: '',
    urgency_level: 'medium',
    patient_details: {
      name: '',
      age: '',
      condition: ''
    },
    reason: '',
    search_radius: 10
  });

  useEffect(() => {
    // Hospital view only
    setViewMode('hospital');
    fetchRequests();
    getCurrentLocation();
  }, []);

  useEffect(() => {
    // Fetch requests when view mode changes
    fetchRequests();
  }, [viewMode]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setHospitalLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: 'Current Location'
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Set default location if geolocation fails
          setHospitalLocation({
            latitude: 28.6139, // Default to Delhi
            longitude: 77.2090,
            address: 'Default Location'
          });
        }
      );
    }
  };

  const searchBloodBanks = async () => {
    if (!formData.blood_type || !hospitalLocation.latitude) {
      error('Please select blood type and ensure location is available');
      return;
    }

    setSearchingBloodBanks(true);
    try {
      const response = await fetch('/api/find-bloodbanks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          blood_type: formData.blood_type,
          hospital_latitude: hospitalLocation.latitude,
          hospital_longitude: hospitalLocation.longitude,
          search_radius: searchRadius
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableBloodBanks(data.available_blood_banks || []);
        setNearestBloodBanks(data.nearest_blood_banks || []);
        setShowBloodBankSelector(true);
        
        if (data.available_blood_banks?.length > 0) {
          success(`Found ${data.available_blood_banks.length} blood banks with ${formData.blood_type} blood available`);
        } else {
          error(`No blood banks found with ${formData.blood_type} blood in ${searchRadius}km radius. Showing nearest blood banks.`);
        }
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Failed to search blood banks');
      }
    } catch (err) {
      console.error('Error searching blood banks:', err);
      error('Failed to search blood banks');
    } finally {
      setSearchingBloodBanks(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch(`/api/hospital-requests?role=${viewMode}`);
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

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    if (!formData.bloodbank_id || !formData.blood_type || !formData.units_requested || !formData.reason) {
      error('Please fill in all required fields');
      return;
    }

    if (formData.request_type === 'patient') {
      if (!formData.patient_details.name || !formData.patient_details.age || !formData.patient_details.condition) {
        error('Patient details are required for patient requests');
        return;
      }
    }

    try {
      const requestData = {
        ...formData,
        hospital_location: hospitalLocation,
        search_radius: searchRadius
      };

      const response = await fetch('/api/hospital-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        success('Blood request submitted successfully');
        setShowRequestForm(false);
        resetForm();
        fetchRequests();
      } else {
        const data = await response.json();
        error(data.error || 'Failed to submit request');
      }
    } catch (err) {
      error('Failed to submit request');
    }
  };

  const resetForm = () => {
    setFormData({
      bloodbank_id: '',
      request_type: 'patient',
      blood_type: '',
      units_requested: '',
      urgency_level: 'medium',
      patient_details: {
        name: '',
        age: '',
        condition: ''
      },
      reason: '',
      search_radius: 10
    });
    setAvailableBloodBanks([]);
    setNearestBloodBanks([]);
    setShowBloodBankSelector(false);
    setSearchRadius(10);
  };

  const selectBloodBank = (bloodBank) => {
    setFormData({
      ...formData,
      bloodbank_id: bloodBank.bloodbank_id
    });
    setShowBloodBankSelector(false);
    success(`Selected: ${bloodBank.name}`);
  };

  const handleRequestResponse = (request, action) => {
    setSelectedRequest(request);
    setResponseData({
      action,
      message: ''
    });
    setShowResponseModal(true);
  };

  const submitResponse = async () => {
    if (!selectedRequest || !responseData.action) {
      error('Invalid request or action');
      return;
    }

    try {
      const response = await fetch('/api/hospital-requests/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: selectedRequest._id,
          action: responseData.action,
          message: responseData.message
        })
      });

      if (response.ok) {
        success(`Request ${responseData.action} successfully`);
        setShowResponseModal(false);
        setSelectedRequest(null);
        setResponseData({ action: '', message: '' });
        fetchRequests();
      } else {
        const data = await response.json();
        error(data.error || 'Failed to respond to request');
      }
    } catch (err) {
      console.error('Error responding to request:', err);
      error('Failed to respond to request');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'accepted': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'fulfilled': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'accepted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'fulfilled': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 font-bold';
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
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

  return (
    <ProtectedRoute allowedRoles={['hospital']}>
      <div className="min-h-screen bg-[var(--background)] py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Hospital className="h-8 w-8 text-[#ef4444]" />
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Blood Requests</h1>
                <p className="text-[var(--text-secondary)]">Request blood units from blood banks</p>
              </div>
            </div>
            <button
              onClick={() => setShowRequestForm(true)}
              className="flex items-center space-x-2 bg-[#ef4444] text-white px-6 py-3 rounded-lg hover:bg-[#ef4444]/90 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>New Request</span>
            </button>
          </div>

          {/* Request Form Modal */}
          {showRequestForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-[var(--card-background)] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">New Blood Request</h2>
                  <button
                    onClick={() => setShowRequestForm(false)}
                    className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors"
                  >
                    <XCircle className="h-6 w-6 text-[var(--text-secondary)]" />
                  </button>
                </div>

                <form onSubmit={handleSubmitRequest} className="space-y-6">
                  {/* Location and Search Radius */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Hospital Location
                      </label>
                      <div className="text-sm text-[var(--text-secondary)] p-3 bg-[var(--background)] rounded-lg border">
                        {hospitalLocation.latitude ? 
                          `${hospitalLocation.address} (${hospitalLocation.latitude.toFixed(4)}, ${hospitalLocation.longitude.toFixed(4)})` : 
                          'Getting location...'
                        }
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Search Radius (km)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={searchRadius}
                        onChange={(e) => setSearchRadius(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg bg-[var(--card-background)] text-[var(--text-primary)]"
                      />
                    </div>
                  </div>

                  {/* Request Type */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Request Type *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, request_type: 'patient'})}
                        className={`p-4 border rounded-lg text-center transition-colors ${
                          formData.request_type === 'patient'
                            ? 'border-[#ef4444] bg-[#ef4444]/10 text-[#ef4444]'
                            : 'border-[var(--border-color)] hover:bg-[var(--background)]'
                        }`}
                      >
                        <User className="h-8 w-8 mx-auto mb-2" />
                        <div className="font-medium">Patient</div>
                        <div className="text-sm opacity-75">For patient treatment</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, request_type: 'inventory'})}
                        className={`p-4 border rounded-lg text-center transition-colors ${
                          formData.request_type === 'inventory'
                            ? 'border-[#ef4444] bg-[#ef4444]/10 text-[#ef4444]'
                            : 'border-[var(--border-color)] hover:bg-[var(--background)]'
                        }`}
                      >
                        <Package className="h-8 w-8 mx-auto mb-2" />
                        <div className="font-medium">Inventory</div>
                        <div className="text-sm opacity-75">For stock replenishment</div>
                      </button>
                    </div>
                  </div>

                  {/* Blood Type and Search */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Blood Type *
                      </label>
                      <select
                        value={formData.blood_type}
                        onChange={(e) => setFormData({...formData, blood_type: e.target.value})}
                        className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg bg-[var(--card-background)] text-[var(--text-primary)]"
                        required
                      >
                        <option value="">Select blood type</option>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Units Requested *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.units_requested}
                        onChange={(e) => setFormData({...formData, units_requested: e.target.value})}
                        className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg bg-[var(--card-background)] text-[var(--text-primary)]"
                        required
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={searchBloodBanks}
                        disabled={!formData.blood_type || searchingBloodBanks}
                        className="w-full px-4 py-3 bg-[#ef4444] text-white rounded-lg hover:bg-[#ef4444]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {searchingBloodBanks ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            Searching...
                          </>
                        ) : (
                          <>
                            <Building2 className="h-4 w-4 mr-2" />
                            Find Blood Banks
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Blood Bank Selection */}
                  {showBloodBankSelector && (
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Select Blood Bank *
                      </label>
                      
                      {/* Available Blood Banks */}
                      {availableBloodBanks.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-green-600 mb-3 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Available Blood Banks ({formData.blood_type} in stock)
                          </h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {availableBloodBanks.map((bank) => (
                              <div
                                key={bank.bloodbank_id}
                                onClick={() => selectBloodBank(bank)}
                                className={`p-3 border rounded-lg cursor-pointer hover:bg-[var(--background)] transition-colors ${
                                  formData.bloodbank_id === bank.bloodbank_id
                                    ? 'border-[#ef4444] bg-[#ef4444]/10'
                                    : 'border-[var(--border-color)]'
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium text-[var(--text-primary)]">{bank.name}</div>
                                    <div className="text-sm text-[var(--text-secondary)]">{bank.email}</div>
                                    {bank.address && (
                                      <div className="text-xs text-[var(--text-secondary)]">{bank.address}</div>
                                    )}
                                    <div className="text-xs text-green-600 font-medium">
                                      {bank.available_units} units of {formData.blood_type} available
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-medium text-[var(--text-primary)]">{bank.distance} km</div>
                                    {bank.within_radius && (
                                      <div className="text-xs text-green-600">Within radius</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Nearest Blood Banks (if no stock available) */}
                      {nearestBloodBanks.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-yellow-600 mb-3 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Nearest Blood Banks (No {formData.blood_type} in stock)
                          </h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {nearestBloodBanks.map((bank) => (
                              <div
                                key={bank.bloodbank_id}
                                onClick={() => selectBloodBank(bank)}
                                className={`p-3 border rounded-lg cursor-pointer hover:bg-[var(--background)] transition-colors ${
                                  formData.bloodbank_id === bank.bloodbank_id
                                    ? 'border-[#ef4444] bg-[#ef4444]/10'
                                    : 'border-[var(--border-color)]'
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium text-[var(--text-primary)]">{bank.name}</div>
                                    <div className="text-sm text-[var(--text-secondary)]">{bank.email}</div>
                                    {bank.address && (
                                      <div className="text-xs text-[var(--text-secondary)]">{bank.address}</div>
                                    )}
                                    <div className="text-xs text-red-600">
                                      No {formData.blood_type} currently available
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-medium text-[var(--text-primary)]">{bank.distance} km</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Urgency Level */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Urgency Level
                    </label>
                    <select
                      value={formData.urgency_level}
                      onChange={(e) => setFormData({...formData, urgency_level: e.target.value})}
                      className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg bg-[var(--card-background)] text-[var(--text-primary)]"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  {/* Patient Details (conditional) */}
                  {formData.request_type === 'patient' && (
                    <div className="space-y-4 p-4 bg-[var(--background)] rounded-lg border border-[var(--border-color)]">
                      <h3 className="font-medium text-[var(--text-primary)]">Patient Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                            Patient Name *
                          </label>
                          <input
                            type="text"
                            value={formData.patient_details.name}
                            onChange={(e) => setFormData({
                              ...formData,
                              patient_details: {...formData.patient_details, name: e.target.value}
                            })}
                            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--card-background)] text-[var(--text-primary)]"
                            required={formData.request_type === 'patient'}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                            Age *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={formData.patient_details.age}
                            onChange={(e) => setFormData({
                              ...formData,
                              patient_details: {...formData.patient_details, age: e.target.value}
                            })}
                            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--card-background)] text-[var(--text-primary)]"
                            required={formData.request_type === 'patient'}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                          Medical Condition *
                        </label>
                        <input
                          type="text"
                          value={formData.patient_details.condition}
                          onChange={(e) => setFormData({
                            ...formData,
                            patient_details: {...formData.patient_details, condition: e.target.value}
                          })}
                          className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--card-background)] text-[var(--text-primary)]"
                          placeholder="e.g., Surgery, Accident, Cancer treatment"
                          required={formData.request_type === 'patient'}
                        />
                      </div>
                    </div>
                  )}

                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Reason for Request *
                    </label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) => setFormData({...formData, reason: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg bg-[var(--card-background)] text-[var(--text-primary)]"
                      placeholder="Provide detailed reason for the blood request..."
                      required
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center space-x-2 bg-[#ef4444] text-white px-6 py-3 rounded-lg hover:bg-[#ef4444]/90 transition-colors"
                    >
                      <Send className="h-5 w-5" />
                      <span>Submit Request</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRequestForm(false)}
                      className="px-6 py-3 border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--background)] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Requests List */}
          <div className="bg-[var(--card-background)] rounded-lg border border-[var(--border-color)]">
            <div className="p-6 border-b border-[var(--border-color)]">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Your Blood Requests</h2>
              <p className="text-[var(--text-secondary)] mt-1">Track your submitted blood requests</p>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ef4444]"></div>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-[var(--text-secondary)] mx-auto mb-4" />
                  <p className="text-[var(--text-secondary)] text-lg">No blood requests yet</p>
                  <p className="text-[var(--text-secondary)] text-sm mt-2">
                    Submit your first blood request to get started
                  </p>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead className="bg-[var(--background)]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Request Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Blood Bank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Type & Urgency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {requests.map((request) => (
                      <tr key={request._id} className="hover:bg-[var(--background)]">
                        <td className="px-6 py-4">
                          <div>
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-[#ef4444] rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {request.blood_type}
                              </div>
                              <div>
                                <div className="font-medium text-[var(--text-primary)]">
                                  {request.blood_type} - {request.units_requested} units
                                </div>
                                {request.patient_details && (
                                  <div className="text-sm text-[var(--text-secondary)]">
                                    Patient: {request.patient_details.name}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-[var(--text-secondary)]" />
                            <span className="text-[var(--text-primary)]">{request.bloodbank_id?.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1">
                              {request.request_type === 'patient' ? 
                                <User className="h-4 w-4" /> : 
                                <Package className="h-4 w-4" />
                              }
                              <span className="text-sm text-[var(--text-primary)] capitalize">
                                {request.request_type}
                              </span>
                            </div>
                            <div className={`text-sm capitalize ${getUrgencyColor(request.urgency_level)}`}>
                              {request.urgency_level}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              {getStatusIcon(request.status)}
                              <span className="ml-1 capitalize">{request.status}</span>
                            </span>
                            {request.response_message && (
                              <div className="text-sm text-[var(--text-secondary)] max-w-xs">
                                {request.response_message}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(request.created_at)}</span>
                          </div>
                          {request.responded_at && (
                            <div className="text-xs text-[var(--text-secondary)] mt-1">
                              Responded: {formatDate(request.responded_at)}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default HospitalRequests;

"use client"
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Heart, 
  Calendar, 
  Activity, 
  Award, 
  Bell, 
  Settings, 
  Users, 
  User,
  Clock, 
  Phone, 
  Mail, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Navigation,
  MapPin
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

const DonorDashboard = () => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [donationDrives, setDonationDrives] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [criticalSettings, setCriticalSettings] = useState({
    is_critical_ready: false,
    current_location: { coordinates: [0, 0] }
  });
  const [loading, setLoading] = useState(true);


  // Fetch data on component mount
  useEffect(() => {
    if (session?.user) {
      fetchInitialData();
    }
  }, [session?.user]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDonationDrives(),
        fetchCriticalSettings(),
        fetchIncomingRequests()
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDonationDrives = async () => {
    try {
      const response = await fetch('/api/drives?future_only=true');
      if (response.ok) {
        const data = await response.json();
        setDonationDrives(data.drives || []);
      }
    } catch (error) {
      console.error('Error fetching donation drives:', error);
    }
  };

  const fetchCriticalSettings = async () => {
    try {
      const response = await fetch('/api/donors/critical-settings');
      
      if (response.ok) {
        const data = await response.json();
        setCriticalSettings({
          is_critical_ready: data.is_critical_ready || false,
          current_location: data.current_location || { coordinates: [0, 0] }
        });
      } else {
        console.error('Failed to fetch critical settings:', response.status, response.statusText);
        // Set default values if API fails
        setCriticalSettings({
          is_critical_ready: false,
          current_location: { coordinates: [0, 0] }
        });
      }
    } catch (error) {
      console.error('Error fetching critical settings:', error);
      // Set default values if API fails
      setCriticalSettings({
        is_critical_ready: false,
        current_location: { coordinates: [0, 0] }
      });
    }
  };

  const fetchIncomingRequests = async () => {
    try {
      const response = await fetch('/api/donors/incoming-requests');
      if (response.ok) {
        const data = await response.json();
        setIncomingRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching incoming requests:', error);
    }
  };



  const updateCriticalSettings = async (updates) => {
    try {
      const response = await fetch('/api/donors/critical-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update state with the response from server to ensure consistency
        setCriticalSettings(prev => ({ 
          ...prev, 
          is_critical_ready: data.is_critical_ready,
          current_location: data.current_location || prev.current_location
        }));
      } else {
        console.error('Failed to update settings:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error updating critical settings:', error);
    }
  };

  const participateInDrive = async (driveId) => {
    try {
      const response = await fetch('/api/drives/participate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drive_id: driveId })
      });
      
      if (response.ok) {
        alert('Successfully registered for the donation drive!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to register for drive');
      }
    } catch (error) {
      console.error('Error participating in drive:', error);
      alert('Failed to register for drive');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['user']}>
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ef4444] mx-auto"></div>
            <p className="mt-4 text-[var(--text-secondary)]">Loading dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['user']}>
      <div className="min-h-screen bg-[var(--background)] py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Heart className="h-8 w-8 text-[#ef4444]" />
                  <h1 className="text-3xl font-bold text-[var(--text-primary)]">Donor Dashboard</h1>
                </div>
                <p className="text-[var(--text-secondary)]">Welcome back, {session?.user?.name || session?.user?.email}!</p>
              </div>
              
              {/* Critical Service Status */}
              <div className="flex items-center space-x-2">
                <div className={`px-3 py-2 rounded-lg border ${criticalSettings.is_critical_ready 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${criticalSettings.is_critical_ready ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-sm font-medium">
                      {criticalSettings.is_critical_ready ? 'Available for Emergency' : 'Emergency Service Off'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="flex space-x-1 bg-[var(--card-background)] p-1 rounded-lg border border-[var(--border-color)]">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'drives', label: 'Donation Drives', icon: Users },
                { id: 'requests', label: 'Incoming Requests', icon: Bell },
                { id: 'settings', label: 'Emergency Settings', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#ef4444] text-white'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background)]'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="font-medium">{tab.label}</span>
                  {tab.id === 'requests' && incomingRequests.length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {incomingRequests.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && <OverviewTab criticalSettings={criticalSettings} />}
          {activeTab === 'drives' && <DrivesTab drives={donationDrives} onParticipate={participateInDrive} />}
          {activeTab === 'requests' && <RequestsTab requests={incomingRequests} criticalSettings={criticalSettings} />}
          {activeTab === 'settings' && (
            <SettingsTab 
              settings={criticalSettings} 
              onUpdateSettings={updateCriticalSettings}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

// Overview Tab Component
const OverviewTab = ({ criticalSettings }) => (
  <div className="space-y-8">
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Total Donations</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">0</p>
          </div>
          <Heart className="h-8 w-8 text-[#ef4444]" />
        </div>
      </div>
      
      <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Lives Saved</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">0</p>
          </div>
          <Award className="h-8 w-8 text-[#ef4444]" />
        </div>
      </div>
      
      <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Next Eligible</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">Now</p>
          </div>
          <Calendar className="h-8 w-8 text-[#ef4444]" />
        </div>
      </div>
    </div>

    {/* Main Content */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Recent Activity */}
      <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Recent Activity
        </h2>
        <div className="text-center py-8">
          <p className="text-[var(--text-secondary)]">No recent activity</p>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Start by scheduling your first donation!
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h2>
        <div className="space-y-3">
          <button className="w-full text-left p-4 bg-[#ef4444] text-white rounded-lg hover:bg-[#ef4444]/90 transition-colors">
            <div className="flex items-center">
              <Heart className="h-5 w-5 mr-3" />
              <div>
                <div className="font-medium">Schedule Donation</div>
                <div className="text-sm opacity-90">Book your next blood donation</div>
              </div>
            </div>
          </button>
          
          <button className="w-full text-left p-4 bg-[var(--background)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--card-background)] transition-colors">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-3 text-[var(--text-secondary)]" />
              <div>
                <div className="font-medium text-[var(--text-primary)]">View History</div>
                <div className="text-sm text-[var(--text-secondary)]">See your donation history</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Donation Drives Tab Component
const DrivesTab = ({ drives, onParticipate }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Available Donation Drives</h2>
      <div className="text-sm text-[var(--text-secondary)]">
        {drives.length} active drive{drives.length !== 1 ? 's' : ''}
      </div>
    </div>

    {drives.length === 0 ? (
      <div className="text-center py-12 bg-[var(--card-background)] rounded-lg border border-[var(--border-color)]">
        <Users className="h-16 w-16 text-[var(--text-secondary)] mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No Active Drives</h3>
        <p className="text-[var(--text-secondary)]">
          There are no active donation drives at the moment. Check back later!
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {drives.map(drive => (
          <div key={drive._id} className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)] hover:shadow-lg transition-shadow">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{drive.title}</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-3">{drive.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-[var(--text-secondary)]" />
                  <span className="text-[var(--text-primary)]">{drive.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-[var(--text-secondary)]" />
                  <span className="text-[var(--text-primary)]">
                    {new Date(drive.date).toLocaleDateString()} | {drive.start_time} - {drive.end_time}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-[var(--text-secondary)]" />
                  <span className="text-[var(--text-primary)]">{drive.contact_number}</span>
                </div>
              </div>

              {drive.required_blood_types && drive.required_blood_types.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-[var(--text-secondary)] mb-1">Required Blood Types:</p>
                  <div className="flex flex-wrap gap-1">
                    {drive.required_blood_types.map(type => (
                      <span key={type} className="px-2 py-1 bg-[#ef4444] text-white text-xs rounded-full">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-[var(--text-secondary)]">
                Organized by {drive.organizer_id?.name || 'Unknown'}
              </div>
              <button
                onClick={() => onParticipate(drive._id)}
                className="bg-[#ef4444] hover:bg-[#ef4444]/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Participate
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Incoming Requests Tab Component
const RequestsTab = ({ requests, criticalSettings }) => {
  const [responding, setResponding] = useState(false);

  const handleResponseToRequest = async (requestId, requestType, action) => {
    setResponding(true);
    try {
      if (requestType === 'donor_contact_request') {
        const response = await fetch('/api/donor-contact-request/respond', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            requestId: requestId, 
            action: action // 'accept' or 'reject'
          })
        });
        
        if (response.ok) {
          alert(`Request ${action}ed successfully!`);
          // Refresh the requests list
          window.location.reload();
        } else {
          const error = await response.json();
          alert(error.error || `Failed to ${action} request`);
        }
      } else {
        // Handle other request types (emergency, hospital, etc.)
        alert('Emergency response feature coming soon!');
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      alert(`Failed to ${action} request`);
    } finally {
      setResponding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Incoming Requests</h2>
        <div className={`px-3 py-1 rounded-full text-sm ${criticalSettings.is_critical_ready 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-600'}`}>
          {criticalSettings.is_critical_ready ? 'Emergency Service ON' : 'Emergency Service OFF'}
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-[var(--card-background)] rounded-lg border border-[var(--border-color)]">
          <Bell className="h-16 w-16 text-[var(--text-secondary)] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No Incoming Requests</h3>
          <p className="text-[var(--text-secondary)]">
            {!criticalSettings.is_critical_ready 
              ? "Enable emergency service in settings to receive urgent blood requests near your location."
              : "Great! There are no requests at the moment."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(request => (
            <div 
              key={request._id} 
              className={`bg-[var(--card-background)] p-6 rounded-lg border-l-4 border border-[var(--border-color)] ${
                request.type === 'donor_contact_request' 
                  ? 'border-l-blue-500' 
                  : request.urgency === 'critical' 
                    ? 'border-l-red-500' 
                    : 'border-l-orange-500'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {request.type === 'donor_contact_request' ? (
                    <User className="h-5 w-5 text-blue-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    request.urgency === 'critical' 
                      ? 'bg-red-100 text-red-800' 
                      : request.urgency === 'high'
                        ? 'bg-orange-100 text-orange-800'
                        : request.urgency === 'urgent'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                  }`}>
                    {request.urgency.toUpperCase()}
                  </span>
                  {request.type === 'donor_contact_request' && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                      Direct Request
                    </span>
                  )}
                </div>
                <div className="text-right">
                  {request.distance > 0 && (
                    <div className="flex items-center space-x-1 text-sm text-[var(--text-secondary)]">
                      <Navigation className="h-4 w-4" />
                      <span>{request.distance}km away</span>
                    </div>
                  )}
                  <div className="text-xs text-[var(--text-secondary)]">
                    {new Date(request.created_at).toLocaleString()}
                  </div>
                  {request.expires_at && (
                    <div className="text-xs text-red-500">
                      Expires: {new Date(request.expires_at).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">Request Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Blood Type:</strong> <span className="text-[#ef4444] font-bold">{request.blood_type}</span></p>
                    {request.units_needed && <p><strong>Units Needed:</strong> {request.units_needed}</p>}
                    {request.patient_name && <p><strong>Patient:</strong> {request.patient_name}</p>}
                    {request.hospital_name && <p><strong>Hospital:</strong> {request.hospital_name}</p>}
                    {request.requester_name && <p><strong>Requested by:</strong> {request.requester_name}</p>}
                    {request.requester_role && (
                      <p><strong>Role:</strong> 
                        <span className={`ml-1 px-2 py-1 rounded text-xs ${
                          request.requester_role === 'bloodbank' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {request.requester_role}
                        </span>
                      </p>
                    )}
                    {request.location && <p><strong>Location:</strong> {request.location}</p>}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">Contact & Actions</h4>
                  <div className="space-y-2 text-sm">
                    {request.contact_email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-[var(--text-secondary)]" />
                        <span>{request.contact_email}</span>
                      </div>
                    )}
                    
                    {request.type === 'donor_contact_request' ? (
                      <div className="space-y-2 mt-3">
                        <button
                          onClick={() => handleResponseToRequest(request._id, request.type, 'accept')}
                          disabled={responding}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full disabled:opacity-50"
                        >
                          {responding ? 'Processing...' : 'Accept Request'}
                        </button>
                        <button
                          onClick={() => handleResponseToRequest(request._id, request.type, 'reject')}
                          disabled={responding}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full disabled:opacity-50"
                        >
                          {responding ? 'Processing...' : 'Reject Request'}
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleResponseToRequest(request._id, request.type, 'respond')}
                        className="bg-[#ef4444] hover:bg-[#ef4444]/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full"
                      >
                        Respond to Emergency
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {request.message && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Message:</strong> {request.message}
                  </p>
                </div>
              )}

              {request.emergency_details && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-800">
                    <strong>Emergency Details:</strong> {request.emergency_details}
                  </p>
                </div>
              )}

              {request.patient_condition && (
                <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded">
                  <p className="text-sm text-orange-800">
                    <strong>Patient Condition:</strong> {request.patient_condition}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Settings Tab Component (With Location)
const SettingsTab = ({ settings, onUpdateSettings }) => {
  const [isReady, setIsReady] = useState(settings.is_critical_ready || false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Update local state when settings change
  useEffect(() => {
    setIsReady(settings.is_critical_ready || false);
  }, [settings.is_critical_ready]);

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            coordinates: [position.coords.longitude, position.coords.latitude]
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  const handleReadyToggle = async (e) => {
    // Prevent the checkbox from being unchecked if already enabled
    if (isReady) {
      e.preventDefault();
      return;
    }
    
    if (isUpdating) {
      e.preventDefault();
      return;
    }
    
    const newValue = e.target.checked;
    
    // Only allow enabling, not disabling
    if (newValue && !isReady) {
      const confirmed = window.confirm(
        "⚠️ IMPORTANT COMMITMENT ⚠️\n\n" +
        "By enabling Emergency Service, you are making a commitment to help save lives during critical situations.\n\n" +
        "• You will receive urgent blood request notifications\n" +
        "• You must respond promptly to emergency calls\n" +
        "• Once enabled, this service CANNOT be disabled\n" +
        "• Your location will be shared for emergency coordination\n\n" +
        "Are you ready to make this life-saving commitment?"
      );
      
      if (!confirmed) {
        e.preventDefault();
        return; // User cancelled
      }
    } else {
      // Prevent any attempt to disable
      e.preventDefault();
      return;
    }
    
    setIsUpdating(true);
    
    try {
      let updateData = { is_critical_ready: newValue };
      
      // If enabling emergency service, get location first
      if (newValue) {
        setGettingLocation(true);
        try {
          const location = await getCurrentLocation();
          updateData.current_location = location;
          console.log('Location obtained:', location);
        } catch (locationError) {
          console.error('Failed to get location:', locationError);
          // Continue anyway, but show a warning
          alert('Warning: Could not get your location. Emergency service will be enabled without precise location data.');
        } finally {
          setGettingLocation(false);
        }
      }
      
      setIsReady(newValue);
      await onUpdateSettings(updateData);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Emergency Service Settings</h2>

      <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Critical Service Availability</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-[var(--text-primary)]">Emergency Response Status</h4>
              <p className="text-sm text-[var(--text-secondary)]">
                {isReady ? 
                  "✅ You are committed to emergency response (permanent)" : 
                  "Enable to receive urgent blood request notifications"
                }
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="emergencyService"
                checked={isReady}
                onChange={handleReadyToggle}
                disabled={isUpdating || gettingLocation || isReady}
                className={`h-5 w-5 rounded border-2 transition-colors ${
                  isReady 
                    ? 'bg-green-500 border-green-500 text-white cursor-not-allowed' 
                    : 'border-gray-300 hover:border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                } ${(isUpdating || gettingLocation) ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <label 
                htmlFor="emergencyService" 
                className={`text-sm font-medium ${
                  isReady ? 'text-green-600 cursor-not-allowed' : 'text-gray-700 cursor-pointer'
                }`}
              >
                {isReady ? 'Emergency Service Active ✅' : 'Enable Emergency Service'}
              </label>
            </div>
          </div>

          {!isReady && !gettingLocation && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-800">⚠️ Important Commitment</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    Emergency service is a <strong>permanent commitment</strong>. Once enabled, it cannot be turned off. 
                    You will be responsible for responding to life-threatening blood requests in your area.
                  </p>
                </div>
              </div>
            </div>
          )}

          {gettingLocation && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <div>
                  <h4 className="font-medium text-blue-800">Getting Your Location...</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Please allow location access to enable emergency service.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isReady && !gettingLocation && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-800">Emergency Service Active</h4>
                  <p className="text-sm text-green-700 mt-1">
                    You will receive notifications for critical blood requests. Make sure to respond promptly to help save lives!
                  </p>
                  {settings.current_location?.coordinates[0] !== 0 && settings.current_location?.coordinates[1] !== 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      📍 Location: {settings.current_location.coordinates[1].toFixed(4)}°, {settings.current_location.coordinates[0].toFixed(4)}°
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Important Information</h4>
            <p className="text-sm text-yellow-700 mt-1">
              When emergency service is enabled, you may receive critical blood request notifications. 
              These requests are time-sensitive and could help save lives. Please ensure you are available 
              to respond promptly when this service is active.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;

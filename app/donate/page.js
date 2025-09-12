'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Heart,
  Search,
  Filter,
  Droplet,
  CheckCircle,
  AlertCircle,
  Phone,
  Navigation
} from 'lucide-react';

export default function DonatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [drives, setDrives] = useState([]);
  const [filteredDrives, setFilteredDrives] = useState([]);
  const [registeredDrives, setRegisteredDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [registering, setRegistering] = useState(null);
  const [message, setMessage] = useState('');

  // Blood type options
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/login');
    
    if (session?.user?.role !== 'user') {
      router.push('/dashboard');
      return;
    }

    fetchDrives();
    fetchRegisteredDrives();
    getUserLocation();
  }, [session, status, router]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log("Location access denied or unavailable");
        }
      );
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const fetchDrives = async () => {
    try {
      const response = await fetch('/api/drives');
      if (response.ok) {
        const data = await response.json();
        setDrives(data.drives || []);
        setFilteredDrives(data.drives || []);
      }
    } catch (error) {
      console.error('Error fetching drives:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegisteredDrives = async () => {
    try {
      const response = await fetch('/api/donors/registered-drives');
      if (response.ok) {
        const data = await response.json();
        setRegisteredDrives(data.registrations?.map(reg => reg.drive_id._id) || []);
      }
    } catch (error) {
      console.error('Error fetching registered drives:', error);
    }
  };

  const handleRegister = async (driveId) => {
    setRegistering(driveId);
    try {
      const response = await fetch('/api/drives/participate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ drive_id: driveId }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Successfully registered for the donation drive!');
        setRegisteredDrives(prev => [...prev, driveId]);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Failed to register');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Error registering for drive');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setRegistering(null);
    }
  };

  // Filter drives based on search and filters
  useEffect(() => {
    let filtered = [...drives];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(drive =>
        drive.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drive.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drive.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Location filter
    if (locationFilter) {
      filtered = filtered.filter(drive =>
        drive.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Blood type filter
    if (bloodTypeFilter) {
      filtered = filtered.filter(drive =>
        drive.required_blood_types.length === 0 || 
        drive.required_blood_types.includes(bloodTypeFilter)
      );
    }

    // Date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(drive => {
        const driveDate = new Date(drive.date);
        return driveDate.toDateString() === filterDate.toDateString();
      });
    }

    // Sort by proximity if user location is available
    if (userLocation) {
      filtered.sort((a, b) => {
        // For now, we'll sort alphabetically by location
        // In a real app, you'd have latitude/longitude for each drive
        return a.location.localeCompare(b.location);
      });
    }

    setFilteredDrives(filtered);
  }, [drives, searchTerm, locationFilter, bloodTypeFilter, dateFilter, userLocation]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes));
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isUpcoming = (date) => {
    return new Date(date) > new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading donation drives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
            Donate Blood, Save Lives
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Join upcoming donation drives in your area and make a difference in someone's life. 
            Every donation can save up to 3 lives.
          </p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 max-w-md mx-auto ${
            message.includes('Success') 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.includes('Success') ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{message}</span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-[var(--bg-secondary)] rounded-lg p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Search drives..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-[var(--bg-primary)] text-[var(--text-primary)]"
              />
            </div>

            {/* Location Filter */}
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-[var(--bg-primary)] text-[var(--text-primary)]"
              />
            </div>

            {/* Blood Type Filter */}
            <div className="relative">
              <Droplet className="absolute left-3 top-3 h-4 w-4 text-[var(--text-secondary)]" />
              <select
                value={bloodTypeFilter}
                onChange={(e) => setBloodTypeFilter(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-[var(--bg-primary)] text-[var(--text-primary)] appearance-none"
              >
                <option value="">All Blood Types</option>
                {bloodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-[var(--text-secondary)]" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-[var(--bg-primary)] text-[var(--text-primary)]"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || locationFilter || bloodTypeFilter || dateFilter) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setLocationFilter('');
                  setBloodTypeFilter('');
                  setDateFilter('');
                }}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Drives Grid */}
        {filteredDrives.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-[var(--text-secondary)] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              No donation drives found
            </h3>
            <p className="text-[var(--text-secondary)] mb-4">
              {drives.length === 0 
                ? "There are no upcoming donation drives at the moment."
                : "Try adjusting your filters to find drives that match your criteria."
              }
            </p>
            {drives.length === 0 && (
              <button
                onClick={fetchDrives}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Refresh
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrives.map((drive) => {
              const isRegistered = registeredDrives.includes(drive._id);
              const upcoming = isUpcoming(drive.date);
              
              return (
                <div
                  key={drive._id}
                  className="bg-[var(--bg-secondary)] rounded-lg p-6 shadow-sm border border-[var(--border)] hover:shadow-md transition-shadow"
                >
                  {/* Drive Header */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-[var(--text-primary)] line-clamp-2">
                      {drive.title}
                    </h3>
                    {isRegistered && (
                      <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 ml-2" />
                    )}
                  </div>

                  {/* Drive Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-[var(--text-secondary)] mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-[var(--text-secondary)]">{drive.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[var(--text-secondary)] flex-shrink-0" />
                      <span className="text-sm text-[var(--text-secondary)]">
                        {formatDate(drive.date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[var(--text-secondary)] flex-shrink-0" />
                      <span className="text-sm text-[var(--text-secondary)]">
                        {formatTime(drive.start_time)} - {formatTime(drive.end_time)}
                      </span>
                    </div>

                    {drive.contact_number && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-[var(--text-secondary)] flex-shrink-0" />
                        <span className="text-sm text-[var(--text-secondary)]">
                          {drive.contact_number}
                        </span>
                      </div>
                    )}

                    {drive.required_blood_types && drive.required_blood_types.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Droplet className="h-4 w-4 text-[var(--text-secondary)] mt-0.5 flex-shrink-0" />
                        <div className="flex flex-wrap gap-1">
                          {drive.required_blood_types.map((type) => (
                            <span
                              key={type}
                              className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-[var(--text-secondary)] mb-6 line-clamp-3">
                    {drive.description}
                  </p>

                  {/* Action Button */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[var(--text-secondary)]">
                      by {drive.organizer_id?.name || 'Blood Bank'}
                    </span>
                    
                    {!upcoming ? (
                      <span className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium">
                        Past Event
                      </span>
                    ) : isRegistered ? (
                      <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Registered
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRegister(drive._id)}
                        disabled={registering === drive._id}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {registering === drive._id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Registering...
                          </>
                        ) : (
                          <>
                            <Heart className="h-4 w-4" />
                            Register
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Location Permission Banner */}
        {!userLocation && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Navigation className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  Find drives near you
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  Allow location access to see donation drives sorted by proximity to your location.
                </p>
                <button
                  onClick={getUserLocation}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Enable Location
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
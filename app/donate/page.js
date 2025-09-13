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
  Navigation,
  Star,
  Award,
  TrendingUp,
  UserCheck,
  Building,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Activity,
  Target
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
  const [activeTab, setActiveTab] = useState('all'); // all, upcoming, registered
  const [viewMode, setViewMode] = useState('grid'); // grid, list

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
        setMessage('🎉 Successfully registered for the donation drive!');
        setRegisteredDrives(prev => [...prev, driveId]);
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage(data.error || 'Failed to register');
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      setMessage('Error registering for drive');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setRegistering(null);
    }
  };

  // Filter drives based on search, filters, and active tab
  useEffect(() => {
    let filtered = [...drives];

    // Tab filtering
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(drive => new Date(drive.date) >= new Date());
    } else if (activeTab === 'registered') {
      filtered = filtered.filter(drive => registeredDrives.includes(drive._id));
    }

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

    // Sort by proximity if user location is available, otherwise by date
    if (userLocation) {
      filtered.sort((a, b) => a.location.localeCompare(b.location));
    } else {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    setFilteredDrives(filtered);
  }, [drives, searchTerm, locationFilter, bloodTypeFilter, dateFilter, userLocation, activeTab, registeredDrives]);

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

  const getDaysUntil = (date) => {
    const driveDate = new Date(date);
    const today = new Date();
    const diffTime = driveDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)] text-lg font-medium">Finding donation drives for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full mb-6 shadow-lg">
            <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-red-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mb-4 leading-tight">
            Save Lives Through
            <span className="text-red-600 block">Blood Donation</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed px-4">
            Join our community of life-savers. Every donation can save up to 3 lives. 
            Find donation drives near you and make a difference today.
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-10 max-w-4xl mx-auto px-4">
            <div className="bg-[var(--card-background)] rounded-2xl p-4 sm:p-6 shadow-lg border border-[var(--border-color)] hover:shadow-xl transition-all duration-300">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg mb-3 sm:mb-4">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{drives.filter(d => isUpcoming(d.date)).length}</h3>
              <p className="text-[var(--text-secondary)] text-sm sm:text-base">Active Drives</p>
            </div>
            <div className="bg-[var(--card-background)] rounded-2xl p-4 sm:p-6 shadow-lg border border-[var(--border-color)] hover:shadow-xl transition-all duration-300">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg mb-3 sm:mb-4">
                <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{registeredDrives.length}</h3>
              <p className="text-[var(--text-secondary)] text-sm sm:text-base">Your Registrations</p>
            </div>
            <div className="bg-[var(--card-background)] rounded-2xl p-4 sm:p-6 shadow-lg border border-[var(--border-color)] hover:shadow-xl transition-all duration-300 sm:col-span-2 lg:col-span-1">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg mb-3 sm:mb-4">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">3</h3>
              <p className="text-[var(--text-secondary)] text-sm sm:text-base">Lives Per Donation</p>
            </div>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 max-w-2xl mx-auto ${
            message.includes('Success') || message.includes('🎉')
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.includes('Success') || message.includes('🎉') ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span className="font-medium">{message}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div className="flex bg-[var(--card-background)] rounded-xl p-1 shadow-lg border border-[var(--border-color)] mb-4 md:mb-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background)]'
              }`}
            >
              All Drives ({drives.length})
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background)]'
              }`}
            >
              Upcoming ({drives.filter(d => isUpcoming(d.date)).length})
            </button>
            <button
              onClick={() => setActiveTab('registered')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'registered'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background)]'
              }`}
            >
              My Registrations ({registeredDrives.length})
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-[var(--card-background)] rounded-lg p-1 shadow-md border border-[var(--border-color)]">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-[var(--background)] text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md transition-all ${
                viewMode === 'list'
                  ? 'bg-[var(--background)] text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              List
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="bg-[var(--card-background)] rounded-2xl p-6 shadow-lg border border-[var(--border-color)] mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Search drives..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-[var(--background)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] transition-all"
              />
            </div>

            {/* Location Filter */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-[var(--background)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] transition-all"
              />
            </div>

            {/* Blood Type Filter */}
            <div className="relative">
              <Droplet className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)]" />
              <select
                value={bloodTypeFilter}
                onChange={(e) => setBloodTypeFilter(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-[var(--background)] text-[var(--text-primary)] appearance-none transition-all"
              >
                <option value="">All Blood Types</option>
                {bloodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)]" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-[var(--background)] text-[var(--text-primary)] transition-all"
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
                className="text-sm text-red-600 hover:text-red-700 font-medium bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition-all"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Drives Display */}
        {filteredDrives.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-[var(--background)] border border-[var(--border-color)] rounded-full mb-6">
              <Heart className="h-12 w-12 text-[var(--text-secondary)]" />
            </div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
              No donation drives found
            </h3>
            <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
              {drives.length === 0 
                ? "There are no upcoming donation drives at the moment. Check back soon!"
                : "Try adjusting your filters to find drives that match your criteria."
              }
            </p>
            {drives.length === 0 && (
              <button
                onClick={fetchDrives}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl transition-all font-medium shadow-lg"
              >
                Refresh Drives
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : 
            "space-y-6"
          }>
            {filteredDrives.map((drive) => {
              const isRegistered = registeredDrives.includes(drive._id);
              const upcoming = isUpcoming(drive.date);
              const daysUntil = getDaysUntil(drive.date);
              
              return (
                <div
                  key={drive._id}
                  className={`bg-[var(--card-background)] rounded-2xl shadow-lg border border-[var(--border-color)] overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                    viewMode === 'list' ? 'flex items-center' : ''
                  }`}
                >
                  {/* Drive Content */}
                  <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 line-clamp-2">
                          {drive.title}
                        </h3>
                        <div className="flex items-center gap-3 mb-3">
                          {upcoming && daysUntil <= 3 && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 border border-red-200">
                              {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days left`}
                            </span>
                          )}
                          {isRegistered && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 border border-green-200">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Registered
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Drive Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-[var(--text-secondary)]">
                        <Calendar className="h-5 w-5 mr-3 flex-shrink-0 text-red-600" />
                        <span className="font-medium">{formatDate(drive.date)}</span>
                      </div>
                      <div className="flex items-center text-[var(--text-secondary)]">
                        <Clock className="h-5 w-5 mr-3 flex-shrink-0 text-red-600" />
                        <span>{formatTime(drive.start_time)} - {formatTime(drive.end_time)}</span>
                      </div>
                      <div className="flex items-center text-[var(--text-secondary)]">
                        <MapPin className="h-5 w-5 mr-3 flex-shrink-0 text-red-600" />
                        <span className="line-clamp-1">{drive.location}</span>
                      </div>
                      <div className="flex items-center text-[var(--text-secondary)]">
                        <Phone className="h-5 w-5 mr-3 flex-shrink-0 text-red-600" />
                        <span>{drive.contact_number}</span>
                      </div>
                      <div className="flex items-center text-[var(--text-secondary)]">
                        <Building className="h-5 w-5 mr-3 flex-shrink-0 text-red-600" />
                        <span>{drive.organizer_id?.name || 'Blood Bank'}</span>
                      </div>
                    </div>

                    {/* Blood Types */}
                    {drive.required_blood_types && drive.required_blood_types.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center mb-2">
                          <Droplet className="h-4 w-4 mr-2 text-red-600" />
                          <span className="text-sm font-medium text-[var(--text-primary)]">Required Blood Types:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {drive.required_blood_types.map((type) => (
                            <span
                              key={type}
                              className="px-3 py-1 bg-red-50 text-red-700 text-sm font-medium rounded-full border border-red-200"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-[var(--text-secondary)] mb-6 line-clamp-3 leading-relaxed">
                      {drive.description}
                    </p>

                    {/* Action Button */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[var(--text-secondary)]">
                        by {drive.organizer_id?.name || 'Blood Bank'}
                      </span>
                      
                      {!upcoming ? (
                        <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-[var(--background)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                          Past Event
                        </span>
                      ) : isRegistered ? (
                        <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-green-100 text-green-700 border border-green-200">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Registered ✓
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRegister(drive._id)}
                          disabled={registering === drive._id}
                          className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                        >
                          {registering === drive._id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                              Registering...
                            </>
                          ) : (
                            <>
                              <Heart className="h-4 w-4 mr-2" />
                              Register Now
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Location Permission Banner */}
        {!userLocation && (
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Navigation className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-blue-900 mb-2">
                  🎯 Find drives near you
                </h4>
                <p className="text-blue-700 mb-4 leading-relaxed">
                  Enable location access to see donation drives sorted by proximity to your location. 
                  We will help you find the most convenient drives in your area.
                </p>
                <button
                  onClick={getUserLocation}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all shadow-lg transform hover:scale-105"
                >
                  📍 Enable Location
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl p-8 text-center text-white">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-6">
              <Heart className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Ready to Save Lives?</h2>
            <p className="text-xl text-red-100 mb-6 leading-relaxed">
              Every blood donation can save up to 3 lives. Join thousands of heroes 
              who are making a difference in their communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setActiveTab('upcoming')}
                className="bg-white text-red-600 px-8 py-3 rounded-xl font-semibold hover:bg-red-50 transition-all shadow-lg transform hover:scale-105"
              >
                View Upcoming Drives
              </button>
              <button
                onClick={() => window.open('/learn-more', '_blank')}
                className="bg-red-700 text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-800 transition-all border-2 border-red-500 transform hover:scale-105"
              >
                Learn More About Donation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
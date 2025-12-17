"use client"
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from '@/context/ThemeContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Users, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  User,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Activity,
  UserCheck,
  Target,
  Award,
  ChevronRight,
  Star,
  Heart,
  Droplet
} from 'lucide-react';

export default function BloodbankDrives() {
  const { data: session } = useSession();
  const { isDarkMode } = useTheme();
  const [drives, setDrives] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [expandedDrive, setExpandedDrive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [statistics, setStatistics] = useState({
    totalDrives: 0,
    activeDrives: 0,
    totalRegistrations: 0,
    completedDrives: 0
  });
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    start_time: '',
    end_time: '',
    required_blood_types: [],
    contact_number: ''
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const response = await fetch('/api/bloodbank/drives');
      if (response.ok) {
        const data = await response.json();
        setDrives(data.drives || []);
        
        // Calculate statistics
        const total = data.drives?.length || 0;
        const active = data.drives?.filter(drive => new Date(drive.date) >= new Date()).length || 0;
        const completed = total - active;
        
        setStatistics({
          totalDrives: total,
          activeDrives: active,
          totalRegistrations: 0, // Will be updated when we fetch registrations
          completedDrives: completed
        });
        
        // Fetch registration counts for each drive
        await fetchRegistrationCounts(data.drives || []);
      }
    } catch (error) {
      console.error('Error fetching drives:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrationCounts = async (drivesList) => {
    let totalRegistrations = 0;
    const updatedDrives = await Promise.all(
      drivesList.map(async (drive) => {
        try {
          const response = await fetch(`/api/bloodbank/drives/${drive._id}/registrations`);
          if (response.ok) {
            const data = await response.json();
            totalRegistrations += data.stats?.total || 0;
            return { ...drive, registrationStats: data.stats };
          }
        } catch (error) {
          console.error(`Error fetching registrations for drive ${drive._id}:`, error);
        }
        return { ...drive, registrationStats: { total: 0, registered: 0, attended: 0, cancelled: 0 } };
      })
    );
    
    setDrives(updatedDrives);
    setStatistics(prev => ({ ...prev, totalRegistrations }));
  };

  const handleBloodTypeToggle = (bloodType) => {
    setFormData(prev => ({
      ...prev,
      required_blood_types: prev.required_blood_types.includes(bloodType)
        ? prev.required_blood_types.filter(type => type !== bloodType)
        : [...prev.required_blood_types, bloodType]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const url = editingDrive 
        ? `/api/bloodbank/drives/${editingDrive._id}`
        : '/api/bloodbank/drives';
      const method = editingDrive ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        resetForm();
        await fetchDrives(); // Refresh the list
        alert(editingDrive ? 'Drive updated successfully!' : 'Drive created successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || `Failed to ${editingDrive ? 'update' : 'create'} donation drive`);
      }
    } catch (error) {
      console.error(`Error ${editingDrive ? 'updating' : 'creating'} drive:`, error);
      alert(`Failed to ${editingDrive ? 'update' : 'create'} donation drive`);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      date: '',
      start_time: '',
      end_time: '',
      required_blood_types: [],
      contact_number: ''
    });
    setShowCreateForm(false);
    setEditingDrive(null);
  };

  const handleEditDrive = (drive) => {
    setEditingDrive(drive);
    setFormData({
      title: drive.title,
      description: drive.description,
      location: drive.location,
      date: drive.date.split('T')[0], // Format date for input
      start_time: drive.start_time,
      end_time: drive.end_time,
      required_blood_types: drive.required_blood_types || [],
      contact_number: drive.contact_number
    });
    setShowCreateForm(true);
  };

  const fetchDriveDetails = async (driveId) => {
    try {
      const response = await fetch(`/api/bloodbank/drives/${driveId}/registrations`);
      if (response.ok) {
        const data = await response.json();
        setSelectedDrive(data);
      }
    } catch (error) {
      console.error('Error fetching drive details:', error);
    }
  };

  const updateRegistrationStatus = async (driveId, registrationId, status) => {
    try {
      const response = await fetch(`/api/bloodbank/drives/${driveId}/registrations`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ registration_id: registrationId, status }),
      });

      if (response.ok) {
        await fetchDriveDetails(driveId);
        await fetchDrives(); // Refresh to update statistics
      }
    } catch (error) {
      console.error('Error updating registration status:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
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

  const getStatusColor = (date) => {
    const driveDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (driveDate < today) {
      return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    } else if (driveDate.toDateString() === today.toDateString()) {
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
    } else if (driveDate.toDateString() === tomorrow.toDateString()) {
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
    } else {
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    }
  };

  const getStatusText = (date) => {
    const driveDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (driveDate < today) {
      return 'Completed';
    } else if (driveDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (driveDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return 'Upcoming';
    }
  };

  // Filter drives based on search and status
  const filteredDrives = drives.filter(drive => {
    const matchesSearch = drive.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         drive.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    
    const driveDate = new Date(drive.date);
    const today = new Date();
    
    switch (filterStatus) {
      case 'upcoming':
        return matchesSearch && driveDate >= today;
      case 'completed':
        return matchesSearch && driveDate < today;
      case 'today':
        return matchesSearch && driveDate.toDateString() === today.toDateString();
      default:
        return matchesSearch;
    }
  });

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['bloodbank_admin']}>
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700 border-t-red-600 dark:border-t-red-400 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Loading drives...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['bloodbank_admin']}>
      <div className="min-h-screen bg-[var(--background)] py-4 sm:py-6 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-2 leading-tight">
                  🩸 Donation Drives
                </h1>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  Manage and track your blood donation drives with real-time analytics
                </p>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-3 border border-transparent text-sm sm:text-base font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Create New Drive
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-[var(--card-background)] rounded-xl p-4 sm:p-6 border border-[var(--border)] hover:shadow-lg transition-all duration-300">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">Total Drives</p>
                  <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{statistics.totalDrives}</p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--card-background)] rounded-xl p-4 sm:p-6 border border-[var(--border)] hover:shadow-lg transition-all duration-300">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">Active Drives</p>
                  <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{statistics.activeDrives}</p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--card-background)] rounded-xl p-4 sm:p-6 border border-[var(--border)] hover:shadow-lg transition-all duration-300">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">Total Registrations</p>
                  <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{statistics.totalRegistrations}</p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--card-background)] rounded-xl p-4 sm:p-6 border border-[var(--border)] hover:shadow-lg transition-all duration-300">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">Completed</p>
                  <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{statistics.completedDrives}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-[var(--card-background)] rounded-xl p-4 sm:p-6 border border-[var(--border)] mb-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    placeholder="Search drives by title or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-4 py-3 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-[var(--background)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] text-sm sm:text-base transition-all duration-300"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-[var(--text-secondary)]" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-4 py-3 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-[var(--background)] text-[var(--text-primary)] text-sm sm:text-base appearance-none transition-all duration-300"
                  >
                    <option value="all">All Drives</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="today">Today</option>
                    <option value="completed">Completed</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)] pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Drives Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredDrives.map((drive) => (
              <div key={drive._id} className="bg-[var(--card-background)] rounded-xl border border-[var(--border)] overflow-hidden hover:shadow-xl hover:border-red-200 dark:hover:border-red-800 transition-all duration-300 transform hover:-translate-y-1">
                {/* Drive Header */}
                <div className="p-4 sm:p-6 pb-3 sm:pb-4">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1 pr-2">
                      <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] mb-2 line-clamp-2 leading-tight">
                        {drive.title}
                      </h3>
                      <div className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(drive.date)}`}>
                        {getStatusText(drive.date)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                      <button
                        onClick={() => fetchDriveDetails(drive._id)}
                        className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-400 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 border border-transparent hover:border-red-200 dark:hover:border-red-800"
                        title="View Details"
                      >
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditDrive(drive)}
                        className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                        title="Edit Drive"
                      >
                        <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Drive Details */}
                  <div className="space-y-2.5 sm:space-y-3">
                    <div className="flex items-center text-xs sm:text-sm text-[var(--text-secondary)]">
                      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 flex-shrink-0 text-red-600 dark:text-red-400" />
                      <span className="font-medium">{formatDate(drive.date)}</span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-[var(--text-secondary)]">
                      <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 flex-shrink-0 text-red-600 dark:text-red-400" />
                      <span>{formatTime(drive.start_time)} - {formatTime(drive.end_time)}</span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-[var(--text-secondary)]">
                      <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 flex-shrink-0 text-red-600 dark:text-red-400" />
                      <span className="line-clamp-1 font-medium">{drive.location}</span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-[var(--text-secondary)]">
                      <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 flex-shrink-0 text-red-600 dark:text-red-400" />
                      <span>{drive.contact_number}</span>
                    </div>
                  </div>

                  {/* Blood Types */}
                  {drive.required_blood_types && drive.required_blood_types.length > 0 && (
                    <div className="mt-3 sm:mt-4">
                      <div className="flex items-center mb-2">
                        <Droplet className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 text-red-600 dark:text-red-400" />
                        <span className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">Required Types:</span>
                      </div>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {drive.required_blood_types.map((type) => (
                          <span key={type} className="px-2 sm:px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium rounded-full border border-red-200 dark:border-red-800">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {drive.description}
                  </p>
                </div>

                {/* Registration Stats */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-gray-50 to-red-50 dark:from-gray-800 dark:to-red-900/20 border-t border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="text-center">
                        <p className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                          {drive.registrationStats?.total || 0}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">Total</p>
                      </div>
                      <div className="w-px h-8 bg-[var(--border)]"></div>
                      <div className="text-center">
                        <p className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
                          {drive.registrationStats?.attended || 0}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">Attended</p>
                      </div>
                      <div className="w-px h-8 bg-[var(--border)]"></div>
                      <div className="text-center">
                        <p className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                          {drive.registrationStats?.registered || 0}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">Registered</p>
                      </div>
                    </div>
                    <button
                      onClick={() => fetchDriveDetails(drive._id)}
                      className="inline-flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 group border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
                    >
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">Details</span>
                      <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredDrives.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <div className="max-w-md mx-auto">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
                  <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] mb-3">
                  No donation drives found
                </h3>
                <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
                  {drives.length === 0 
                    ? "Create your first donation drive to start helping save lives."
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
                {drives.length === 0 && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Drive
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Create Drive Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[var(--card-background)] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                  {editingDrive ? 'Edit Donation Drive' : 'Create New Donation Drive'}
                </h2>
                <button
                  type="button"
                  onClick={resetForm}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Drive Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#ef4444] focus:border-transparent bg-[var(--background)] text-[var(--text-primary)]"
                      placeholder="Enter drive title"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#ef4444] focus:border-transparent bg-[var(--background)] text-[var(--text-primary)]"
                      placeholder="Describe the donation drive"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#ef4444] focus:border-transparent bg-[var(--background)] text-[var(--text-primary)]"
                      placeholder="Enter venue address"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#ef4444] focus:border-transparent bg-[var(--background)] text-[var(--text-primary)]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.contact_number}
                      onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#ef4444] focus:border-transparent bg-[var(--background)] text-[var(--text-primary)]"
                      placeholder="Contact number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.start_time}
                      onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#ef4444] focus:border-transparent bg-[var(--background)] text-[var(--text-primary)]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      End Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.end_time}
                      onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#ef4444] focus:border-transparent bg-[var(--background)] text-[var(--text-primary)]"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
                    Required Blood Types (Optional)
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {bloodTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleBloodTypeToggle(type)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          formData.required_blood_types.includes(type)
                            ? 'bg-[#ef4444] text-white border-[#ef4444]'
                            : 'bg-[var(--background)] text-[var(--text-primary)] border-[var(--border)] hover:border-[#ef4444]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-6 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center font-medium shadow-lg"
                  >
                    {submitting && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    {submitting 
                      ? (editingDrive ? 'Updating...' : 'Creating...') 
                      : (editingDrive ? 'Update Drive' : 'Create Drive')
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Drive Details Modal */}
        {selectedDrive && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[var(--card-background)] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                    Drive Participants
                  </h2>
                  <button
                    onClick={() => setSelectedDrive(null)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Drive Info */}
                <div className="bg-[var(--background)] rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                    {selectedDrive.drive?.title}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-[var(--text-secondary)]">Date</p>
                      <p className="font-medium text-[var(--text-primary)]">
                        {formatDate(selectedDrive.drive?.date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[var(--text-secondary)]">Time</p>
                      <p className="font-medium text-[var(--text-primary)]">
                        {formatTime(selectedDrive.drive?.start_time)} - {formatTime(selectedDrive.drive?.end_time)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[var(--text-secondary)]">Location</p>
                      <p className="font-medium text-[var(--text-primary)]">{selectedDrive.drive?.location}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text-secondary)]">Contact</p>
                      <p className="font-medium text-[var(--text-primary)]">{selectedDrive.drive?.contact_number}</p>
                    </div>
                  </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedDrive.stats?.total || 0}</p>
                    <p className="text-sm text-blue-600">Total Registered</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedDrive.stats?.attended || 0}</p>
                    <p className="text-sm text-green-600">Attended</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{selectedDrive.stats?.registered || 0}</p>
                    <p className="text-sm text-yellow-600">Pending</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">{selectedDrive.stats?.cancelled || 0}</p>
                    <p className="text-sm text-red-600">Cancelled</p>
                  </div>
                </div>

                {/* Participants List */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-[var(--text-primary)]">Registered Participants</h4>
                  
                  {selectedDrive.registrations && selectedDrive.registrations.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDrive.registrations.map((registration) => (
                        <div key={registration._id} className="bg-[var(--background)] rounded-lg p-4 border border-[var(--border)]">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="p-2 bg-[#ef4444]/10 rounded-lg">
                                <User className="h-5 w-5 text-[#ef4444]" />
                              </div>
                              <div>
                                <p className="font-medium text-[var(--text-primary)]">
                                  {registration.donor_id?.name || 'Unknown Donor'}
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-[var(--text-secondary)]">
                                  <span className="flex items-center">
                                    <Mail className="h-4 w-4 mr-1" />
                                    {registration.donor_id?.email}
                                  </span>
                                  {registration.donor_id?.phone && (
                                    <span className="flex items-center">
                                      <Phone className="h-4 w-4 mr-1" />
                                      {registration.donor_id.phone}
                                    </span>
                                  )}
                                  {registration.donor_id?.blood_type && (
                                    <span className="flex items-center">
                                      <Droplet className="h-4 w-4 mr-1" />
                                      {registration.donor_id.blood_type}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[var(--text-secondary)] mt-1">
                                  Registered: {new Date(registration.registration_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                registration.status === 'attended' ? 'bg-green-100 text-green-700' :
                                registration.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                              </div>
                              
                              {registration.status === 'registered' && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => updateRegistrationStatus(selectedDrive.drive._id, registration._id, 'attended')}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Mark as attended"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => updateRegistrationStatus(selectedDrive.drive._id, registration._id, 'cancelled')}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Mark as cancelled"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-[var(--text-secondary)] mx-auto mb-3" />
                      <p className="text-[var(--text-secondary)]">No participants registered yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
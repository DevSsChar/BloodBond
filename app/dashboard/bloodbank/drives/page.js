"use client"
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
  AlertCircle
} from 'lucide-react';

export default function BloodbankDrives() {
  const { data: session } = useSession();
  const [drives, setDrives] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [expandedDrive, setExpandedDrive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
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
    if (session) {
      fetchDrives();
    }
  }, [session]);

  const fetchDrives = async () => {
    try {
      const response = await fetch('/api/bloodbank/drives');
      if (response.ok) {
        const data = await response.json();
        setDrives(data.drives || []);
      }
    } catch (error) {
      console.error('Error fetching drives:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      const response = await fetch('/api/bloodbank/drives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchDrives();
        setShowCreateForm(false);
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
        alert('Donation drive created successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create donation drive');
      }
    } catch (error) {
      console.error('Error creating drive:', error);
      alert('Failed to create donation drive');
    } finally {
      setSubmitting(false);
    }
  };

  const getDriveStatus = (drive) => {
    const now = new Date();
    const driveDate = new Date(drive.date);
    
    if (driveDate < now) return 'completed';
    if (driveDate.toDateString() === now.toDateString()) return 'active';
    return 'upcoming';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'active': return 'bg-green-100 text-green-700';
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredDrives = drives.filter(drive => {
    const matchesSearch = drive.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         drive.location.toLowerCase().includes(searchQuery.toLowerCase());
    const status = getDriveStatus(drive);
    const matchesFilter = filterStatus === 'all' || status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['bloodbank_admin']}>
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ef4444] mx-auto"></div>
            <p className="mt-4 text-[var(--text-secondary)]">Loading drives...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['bloodbank_admin']}>
      <div className="min-h-screen bg-[var(--background)] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                  Blood Donation Drives
                </h1>
                <p className="mt-2 text-[var(--text-secondary)]">
                  Create and manage your blood donation drives
                </p>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-[#ef4444] hover:bg-[#dc2626] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ef4444] transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Drive
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 bg-[var(--card-background)] rounded-xl border border-[var(--border-color)] p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    placeholder="Search drives by title or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[#ef4444] focus:border-transparent bg-[var(--background)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
                  />
                </div>
              </div>
              <div className="lg:w-48">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[#ef4444] focus:border-transparent bg-[var(--background)] text-[var(--text-primary)]"
                >
                  <option value="all">All Drives</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active Today</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Drives List */}
          <div className="space-y-6">
            {filteredDrives.length === 0 ? (
              <div className="text-center py-12 bg-[var(--card-background)] rounded-xl border border-[var(--border-color)]">
                <Calendar className="h-16 w-16 text-[var(--text-secondary)] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                  {searchQuery || filterStatus !== 'all' ? 'No Matching Drives' : 'No Drives Created'}
                </h3>
                <p className="text-[var(--text-secondary)] mb-6">
                  {searchQuery || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Create your first donation drive to get started.'
                  }
                </p>
                {!searchQuery && filterStatus === 'all' && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-[#ef4444] hover:bg-[#dc2626] transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Drive
                  </button>
                )}
              </div>
            ) : (
              filteredDrives.map((drive) => {
                const status = getDriveStatus(drive);
                const isExpanded = expandedDrive === drive._id;
                
                return (
                  <div
                    key={drive._id}
                    className="bg-[var(--card-background)] rounded-xl border border-[var(--border-color)] overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Drive Header */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                              {drive.title}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          </div>
                          <p className="text-[var(--text-secondary)] mb-4">{drive.description}</p>
                          
                          {/* Drive Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-[var(--text-secondary)]" />
                              <span className="text-sm text-[var(--text-primary)]">{drive.location}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-[var(--text-secondary)]" />
                              <span className="text-sm text-[var(--text-primary)]">
                                {new Date(drive.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-[var(--text-secondary)]" />
                              <span className="text-sm text-[var(--text-primary)]">
                                {drive.start_time} - {drive.end_time}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-[var(--text-secondary)]" />
                              <span className="text-sm text-[var(--text-primary)]">{drive.contact_number}</span>
                            </div>
                          </div>

                          {/* Blood Types */}
                          {drive.required_blood_types && drive.required_blood_types.length > 0 && (
                            <div className="mt-4">
                              <div className="flex flex-wrap gap-2">
                                {drive.required_blood_types.map(type => (
                                  <span key={type} className="px-2 py-1 bg-[#ef4444] text-white text-xs rounded-full">
                                    {type}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => setExpandedDrive(isExpanded ? null : drive._id)}
                            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background)] rounded-lg transition-colors"
                            title="View Registrations"
                          >
                            <Users className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setExpandedDrive(isExpanded ? null : drive._id)}
                            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background)] rounded-lg transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Section - Registrations */}
                    {isExpanded && (
                      <div className="border-t border-[var(--border-color)] bg-[var(--background)] p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-[var(--text-primary)]">
                            Registered Participants
                          </h4>
                          <span className="text-sm text-[var(--text-secondary)]">
                            {drive.registrations?.length || 0} registered
                          </span>
                        </div>

                        {/* Registrations List */}
                        <DriveRegistrations driveId={drive._id} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Create Drive Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-[var(--card-background)] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                      Create New Donation Drive
                    </h2>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <XCircle className="h-6 w-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                          Drive Title *
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[#ef4444] focus:border-transparent bg-[var(--background)] text-[var(--text-primary)]"
                          placeholder="e.g., Emergency Blood Drive - Help Save Lives"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                          Description *
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          required
                          rows={3}
                          className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[#ef4444] focus:border-transparent bg-[var(--background)] text-[var(--text-primary)]"
                          placeholder="Describe the purpose and importance of this blood drive..."
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                          Location *
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[#ef4444] focus:border-transparent bg-[var(--background)] text-[var(--text-primary)]"
                          placeholder="e.g., City Community Center, 123 Main St"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                          Date *
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          required
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[#ef4444] focus:border-transparent bg-[var(--background)] text-[var(--text-primary)]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                          Contact Number *
                        </label>
                        <input
                          type="tel"
                          name="contact_number"
                          value={formData.contact_number}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[#ef4444] focus:border-transparent bg-[var(--background)] text-[var(--text-primary)]"
                          placeholder="e.g., +1 (555) 123-4567"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                          Start Time *
                        </label>
                        <input
                          type="time"
                          name="start_time"
                          value={formData.start_time}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[#ef4444] focus:border-transparent bg-[var(--background)] text-[var(--text-primary)]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                          End Time *
                        </label>
                        <input
                          type="time"
                          name="end_time"
                          value={formData.end_time}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[#ef4444] focus:border-transparent bg-[var(--background)] text-[var(--text-primary)]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
                        Required Blood Types (Optional)
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {bloodTypes.map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => handleBloodTypeToggle(type)}
                            className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                              formData.required_blood_types.includes(type)
                                ? 'border-[#ef4444] bg-[#ef4444] text-white'
                                : 'border-[var(--border-color)] bg-[var(--background)] text-[var(--text-primary)] hover:border-[#ef4444]'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6">
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                        className="px-6 py-3 border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--background)] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-3 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {submitting ? 'Creating...' : 'Create Drive'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

// Component to display drive registrations
const DriveRegistrations = ({ driveId }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, [driveId]);

  const fetchRegistrations = async () => {
    try {
      const response = await fetch(`/api/bloodbank/drives/${driveId}/registrations`);
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data.registrations || []);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#ef4444]"></div>
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-[var(--text-secondary)] mx-auto mb-3" />
        <p className="text-[var(--text-secondary)]">No registrations yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {registrations.map((registration) => (
        <div
          key={registration._id}
          className="flex items-center justify-between p-4 bg-[var(--card-background)] rounded-lg border border-[var(--border-color)]"
        >
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-[#ef4444] rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h5 className="font-medium text-[var(--text-primary)]">
                {registration.donor?.name || 'Anonymous Donor'}
              </h5>
              <div className="flex items-center space-x-4 text-sm text-[var(--text-secondary)]">
                <span className="flex items-center space-x-1">
                  <Mail className="h-3 w-3" />
                  <span>{registration.donor?.email || 'N/A'}</span>
                </span>
                <span>Blood Type: {registration.donor?.blood_type || 'N/A'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              registration.status === 'registered' ? 'bg-blue-100 text-blue-700' :
              registration.status === 'attended' ? 'bg-green-100 text-green-700' :
              registration.status === 'cancelled' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
            </span>
            <span className="text-xs text-[var(--text-secondary)]">
              {new Date(registration.registration_date).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
"use client"
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Users, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  MapPin,
  Droplet,
  Calendar,
  Heart,
  User
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

const ViewDonors = () => {
  const { data: session } = useSession();
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Template donor data
  const templateDonors = [
    {
      _id: '1',
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@email.com',
      mobile_number: '+91 9876543210',
      blood_type: 'O+',
      age: 28,
      address: 'Sector 15, Noida, Uttar Pradesh',
      last_donation_date: '2024-08-15',
      total_donations: 5,
      status: 'Active'
    },
    {
      _id: '2',
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      mobile_number: '+91 9876543211',
      blood_type: 'A+',
      age: 25,
      address: 'Connaught Place, New Delhi',
      last_donation_date: '2024-07-20',
      total_donations: 3,
      status: 'Active'
    },
    {
      _id: '3',
      name: 'Amit Singh',
      email: 'amit.singh@email.com',
      mobile_number: '+91 9876543212',
      blood_type: 'B-',
      age: 32,
      address: 'Bandra West, Mumbai, Maharashtra',
      last_donation_date: '2024-06-10',
      total_donations: 8,
      status: 'Active'
    },
    {
      _id: '4',
      name: 'Sneha Patel',
      email: 'sneha.patel@email.com',
      mobile_number: '+91 9876543213',
      blood_type: 'AB+',
      age: 29,
      address: 'Satellite, Ahmedabad, Gujarat',
      last_donation_date: '2024-09-01',
      total_donations: 12,
      status: 'Active'
    },
    {
      _id: '5',
      name: 'Vikram Reddy',
      email: 'vikram.reddy@email.com',
      mobile_number: '+91 9876543214',
      blood_type: 'O-',
      age: 35,
      address: 'Jubilee Hills, Hyderabad, Telangana',
      last_donation_date: '2024-05-15',
      total_donations: 15,
      status: 'Active'
    },
    {
      _id: '6',
      name: 'Kavya Nair',
      email: 'kavya.nair@email.com',
      mobile_number: '+91 9876543215',
      blood_type: 'A-',
      age: 26,
      address: 'MG Road, Bangalore, Karnataka',
      last_donation_date: '2024-08-30',
      total_donations: 4,
      status: 'Active'
    },
    {
      _id: '7',
      name: 'Arjun Mehta',
      email: 'arjun.mehta@email.com',
      mobile_number: '+91 9876543216',
      blood_type: 'B+',
      age: 31,
      address: 'Park Street, Kolkata, West Bengal',
      last_donation_date: '2024-04-22',
      total_donations: 7,
      status: 'Inactive'
    },
    {
      _id: '8',
      name: 'Ananya Gupta',
      email: 'ananya.gupta@email.com',
      mobile_number: '+91 9876543217',
      blood_type: 'AB-',
      age: 27,
      address: 'Civil Lines, Pune, Maharashtra',
      last_donation_date: '2024-07-05',
      total_donations: 6,
      status: 'Active'
    }
  ];

  useEffect(() => {
    // Simulate API call with template data
    setTimeout(() => {
      setDonors(templateDonors);
      setFilteredDonors(templateDonors);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Filter donors based on search term and blood type
    let filtered = donors;

    if (searchTerm) {
      filtered = filtered.filter(donor => 
        donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.mobile_number.includes(searchTerm)
      );
    }

    if (bloodTypeFilter) {
      filtered = filtered.filter(donor => donor.blood_type === bloodTypeFilter);
    }

    setFilteredDonors(filtered);
  }, [searchTerm, bloodTypeFilter, donors]);

  const getDonationStatus = (lastDonationDate) => {
    const today = new Date();
    const lastDonation = new Date(lastDonationDate);
    const daysSinceLastDonation = Math.floor((today - lastDonation) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastDonation < 90) {
      return { status: 'Recent', color: 'text-green-600 bg-green-100' };
    } else if (daysSinceLastDonation < 180) {
      return { status: 'Eligible', color: 'text-blue-600 bg-blue-100' };
    } else {
      return { status: 'Due', color: 'text-orange-600 bg-orange-100' };
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['bloodbank_admin']}>
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ef4444] mx-auto"></div>
            <p className="mt-4 text-[var(--text-secondary)]">Loading donors...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['bloodbank_admin']}>
      <div className="min-h-screen bg-[var(--background)] py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-8 w-8 text-[#ef4444]" />
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Donor Management</h1>
              </div>
              <p className="text-[var(--text-secondary)]">View and manage donor records</p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Total Donors</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{donors.length}</p>
                </div>
                <Users className="h-8 w-8 text-[#ef4444]" />
              </div>
            </div>
            
            <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Active Donors</p>
                  <p className="text-2xl font-bold text-green-600">
                    {donors.filter(d => d.status === 'Active').length}
                  </p>
                </div>
                <Heart className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Total Donations</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {donors.reduce((sum, donor) => sum + donor.total_donations, 0)}
                  </p>
                </div>
                <Droplet className="h-8 w-8 text-[#ef4444]" />
              </div>
            </div>
            
            <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Eligible to Donate</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {donors.filter(d => {
                      const lastDonation = new Date(d.last_donation_date);
                      const daysSince = Math.floor((new Date() - lastDonation) / (1000 * 60 * 60 * 24));
                      return daysSince >= 90;
                    }).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)] mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--background)] text-[var(--text-primary)] focus:ring-2 focus:ring-[#ef4444] focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="md:w-48">
                <select
                  value={bloodTypeFilter}
                  onChange={(e) => setBloodTypeFilter(e.target.value)}
                  className="w-full p-2 border border-[var(--border-color)] rounded-lg bg-[var(--background)] text-[var(--text-primary)] focus:ring-2 focus:ring-[#ef4444] focus:border-transparent"
                >
                  <option value="">All Blood Types</option>
                  {bloodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Donors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonors.map(donor => {
              const donationStatus = getDonationStatus(donor.last_donation_date);
              
              return (
                <div key={donor._id} className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)] hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-[#ef4444]/10 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-[#ef4444]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{donor.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Droplet className="h-4 w-4 text-[#ef4444]" />
                          <span className="text-lg font-bold text-[#ef4444]">{donor.blood_type}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${donationStatus.color}`}>
                      {donationStatus.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-[var(--text-secondary)]">
                      <Mail className="h-4 w-4" />
                      <span>{donor.email}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-[var(--text-secondary)]">
                      <Phone className="h-4 w-4" />
                      <span>{donor.mobile_number}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-[var(--text-secondary)]">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{donor.address}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-[var(--text-secondary)]">
                      <Calendar className="h-4 w-4" />
                      <span>Last donation: {new Date(donor.last_donation_date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <span className="text-[var(--text-secondary)]">Total donations: </span>
                        <span className="font-semibold text-[var(--text-primary)]">{donor.total_donations}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-[var(--text-secondary)]">Age: </span>
                        <span className="font-semibold text-[var(--text-primary)]">{donor.age}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button className="flex-1 bg-[#ef4444] text-white py-2 px-4 rounded-lg hover:bg-[#ef4444]/90 transition-colors text-sm">
                      Contact Donor
                    </button>
                    <button className="flex-1 bg-[var(--background)] border border-[var(--border-color)] text-[var(--text-primary)] py-2 px-4 rounded-lg hover:bg-[var(--card-background)] transition-colors text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredDonors.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-24 w-24 text-[var(--text-secondary)] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No donors found</h3>
              <p className="text-[var(--text-secondary)]">
                {searchTerm || bloodTypeFilter 
                  ? "Try adjusting your search criteria" 
                  : "No donors registered yet"
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ViewDonors;

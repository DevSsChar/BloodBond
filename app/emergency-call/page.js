"use client"
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { TriangleAlert, Users, Phone, Mail, MapPin, Droplet, Clock, Send } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

const BloodBankEmergencyPage = () => {
  const { data: session } = useSession();
  const [urgentRequest, setUrgentRequest] = useState({
    bloodType: '',
    unitsNeeded: '',
    urgencyLevel: 'high',
    hospitalName: '',
    contactPerson: '',
    contactNumber: '',
    message: ''
  });
  const [availableDonors, setAvailableDonors] = useState([]);
  const [selectedDonors, setSelectedDonors] = useState([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  // Template donors for blood bank emergency calling
  const templateDonors = [
    {
      _id: '1',
      name: 'Rajesh Kumar',
      blood_type: 'O+',
      mobile_number: '+91 9876543210',
      email: 'rajesh.kumar@email.com',
      address: 'Mumbai, Maharashtra',
      last_donation: '2024-11-15',
      status: 'available'
    },
    {
      _id: '2',
      name: 'Priya Sharma',
      blood_type: 'A+',
      mobile_number: '+91 9876543211',
      email: 'priya.sharma@email.com',
      address: 'Delhi, India',
      last_donation: '2024-10-20',
      status: 'available'
    },
    {
      _id: '3',
      name: 'Amit Patel',
      blood_type: 'B+',
      mobile_number: '+91 9876543212',
      email: 'amit.patel@email.com',
      address: 'Ahmedabad, Gujarat',
      last_donation: '2024-09-30',
      status: 'available'
    },
    {
      _id: '4',
      name: 'Neha Singh',
      blood_type: 'AB+',
      mobile_number: '+91 9876543213',
      email: 'neha.singh@email.com',
      address: 'Bangalore, Karnataka',
      last_donation: '2024-11-01',
      status: 'available'
    },
    {
      _id: '5',
      name: 'Vikram Joshi',
      blood_type: 'O-',
      mobile_number: '+91 9876543214',
      email: 'vikram.joshi@email.com',
      address: 'Pune, Maharashtra',
      last_donation: '2024-10-15',
      status: 'available'
    },
    {
      _id: '6',
      name: 'Deepika Reddy',
      blood_type: 'A-',
      mobile_number: '+91 9876543215',
      email: 'deepika.reddy@email.com',
      address: 'Hyderabad, Telangana',
      last_donation: '2024-11-10',
      status: 'available'
    }
  ];

  useEffect(() => {
    // Set template donors
    setAvailableDonors(templateDonors);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUrgentRequest(prev => ({ ...prev, [name]: value }));
    
    // Filter donors by blood type if selected
    if (name === 'bloodType' && value) {
      const filtered = templateDonors.filter(donor => 
        donor.blood_type === value || 
        (value === 'O-' && ['O-'].includes(donor.blood_type)) ||
        (value === 'O+' && ['O+', 'O-'].includes(donor.blood_type)) ||
        (value === 'A-' && ['A-', 'O-'].includes(donor.blood_type)) ||
        (value === 'A+' && ['A+', 'A-', 'O+', 'O-'].includes(donor.blood_type)) ||
        (value === 'B-' && ['B-', 'O-'].includes(donor.blood_type)) ||
        (value === 'B+' && ['B+', 'B-', 'O+', 'O-'].includes(donor.blood_type)) ||
        (value === 'AB-' && ['AB-', 'A-', 'B-', 'O-'].includes(donor.blood_type)) ||
        (value === 'AB+' && true) // AB+ can receive from anyone
      );
      setAvailableDonors(filtered);
    } else if (name === 'bloodType' && !value) {
      setAvailableDonors(templateDonors);
    }
  };

  const toggleDonorSelection = (donorId) => {
    setSelectedDonors(prev => 
      prev.includes(donorId) 
        ? prev.filter(id => id !== donorId)
        : [...prev, donorId]
    );
  };

  const selectAllDonors = () => {
    const allIds = availableDonors.map(d => d._id);
    setSelectedDonors(allIds);
  };

  const clearSelection = () => {
    setSelectedDonors([]);
  };

  const sendUrgentCall = async () => {
    if (selectedDonors.length === 0) {
      alert('Please select at least one donor to contact');
      return;
    }

    if (!urgentRequest.bloodType || !urgentRequest.unitsNeeded) {
      alert('Please fill in blood type and units needed');
      return;
    }

    setSending(true);
    try {
      // Simulate API call for sending urgent donor notifications
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Urgent call sent to ${selectedDonors.length} donors for ${urgentRequest.bloodType} blood!\n\nDonors will be contacted via SMS and phone calls immediately.`);
      
      // Reset form
      setUrgentRequest({
        bloodType: '',
        unitsNeeded: '',
        urgencyLevel: 'high',
        hospitalName: '',
        contactPerson: '',
        contactNumber: '',
        message: ''
      });
      setSelectedDonors([]);
      setAvailableDonors(templateDonors);
      
    } catch (error) {
      console.error('Error sending urgent call:', error);
      alert('Failed to send urgent call to donors');
    } finally {
      setSending(false);
    }
  };

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['bloodbank_admin']}>
      <div className="min-h-screen bg-[var(--background)] py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <TriangleAlert className="h-8 w-8 text-[#ef4444]" />
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">Emergency Donor Call</h1>
            </div>
            <p className="text-[var(--text-secondary)]">
              Send urgent calls to available donors in your network when emergency blood is needed
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Emergency Request Form */}
            <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center">
                <TriangleAlert className="h-5 w-5 mr-2" />
                Emergency Blood Request
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Blood Type Required *
                    </label>
                    <select
                      name="bloodType"
                      value={urgentRequest.bloodType}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-[var(--border-color)] rounded-md focus:ring-2 focus:ring-[#ef4444] focus:border-transparent"
                      required
                    >
                      <option value="">Select Blood Type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Units Needed *
                    </label>
                    <input
                      type="number"
                      name="unitsNeeded"
                      value={urgentRequest.unitsNeeded}
                      onChange={handleInputChange}
                      placeholder="Number of units"
                      min="1"
                      className="w-full p-3 border border-[var(--border-color)] rounded-md focus:ring-2 focus:ring-[#ef4444] focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Urgency Level
                  </label>
                  <select
                    name="urgencyLevel"
                    value={urgentRequest.urgencyLevel}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-[var(--border-color)] rounded-md focus:ring-2 focus:ring-[#ef4444] focus:border-transparent"
                  >
                    <option value="critical">🔴 Critical (Life threatening)</option>
                    <option value="high">🟠 High (Urgent surgery)</option>
                    <option value="medium">🟡 Medium (Planned surgery)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Hospital/Requesting Institution
                  </label>
                  <input
                    type="text"
                    name="hospitalName"
                    value={urgentRequest.hospitalName}
                    onChange={handleInputChange}
                    placeholder="Hospital or institution name"
                    className="w-full p-3 border border-[var(--border-color)] rounded-md focus:ring-2 focus:ring-[#ef4444] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={urgentRequest.contactPerson}
                      onChange={handleInputChange}
                      placeholder="Doctor/Coordinator name"
                      className="w-full p-3 border border-[var(--border-color)] rounded-md focus:ring-2 focus:ring-[#ef4444] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={urgentRequest.contactNumber}
                      onChange={handleInputChange}
                      placeholder="+91 XXXXXXXXXX"
                      className="w-full p-3 border border-[var(--border-color)] rounded-md focus:ring-2 focus:ring-[#ef4444] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Additional Message
                  </label>
                  <textarea
                    name="message"
                    value={urgentRequest.message}
                    onChange={handleInputChange}
                    placeholder="Any additional details for donors..."
                    rows={3}
                    className="w-full p-3 border border-[var(--border-color)] rounded-md focus:ring-2 focus:ring-[#ef4444] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Available Donors */}
            <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Available Donors ({availableDonors.length})
                </h2>
                <div className="space-x-2">
                  <button
                    onClick={selectAllDonors}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearSelection}
                    className="text-sm border border-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-50 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {urgentRequest.bloodType && (
                <div className={`p-3 rounded-lg border mb-4 ${getUrgencyColor(urgentRequest.urgencyLevel)}`}>
                  <p className="font-medium">
                    Searching for: {urgentRequest.bloodType} blood compatible donors
                  </p>
                  <p className="text-sm">
                    {selectedDonors.length} donors selected for urgent contact
                  </p>
                </div>
              )}

              <div className="max-h-96 overflow-y-auto space-y-3">
                {availableDonors.map((donor) => (
                  <div
                    key={donor._id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedDonors.includes(donor._id)
                        ? 'border-[#ef4444] bg-[#ef4444]/5'
                        : 'border-[var(--border-color)] hover:bg-[var(--background)]'
                    }`}
                    onClick={() => toggleDonorSelection(donor._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#ef4444] text-white rounded-full flex items-center justify-center font-bold">
                          {donor.blood_type}
                        </div>
                        <div>
                          <h3 className="font-medium text-[var(--text-primary)]">{donor.name}</h3>
                          <p className="text-sm text-[var(--text-secondary)]">{donor.mobile_number}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 text-green-600 text-sm">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                          <span>Available</span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)]">
                          Last: {new Date(donor.last_donation).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Send Button */}
              <div className="mt-6 pt-4 border-t border-[var(--border-color)]">
                <button
                  onClick={sendUrgentCall}
                  disabled={sending || selectedDonors.length === 0}
                  className="w-full bg-[#ef4444] hover:bg-[#ef4444]/90 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending Calls...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Emergency Call to {selectedDonors.length} Donors</span>
                    </>
                  )}
                </button>
                
                {selectedDonors.length > 0 && (
                  <p className="text-center text-sm text-[var(--text-secondary)] mt-2">
                    Donors will receive SMS and phone calls immediately
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default BloodBankEmergencyPage;

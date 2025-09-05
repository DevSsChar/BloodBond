"use client"
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Heart, MapPin, Phone, Mail, User, Building, Calendar, Droplet, Users } from 'lucide-react';

// Geolocation Hook
const useGeolocation = () => {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLoading(false);
      },
      (error) => {
        setError('Unable to retrieve your location');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return { location, loading, error, getCurrentLocation };
};

// Donor Form Component
const DonorForm = ({ onSubmit, loading }) => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    age: '',
    blood_type: '',
    mobile_number: '',
    email: session?.user?.email || '',
    emergency_contact_mobile: ''
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            <User className="inline w-4 h-4 mr-2" />
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            <Calendar className="inline w-4 h-4 mr-2" />
            Age *
          </label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
            min="18"
            max="65"
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            <Droplet className="inline w-4 h-4 mr-2" />
            Blood Type *
          </label>
          <select
            name="blood_type"
            value={formData.blood_type}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
          >
            <option value="">Select Blood Type</option>
            {bloodTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            <Phone className="inline w-4 h-4 mr-2" />
            Mobile Number *
          </label>
          <input
            type="tel"
            name="mobile_number"
            value={formData.mobile_number}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            <Mail className="inline w-4 h-4 mr-2" />
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            <Users className="inline w-4 h-4 mr-2" />
            Emergency Contact *
          </label>
          <input
            type="tel"
            name="emergency_contact_mobile"
            value={formData.emergency_contact_mobile}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-[#ef4444] hover:bg-[#ef4444]/90'
        }`}
      >
        {loading ? 'Registering...' : 'Complete Registration'}
      </button>
    </form>
  );
};

// Blood Bank Form Component
const BloodBankForm = ({ onSubmit, loading }) => {
  const { data: session } = useSession();
  const { location, loading: locationLoading, error: locationError, getCurrentLocation } = useGeolocation();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact_number: '',
    email: session?.user?.email || '',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    if (location.latitude && location.longitude) {
      setFormData(prev => ({
        ...prev,
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString()
      }));
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.latitude || !formData.longitude) {
      alert('Location is required for blood banks. Please get your current location.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            <Building className="inline w-4 h-4 mr-2" />
            Blood Bank Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            <MapPin className="inline w-4 h-4 mr-2" />
            Address *
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            rows="3"
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            <Phone className="inline w-4 h-4 mr-2" />
            Contact Number *
          </label>
          <input
            type="tel"
            name="contact_number"
            value={formData.contact_number}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            <Mail className="inline w-4 h-4 mr-2" />
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            <MapPin className="inline w-4 h-4 mr-2" />
            Location (Required) *
          </label>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors ${
                locationLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {locationLoading ? 'Getting Location...' : 'Get Current Location'}
            </button>
          </div>
          {locationError && (
            <p className="text-red-500 text-sm mb-2">{locationError}</p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="Latitude"
              step="any"
              required
              className="px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
            />
            <input
              type="number"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="Longitude"
              step="any"
              required
              className="px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-[#ef4444] hover:bg-[#ef4444]/90'
        }`}
      >
        {loading ? 'Registering...' : 'Complete Registration'}
      </button>
    </form>
  );
};

// Hospital Form Component (similar to Blood Bank)
const HospitalForm = ({ onSubmit, loading }) => {
  const { data: session } = useSession();
  const { location, loading: locationLoading, error: locationError, getCurrentLocation } = useGeolocation();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact_number: '',
    email: session?.user?.email || '',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    if (location.latitude && location.longitude) {
      setFormData(prev => ({
        ...prev,
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString()
      }));
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.latitude || !formData.longitude) {
      alert('Location is required for hospitals. Please get your current location.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            <Building className="inline w-4 h-4 mr-2" />
            Hospital Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            <MapPin className="inline w-4 h-4 mr-2" />
            Address *
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            rows="3"
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            <Phone className="inline w-4 h-4 mr-2" />
            Contact Number *
          </label>
          <input
            type="tel"
            name="contact_number"
            value={formData.contact_number}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            <Mail className="inline w-4 h-4 mr-2" />
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            <MapPin className="inline w-4 h-4 mr-2" />
            Location (Required) *
          </label>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors ${
                locationLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {locationLoading ? 'Getting Location...' : 'Get Current Location'}
            </button>
          </div>
          {locationError && (
            <p className="text-red-500 text-sm mb-2">{locationError}</p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="Latitude"
              step="any"
              required
              className="px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
            />
            <input
              type="number"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="Longitude"
              step="any"
              required
              className="px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-[#ef4444] hover:bg-[#ef4444]/90'
        }`}
      >
        {loading ? 'Registering...' : 'Complete Registration'}
      </button>
    </form>
  );
};

// Main Form Container
const RegistrationForm = ({ role }) => {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession(); // Get session only
  const router = useRouter();

  const getRoleTitle = () => {
    switch (role) {
      case 'user': return 'Blood Donor Registration';
      case 'bloodbank_admin': return 'Blood Bank Registration';
      case 'hospital': return 'Hospital Registration';
      default: return 'Registration';
    }
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      let endpoint, body;
      
      if (role === 'user') {
        endpoint = '/api/donors/register';
        body = { ...formData, role };
      } else if (role === 'bloodbank_admin') {
        endpoint = '/api/bloodbanks';
        body = { ...formData, role };
      } else if (role === 'hospital') {
        endpoint = '/api/hospitals';
        body = { ...formData, role };
      }
      
      console.log('Submitting to:', endpoint, 'with data:', body);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      console.log('Response:', response.status, result);

      if (response.ok) {
        console.log('Registration successful!', result);
        // Mark completion locally immediately to avoid UI loop while we sync session
        try {
          localStorage.setItem('registrationComplete', 'true');
        } catch (e) {
          console.warn('Could not write registrationComplete to localStorage');
        }

        // Poll backend status until it reflects completion to avoid stale session token
        const pollStatus = async (attempt = 1) => {
          try {
            const statusRes = await fetch('/api/users/status', { cache: 'no-store' });
            if (statusRes.ok) {
              const statusJson = await statusRes.json();
              console.log('Status poll attempt', attempt, statusJson);
              if (statusJson?.user?.isRegistrationComplete) {
                return true;
              }
            }
          } catch (e) {
            console.warn('Status poll failed attempt', attempt, e);
          }
          if (attempt < 5) {
            await new Promise(r => setTimeout(r, 400 * attempt));
            return pollStatus(attempt + 1);
          }
          return false;
        };

        const backendSynced = await pollStatus();
        if (!backendSynced) {
          console.warn('Backend did not confirm registration completion after polling – proceeding anyway');
        }

        alert('Registration completed! Redirecting to your dashboard...');

        // Prefer router.replace so history does not keep the form
        const dashboardPath = role === 'user' ? '/dashboard/donor' : 
                              role === 'bloodbank_admin' ? '/dashboard/bloodbank' : 
                              '/dashboard/hospital';
        try {
          // Force a session refetch (triggers JWT refresh due to false->true transition)
          await fetch('/api/auth/session?update=1', { cache: 'no-store' }).catch(()=>{});
        } catch {}
        // Navigate
        router.replace(dashboardPath);
      } else {
        console.error('Registration failed:', result);
        alert(`Registration failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Network error: Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    switch (role) {
      case 'user':
        return <DonorForm onSubmit={handleSubmit} loading={loading} />;
      case 'bloodbank_admin':
        return <BloodBankForm onSubmit={handleSubmit} loading={loading} />;
      case 'hospital':
        return <HospitalForm onSubmit={handleSubmit} loading={loading} />;
      default:
        return <div>Invalid role</div>;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4 sm:p-6">
      <div className="w-full max-w-2xl space-y-8 bg-[var(--card-background)] p-6 sm:p-8 rounded-xl shadow-md border border-[var(--border-color)] transition-colors duration-200">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Heart className="h-8 w-8 text-[#ef4444]" aria-hidden="true" />
            <h1 className="font-heading text-3xl font-bold text-[#ef4444]">BloodBond</h1>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{getRoleTitle()}</h2>
          <p className="text-[var(--text-secondary)]">
            Please fill out all the required information
          </p>
        </div>

        {/* Form */}
        {renderForm()}
      </div>
    </div>
  );
};

export { RegistrationForm, DonorForm, BloodBankForm, HospitalForm };
export default RegistrationForm;

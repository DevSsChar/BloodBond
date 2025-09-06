"use client"
import { Clock, Loader, MapPin, Navigation, Phone, TriangleAlert, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const EmergencyPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    patientName: '',
    contactNumber: '',
    bloodType: '',
    unitsRequired: '',
    hospitalLocation: '',
    emergencyDetails: '',
    latitude: null,
    longitude: null
  });
  
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    loading: false,
    error: null
  });
  
  const [nearbyBloodBanks, setNearbyBloodBanks] = useState([]);
  const [selectedBloodBank, setSelectedBloodBank] = useState(null);
  const [geminiRecommendations, setGeminiRecommendations] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchingBloodBanks, setSearchingBloodBanks] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  // Get user's current location
  const getCurrentLocation = () => {
    setLocation(prev => ({ ...prev, loading: true, error: null }));
    
    if (!navigator.geolocation) {
      setLocation(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Geolocation is not supported by this browser' 
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({
          latitude,
          longitude,
          loading: false,
          error: null
        });
        setFormData(prev => ({ ...prev, latitude, longitude }));
      },
      (error) => {
        setLocation(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Unable to retrieve your location. Please enable location services.' 
        }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Find nearby blood banks using location and Gemini API
  const findNearbyBloodBanks = async () => {
    if (!location.latitude || !location.longitude) {
      alert('Please get your location first');
      return;
    }

    setSearchingBloodBanks(true);
    try {
      const response = await fetch('/api/emergency/nearby-bloodbanks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          bloodType: formData.bloodType
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setNearbyBloodBanks(data.nearestBloodBanks);
        setGeminiRecommendations(data.recommendations);
        
        // Show feedback about search results
        const avgDistance = data.nearestBloodBanks.reduce((sum, bank) => sum + bank.distance, 0) / data.nearestBloodBanks.length;
        console.log(`Found ${data.nearestBloodBanks.length} blood banks. Average distance: ${avgDistance.toFixed(1)}km`);
        console.log('Sources:', data.sources);
        
        let message = `✅ Found ${data.nearestBloodBanks.length} blood banks:\n`;
        message += `🏦 ${data.sources.database} from verified database\n`;
        message += `🌐 ${data.sources.google_places} real-time from Google Places\n`;
        message += `📍 Average distance: ${avgDistance.toFixed(1)}km`;
        
        if (data.searchExpanded) {
          message = '⚠️ Warning: No blood banks found within emergency distance (25km). Showing all available options.\n\n' + message;
        } else if (avgDistance > 15) {
          message += '\n\n⚠️ Notice: Blood banks are relatively far. Consider calling emergency services (108) for immediate assistance.';
        }
        
        alert(message);
      } else {
        alert('Failed to find nearby blood banks: ' + data.error);
      }
    } catch (error) {
      console.error('Error finding blood banks:', error);
      alert('Failed to find nearby blood banks');
    } finally {
      setSearchingBloodBanks(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedBloodBank) {
      alert('Please select a blood bank first');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/emergency/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          selectedBloodBankId: selectedBloodBank._id
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Emergency request submitted successfully! Request ID: ' + data.requestId);
        // Reset form
        setFormData({
          patientName: '',
          contactNumber: '',
          bloodType: '',
          unitsRequired: '',
          hospitalLocation: '',
          emergencyDetails: '',
          latitude: null,
          longitude: null
        });
        setSelectedBloodBank(null);
        setNearbyBloodBanks([]);
        setGeminiRecommendations('');
      } else {
        alert('Failed to submit request: ' + data.error);
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit emergency request');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ef4444]"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Emergency Header */}
        <div className="text-center mb-8">
          <div className="bg-[#ef4444] text-white p-4 rounded-lg mb-6">
            <TriangleAlert className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-2">Emergency Blood Request</h1>
            <p className="text-xl opacity-90">Request urgent blood supply for critical situations</p>
          </div>
        </div>
        
        {/* Emergency Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)] text-center">
            <Phone className="h-12 w-12 text-[#ef4444] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Emergency Hotline</h3>
            <p className="text-2xl font-bold text-[#ef4444] mb-2">108</p>
            <p className="text-sm text-[var(--text-secondary)]">Available 24/7</p>
          </div>
          
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)] text-center">
            <Clock className="h-12 w-12 text-[#ef4444] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Response Time</h3>
            <p className="text-2xl font-bold text-[#ef4444] mb-2">&lt; 30 min</p>
            <p className="text-sm text-[var(--text-secondary)]">Average response</p>
          </div>
          
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)] text-center">
            <Users className="h-12 w-12 text-[#ef4444] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Available Donors</h3>
            <p className="text-2xl font-bold text-[#ef4444] mb-2">1,200+</p>
            <p className="text-sm text-[var(--text-secondary)]">Ready to help</p>
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)] mb-6">
          <div className="flex items-center mb-4">
            <MapPin className="h-6 w-6 text-[#ef4444] mr-2" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Your Location</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <button
              onClick={getCurrentLocation}
              disabled={location.loading}
              className="flex items-center gap-2 bg-[#ef4444] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#ef4444]/90 transition-colors disabled:opacity-50"
            >
              {location.loading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <Navigation className="h-5 w-5" />
              )}
              {location.loading ? 'Getting Location...' : 'Get My Location'}
            </button>
            
            {location.latitude && location.longitude && (
              <div className="text-sm text-[var(--text-secondary)]">
                <p>Latitude: {location.latitude.toFixed(6)}</p>
                <p>Longitude: {location.longitude.toFixed(6)}</p>
              </div>
            )}
            
            {location.error && (
              <p className="text-red-500 text-sm">{location.error}</p>
            )}
          </div>
        </div>

        {/* Emergency Request Form */}
        <div className="bg-[var(--card-background)] p-8 rounded-lg border border-[var(--border-color)]">
          <div className="flex items-center mb-6">
            <TriangleAlert className="h-6 w-6 text-[#ef4444] mr-2" />
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Submit Emergency Request</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Patient Name *
                </label>
                <input 
                  type="text" 
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--background)] text-[var(--text-primary)] focus:ring-2 focus:ring-[#ef4444] focus:border-transparent"
                  placeholder="Enter patient's full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Contact Number *
                </label>
                <input 
                  type="tel" 
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--background)] text-[var(--text-primary)] focus:ring-2 focus:ring-[#ef4444] focus:border-transparent"
                  placeholder="Enter contact number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Blood Type *
                </label>
                <select 
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--background)] text-[var(--text-primary)] focus:ring-2 focus:ring-[#ef4444] focus:border-transparent"
                >
                  <option value="">Select blood type</option>
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
                  Units Required *
                </label>
                <input 
                  type="number" 
                  name="unitsRequired"
                  value={formData.unitsRequired}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--background)] text-[var(--text-primary)] focus:ring-2 focus:ring-[#ef4444] focus:border-transparent"
                  placeholder="Number of units"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Hospital/Location *
              </label>
              <input 
                type="text" 
                name="hospitalLocation"
                value={formData.hospitalLocation}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--background)] text-[var(--text-primary)] focus:ring-2 focus:ring-[#ef4444] focus:border-transparent"
                placeholder="Hospital name or location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Emergency Details *
              </label>
              <textarea 
                rows="4"
                name="emergencyDetails"
                value={formData.emergencyDetails}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--background)] text-[var(--text-primary)] focus:ring-2 focus:ring-[#ef4444] focus:border-transparent"
                placeholder="Describe the emergency situation and urgency level"
              ></textarea>
            </div>

            {/* Find Blood Banks Button */}
            <div className="flex justify-center">
              <button 
                type="button"
                onClick={findNearbyBloodBanks}
                disabled={!location.latitude || !formData.bloodType || searchingBloodBanks}
                className="bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {searchingBloodBanks ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <MapPin className="h-5 w-5" />
                )}
                {searchingBloodBanks ? 'Finding Blood Banks...' : 'Find Nearby Blood Banks'}
              </button>
            </div>

            {/* Nearby Blood Banks Results */}
            {nearbyBloodBanks.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    Emergency Blood Banks ({nearbyBloodBanks.length} found)
                  </h3>
                  {nearbyBloodBanks.some(bank => bank.distance > 20) && (
                    <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                      ⚠️ Some banks are far for emergency
                    </div>
                  )}
                </div>
                
                {/* Gemini AI Recommendations */}
                {geminiRecommendations && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">🤖 AI Emergency Recommendations</h4>
                    <div className="text-sm text-blue-700 dark:text-blue-300 whitespace-pre-wrap">
                      {geminiRecommendations}
                    </div>
                  </div>
                )}
                
                <div className="grid gap-4">
                  {nearbyBloodBanks.map((bank, index) => (
                    <div 
                      key={bank._id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedBloodBank?._id === bank._id 
                          ? 'border-[#ef4444] bg-[#ef4444]/10' 
                          : 'border-[var(--border-color)] hover:border-[#ef4444]/50'
                      }`}
                      onClick={() => setSelectedBloodBank(bank)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-[var(--text-primary)]">{bank.name}</h4>
                            
                            {/* Source Badge */}
                            {bank.source === 'database' ? (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">
                                🏦 VERIFIED
                              </span>
                            ) : (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">
                                🌐 REAL-TIME
                              </span>
                            )}
                            
                            {/* Distance Badge */}
                            {bank.distance <= 10 && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">NEAR</span>
                            )}
                            {bank.distance > 20 && (
                              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">FAR</span>
                            )}
                          </div>
                          
                          <p className="text-sm text-[var(--text-secondary)] mt-1">{bank.address}</p>
                          <p className="text-sm text-[var(--text-secondary)]">📞 {bank.contact_number}</p>
                          
                          {/* Google Rating for real-time banks */}
                          {bank.rating && (
                            <p className="text-sm text-yellow-600 mt-1">
                              ⭐ {bank.rating}/5 Google Rating
                            </p>
                          )}
                          
                          {/* Blood Type Availability */}
                          {formData.bloodType && (
                            <div className="mt-2 text-sm">
                              {bank.source === 'database' ? (
                                bank.hasRequestedBloodType ? (
                                  <span className="text-green-600 font-medium">
                                    ✅ {formData.bloodType} Available ({bank.availableUnits} units)
                                  </span>
                                ) : (
                                  <span className="text-orange-600">
                                    ❌ {formData.bloodType} Not Available
                                  </span>
                                )
                              ) : (
                                <span className="text-blue-600">
                                  ❓ {formData.bloodType} - Call to confirm availability
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* Emergency Priority */}
                          <div className="mt-1 text-xs">
                            Priority: {
                              bank.source === 'database' && bank.distance <= 10 && bank.hasRequestedBloodType ? 
                                <span className="text-green-600 font-medium">HIGHEST</span> :
                              bank.distance <= 10 ? 
                                <span className="text-green-600 font-medium">HIGH</span> :
                              bank.distance <= 20 ? 
                                <span className="text-yellow-600">MEDIUM</span> :
                                <span className="text-orange-600">LOW</span>
                            }
                          </div>
                          
                          {/* Data Source Info */}
                          <div className="mt-1 text-xs text-[var(--text-secondary)]">
                            {bank.source === 'database' ? 
                              '🏦 From trusted database - Inventory confirmed' : 
                              '🌐 Real-time from Google Places - Call to verify'
                            }
                          </div>
                        </div>
                        
                        <div className="text-right ml-4">
                          <p className={`text-sm font-medium ${
                            bank.distance <= 10 ? 'text-green-600' : 
                            bank.distance <= 20 ? 'text-yellow-600' : 'text-orange-600'
                          }`}>
                            {bank.distance.toFixed(1)} km
                          </p>
                          <p className="text-xs text-[var(--text-secondary)]">
                            ~{Math.round(bank.distance * 2)} min drive
                          </p>
                          {selectedBloodBank?._id === bank._id && (
                            <p className="text-xs text-green-600 mt-1 font-medium">✓ SELECTED</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                type="submit"
                disabled={!selectedBloodBank || submitting}
                className="flex-1 bg-[#ef4444] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#ef4444]/90 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {submitting ? (
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <TriangleAlert className="h-5 w-5 mr-2" />
                )}
                {submitting ? 'Submitting...' : 'Submit Emergency Request'}
              </button>
              
              <button 
                type="button"
                className="flex-1 bg-[var(--background)] text-[var(--text-primary)] py-3 px-6 rounded-lg font-semibold border border-[var(--border-color)] hover:bg-[var(--card-background)] transition-colors flex items-center justify-center"
              >
                <Phone className="h-5 w-5 mr-2" />
                Call Emergency Hotline
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-[#ef4444]/10 rounded-lg border border-[#ef4444]/20">
            <div className="flex items-start">
              <TriangleAlert className="h-5 w-5 text-[#ef4444] mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-[var(--text-primary)] mb-1">Important Note</h4>
                <p className="text-sm text-[var(--text-secondary)]">
                  This form is for emergency blood requests only. For non-urgent requests, please contact your nearest blood bank directly. 
                  Emergency requests are processed with highest priority and will be shared with all available donors in your area.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyPage;

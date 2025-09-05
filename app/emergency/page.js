"use client"
import React from 'react';
import { TriangleAlert, Heart, Phone, MapPin, Clock, Users } from 'lucide-react';

const EmergencyPage = () => {
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

        {/* Emergency Request Form */}
        <div className="bg-[var(--card-background)] p-8 rounded-lg border border-[var(--border-color)]">
          <div className="flex items-center mb-6">
            <TriangleAlert className="h-6 w-6 text-[#ef4444] mr-2" />
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Submit Emergency Request</h2>
          </div>
          
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Patient Name *
                </label>
                <input 
                  type="text" 
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
                <select className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--background)] text-[var(--text-primary)] focus:ring-2 focus:ring-[#ef4444] focus:border-transparent">
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
                  min="1"
                  max="10"
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
                className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--background)] text-[var(--text-primary)] focus:ring-2 focus:ring-[#ef4444] focus:border-transparent"
                placeholder="Describe the emergency situation and urgency level"
              ></textarea>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                type="submit"
                className="flex-1 bg-[#ef4444] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#ef4444]/90 transition-colors flex items-center justify-center"
              >
                <TriangleAlert className="h-5 w-5 mr-2" />
                Submit Emergency Request
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

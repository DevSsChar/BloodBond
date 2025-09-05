"use client"
import React, { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Heart, Users, Building2, Hospital, ArrowRight } from 'lucide-react';

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const { data: session, update } = useSession();
  const router = useRouter();

  const roles = [
    {
      id: 'user',
      title: 'Blood Donor',
      description: 'I want to donate blood and help save lives',
      icon: Heart,
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600'
    },
    {
      id: 'bloodbank_admin',
      title: 'Blood Bank',
      description: 'I represent a blood bank organization',
      icon: Building2,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      id: 'hospital',
      title: 'Hospital',
      description: 'I represent a hospital or medical facility',
      icon: Hospital,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    }
  ];

  const handleRoleSelection = async () => {
    if (!selectedRole) return;
    
    setLoading(true);
    
    try {
      console.log('Updating role to:', selectedRole);
      
      // Update role in database
      const response = await fetch('/api/users/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      const result = await response.json();
      console.log('Role update response:', response.status, result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update role');
      }

      // Update the session
      await update();
      
      console.log('Role updated successfully, redirecting to form...');
      
      // Redirect to appropriate form based on role
      switch (selectedRole) {
        case 'user':
          router.push('/register/donor');
          break;
        case 'bloodbank_admin':
          router.push('/register/bloodbank');
          break;
        case 'hospital':
          router.push('/register/hospital');
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4 sm:p-6">
      <div className="w-full max-w-4xl space-y-8 bg-[var(--card-background)] p-6 sm:p-8 rounded-xl shadow-md border border-[var(--border-color)] transition-colors duration-200">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Heart className="h-8 w-8 text-[#ef4444]" aria-hidden="true" />
            <h1 className="font-heading text-3xl font-bold text-[#ef4444]">BloodBond</h1>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Choose Your Role</h2>
          <p className="text-[var(--text-secondary)]">
            Tell us who you are to personalize your experience
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`relative cursor-pointer rounded-lg border-2 p-6 transition-all duration-200 ${
                  selectedRole === role.id
                    ? 'border-[#ef4444] bg-[#ef4444]/5 shadow-md'
                    : 'border-[var(--border-color)] hover:border-[#ef4444]/50 hover:bg-[var(--card-background)]'
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`p-4 rounded-full ${role.color} text-white`}>
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                      {role.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {role.description}
                    </p>
                  </div>
                  {selectedRole === role.id && (
                    <div className="absolute top-3 right-3">
                      <div className="w-5 h-5 bg-[#ef4444] rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleRoleSelection}
            disabled={!selectedRole || loading}
            className={`flex items-center gap-2 px-8 py-3 rounded-md text-white text-sm font-medium transition-colors ${
              !selectedRole || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#ef4444] hover:bg-[#ef4444]/90'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Back to login link */}
        <div className="text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            Need to sign in first?{' '}
            <button
              onClick={() => signIn()}
              className="text-[#ef4444] hover:text-[#ef4444]/80 underline-offset-2 hover:underline font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;

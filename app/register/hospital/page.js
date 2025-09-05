"use client"
import React from 'react';
import RegistrationForm from '@/components/form';
import ProtectedRoute from '@/components/ProtectedRoute';

const HospitalRegistrationPage = () => {
  return (
    <ProtectedRoute 
      allowedRoles={['hospital']} 
      requiresRole={true} 
      requiresRegistration={false}
    >
      <RegistrationForm role="hospital" />
    </ProtectedRoute>
  );
};

export default HospitalRegistrationPage;

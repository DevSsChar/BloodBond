"use client"
import React from 'react';
import RegistrationForm from '@/components/form';
import ProtectedRoute from '@/components/ProtectedRoute';

const DonorRegistrationPage = () => {
  return (
    <ProtectedRoute 
      allowedRoles={['user']} 
      requiresRole={true} 
      requiresRegistration={false}
    >
      <RegistrationForm role="user" />
    </ProtectedRoute>
  );
};

export default DonorRegistrationPage;

"use client"
import React from 'react';
import RegistrationForm from '@/components/form';
import ProtectedRoute from '@/components/ProtectedRoute';

const BloodBankRegistrationPage = () => {
  return (
    <ProtectedRoute 
      allowedRoles={['bloodbank_admin']} 
      requiresRole={true} 
      requiresRegistration={false}
    >
      <RegistrationForm role="bloodbank_admin" />
    </ProtectedRoute>
  );
};

export default BloodBankRegistrationPage;

"use client"
import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import RoleSelection from '@/components/RoleSelection';

const RegisterPage = () => {
  return (
    <ProtectedRoute requiresRole={false}>
      <RoleSelection />
    </ProtectedRoute>
  );
};

export default RegisterPage;

"use client"
import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import RoleSelection from '@/components/RoleSelection';
import { useUserRole } from '@/hooks/useUserRole';

const RegisterPage = () => {
  const { data: session, status } = useSession();
  const { userRole, loading: roleLoading, hasRole } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading' || roleLoading) return; // Still loading

    if (!session) {
      router.push('/login');
      return;
    }

    // If user already has a role, redirect them to appropriate dashboard
    if (session && hasRole) {
      console.log('User already has role:', userRole, 'redirecting to dashboard');
      switch (userRole) {
        case 'user':
          router.push('/dashboard/donor');
          break;
        case 'bloodbank_admin':
          router.push('/dashboard/bloodbank');
          break;
        case 'hospital':
          router.push('/dashboard/hospital');
          break;
        default:
          router.push('/dashboard');
          break;
      }
      return;
    }
  }, [session, status, userRole, hasRole, roleLoading, router]);

  const isLoading = status === "loading" || roleLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ef4444]"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // If user already has a role, this will be handled by useEffect redirect
  if (hasRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ef4444]"></div>
      </div>
    );
  }

  return <RoleSelection />;
};

export default RegisterPage;

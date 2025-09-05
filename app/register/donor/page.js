"use client"
import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import RegistrationForm from '@/components/form';

const DonorRegistrationPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session) {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

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

  return <RegistrationForm role="user" />;
};

export default DonorRegistrationPage;

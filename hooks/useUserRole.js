"use client"
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

export const useUserRole = () => {
  const { data: session, status } = useSession();

  // Use useMemo to prevent unnecessary recalculations and re-renders
  const roleData = useMemo(() => {
    if (status === 'loading') {
      return {
        userRole: null,
        loading: true,
        hasRole: false,
        isRegistrationComplete: false,
        isDonor: false,
        isBloodBank: false,
        isHospital: false
      };
    }

    if (!session?.user) {
      return {
        userRole: null,
        loading: false,
        hasRole: false,
        isRegistrationComplete: false,
        isDonor: false,
        isBloodBank: false,
        isHospital: false
      };
    }

    const userRole = session.user.role || null;
    const hasRole = !!(userRole && userRole !== null && userRole !== undefined);
    const isRegistrationComplete = session.user.isRegistrationComplete || false;

    return {
      userRole,
      loading: false,
      hasRole,
      isRegistrationComplete,
      isDonor: userRole === 'user',
      isBloodBank: userRole === 'bloodbank_admin',
      isHospital: userRole === 'hospital'
    };
  }, [session?.user?.role, session?.user?.isRegistrationComplete, status]);

  return {
    ...roleData,
    session
  };
};

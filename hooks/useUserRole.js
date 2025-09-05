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
        isDonor: false,
        isBloodBank: false,
        isHospital: false
      };
    }

    const userRole = session.user.role || null;
    const hasRole = !!(userRole && userRole !== null && userRole !== undefined);

    return {
      userRole,
      loading: false,
      hasRole,
      isDonor: userRole === 'user',
      isBloodBank: userRole === 'bloodbank_admin',
      isHospital: userRole === 'hospital'
    };
  }, [session?.user?.role, status]);

  return {
    ...roleData,
    session
  };
};

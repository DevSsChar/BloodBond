"use client"
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUserRole } from '@/hooks/useUserRole';

const RoleGuard = ({ children, allowedRoles = [], requireRole = false }) => {
  const { data: session, status } = useSession();
  const { userRole, loading, hasRole } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading' || loading) return;

    // If not authenticated, redirect to login
    if (!session) {
      router.push('/login');
      return;
    }

    // If role is required but user doesn't have one, redirect to role selection
    if (requireRole && !hasRole()) {
      router.push('/register');
      return;
    }

    // If specific roles are required and user doesn't have the right role
    if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
      router.push('/unauthorized');
      return;
    }
  }, [session, status, userRole, loading, hasRole, router, allowedRoles, requireRole]);

  // Show loading while checking authentication and role
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ef4444]"></div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!session) {
    return null;
  }

  // Don't render children if role is required but not set
  if (requireRole && !hasRole()) {
    return null;
  }

  // Don't render children if specific roles are required but user doesn't have the right role
  if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
    return null;
  }

  return children;
};

export default RoleGuard;

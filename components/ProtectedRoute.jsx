"use client"
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUserRole } from '@/hooks/useUserRole';

const ProtectedRoute = ({ children, allowedRoles = [], requiresRole = true, requiresRegistration = true }) => {
  const { data: session, status } = useSession();
  const { userRole, loading: roleLoading, hasRole, isRegistrationComplete } = useUserRole();
  const router = useRouter();
  const [dbChecking, setDbChecking] = useState(false);
  const [dbRegistrationComplete, setDbRegistrationComplete] = useState(null);
  const [forcedRefresh, setForcedRefresh] = useState(false);

  // Function to check database directly for registration status
  const checkDatabaseRegistrationStatus = async () => {
    if (!session || dbChecking) return;
    
    setDbChecking(true);
    try {
      const response = await fetch('/api/users/status');
      if (response.ok) {
        const result = await response.json();
        setDbRegistrationComplete(result.user?.isRegistrationComplete);
        console.log('ProtectedRoute - Database check result:', result.user?.isRegistrationComplete);
      }
    } catch (error) {
      console.error('ProtectedRoute - Database check failed:', error);
    } finally {
      setDbChecking(false);
    }
  };

  useEffect(() => {
    // If local flag says registration complete but session not yet updated, trigger a DB check once
    try {
      const localDone = typeof window !== 'undefined' && localStorage.getItem('registrationComplete') === 'true';
      if (localDone && !isRegistrationComplete && dbRegistrationComplete === null && !dbChecking && !forcedRefresh) {
        checkDatabaseRegistrationStatus();
        setForcedRefresh(true);
      }
      if (localDone && (dbRegistrationComplete || isRegistrationComplete)) {
        // Clean up the flag once backend/session reflect it
        localStorage.removeItem('registrationComplete');
      }
    } catch {}
  }, [isRegistrationComplete, dbRegistrationComplete, dbChecking, forcedRefresh]);

  useEffect(() => {
    if (status === 'loading' || roleLoading || dbChecking) return;

    // Debug logging
    console.log('ProtectedRoute - Debug Info:', {
      session: !!session,
      hasRole,
      userRole,
      isRegistrationComplete,
      dbRegistrationComplete,
      requiresRole,
      requiresRegistration,
      allowedRoles
    });

    // If not logged in, redirect to login
    if (!session) {
      console.log('ProtectedRoute - No session, redirecting to login');
      router.push('/login');
      return;
    }

    // If role is required but user doesn't have one, redirect to role selection
    if (requiresRole && !hasRole) {
      console.log('ProtectedRoute - Role required but user has no role, redirecting to register');
      router.push('/register');
      return;
    }

    // Enhanced registration check - use database status if available
    const effectiveRegistrationComplete = dbRegistrationComplete !== null ? dbRegistrationComplete : isRegistrationComplete;
    
    // If user has role but registration is required and not complete, redirect to registration form
    if (requiresRegistration && hasRole && !effectiveRegistrationComplete) {
      console.log('ProtectedRoute - Registration incomplete (session:', isRegistrationComplete, 'db:', dbRegistrationComplete, '), redirecting to registration form');
      
      // If we haven't checked the database yet and session says incomplete, check database
      if (dbRegistrationComplete === null && !isRegistrationComplete) {
        console.log('ProtectedRoute - Checking database for registration status...');
        checkDatabaseRegistrationStatus();
        return;
      }
      
      switch (userRole) {
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
          router.push('/register');
          break;
      }
      return;
    }

    // If role is NOT required (like register page) but user already has a role and completed registration, redirect to dashboard
    if (!requiresRole && hasRole && isRegistrationComplete) {
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

    // If user has a role but it's not in the allowed roles, redirect appropriately
    if (hasRole && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      // Redirect to appropriate dashboard based on their role
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
          router.push('/register');
          break;
      }
      return;
    }
  }, [session, status, userRole, hasRole, isRegistrationComplete, dbRegistrationComplete, roleLoading, router, allowedRoles, requiresRole, requiresRegistration, dbChecking]);

  // Add this inside the component, after the useEffect for checking database
  useEffect(() => {
    // If user has localStorage flag for completed registration, redirect to dashboard
    const registrationCompleted = localStorage.getItem('registrationCompleted');
    const storedRole = localStorage.getItem('userRole');
    
    if (registrationCompleted === 'true' && storedRole) {
      console.log("Registration completed flag found in localStorage, redirecting to dashboard");
      
      // Clear the flag after using it
      localStorage.removeItem('registrationCompleted');
      
      // Redirect to appropriate dashboard based on stored role
      let dashboardPath = '/dashboard';
      if (storedRole === 'user') dashboardPath = '/dashboard/donor';
      if (storedRole === 'hospital') dashboardPath = '/dashboard/hospital';
      if (storedRole === 'bloodbank_admin') dashboardPath = '/dashboard/bloodbank';
      
      router.push(dashboardPath);
    }
  }, [router]);

  // Show loading while checking authentication and role
  if (status === 'loading' || roleLoading || dbChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ef4444]"></div>
      </div>
    );
  }

  // Enhanced registration check for rendering
  const effectiveRegistrationComplete = dbRegistrationComplete !== null ? dbRegistrationComplete : isRegistrationComplete;

  // Don't render anything while redirecting
  if (!session || 
      (requiresRole && !hasRole) || 
      (requiresRegistration && hasRole && !effectiveRegistrationComplete) ||
      (!requiresRole && hasRole && effectiveRegistrationComplete) ||
      (hasRole && allowedRoles.length > 0 && !allowedRoles.includes(userRole))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ef4444]"></div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

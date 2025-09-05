"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useUserRole } from "@/hooks/useUserRole";
import LoginPage from "@/components/Login";

const Page = () => {
  const { data: session, status } = useSession();
  const { userRole, loading: roleLoading, hasRole } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading" || roleLoading) return;
    
    if (status === "unauthenticated") {
      return; // Stay on login page
    }
    
    if (status === "authenticated" && session) {
      // Check registration status and redirect appropriately
      if (!hasRole) {
        // User needs to select a role
        router.push("/register");
      } else if (!session.user.isRegistrationComplete) {
        // User has role but needs to complete registration
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
        }
      } else {
        // User is fully registered, go to appropriate dashboard
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
            router.push('/');
        }
      }
    }
  }, [status, session, userRole, hasRole, roleLoading, router]);

  // Return a loading state until the session is determined
  if (status === "loading" || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ef4444]"></div>
      </div>
    );
  }

  // Render Login page if unauthenticated
  if (status === "unauthenticated") {
    return (
      <div>
        <LoginPage />
      </div>
    );
  }

  return null;
};

export default Page;
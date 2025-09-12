"use client";

import { useTheme } from "@/context/ThemeContext";
import useEmergencyNotifications from "@/hooks/useEmergencyNotifications";
import { useEmergencyRequestCheck } from "@/hooks/useEmergencyRequestCheck";
import { useRequestStatus } from "@/hooks/useRequestStatus";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Activity,
  Building,
  Droplet,
  Heart,
  Hospital,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Send,
  Sun,
  TriangleAlert,
  UserCircle,
  Users,
  X
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const Navbar = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [dbRegistrationStatus, setDbRegistrationStatus] = useState(null);
  const { data: session, status } = useSession();
  const { userRole, loading: roleLoading, hasRole, isDonor, isBloodBank, isHospital, isRegistrationComplete } = useUserRole();
  const { pendingRequests } = useRequestStatus();
  const { hasEmergencyRequest } = useEmergencyRequestCheck();
  const pathname = usePathname();
  
  // Initialize emergency notifications for blood bank admins
  useEmergencyNotifications();
  
  const profileRef = useRef(null);

  // Check database directly if session shows incomplete registration but user has a role
  useEffect(() => {
    const checkDatabaseStatus = async () => {
      if (session && hasRole && !isRegistrationComplete && dbRegistrationStatus === null) {
        try {
          console.log('Navbar - Checking database for registration status...');
          const response = await fetch('/api/users/status');
          if (response.ok) {
            const result = await response.json();
            setDbRegistrationStatus(result.user?.isRegistrationComplete || false);
            console.log('Navbar - Database registration status:', result.user?.isRegistrationComplete);
          }
        } catch (error) {
          console.error('Navbar - Failed to check database status:', error);
        }
      }
    };

    checkDatabaseStatus();
  }, [session, hasRole, isRegistrationComplete, dbRegistrationStatus]);

  // Use database status if available, otherwise fall back to session
  const effectiveRegistrationComplete = dbRegistrationStatus !== null ? dbRegistrationStatus : isRegistrationComplete;

  // Handle clicks outside of profile dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };
  
  const handleLogout = async () => {
    // Don't clear role on logout - preserve user's chosen role
    signOut();
    setIsProfileOpen(false);
  };

  const isLoading = status === "loading" || roleLoading;

  // Helper function to get role-specific dashboard link
  const getDashboardLink = () => {
    if (!hasRole) return '/register';
    
    switch (userRole) {
      case 'user':
        return '/dashboard/donor';
      case 'bloodbank_admin':
        return '/dashboard/bloodbank';
      case 'hospital':
        return '/dashboard/hospital';
      default:
        return '/dashboard';
    }
  };

  // Helper function to get role-specific navigation items
  const getRoleSpecificNavItems = () => {
    if (!session) return [];
    
    // Debug: Add debug info to the navigation
    if (process.env.NODE_ENV === 'development') {
      console.log('DEBUG Navbar - hasRole:', hasRole, 'userRole:', userRole, 'sessionRegistrationComplete:', isRegistrationComplete, 'dbRegistrationComplete:', dbRegistrationStatus, 'effectiveRegistrationComplete:', effectiveRegistrationComplete);
    }
    
    // Only show role selection if user has no role
    if (!hasRole) {
      return [
        { href: '/register', icon: Users, label: 'Select Role', active: pathname === '/register' }
      ];
    }

    // If user has role but registration not complete, show registration link
    if (hasRole && !effectiveRegistrationComplete) {
      let registrationPath = '/register';
      switch (userRole) {
        case 'user':
          registrationPath = '/register/donor';
          break;
        case 'bloodbank_admin':
          registrationPath = '/register/bloodbank';
          break;
        case 'hospital':
          registrationPath = '/register/hospital';
          break;
      }
      return [
        { href: registrationPath, icon: Users, label: 'Complete Registration', active: pathname === registrationPath }
      ];
    }

    // Only show full navigation after registration is complete
    if (!effectiveRegistrationComplete) {
      return [];
    }

    const items = [];
    
    // Role-specific items (only after registration is complete)
    if (isDonor) {
      items.push(
        { href: '/donate', icon: Droplet, label: 'Donate Blood', active: pathname === '/donate' },
        { href: '/my-requests', icon: TriangleAlert, label: 'My Requests', active: pathname === '/my-requests' },
        { href: '/dashboard/donor', icon: Activity, label: 'My Donations', active: pathname === '/dashboard/donor' }
      );
    } else if (isBloodBank) {
      items.push(
        { href: '/requests', icon: TriangleAlert, label: 'Blood Requests', active: pathname === '/requests' },
        { href: '/hospital-request-acceptance', icon: Hospital, label: 'Hospital Request Acceptance', active: pathname === '/hospital-request-acceptance' },
        // { href: '/emergency-call', icon: TriangleAlert, label: 'Call Donors', active: pathname === '/emergency-call' },
        { href: '/inventory', icon: Building, label: 'Blood Inventory', active: pathname === '/inventory' },
        { href: '/donors', icon: Users, label: 'View Donors', active: pathname === '/donors' },
        { href: '/dashboard/bloodbank/drives', icon: Droplet, label: 'Donation Drives', active: pathname === '/dashboard/bloodbank/drives' },
        { href: '/dashboard/bloodbank', icon: Activity, label: 'Blood Bank Dashboard', active: pathname === '/dashboard/bloodbank' }
      );
    } else if (isHospital) {
      items.push(
        { href: '/requests', icon: Hospital, label: 'Blood Requests', active: pathname === '/requests' },
        { href: '/hospital-requests', icon: Send, label: 'Hospital Requests', active: pathname === '/hospital-requests' },
        { href: '/hospital-inventory', icon: Building, label: 'Inventory Management', active: pathname === '/hospital-inventory' },
        { href: '/dashboard/hospital', icon: Activity, label: 'Hospital Dashboard', active: pathname === '/dashboard/hospital' }
      );
    }

    return items;
  };

  // Helper function to render nav item with optional badge
  const renderNavItem = (item, className = '') => (
    <Link key={item.href} href={item.href}>
      <button className={className}>
        <div className="relative flex items-center space-x-1.5">
          <item.icon className="w-4 h-4 lg:w-5 lg:h-5" aria-hidden="true" />
          <span>{item.label}</span>
          {/* Show notification badge for My Requests if user has pending requests */}
          {item.href === '/my-requests' && pendingRequests > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {pendingRequests > 9 ? '9+' : pendingRequests}
            </span>
          )}
        </div>
      </button>
    </Link>
  );

  // Helper function to render nav item with optional badge for mobile
  const renderMobileNavItem = (item) => (
    <Link key={item.href} href={item.href}>
      <button className={`flex items-center space-x-3 px-4 py-2.5 rounded-4xl text-base font-medium w-full text-left transition-colors ${
        item.active 
          ? 'text-[#ef4444] bg-[#ef4444]/5' 
          : 'text-[var(--text-secondary)] hover:text-[#ef4444] hover:bg-[#ef4444]/5'
      }`}>
        <div className="relative flex items-center space-x-3 w-full">
          <item.icon className="w-5 h-5" aria-hidden="true" />
          <span>{item.label}</span>
          {/* Show notification badge for My Requests if user has pending requests */}
          {item.href === '/my-requests' && pendingRequests > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-auto">
              {pendingRequests > 9 ? '9+' : pendingRequests}
            </span>
          )}
        </div>
      </button>
    </Link>
  );

  // Helper function to render nav item with optional badge for medium/tablet (icon-only)
  const renderMediumNavItem = (item) => (
    <Link key={item.href} href={item.href}>
      <button className={`relative flex items-center space-x-1 px-2 py-2 rounded-4xl text-sm font-medium transition-colors ${
        item.active 
          ? 'text-[#ef4444] bg-[#ef4444]/5' 
          : 'text-[var(--text-secondary)] hover:text-[#ef4444] hover:bg-[#ef4444]/5'
      }`}>
        <item.icon className="w-5 h-5" aria-hidden="true" />
        <span className="sr-only">{item.label}</span>
        {/* Show notification badge for My Requests if user has pending requests */}
        {item.href === '/my-requests' && pendingRequests > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {pendingRequests > 9 ? '9+' : pendingRequests}
          </span>
        )}
      </button>
    </Link>
  );

  const navItems = getRoleSpecificNavItems();


  return (
    <header className="bg-[var(--card-background)] border-b border-[var(--border-color)] sticky top-0 z-50 w-full shadow-sm transition-colors duration-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 md:h-20 lg:h-24">
          {/* Logo */}
          <Link href="/">
            <button className="flex items-center space-x-2 sm:space-x-2.5 text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold font-heading text-[#ef4444] hover:text-[#ef4444]/90 transition-colors hover:cursor-pointer">
              <Heart className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" aria-hidden="true" />
              <span>BloodBond</span>
            </button>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-6">
            {/* Home - Active state */}
            <Link href="/">
              <button className={`flex items-center space-x-1.5 px-3 lg:px-4 py-2 lg:py-2.5 rounded-4xl text-sm lg:text-base font-medium transition-colors ${
                pathname === '/' 
                  ? 'text-[#ef4444] bg-[#ef4444]/5' 
                  : 'text-[var(--text-secondary)] hover:text-[#ef4444] hover:bg-[#ef4444]/5'
              }`}>
                <Heart className="w-4 h-4 lg:w-5 lg:h-5" aria-hidden="true" />
                <span>Home</span>
              </button>
            </Link>

            {/* Track Status - Available to donors who have made emergency requests, hospitals, and other non-blood bank users */}
            {(!isBloodBank && (!isDonor || (isDonor && hasEmergencyRequest))) && (
              <Link href="/track-request">
                <button className={`flex items-center space-x-1.5 px-3 lg:px-4 py-2 lg:py-2.5 rounded-4xl text-sm lg:text-base font-medium transition-colors ${
                  pathname === '/track-request' 
                    ? 'text-[#ef4444] bg-[#ef4444]/5' 
                    : 'text-[var(--text-secondary)] hover:text-[#ef4444] hover:bg-[#ef4444]/5'
                }`}>
                  <TriangleAlert className="w-4 h-4 lg:w-5 lg:h-5" aria-hidden="true" />
                  <span>Track Status</span>
                </button>
              </Link>
            )}
            
            {/* Role-based navigation items */}
            {navItems.map((item, index) => 
              renderNavItem(item, `flex items-center space-x-1.5 px-3 lg:px-4 py-2 lg:py-2.5 rounded-4xl text-sm lg:text-base font-medium transition-colors ${
                item.active 
                  ? 'text-[#ef4444] bg-[#ef4444]/5' 
                  : 'text-[var(--text-secondary)] hover:text-[#ef4444] hover:bg-[#ef4444]/5'
              }`)
            )}
          </nav>

          {/* Medium navigation (tablet) */}
          <nav className="hidden md:flex lg:hidden items-center">
            {/* Home - Active state */}
            <Link href="/">
              <button className={`flex items-center space-x-1 px-2 py-2 rounded-4xl text-sm font-medium transition-colors ${
                pathname === '/' 
                  ? 'text-[#ef4444] bg-[#ef4444]/5' 
                  : 'text-[var(--text-secondary)] hover:text-[#ef4444] hover:bg-[#ef4444]/5'
              }`}>
                <Heart className="w-5 h-5" aria-hidden="true" />
                <span className="sr-only">Home</span>
              </button>
            </Link>

            {/* Track Status - Available to donors who have made emergency requests, hospitals, and other non-blood bank users */}
            {(!isBloodBank && (!isDonor || (isDonor && hasEmergencyRequest))) && (
              <Link href="/track-request">
                <button className={`flex items-center space-x-1 px-2 py-2 rounded-4xl text-sm font-medium transition-colors ${
                  pathname === '/track-request' 
                    ? 'text-[#ef4444] bg-[#ef4444]/5' 
                    : 'text-[var(--text-secondary)] hover:text-[#ef4444] hover:bg-[#ef4444]/5'
                }`}>
                  <TriangleAlert className="w-5 h-5" aria-hidden="true" />
                  <span className="sr-only">Track Status</span>
                </button>
              </Link>
            )}
            
            {/* Role-based navigation items */}
            {navItems.map((item, index) => renderMediumNavItem(item))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
            {/* Theme toggle */}
            <button 
              className="p-2 rounded-4xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" aria-hidden="true" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" aria-hidden="true" />
              )}
            </button>

            {/* User or Login button */}
            {isLoading ? (
              <div className="w-10 h-10 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            ) : session ? (
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={toggleProfile}
                  className="flex items-center space-x-2 px-3 md:px-4 py-2 rounded-4xl text-sm lg:text-base font-medium text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <UserCircle className="w-5 h-5 text-[#ef4444]" aria-hidden="true" />
                  <span className="hidden md:inline truncate max-w-[100px] lg:max-w-[150px]">
                    {session.user?.name || session.user?.email || "Account"}
                  </span>
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[var(--card-background)] border border-[var(--border-color)] rounded-md shadow-lg z-50">
                    <div className="p-2">
                      <div className="px-3 py-2 text-sm text-[var(--text-secondary)]">
                        Signed in as{" "}
                        <span className="font-medium text-[var(--text-primary)]">
                          {session.user?.email}
                        </span>
                      </div>
                      <hr className="border-[var(--border-color)] my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : ( 
              <Link href="/login">
                <button 
                  className="flex items-center space-x-1.5 px-3 md:px-4 py-2 rounded-4xl text-sm lg:text-base font-medium text-[var(--text-primary)] hover:text-[#ef4444] hover:bg-[#ef4444]/5 transition-colors"
                >
                  <LogIn className="w-5 h-5" aria-hidden="true" />
                  <span className="hidden md:inline">Login</span>
                </button>
              </Link>
            )}

            {/* Emergency CTA button - Not shown to donors */}
            {!isDonor && (
              <Link href="/emergency">
                <button className="hidden sm:flex items-center justify-center gap-1.5 px-3 md:px-4 lg:px-5 py-2 lg:py-2.5 rounded-4xl bg-[#ef4444] hover:bg-[#ef4444]/90 text-white font-medium text-sm lg:text-base transition-colors">
                  <TriangleAlert className="w-4 h-4 lg:w-5 lg:h-5" aria-hidden="true" />
                  <span>Emergency</span>
                </button>
              </Link>
            )}

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-4xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-[var(--text-primary)]" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5 text-[var(--text-primary)]" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[var(--border-color)] bg-[var(--card-background)] transition-colors duration-200">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex flex-col space-y-2">
              <Link href="/">
                <button className={`flex items-center space-x-3 px-4 py-2.5 rounded-4xl text-base font-medium w-full text-left transition-colors ${
                  pathname === '/' 
                    ? 'text-[#ef4444] bg-[#ef4444]/5' 
                    : 'text-[var(--text-secondary)] hover:text-[#ef4444] hover:bg-[#ef4444]/5'
                }`}>
                  <Heart className="w-5 h-5" aria-hidden="true" />
                  <span>Home</span>
                </button>
              </Link>

              {/* Track Status - Available to donors who have made emergency requests, hospitals, and other non-blood bank users */}
              {(!isBloodBank && (!isDonor || (isDonor && hasEmergencyRequest))) && (
                <Link href="/track-request">
                  <button className={`flex items-center space-x-3 px-4 py-2.5 rounded-4xl text-base font-medium w-full text-left transition-colors ${
                    pathname === '/track-request' 
                      ? 'text-[#ef4444] bg-[#ef4444]/5' 
                      : 'text-[var(--text-secondary)] hover:text-[#ef4444] hover:bg-[#ef4444]/5'
                  }`}>
                    <TriangleAlert className="w-5 h-5" aria-hidden="true" />
                    <span>Track Status</span>
                  </button>
                </Link>
              )}
              
              {/* Role-based navigation items */}
              {navItems.map((item, index) => renderMobileNavItem(item))}
              
              {/* User or Login button in mobile menu */}
              {session ? (
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-2.5 rounded-4xl text-base font-medium text-[var(--text-secondary)] hover:text-[#ef4444] hover:bg-[#ef4444]/5 w-full text-left"
                >
                  <LogOut className="w-5 h-5" aria-hidden="true" />
                  <span>Sign Out ({session.user?.name || "Account"})</span>
                </button>
              ) : (
                <Link href="/login">
                  <button 
                    className="flex items-center space-x-3 px-4 py-2.5 rounded-4xl text-base font-medium text-[var(--text-secondary)] hover:text-[#ef4444] hover:bg-[#ef4444]/5 w-full text-left"
                  >
                    <LogIn className="w-5 h-5" aria-hidden="true" />
                    <span>Login</span>
                  </button>
                </Link>
              )}

              {/* Emergency button in mobile menu - Not shown to donors */}
              {!isDonor && (
                <Link href="/emergency">
                  <button className="flex items-center justify-center gap-2 mt-2 px-5 py-2.5 rounded-4xl bg-[#ef4444] hover:bg-[#ef4444]/90 text-white font-medium text-base">
                    <TriangleAlert className="w-5 h-5" aria-hidden="true" />
                    <span>Emergency</span>
                  </button>
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
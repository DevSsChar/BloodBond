"use client";

import { useState } from "react";
import { 
  Heart, 
  TriangleAlert,
  Users,
  Activity,
  Sun,
  Moon,
  Menu,
  X
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const Navbar = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-[var(--card-background)] border-b border-[var(--border-color)] sticky top-0 z-50 w-full shadow-sm transition-colors duration-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 md:h-20 lg:h-24">
          {/* Logo */}
          <button className="flex items-center space-x-2 sm:space-x-2.5 text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold font-heading text-[#ef4444] hover:text-[#ef4444]/90 transition-colors">
            <Heart className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" aria-hidden="true" />
            <span>BloodBond</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-6">
            {/* Home - Active state */}
            <button className="flex items-center space-x-1.5 px-3 lg:px-4 py-2 lg:py-2.5 rounded-4xl text-sm lg:text-base font-medium text-[#ef4444] bg-[#ef4444]/5 transition-colors">
              <Heart className="w-4 h-4 lg:w-5 lg:h-5" aria-hidden="true" />
              <span>Home</span>
            </button>
            
            {/* Emergency nav item */}
            <button className="flex items-center space-x-1.5 px-3 lg:px-4 py-2 lg:py-2.5 rounded-4xl text-sm lg:text-base font-medium text-[var(--text-secondary)] hover:text-[#ef4444] hover:bg-[#ef4444]/5 transition-colors">
              <TriangleAlert className="w-4 h-4 lg:w-5 lg:h-5" aria-hidden="true" />
              <span>Emergency</span>
            </button>
            
            {/* Register */}
            <button className="flex items-center space-x-1.5 px-3 lg:px-4 py-2 lg:py-2.5 rounded-4xl text-sm lg:text-base font-medium text-[var(--text-secondary)] hover:text-[#ef4444] hover:bg-[#ef4444]/5 transition-colors">
              <Users className="w-4 h-4 lg:w-5 lg:h-5" aria-hidden="true" />
              <span>Register</span>
            </button>
            
            {/* Dashboard */}
            <button className="flex items-center space-x-1.5 px-3 lg:px-4 py-2 lg:py-2.5 rounded-4xl text-sm lg:text-base font-medium text-[var(--text-secondary)] hover:text-[#ef4444] hover:bg-[#ef4444]/5 transition-colors">
              <Activity className="w-4 h-4 lg:w-5 lg:h-5" aria-hidden="true" />
              <span>Dashboard</span>
            </button>
          </nav>

          {/* Medium navigation (tablet) */}
          <nav className="hidden md:flex lg:hidden items-center">
            {/* Home - Active state */}
            <button className="flex items-center space-x-1 px-2 py-2 rounded-4xl text-sm font-medium text-[#ef4444] hover:bg-[#ef4444]/5 transition-colors">
              <Heart className="w-5 h-5" aria-hidden="true" />
              <span className="sr-only">Home</span>
            </button>
            
            {/* Emergency nav item */}
            <button className="flex items-center space-x-1 px-2 py-2 rounded-4xl text-sm font-medium text-[var(--text-secondary)] hover:text-[#ef4444] hover:bg-[#ef4444]/5 transition-colors">
              <TriangleAlert className="w-5 h-5" aria-hidden="true" />
              <span className="sr-only">Emergency</span>
            </button>
            
            {/* Register */}
            <button className="flex items-center space-x-1 px-2 py-2 rounded-4xl text-sm font-medium text-[var(--text-secondary)] hover:text-[#ef4444] hover:bg-[#ef4444]/5 transition-colors">
              <Users className="w-5 h-5" aria-hidden="true" />
              <span className="sr-only">Register</span>
            </button>
            
            {/* Dashboard */}
            <button className="flex items-center space-x-1 px-2 py-2 rounded-4xl text-sm font-medium text-[var(--text-secondary)] hover:text-[#ef4444] hover:bg-[#ef4444]/5 transition-colors">
              <Activity className="w-5 h-5" aria-hidden="true" />
              <span className="sr-only">Dashboard</span>
            </button>
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
            
            {/* Emergency CTA button */}
            <button className="hidden sm:flex items-center justify-center gap-1.5 px-3 md:px-4 lg:px-5 py-2 lg:py-2.5 rounded-4xl bg-[#ef4444] hover:bg-[#ef4444]/90 text-white font-medium text-sm lg:text-base transition-colors">
              <TriangleAlert className="w-4 h-4 lg:w-5 lg:h-5" aria-hidden="true" />
              <span>Emergency</span>
            </button>

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
              <button className="flex items-center space-x-3 px-4 py-2.5 rounded-4xl text-base font-medium text-[#ef4444] bg-[#ef4444]/5">
                <Heart className="w-5 h-5" aria-hidden="true" />
                <span>Home</span>
              </button>
              
              <button className="flex items-center space-x-3 px-4 py-2.5 rounded-4xl text-base font-medium text-[var(--text-secondary)] hover:text-[#ef4444] hover:bg-[#ef4444]/5">
                <TriangleAlert className="w-5 h-5" aria-hidden="true" />
                <span>Emergency</span>
              </button>
              
              <button className="flex items-center space-x-3 px-4 py-2.5 rounded-4xl text-base font-medium text-[var(--text-secondary)] hover:text-[#ef4444] hover:bg-[#ef4444]/5">
                <Users className="w-5 h-5" aria-hidden="true" />
                <span>Register</span>
              </button>
              
              <button className="flex items-center space-x-3 px-4 py-2.5 rounded-4xl text-base font-medium text-[var(--text-secondary)] hover:text-[#ef4444] hover:bg-[#ef4444]/5">
                <Activity className="w-5 h-5" aria-hidden="true" />
                <span>Dashboard</span>
              </button>

              <button className="flex items-center justify-center gap-2 mt-2 px-5 py-2.5 rounded-4xl bg-[#ef4444] hover:bg-[#ef4444]/90 text-white font-medium text-base">
                <TriangleAlert className="w-5 h-5" aria-hidden="true" />
                <span>Emergency</span>
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
import Image from "next/image";
import Link from "next/link";
import { Heart, TriangleAlert, Activity, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <main className="bg-[var(--background)] transition-colors duration-200">
      {/* Hero Section with dynamic margins - not changed since it has its own colors */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#ef4444] to-[#ef4444]/90 text-white 
        py-12 sm:py-16 md:py-20 lg:py-28 xl:py-32
        mx-[3vw] sm:mx-[4vw] lg:mx-[5vw] mt-6
        rounded-t-lg">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 sm:space-y-8 md:space-y-10 md:col-span-7 lg:col-span-6">
              {/* Logo */}
              <div className="flex items-center space-x-2 mb-2 sm:mb-4 md:mb-6">
                <Heart className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-white" aria-hidden="true" />
                <span className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold">BloodBond</span>
              </div>
              
              {/* Main Content */}
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                <h1 className="font-heading text-3xl sm:text-4xl md:text-[2.75rem] lg:text-5xl xl:text-6xl font-bold leading-tight">
                  Connecting Lives in
                  <span className="block text-white/90">Critical Moments</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl">
                  Real-time blood donor matching that saves lives. Join thousands of donors making a difference 
                  when every second counts.
                </p>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto pt-2">
                <Link href="/emergency" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-[#ef4444] hover:bg-gray-100 
                  font-medium sm:font-semibold px-4 sm:px-5 md:px-6 lg:px-8 py-3 md:py-3.5 rounded-2xl transition-all">
                  <TriangleAlert className="mr-1 md:mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                  Request Emergency Blood
                </Link>
                <Link href="/register" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white text-white 
                  hover:bg-white hover:text-[#ef4444] font-medium sm:font-semibold px-4 sm:px-5 md:px-6 lg:px-8 py-3 md:py-3.5 rounded-2xl transition-all">
                  <Heart className="mr-1 md:mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                  Become a Donor
                </Link>
              </div>
              
              {/* Stats */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 inline-block mt-2">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></div>
                    <span className="text-sm sm:text-base text-white/90 font-medium">Lives Connected Today</span>
                  </div>
                  <div className="font-heading text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">1,410</div>
                </div>
              </div>
            </div>
            
            {/* Right Content - Heartbeat Icon */}
            <div className="hidden md:flex justify-center md:col-span-5 lg:col-span-6">
              <div className="relative">
                <div className="w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-72 lg:h-72 xl:w-96 xl:h-96 
                  bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Activity 
                    className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 xl:h-32 xl:w-32 text-white/80" 
                    aria-hidden="true" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blood Donation Statistics Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 
        mx-[3vw] sm:mx-[4vw] lg:mx-[5vw] mb-6
        bg-[var(--card-background)] rounded-b-lg shadow-sm border border-[var(--border-color)] transition-colors duration-200">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-start">
            {/* Left side - Statistics */}
            <div className="space-y-6 sm:space-y-8 md:space-y-10">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--text-primary)] max-w-xl">
                Every 2 seconds, someone needs blood
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {/* Stat Card 1 */}
                <div className="flex flex-col rounded-xl border border-[#ef4444]/20 shadow-sm p-4 sm:p-5 md:p-6 text-center bg-[var(--card-background)] transition-colors duration-200">
                  <div className="text-3xl sm:text-3xl md:text-4xl font-heading font-bold text-[#ef4444] mb-2">6.8M</div>
                  <p className="text-sm md:text-base text-[var(--text-secondary)]">Units needed annually</p>
                </div>

                {/* Stat Card 2 */}
                <div className="flex flex-col rounded-xl border border-[#ef4444]/20 shadow-sm p-4 sm:p-5 md:p-6 text-center bg-[var(--card-background)] transition-colors duration-200">
                  <div className="text-3xl sm:text-3xl md:text-4xl font-heading font-bold text-[#ef4444] mb-2">38%</div>
                  <p className="text-sm md:text-base text-[var(--text-secondary)]">Population eligible</p>
                </div>

                {/* Stat Card 3 */}
                <div className="flex flex-col rounded-xl border border-[#ef4444]/20 shadow-sm p-4 sm:p-5 md:p-6 text-center bg-[var(--card-background)] transition-colors duration-200">
                  <div className="text-3xl sm:text-3xl md:text-4xl font-heading font-bold text-[#ef4444] mb-2">3%</div>
                  <p className="text-sm md:text-base text-[var(--text-secondary)]">Actually donate</p>
                </div>

                {/* Stat Card 4 */}
                <div className="flex flex-col rounded-xl border border-[#ef4444]/20 shadow-sm p-4 sm:p-5 md:p-6 text-center bg-[var(--card-background)] transition-colors duration-200">
                  <div className="text-3xl sm:text-3xl md:text-4xl font-heading font-bold text-[#ef4444] mb-2">2min</div>
                  <p className="text-sm md:text-base text-[var(--text-secondary)]">Critical window</p>
                </div>
              </div>
            </div>

            {/* Right side - The Challenge */}
            <div className="flex flex-col gap-5 md:gap-6 rounded-xl border shadow-sm p-5 sm:p-6 md:p-7 lg:p-8 bg-[var(--card-background)] border-[var(--border-color)] transition-colors duration-200">
              <div className="space-y-2 md:space-y-3">
                <div className="font-semibold font-heading text-2xl md:text-3xl text-[var(--text-primary)]">The Challenge</div>
                <div className="text-sm md:text-base text-[var(--text-secondary)]">
                  Traditional blood banking systems struggle with real-time matching and emergency response
                </div>
              </div>

              <div className="space-y-5 md:space-y-6 pt-3">
                {/* Before */}
                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#ef4444]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <TriangleAlert className="h-3.5 w-3.5 md:h-4.5 md:w-4.5 text-[#ef4444]" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)] text-base md:text-lg">Before: Hours of searching</p>
                    <p className="text-sm md:text-base text-[var(--text-secondary)]">Manual calls to blood banks, uncertain availability</p>
                  </div>
                </div>

                {/* After */}
                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-3.5 w-3.5 md:h-4.5 md:w-4.5 text-green-600" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)] text-base md:text-lg">After: Instant connections</p>
                    <p className="text-sm md:text-base text-[var(--text-secondary)]">Real-time matching with verified donors nearby</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How BloodBond Works Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-10 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4 sm:mb-6">
              How BloodBond Works
            </h2>
            <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-4xl mx-auto">
              Advanced technology meets human compassion to create the fastest, most reliable blood donation network
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Instant Matching */}
            <div className="bg-[var(--card-background)] rounded-xl p-6 sm:p-8 border border-[var(--border-color)] hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#ef4444]/10 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[#ef4444]/20 transition-colors">
                <Activity className="h-6 w-6 sm:h-7 sm:w-7 text-[#ef4444]" />
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-3 sm:mb-4">
                Instant Matching
              </h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                AI-powered algorithms match blood requests with compatible donors in seconds, not hours
              </p>
            </div>

            {/* Location-Based */}
            <div className="bg-[var(--card-background)] rounded-xl p-6 sm:p-8 border border-[var(--border-color)] hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#ef4444]/10 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[#ef4444]/20 transition-colors">
                <svg className="h-6 w-6 sm:h-7 sm:w-7 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-3 sm:mb-4">
                Location-Based
              </h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Find donors within optimal distance for emergency situations and routine needs
              </p>
            </div>

            {/* Verified Safety */}
            <div className="bg-[var(--card-background)] rounded-xl p-6 sm:p-8 border border-[var(--border-color)] hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#ef4444]/10 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[#ef4444]/20 transition-colors">
                <svg className="h-6 w-6 sm:h-7 sm:w-7 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-3 sm:mb-4">
                Verified Safety
              </h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                All donors undergo comprehensive screening and verification processes
              </p>
            </div>

            {/* Real-Time Updates */}
            <div className="bg-[var(--card-background)] rounded-xl p-6 sm:p-8 border border-[var(--border-color)] hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#ef4444]/10 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[#ef4444]/20 transition-colors">
                <svg className="h-6 w-6 sm:h-7 sm:w-7 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-3 sm:mb-4">
                Real-Time Updates
              </h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Live notifications keep all parties informed throughout the donation process
              </p>
            </div>

            {/* Health Monitoring */}
            <div className="bg-[var(--card-background)] rounded-xl p-6 sm:p-8 border border-[var(--border-color)] hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#ef4444]/10 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[#ef4444]/20 transition-colors">
                <svg className="h-6 w-6 sm:h-7 sm:w-7 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-3 sm:mb-4">
                Health Monitoring
              </h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Continuous tracking of donor health status and availability
              </p>
            </div>

            {/* Community Network */}
            <div className="bg-[var(--card-background)] rounded-xl p-6 sm:p-8 border border-[var(--border-color)] hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#ef4444]/10 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[#ef4444]/20 transition-colors">
                <svg className="h-6 w-6 sm:h-7 sm:w-7 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-3 sm:mb-4">
                Community Network
              </h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Join thousands of verified donors committed to saving lives
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-[var(--card-background)] border-y border-[var(--border-color)]">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-10 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4 sm:mb-6">
              From Request to Donation in Minutes
            </h2>
            <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-3xl mx-auto">
              Our streamlined process ensures rapid response when lives are at stake
            </p>
          </div>

          {/* Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
            {/* Step 1 */}
            <div className="text-center relative">
              <div className="relative mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#ef4444] text-white rounded-full flex items-center justify-center mx-auto font-heading text-xl sm:text-2xl font-bold shadow-lg">
                  1
                </div>
                {/* Connector Line - Hidden on last item */}
                <div className="hidden lg:block absolute top-1/2 left-full w-full h-0.5 bg-[var(--border-color)] -translate-y-1/2 lg:w-24 xl:w-32"></div>
              </div>
              <div className="bg-[var(--card-background)] rounded-xl p-6 sm:p-8 border border-[var(--border-color)] shadow-sm">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#ef4444]/10 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <TriangleAlert className="h-6 w-6 sm:h-7 sm:w-7 text-[#ef4444]" />
                </div>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-3 sm:mb-4">
                  Emergency Request
                </h3>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  Hospital or patient submits urgent blood request with location and blood type
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center relative">
              <div className="relative mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#ef4444] text-white rounded-full flex items-center justify-center mx-auto font-heading text-xl sm:text-2xl font-bold shadow-lg">
                  2
                </div>
                <div className="hidden lg:block absolute top-1/2 left-full w-full h-0.5 bg-[var(--border-color)] -translate-y-1/2 lg:w-24 xl:w-32"></div>
              </div>
              <div className="bg-[var(--card-background)] rounded-xl p-6 sm:p-8 border border-[var(--border-color)] shadow-sm">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#ef4444]/10 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Activity className="h-6 w-6 sm:h-7 sm:w-7 text-[#ef4444]" />
                </div>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-3 sm:mb-4">
                  Instant Matching
                </h3>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  AI algorithm identifies compatible donors within optimal radius
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center relative">
              <div className="relative mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#ef4444] text-white rounded-full flex items-center justify-center mx-auto font-heading text-xl sm:text-2xl font-bold shadow-lg">
                  3
                </div>
                <div className="hidden lg:block absolute top-1/2 left-full w-full h-0.5 bg-[var(--border-color)] -translate-y-1/2 lg:w-24 xl:w-32"></div>
              </div>
              <div className="bg-[var(--card-background)] rounded-xl p-6 sm:p-8 border border-[var(--border-color)] shadow-sm">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#ef4444]/10 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg className="h-6 w-6 sm:h-7 sm:w-7 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-3 sm:mb-4">
                  Donor Notification
                </h3>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  Verified donors receive immediate notification with request details
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="relative mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#ef4444] text-white rounded-full flex items-center justify-center mx-auto font-heading text-xl sm:text-2xl font-bold shadow-lg">
                  4
                </div>
              </div>
              <div className="bg-[var(--card-background)] rounded-xl p-6 sm:p-8 border border-[var(--border-color)] shadow-sm">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#ef4444]/10 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 text-[#ef4444]" />
                </div>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-3 sm:mb-4">
                  Rapid Response
                </h3>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  Donors confirm availability and coordinate donation logistics
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Statistics Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-10 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4 sm:mb-6">
              Real Impact, Real Lives
            </h2>
            <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-3xl mx-auto">
              See how BloodBond is transforming emergency response and saving lives
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16 md:mb-20">
            {/* Success Rate */}
            <div className="bg-[var(--card-background)] rounded-xl p-6 sm:p-8 border border-[var(--border-color)] text-center hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="h-6 w-6 sm:h-7 sm:w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-2 sm:mb-3">94%</div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">Success Rate</h3>
              <p className="text-sm text-[var(--text-secondary)]">Emergency requests fulfilled</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-4">
                <div className="bg-[#ef4444] h-1.5 rounded-full" style={{width: '94%'}}></div>
              </div>
            </div>

            {/* Average Response */}
            <div className="bg-[var(--card-background)] rounded-xl p-6 sm:p-8 border border-[var(--border-color)] text-center hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-2 sm:mb-3">4.2min</div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">Average Response</h3>
              <p className="text-sm text-[var(--text-secondary)]">From request to match and ready</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-4">
                <div className="bg-[#ef4444] h-1.5 rounded-full" style={{width: '88%'}}></div>
              </div>
            </div>

            {/* Active Donors */}
            <div className="bg-[var(--card-background)] rounded-xl p-6 sm:p-8 border border-[var(--border-color)] text-center hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="h-6 w-6 sm:h-7 sm:w-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-2 sm:mb-3">12,847</div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">Active Donors</h3>
              <p className="text-sm text-[var(--text-secondary)]">Verified and ready</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-4">
                <div className="bg-[#ef4444] h-1.5 rounded-full" style={{width: '76%'}}></div>
              </div>
            </div>

            {/* Lives Saved */}
            <div className="bg-[var(--card-background)] rounded-xl p-6 sm:p-8 border border-[var(--border-color)] text-center hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="h-6 w-6 sm:h-7 sm:w-7 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-2 sm:mb-3">2,349</div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">Lives Saved</h3>
              <p className="text-sm text-[var(--text-secondary)]">This month alone</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-4">
                <div className="bg-[#ef4444] h-1.5 rounded-full" style={{width: '92%'}}></div>
              </div>
            </div>
          </div>

          {/* Call to Action Section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#ef4444]/10 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
              <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-[#ef4444]" />
            </div>
            <h3 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4 sm:mb-6">
              Join the Mission
            </h3>
            <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-8 sm:mb-12">
              Every donation matters. Every donor saves lives. Be part of the network that's revolutionizing emergency blood response.
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Emergency Request Card */}
            <div className="bg-gradient-to-br from-[#ef4444] to-[#ef4444]/90 rounded-xl p-6 sm:p-8 lg:p-10 text-white">
              <div className="flex items-center mb-4 sm:mb-6">
                <TriangleAlert className="h-6 w-6 sm:h-8 sm:w-8 mr-3 sm:mr-4" />
                <h3 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold">
                  Emergency Blood Needed?
                </h3>
              </div>
              <p className="text-white/90 mb-6 sm:mb-8 text-base sm:text-lg">
                Every second counts. Get connected to verified donors in your area within minutes.
              </p>
              <Link href="/emergency" className="inline-flex items-center justify-center bg-white text-[#ef4444] hover:bg-gray-100 font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-300 group">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Request Emergency Blood
              </Link>
              <div className="flex items-center space-x-4 sm:space-x-6 mt-4 sm:mt-6 text-sm sm:text-base text-white/80">
                <span>24/7 emergency response</span>
                <span>•</span>
                <span>Average 4.2 minute response time</span>
              </div>
            </div>

            {/* Become Donor Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 sm:p-8 lg:p-10 text-white">
              <div className="flex items-center mb-4 sm:mb-6">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 mr-3 sm:mr-4" />
                <h3 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold">
                  Ready to Save Lives?
                </h3>
              </div>
              <p className="text-white/90 mb-6 sm:mb-8 text-base sm:text-lg">
                Join our network of heroes. Register as a donor and help save lives in your community.
              </p>
              <Link href="/register" className="inline-flex items-center justify-center bg-white text-blue-600 hover:bg-gray-100 font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-300 group">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Become a Donor
              </Link>
              <div className="flex items-center space-x-4 sm:space-x-6 mt-4 sm:mt-6 text-sm sm:text-base text-white/80">
                <span>Safe & secure</span>
                <span>•</span>
                <span>Flexible scheduling</span>
                <span>•</span>
                <span>Make a difference</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

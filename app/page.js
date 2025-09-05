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
    </main>
  );
}

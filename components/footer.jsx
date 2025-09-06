import { Heart, Phone } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-[var(--card-background)] border-t border-[var(--border-color)] py-3 sm:py-4 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="text-center text-xs sm:text-sm text-[var(--text-secondary)]">
          <div className="flex items-center justify-center space-x-1 sm:space-x-2 mb-1">
            <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-[#ef4444]" aria-hidden="true" />
            <span className="font-heading font-medium text-[#ef4444]">BloodBond</span>
          </div>
          
          <p className="text-xs sm:text-sm max-w-lg mx-auto">
            Connecting lives in critical moments. Available 24/7 for emergency blood requests.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-3 gap-y-1 mt-2 text-xs">
            <span className="flex items-center space-x-1">
              <Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3" aria-hidden="true" />
              <span>Emergency: 108</span>
            </span>
            
            <span className="hidden xs:inline text-gray-400 dark:text-gray-600">•</span>
            
            <Link href="/privacy" className="hover:text-[#ef4444] transition-colors">
              Privacy Policy
            </Link>
            
            <span className="hidden xs:inline text-gray-400 dark:text-gray-600">•</span>
            
            <Link href="/terms" className="hover:text-[#ef4444] transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import "./dark-theme.css";
import "./chatbot.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Chatbot from "@/components/Chatbot";
import { ThemeProvider } from "@/context/ThemeContext";
import SessionWrapper from "@/components/SessionProvider";
import ToastProvider from "@/context/ToastContext";
import RequestTrackingProvider from "@/context/RequestTrackingContext";

// Load Inter as body font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Load Manrope as heading font
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata = {
  title: "BloodBond - Connecting Lives in Critical Moments",
  description: "Real-time blood donor matching that saves lives",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${manrope.variable} font-sans bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-200`}>
        <ThemeProvider>
          <SessionWrapper>
            <RequestTrackingProvider>
              <ToastProvider>
                <Navbar />
                <main className="min-h-screen">
                  {children}
                </main>
                <Footer />
                <Chatbot />
              </ToastProvider>
            </RequestTrackingProvider>
          </SessionWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}

    
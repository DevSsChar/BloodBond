import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import "./dark-theme.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { ThemeProvider } from "@/context/ThemeContext";
import SessionWrapper from "@/components/SessionProvider";

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
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </SessionWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}

    
"use client";
import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";
import Link from "next/link";
import { Heart, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

const CredentialsLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { data: session, status } = useSession();
  const { userRole, loading: roleLoading, hasRole } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading" || roleLoading) return;
    
    if (status === "authenticated" && session) {
      // Check registration status and redirect appropriately
      if (!hasRole) {
        router.push("/register");
      } else if (!session.user.isRegistrationComplete) {
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else if (result?.ok) {
        // Successful login, let useEffect handle redirection
        console.log("Login successful");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (status === "loading" || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ef4444]"></div>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ef4444]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4 sm:p-6">
      <div className="w-full max-w-md space-y-8 bg-[var(--card-background)] p-6 sm:p-8 rounded-xl shadow-md border border-[var(--border-color)] transition-colors duration-200">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <Heart className="h-7 w-7 text-[#ef4444]" aria-hidden="true" />
            <span className="font-heading text-2xl font-bold text-[var(--text-primary)]">BloodBond</span>
          </div>
          <h2 className="mt-6 text-xl font-bold text-[var(--text-primary)]">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Enter your email and password to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                <Mail className="inline w-4 h-4 mr-2" />
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                <Lock className="inline w-4 h-4 mr-2" />
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pr-10 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-white text-sm font-medium transition-colors ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#ef4444] hover:bg-[#ef4444]/90"
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        {/* Navigation Links */}
        <div className="mt-6 space-y-4">
          <div className="text-center">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline underline-offset-2">
              <ArrowLeft className="w-4 h-4" />
              Back to login options
            </Link>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-medium text-[#ef4444] hover:text-[#ef4444]/80 underline-offset-2 hover:underline">
                Register now
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-center text-[var(--text-secondary)]">
          <p>
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-[#ef4444] hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-[#ef4444] hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CredentialsLogin;

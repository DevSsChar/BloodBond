"use client";

import { Loader } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const AADHAAR_STORAGE_KEY = "bloodbond_emergency_aadhaar";

function DigilockerReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const state = searchParams.get("state");
  const [message, setMessage] = useState("Completing Aadhaar verification…");

  useEffect(() => {
    if (!state) {
      setMessage("Missing verification state. Returning to emergency form…");
      setTimeout(() => router.replace("/emergency"), 2000);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 40;

    const poll = async () => {
      if (cancelled) {
        return;
      }
      attempts += 1;
      try {
        const res = await fetch(
          `/api/kyc/digilocker/complete?state=${encodeURIComponent(state)}`
        );
        const data = await res.json();

        if (data.status === "verified" && data.verificationId) {
          sessionStorage.setItem(
            AADHAAR_STORAGE_KEY,
            JSON.stringify({
              verificationId: data.verificationId,
              verifiedName: data.verifiedName || null,
              expiresAt: data.expiresAt || null,
            })
          );
          router.replace("/emergency?aadhaar=verified");
          return;
        }

        if (data.status === "failed" || data.status === "expired") {
          setMessage(data.error || "Verification failed.");
          setTimeout(() => router.replace("/emergency?aadhaar=failed"), 2500);
          return;
        }

        if (attempts >= maxAttempts) {
          setMessage("Verification is taking too long. Try again from the form.");
          setTimeout(() => router.replace("/emergency"), 3000);
          return;
        }

        setMessage("Waiting for DigiLocker consent…");
        setTimeout(poll, 2000);
      } catch {
        setMessage("Could not confirm verification. Try again.");
        setTimeout(() => router.replace("/emergency"), 2500);
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [state, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="text-center max-w-md">
        <Loader className="h-10 w-10 animate-spin text-[#ef4444] mx-auto mb-4" />
        <p className="text-[var(--text-primary)] font-medium">{message}</p>
        <p className="text-sm text-[var(--text-secondary)] mt-2">
          Do not close this tab until you are redirected.
        </p>
      </div>
    </div>
  );
}

export default function DigilockerReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader className="h-10 w-10 animate-spin text-[#ef4444]" />
        </div>
      }
    >
      <DigilockerReturnContent />
    </Suspense>
  );
}

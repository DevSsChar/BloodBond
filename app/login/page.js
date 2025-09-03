"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoginPage from "@/components/Login";

const Page = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status,session, router]);

  // Return a loading state until the session is determined
  if (status === "loading") {
    return <p>Loading...</p>;
  }

  // Render Dashboard if authenticated
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
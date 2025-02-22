"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyProfile } from "@/app/api/profiles";
import { ProfileSetupWizard } from "@/app/components/profile/setup-wizard";
import { Loader2 } from "lucide-react";

export default function SetupProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [canSetup, setCanSetup] = useState(false);

  useEffect(() => {
    const checkProfileStatus = async () => {
      try {
        await getMyProfile();
        // If we get here, profile exists, redirect to dashboard
        router.push('/tenant-dashboard');
      } catch (error: any) {
        // Log the full error object for debugging
        console.error('Profile check error:', error);

        // Check both error.status and error.response.status
        const status = error.status || error.response?.status;
        const message = error.message || error.response?.message;

        if (status === 404) {
          setCanSetup(true);
        } else {
          // For any other error, redirect to dashboard
          router.push('/tenant-dashboard');
        }
      } finally {
        setLoading(false);
      }
    };

    checkProfileStatus();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!canSetup) {
    router.push('/tenant-dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container">
        <ProfileSetupWizard />
      </div>
    </div>
  );
}
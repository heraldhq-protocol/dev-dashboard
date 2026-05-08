"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PulsatingDots } from "@/components/ui/pulsating-loader";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Basic fallback redirect if NextAuth's native routing leaves us stranded
    router.replace("/overview");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy">
      <div className="text-center flex flex-col items-center">
        <div className="mb-4">
          <PulsatingDots />
        </div>
        <p className="text-sm font-semibold text-text-muted mt-2">Authenticating...</p>
      </div>
    </div>
  );
}

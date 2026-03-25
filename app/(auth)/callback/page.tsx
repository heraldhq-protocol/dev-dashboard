"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Basic fallback redirect if NextAuth's native routing leaves us stranded
    router.replace("/overview");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-teal border-t-transparent" />
        <p className="text-sm font-semibold text-text-muted">Authenticating...</p>
      </div>
    </div>
  );
}

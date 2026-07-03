"use client";

import { useState, useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { init, initClickTracking, initPageTracking, initLocationTracking } from "@adtivity/adtivity-sdk";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OnboardingTourProvider } from "@/components/providers/OnboardingTourProvider";

declare global {
  interface Window {
    __ADTIVITY_BOOTSTRAPPED__?: boolean;
  }
}

// Adtivity analytics should only run in the production deployment — never in
// local development or on staging/preview deployments. Vercel exposes the
// deployment target via NEXT_PUBLIC_VERCEL_ENV ("production" | "preview" |
// "development"); locally it is undefined, so this is false there too.
const IS_PRODUCTION = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!IS_PRODUCTION) return;
    if (window.__ADTIVITY_BOOTSTRAPPED__) return;
    window.__ADTIVITY_BOOTSTRAPPED__ = true;

    // Monkey-patch window.fetch to inject origin property into Adtivity SDK payloads.
    // The SDK auto-tracks click/page/location events internally and offers no
    // default-properties config, so tagging them with our origin requires this hook.
    const originalFetch = window.fetch;
    window.fetch = async function (input, initOptions) {
      const url = typeof input === "string" ? input : input instanceof Request ? input.url : "";
      if (url.includes("/sdk/event") && initOptions && initOptions.body) {
        try {
          const body = JSON.parse(initOptions.body as string);
          if (Array.isArray(body)) {
            const enrichedBody = body.map((event: { properties?: Record<string, unknown> }) => {
              if (!event.properties) {
                event.properties = {};
              }
              event.properties.origin = "dev-dashboard";
              return event;
            });
            initOptions.body = JSON.stringify(enrichedBody);
          }
        } catch (e) {
          console.warn("Failed to enrich Adtivity payload:", e);
        }
      }
      return originalFetch.apply(this, [input, initOptions]);
    };

    const API_KEY = process.env.NEXT_PUBLIC_ADTIVITY_API_KEY;
    if (!API_KEY) {
      console.error("Adtivity SDK: API key is not configured");
      return;
    }

    init({
      apiKey: API_KEY,
      debug: false,
    });

    initPageTracking();
    initClickTracking();
    initLocationTracking();
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
          mutations: { retry: 0 },
        },
      })
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider refetchOnWindowFocus={false}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <OnboardingTourProvider>
              {children}
            </OnboardingTourProvider>
          </TooltipProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#112240",
                border: "1px solid #1A3A52",
                color: "#ffffff",
              },
              classNames: {
                description: "text-text-muted text-sm mt-1",
                actionButton: "bg-teal text-navy hover:bg-teal/90 font-medium px-4 py-2 rounded-md transition-colors",
              }
            }}
          />
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}

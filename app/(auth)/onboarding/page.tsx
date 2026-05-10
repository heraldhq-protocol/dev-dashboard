import type { Metadata } from "next";
import OnboardingPage from "./page.client";

export const metadata: Metadata = {
  title: "Onboard Your Protocol",
  description: "Register your protocol on the Herald notification gateway and get your API keys.",
  openGraph: {
    title: "Onboard Your Protocol — Herald Dashboard",
    description: "Register your protocol on the Herald notification gateway.",
    images: [{ url: "/api/og?title=Onboard+Your+Protocol&subtitle=Get+Started+in+Minutes&description=Register+your+protocol+on+the+Herald+notification+gateway+and+get+your+API+keys.", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og?title=Onboard+Your+Protocol&subtitle=Get+Started+in+Minutes&description=Register+your+protocol+on+the+Herald+notification+gateway+and+get+your+API+keys."],
  },
};

export default function Page() {
  return <OnboardingPage />;
}

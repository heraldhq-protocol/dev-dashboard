import type { Metadata } from "next";
import SettingsPage from "./page.client";

export const metadata: Metadata = {
  title: "Settings",
  description: "Configure your protocol settings, branding, and sandbox preferences.",
  openGraph: {
    title: "Settings — Herald Dashboard",
    description: "Configure your protocol settings on Herald.",
    images: [{ url: "/api/og?title=Settings&subtitle=Configure+Your+Protocol&description=Update+protocol+details%2C+branding%2C+and+sandbox+preferences.", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og?title=Settings&subtitle=Configure+Your+Protocol&description=Update+protocol+details%2C+branding%2C+and+sandbox+preferences."],
  },
};

export default function Page() {
  return <SettingsPage />;
}

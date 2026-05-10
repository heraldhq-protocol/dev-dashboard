import type { Metadata } from "next";
import OverviewPage from "./page.client";

export const metadata: Metadata = {
  title: "Overview",
  description: "Monitor your Herald notification infrastructure — sends, delivery rates, and system health.",
  openGraph: {
    title: "Overview — Herald Dashboard",
    description: "Monitor your Herald notification infrastructure.",
    images: [{ url: "/api/og?title=Overview&subtitle=Monitor+Your+Protocol&description=Track+sends%2C+delivery+rates%2C+and+system+health+across+your+notification+channels.", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og?title=Overview&subtitle=Monitor+Your+Protocol&description=Track+sends%2C+delivery+rates%2C+and+system+health+across+your+notification+channels."],
  },
};

export default function Page() {
  return <OverviewPage />;
}

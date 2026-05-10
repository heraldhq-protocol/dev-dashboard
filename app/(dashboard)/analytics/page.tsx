import type { Metadata } from "next";
import AnalyticsPage from "./page.client";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Monitor notification delivery metrics, user engagement, and channel performance across your protocol.",
  openGraph: {
    title: "Analytics — Herald Dashboard",
    description: "Monitor notification delivery metrics, user engagement, and channel performance.",
    images: [{ url: "/api/og?title=Analytics&subtitle=Track+Performance&description=Monitor+notification+delivery+metrics%2C+user+engagement%2C+and+channel+performance+across+your+protocol.", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og?title=Analytics&subtitle=Track+Performance&description=Monitor+notification+delivery+metrics%2C+user+engagement%2C+and+channel+performance+across+your+protocol."],
  },
};

export default function Page() {
  return <AnalyticsPage />;
}

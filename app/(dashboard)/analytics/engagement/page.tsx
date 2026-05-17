import type { Metadata } from "next";
import EngagementAnalyticsPage from "./page.client";

export const metadata: Metadata = {
  title: "Engagement Analytics",
  description: "Open rates, click rates, and unsubscribes across your tracked notifications.",
};

export default function Page() {
  return <EngagementAnalyticsPage />;
}

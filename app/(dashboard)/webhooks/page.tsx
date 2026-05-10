import type { Metadata } from "next";
import WebhooksPage from "./page.client";

export const metadata: Metadata = {
  title: "Webhooks",
  description: "Set up webhook endpoints to receive real-time delivery events from Herald.",
  openGraph: {
    title: "Webhooks — Herald Dashboard",
    description: "Set up webhook endpoints to receive real-time delivery events from Herald.",
    images: [{ url: "/api/og?title=Webhooks&subtitle=Configure+Webhooks&description=Set+up+webhook+endpoints+to+receive+real-time+delivery+events+from+Herald.", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og?title=Webhooks&subtitle=Configure+Webhooks&description=Set+up+webhook+endpoints+to+receive+real-time+delivery+events+from+Herald."],
  },
};

export default function Page() {
  return <WebhooksPage />;
}

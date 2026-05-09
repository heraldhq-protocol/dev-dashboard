import type { Metadata } from "next";
import InviteAcceptPage from "./page.client";

export const metadata: Metadata = {
  title: "Accept Invite",
  description: "Accept your team invite to the Herald notification gateway.",
  openGraph: {
    title: "Accept Invite — Herald Dashboard",
    description: "Accept your team invite to the Herald notification gateway.",
    images: [{ url: "/api/og?title=Accept+Invite&subtitle=Join+Your+Team&description=Accept+your+team+invite+to+the+Herald+notification+gateway.", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og?title=Accept+Invite&subtitle=Join+Your+Team&description=Accept+your+team+invite+to+the+Herald+notification+gateway."],
  },
};

export default function Page() {
  return <InviteAcceptPage />;
}

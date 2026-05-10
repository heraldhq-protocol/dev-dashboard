import type { Metadata } from "next";
import InvitePage from "./page.client";

export const metadata: Metadata = {
  title: "Accept Team Invite",
  description: "Join your team on the Herald notification gateway. Accept your invite and get started.",
  openGraph: {
    title: "Accept Team Invite — Herald Dashboard",
    description: "Join your team on the Herald notification gateway.",
    images: [{ url: "/api/og?title=Accept+Team+Invite&subtitle=Join+Your+Team&description=Join+your+team+on+the+Herald+notification+gateway.", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og?title=Accept+Team+Invite&subtitle=Join+Your+Team&description=Join+your+team+on+the+Herald+notification+gateway."],
  },
};

export default function Page() {
  return <InvitePage />;
}

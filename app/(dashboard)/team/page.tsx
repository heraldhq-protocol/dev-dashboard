import type { Metadata } from "next";
import TeamPage from "./page.client";

export const metadata: Metadata = {
  title: "Team",
  description: "Invite team members and manage roles for your Herald protocol.",
  openGraph: {
    title: "Team — Herald Dashboard",
    description: "Invite team members and manage roles for your Herald protocol.",
    images: [{ url: "/api/og?title=Team&subtitle=Manage+Team&description=Invite+team+members+and+manage+roles+for+your+Herald+protocol.", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og?title=Team&subtitle=Manage+Team&description=Invite+team+members+and+manage+roles+for+your+Herald+protocol."],
  },
};

export default function Page() {
  return <TeamPage />;
}

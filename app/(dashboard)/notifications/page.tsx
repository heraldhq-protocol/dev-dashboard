import type { Metadata } from "next";
import NotificationsPage from "./page.client";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Browse and manage notifications sent through your Herald protocol.",
  openGraph: {
    title: "Notifications — Herald Dashboard",
    description: "Browse and manage notifications sent through your Herald protocol.",
    images: [{ url: "/api/og?title=Notifications&subtitle=View+Notifications&description=Browse+and+manage+notifications+sent+through+your+Herald+protocol.", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og?title=Notifications&subtitle=View+Notifications&description=Browse+and+manage+notifications+sent+through+your+Herald+protocol."],
  },
};

export default function Page() {
  return <NotificationsPage />;
}

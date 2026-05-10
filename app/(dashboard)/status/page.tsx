import type { Metadata } from "next";
import StatusPage from "./page.client";

export const metadata: Metadata = {
  title: "System Status",
  description: "Monitor the operational status of Herald's notification infrastructure.",
  openGraph: {
    title: "System Status — Herald Dashboard",
    description: "Monitor the operational status of Herald's notification infrastructure.",
    images: [{ url: "/api/og?title=System+Status&subtitle=Service+Health&description=Monitor+the+operational+status+of+Herald%27s+notification+infrastructure.", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og?title=System+Status&subtitle=Service+Health&description=Monitor+the+operational+status+of+Herald%27s+notification+infrastructure."],
  },
};

export default function Page() {
  return <StatusPage />;
}

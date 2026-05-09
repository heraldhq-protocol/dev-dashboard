import type { Metadata } from "next";
import TemplatesPage from "./page.client";

export const metadata: Metadata = {
  title: "Templates",
  description: "Create and manage notification templates for your Herald protocol.",
  openGraph: {
    title: "Templates — Herald Dashboard",
    description: "Create and manage notification templates for your Herald protocol.",
    images: [{ url: "/api/og?title=Templates&subtitle=Notification+Templates&description=Create+and+manage+notification+templates+for+your+Herald+protocol.", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og?title=Templates&subtitle=Notification+Templates&description=Create+and+manage+notification+templates+for+your+Herald+protocol."],
  },
};

export default function Page() {
  return <TemplatesPage />;
}

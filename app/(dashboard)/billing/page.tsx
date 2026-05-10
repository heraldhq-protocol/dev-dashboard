import type { Metadata } from "next";
import BillingPage from "./page.client";

export const metadata: Metadata = {
  title: "Billing & Usage",
  description: "Manage your subscription, view usage, and configure overage settings.",
  openGraph: {
    title: "Billing & Usage — Herald Dashboard",
    description: "Manage your subscription and usage on Herald.",
    images: [{ url: "/api/og?title=Billing+%26+Usage&subtitle=Manage+Your+Plan&description=View+subscription+details%2C+usage+limits%2C+and+configure+overage+settings.", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og?title=Billing+%26+Usage&subtitle=Manage+Your+Plan&description=View+subscription+details%2C+usage+limits%2C+and+configure+overage+settings."],
  },
};

export default function Page() {
  return <BillingPage />;
}

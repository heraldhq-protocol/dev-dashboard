import type { Metadata } from "next";
import DomainsPage from "./page.client";

export const metadata: Metadata = {
  title: "Domains",
  description: "Configure and verify custom domains for your Herald notification gateway.",
  openGraph: {
    title: "Domains — Herald Dashboard",
    description: "Configure and verify custom domains for your Herald notification gateway.",
    images: [{ url: "/api/og?title=Domains&subtitle=Manage+Domains&description=Configure+and+verify+custom+domains+for+your+Herald+notification+gateway.", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og?title=Domains&subtitle=Manage+Domains&description=Configure+and+verify+custom+domains+for+your+Herald+notification+gateway."],
  },
};

export default function Page() {
  return <DomainsPage />;
}

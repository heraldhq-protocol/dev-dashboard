import type { Metadata } from "next";
import ApiKeysPage from "./page.client";

export const metadata: Metadata = {
  title: "API Keys",
  description: "Manage your Herald API keys for sandbox and production environments.",
  openGraph: {
    title: "API Keys — Herald Dashboard",
    description: "Manage your Herald API keys.",
    images: [{ url: "/api/og?title=API+Keys&subtitle=Manage+Credentials&description=Create+and+manage+your+Herald+API+keys+for+sandbox+and+production+environments.", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og?title=API+Keys&subtitle=Manage+Credentials&description=Create+and+manage+your+Herald+API+keys+for+sandbox+and+production+environments."],
  },
};

export default function Page() {
  return <ApiKeysPage />;
}

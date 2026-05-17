import type { Metadata } from "next";
import MarketplacePage from "./page.client";

export const metadata: Metadata = {
  title: "Template Marketplace",
  description: "Browse and import battle-tested notification templates for your Herald protocol.",
};

export default function Page() {
  return <MarketplacePage />;
}

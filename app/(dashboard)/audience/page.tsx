import type { Metadata } from "next";
import AudiencePage from "./page.client";

export const metadata: Metadata = {
  title: "Audience",
  description: "Track subscriber growth, channel coverage, and retention for your Herald protocol.",
};

export default function Page() {
  return <AudiencePage />;
}

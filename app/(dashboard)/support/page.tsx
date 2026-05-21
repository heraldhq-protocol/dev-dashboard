import type { Metadata } from "next";
import SupportPage from "./page.client";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help from the Herald team. Submit tickets and track your open requests.",
};

export default function Page() {
  return <SupportPage />;
}

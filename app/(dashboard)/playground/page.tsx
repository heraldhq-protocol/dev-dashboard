import type { Metadata } from "next";
import PlaygroundPage from "./page.client";

export const metadata: Metadata = {
  title: "Playground",
  description: "Send test notifications and experiment with Herald's API in real-time.",
  openGraph: {
    title: "Playground — Herald Dashboard",
    description: "Send test notifications and experiment with Herald's API in real-time.",
    images: [{ url: "/api/og?title=Playground&subtitle=Test+Your+Integration&description=Send+test+notifications+and+experiment+with+Herald%27s+API+in+real-time.", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og?title=Playground&subtitle=Test+Your+Integration&description=Send+test+notifications+and+experiment+with+Herald%27s+API+in+real-time."],
  },
};

export default function Page() {
  return <PlaygroundPage />;
}

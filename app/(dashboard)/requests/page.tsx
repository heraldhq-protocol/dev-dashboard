import type { Metadata } from "next";
import RequestInspectorPage from "./page.client";

export const metadata: Metadata = {
  title: "Request Inspector",
  description: "Inspect every API request made against your Herald project — status codes, latency, payloads, and more.",
  openGraph: {
    title: "Request Inspector — Herald Dashboard",
    description: "Inspect every API request made against your Herald project — status codes, latency, payloads, and more.",
    images: [{ url: "/api/og?title=Request+Inspector&subtitle=Developer+Tools&description=Inspect+every+API+request+made+against+your+Herald+project.", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og?title=Request+Inspector&subtitle=Developer+Tools&description=Inspect+every+API+request+made+against+your+Herald+project."],
  },
};

export default function Page() {
  return <RequestInspectorPage />;
}

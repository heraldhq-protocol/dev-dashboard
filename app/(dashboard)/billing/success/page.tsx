import type { Metadata } from "next";
import BillingSuccessPage from "./page.client";

export const metadata: Metadata = {
  title: "Payment Successful",
  description: "Your billing update was processed successfully. Your Herald dashboard is ready.",
  openGraph: {
    title: "Payment Successful — Herald Dashboard",
    description: "Your billing update was processed successfully.",
    images: [{ url: "/api/og?title=Payment+Successful&subtitle=Thank+You&description=Your+billing+update+was+processed+successfully.+Your+Herald+dashboard+is+ready.", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og?title=Payment+Successful&subtitle=Thank+You&description=Your+billing+update+was+processed+successfully.+Your+Herald+dashboard+is+ready."],
  },
};

export default function Page() {
  return <BillingSuccessPage />;
}

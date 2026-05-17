import type { Metadata } from "next";
import AuditLogPage from "./page.client";

export const metadata: Metadata = {
  title: "Audit Log",
  description: "Full audit trail of all actions performed by your team on the Herald platform.",
};

export default function Page() {
  return <AuditLogPage />;
}

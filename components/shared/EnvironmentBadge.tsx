import { Badge } from "@/components/ui/Badge";

export function EnvironmentBadge({ environment }: { environment: "sandbox" | "live" }) {
  if (environment === "sandbox") {
    return <Badge variant="warning">SANDBOX</Badge>;
  }
  return <Badge variant="success">LIVE</Badge>;
}

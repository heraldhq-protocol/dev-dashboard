import { DashboardApiKey } from "@/hooks/useApiKeys";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDistanceToNow } from "date-fns";
import { EmptyState } from "@/components/shared/EmptyState";
import { Key } from "lucide-react";

interface ApiKeyTableProps {
  keys: DashboardApiKey[];
  onRevokeClick: (key: DashboardApiKey) => void;
}

export function ApiKeyTable({ keys, onRevokeClick }: ApiKeyTableProps) {
  if (keys.length === 0) {
    return (
      <EmptyState
        icon={<Key className="w-6 h-6" />}
        title="No API Keys Found"
        description="Create an API key to authenticate your requests to the Herald API in this environment."
      />
    );
  }

  return (
    <>
      {/* Mobile view: Stack of cards */}
      <div className="flex flex-col gap-4 md:hidden">
        {keys.map((k) => (
          <div key={k.id} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-foreground font-semibold line-clamp-1">{k.name}</h3>
                <p className="font-mono text-xs text-text-muted mt-1 break-all">{k.prefix}</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onRevokeClick(k)}
                className="shrink-0"
              >
                Revoke
              </Button>
            </div>

            <div className="flex flex-col gap-2 text-sm text-text-muted">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Scopes</span>
                <div className="flex flex-wrap gap-2">
                  {k.scopes.map((s) => {
                    const isWrite = s.includes(":write") || s.includes("manage");
                    const label = s.replace(/[:_]/g, " ");
                    return (
                      <Badge
                        key={s}
                        variant={isWrite ? "default" : "secondary"}
                        className="capitalize text-[10px] px-2 py-0.5"
                      >
                        {label}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1 mt-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Last Used</span>
                <span className="text-sm">
                  {k.lastUsedAt ? formatDistanceToNow(new Date(k.lastUsedAt), { addSuffix: true }) : "Never"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop view: Table */}
      <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-left text-sm text-text-muted">
          <thead className="bg-secondary/50 text-xs font-semibold uppercase tracking-wider text-text-muted border-b border-border">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Key Prefix</th>
              <th className="px-4 py-3">Scopes</th>
              <th className="px-4 py-3">Last Used</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {keys.map((k) => (
              <tr key={k.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-foreground font-medium">
                  {k.name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-text-muted">
                  {k.prefix}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2 max-w-[400px]">
                    {k.scopes.map((s) => {
                      const isWrite = s.includes(":write") || s.includes("manage");
                      const label = s.replace(/[:_]/g, " ");
                      return (
                        <Badge
                          key={s}
                          variant={isWrite ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {label}
                        </Badge>
                      );
                    })}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {k.lastUsedAt ? formatDistanceToNow(new Date(k.lastUsedAt), { addSuffix: true }) : "Never"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onRevokeClick(k)}
                  >
                    Revoke
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

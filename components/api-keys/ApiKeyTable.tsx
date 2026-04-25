import { DashboardApiKey } from "@/hooks/useApiKeys";
import { Button } from "@/components/ui/Button";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/Badge";

interface ApiKeyTableProps {
  keys: DashboardApiKey[];
  onRevokeClick: (key: DashboardApiKey) => void;
}

import { EmptyState } from "@/components/shared/EmptyState";
import { Key } from "lucide-react";

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
          <div key={k.id} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 shadow-sm">
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
            
            <div className="flex flex-col gap-2 text-sm text-text-secondary">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-widest text-text-muted">Scopes</span>
                <div className="flex flex-wrap gap-2">
                  {k.scopes.map((s) => {
                    const isWrite = s.includes(":write") || s.includes("manage");
                    const label = s.replace(/[:_]/g, " ");
                    return (
                      <Badge
                        key={s}
                        variant={isWrite ? "default" : "outline"}
                        className={`capitalize text-[10px] px-2 py-0.5 ${!isWrite ? "bg-card-2/50" : ""}`}
                      >
                        {label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex flex-col gap-1 mt-1">
                <span className="text-xs font-medium uppercase tracking-widest text-text-muted">Last Used</span>
                <span className="text-sm">
                  {k.lastUsedAt ? formatDistanceToNow(new Date(k.lastUsedAt), { addSuffix: true }) : "Never"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop view: Table */}
      <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-text-secondary">
          <thead className="bg-card-2 text-xs uppercase tracking-widest text-text-muted border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold">Key Prefix</th>
              <th className="px-6 py-4 font-semibold">Scopes</th>
              <th className="px-6 py-4 font-semibold">Last Used</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {keys.map((k) => (
              <tr key={k.id} className="hover:bg-muted/30 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap text-foreground font-medium">
                  {k.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-text-muted">
                  {k.prefix}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2 max-w-[400px]">
                    {k.scopes.map((s) => {
                      const isWrite = s.includes(":write") || s.includes("manage");
                      const label = s.replace(/[:_]/g, " ");
                      return (
                        <Badge
                          key={s}
                          variant={isWrite ? "default" : "outline"}
                          className={`capitalize ${!isWrite ? "bg-card-2/50" : ""}`}
                        >
                          {label}
                        </Badge>
                      );
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {k.lastUsedAt ? formatDistanceToNow(new Date(k.lastUsedAt), { addSuffix: true }) : "Never"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => onRevokeClick(k)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
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

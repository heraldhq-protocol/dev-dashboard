import { DashboardApiKey } from "@/hooks/useApiKeys";
import { Button } from "@/components/ui/Button";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/Badge";

interface ApiKeyTableProps {
  keys: DashboardApiKey[];
  onRevokeClick: (key: DashboardApiKey) => void;
}

export function ApiKeyTable({ keys, onRevokeClick }: ApiKeyTableProps) {
  if (keys.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center text-text-muted text-sm">
        No API keys found for this environment.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-x-auto md:overflow-hidden">
      <table className="w-full text-left text-sm text-text-secondary min-w-[700px]">
        <thead className="bg-card-2 text-xs uppercase tracking-widest text-text-muted border-b border-border">
          <tr>
            <th className="px-6 py-4 font-semibold">Name</th>
            <th className="px-6 py-4 font-semibold">Key Prefix</th>
            <th className="px-6 py-4 font-semibold">Scopes</th>
            <th className="px-6 py-4 font-semibold">Last Used</th>
            <th className="px-6 py-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {keys.map((k) => (
            <tr key={k.id} className="hover:bg-card-2/50 transition-colors group">
              <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
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
                        variant={isWrite ? "default" : "secondary"}
                        className="capitalize"
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
                  variant="danger" 
                  size="sm" 
                  onClick={() => onRevokeClick(k)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Revoke
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

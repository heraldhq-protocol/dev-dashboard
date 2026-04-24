"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useApiKeys, DashboardApiKey } from "@/hooks/useApiKeys";
import { ApiKeyTable } from "@/components/api-keys/ApiKeyTable";
import { CreateKeyModal } from "@/components/api-keys/CreateKeyModal";
import { KeyRevealModal } from "@/components/api-keys/KeyRevealModal";
import { RevokeKeyModal } from "@/components/api-keys/RevokeKeyModal";
import { PageHeader } from "@/components/shared/PageHeader";
import { AlertCircle, Plus } from "lucide-react";

export default function ApiKeysPage() {
  const { query, createKey, revokeKey } = useApiKeys();
  const keys = query.data || [];

  const liveKeys = keys.filter((k) => k.environment === "live");
  const testKeys = keys.filter((k) => k.environment === "test");

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [revealKeyData, setRevealKeyData] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<DashboardApiKey | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        setIsCreateOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCreate = async (data: {
    name: string;
    environment: "live" | "test";
    scopes: string[];
  }) => {
    createKey.mutate(data, {
      onSuccess: (res) => {
        setIsCreateOpen(false);
        setRevealKeyData(res.plainTextKey);
      },
    });
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    revokeKey.mutate(revokeTarget.id, {
      onSuccess: () => {
        setRevokeTarget(null);
      },
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="API Keys"
        description="Manage network access tokens for emitting notifications."
        actions={
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 shrink-0 group"
          >
            <Plus className="h-4 w-4" />
            Create Key
            <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 font-mono text-[10px] font-medium text-white/50 bg-black/20 rounded border border-white/10 ml-2 group-hover:bg-black/30 transition-colors">
              Ctrl N
            </kbd>
          </Button>
        }
      />

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400">
        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="text-sm leading-relaxed">
          <p className="font-semibold mb-1">Keep your keys secure</p>
          <p className="opacity-90">
            Live keys bypass the sandbox environment and perform real actions on the network. 
            Do not commit them to version control or expose them in client-side code.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border shadow-sm">
          <span className="h-2 w-2 rounded-full bg-green shadow-[0_0_10px_#27AE60]" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest">
            Live Environment
          </h2>
          <span className="ml-auto bg-card-2 border border-border text-text-muted text-xs px-2.5 py-0.5 rounded-full font-medium">
            {liveKeys.length} keys
          </span>
        </div>
        <ApiKeyTable keys={liveKeys} onRevokeClick={setRevokeTarget} />
      </div>

      {/* Styled Divider */}
      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border border-dashed" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-bg-primary px-3 text-xs uppercase tracking-widest text-text-muted font-medium">
            Development
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border shadow-sm">
          <span className="h-2 w-2 rounded-full bg-gold shadow-[0_0_10px_#E8920A]" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest">
            Test Environment
          </h2>
          <span className="ml-auto bg-card-2 border border-border text-text-muted text-xs px-2.5 py-0.5 rounded-full font-medium">
            {testKeys.length} keys
          </span>
        </div>
        <ApiKeyTable keys={testKeys} onRevokeClick={setRevokeTarget} />
      </div>

      <CreateKeyModal
        key={isCreateOpen ? "open" : "closed"}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onConfirm={handleCreate}
        isCreating={createKey.isPending}
      />

      <KeyRevealModal
        isOpen={!!revealKeyData}
        onClose={() => setRevealKeyData(null)}
        plainTextKey={revealKeyData || ""}
      />

      <RevokeKeyModal
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevoke}
        keyName={revokeTarget?.name || ""}
        isRevoking={revokeKey.isPending}
      />
    </div>
  );
}

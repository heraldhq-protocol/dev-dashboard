"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useApiKeys, ApiKey } from "@/hooks/useApiKeys";
import { ApiKeyTable } from "@/components/api-keys/ApiKeyTable";
import { CreateKeyModal } from "@/components/api-keys/CreateKeyModal";
import { KeyRevealModal } from "@/components/api-keys/KeyRevealModal";
import { RevokeKeyModal } from "@/components/api-keys/RevokeKeyModal";

export default function ApiKeysPage() {
  const { query, createKey, revokeKey } = useApiKeys();
  const keys = query.data || [];

  const liveKeys = keys.filter((k) => k.environment === "live");
  const testKeys = keys.filter((k) => k.environment === "test");

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [revealKeyData, setRevealKeyData] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            API Keys
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage network access tokens for emitting notifications.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="gap-2 shrink-0"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Key
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green shadow-[0_0_10px_#27AE60]"></span>
          Live Keys
        </h2>
        <ApiKeyTable keys={liveKeys} onRevokeClick={setRevokeTarget} />
      </div>

      <hr className="border-border gap-y-4" />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-gold shadow-[0_0_10px_#E8920A]"></span>
          Test Keys
        </h2>
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

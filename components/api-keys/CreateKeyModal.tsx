import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface CreateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    name: string;
    environment: "live" | "test";
    scopes: string[];
  }) => void;
  isCreating: boolean;
}

type ScopeGroup = {
  label: string;
  scopes: { id: string; label: string; description: string; ownerOnly?: boolean }[];
};

const SCOPE_GROUPS: ScopeGroup[] = [
  {
    label: "Notifications",
    scopes: [
      { id: "notify:write", label: "Send Notifications", description: "Emit notifications to registered wallets via the gateway" },
      { id: "notify:read", label: "Read Notifications", description: "View status and history of sent notifications" },
    ],
  },
  {
    label: "Analytics",
    scopes: [
      { id: "analytics:read", label: "View Analytics", description: "Access delivery stats and protocol usage metrics" },
    ],
  },
  {
    label: "Templates",
    scopes: [
      { id: "templates:read", label: "View Templates", description: "List and preview notification templates" },
      { id: "templates:write", label: "Manage Templates", description: "Create, edit, and delete templates" },
    ],
  },
  {
    label: "Webhooks",
    scopes: [
      { id: "webhook:read", label: "View Webhooks", description: "Read webhook configurations and delivery logs" },
      { id: "webhook:write", label: "Manage Webhooks", description: "Create, update, and remove webhook endpoints" },
    ],
  },
  {
    label: "Admin",
    scopes: [
      { id: "protocol:read", label: "View Profile", description: "Access protocol profile and subscription metadata" },
      { id: "keys:manage", label: "Manage API Keys", description: "Create and revoke API keys — Owner role only", ownerOnly: true },
    ],
  },
];

const DEFAULT_SCOPES = ["notify:write", "notify:read", "analytics:read", "templates:read", "webhook:read"];

export function CreateKeyModal({
  isOpen,
  onClose,
  onConfirm,
  isCreating,
}: CreateKeyModalProps) {
  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState<"live" | "test">("live");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(DEFAULT_SCOPES);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onConfirm({ name, environment, scopes: selectedScopes });
  };

  const toggleScope = (scopeId: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId)
        ? prev.filter((s) => s !== scopeId)
        : [...prev, scopeId]
    );
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Create New API Key">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-secondary">
            Key Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Lambda Marketing Worker"
            autoFocus
            required
            className="w-full mt-2"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-secondary">
            Environment Context
          </label>
          <div className="grid grid-cols-2 gap-3 mt-1">
            <button
              type="button"
              onClick={() => setEnvironment("live")}
              className={`p-3 rounded-lg border text-sm font-semibold transition-all ${
                environment === "live"
                  ? "bg-green/10 border-green text-green shadow-[0_0_15px_rgba(39,174,96,0.1)]"
                  : "bg-card border-border text-text-muted hover:border-text-muted hover:bg-card-2"
              }`}
            >
              Live Production
            </button>
            <button
              type="button"
              onClick={() => setEnvironment("test")}
              className={`p-3 rounded-lg border text-sm font-semibold transition-all ${
                environment === "test"
                  ? "bg-gold/10 border-gold text-gold shadow-[0_0_15px_rgba(232,146,10,0.1)]"
                  : "bg-card border-border text-text-muted hover:border-text-muted hover:bg-card-2"
              }`}
            >
              Test Sandboxed
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-text-secondary flex justify-between items-end">
            <span>Permission Scopes</span>
            <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold">
              {selectedScopes.length} selected
            </span>
          </label>

          <div className="max-h-[300px] overflow-y-auto pr-1 space-y-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {SCOPE_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 px-0.5">
                  {group.label}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.scopes.map((scope) => {
                    const isSelected = selectedScopes.includes(scope.id);
                    return (
                      <button
                        key={scope.id}
                        type="button"
                        onClick={() => toggleScope(scope.id)}
                        className={`relative flex flex-col items-start text-left p-3 rounded-xl border transition-all duration-200 group ${
                          isSelected
                            ? "bg-teal/10 border-teal shadow-[0_0_12px_rgba(0,210,255,0.08)]"
                            : "bg-card border-border hover:border-border-2 hover:bg-card-2/50"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className={`text-xs font-bold transition-colors ${isSelected ? "text-teal" : "text-foreground"}`}>
                            {scope.label}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {scope.ownerOnly && (
                              <span className="text-[9px] font-bold uppercase tracking-wide text-gold bg-gold/10 border border-gold/20 px-1.5 py-0.5 rounded">
                                Owner
                              </span>
                            )}
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected ? "border-teal bg-teal" : "border-text-muted/50"
                            }`}>
                              {isSelected && (
                                <svg className="w-2 h-2 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] text-text-muted leading-relaxed line-clamp-2">
                          {scope.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            isLoading={isCreating}
            disabled={!name.trim() || selectedScopes.length === 0}
          >
            Generate Token
          </Button>
        </div>
      </form>
    </Modal>
  );
}

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

const AVAILABLE_SCOPES = [
  { id: "notify:write", label: "Send Notifications", description: "Permission to emit notifications via the gateway" },
  { id: "notify:read", label: "Read Notifications", description: "View status and history of sent notifications" },
  { id: "analytics:read", label: "View Analytics", description: "Access delivery stats and protocol usage metrics" },
  { id: "webhook:read", label: "View Webhooks", description: "Read webhook configurations and history" },
  { id: "webhook:write", label: "Manage Webhooks", description: "Create, update, and remove webhook endpoints" },
  { id: "protocol:read", label: "View Profile", description: "Access protocol profile and subscription metadata" },
];

export function CreateKeyModal({
  isOpen,
  onClose,
  onConfirm,
  isCreating,
}: CreateKeyModalProps) {
  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState<"live" | "test">("live");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["notify:write"]);



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
              {selectedScopes.length} Selected
            </span>
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[260px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {AVAILABLE_SCOPES.map((scope) => {
              const isSelected = selectedScopes.includes(scope.id);
              return (
                <button
                  key={scope.id}
                  type="button"
                  onClick={() => toggleScope(scope.id)}
                  className={`relative flex flex-col items-start text-left p-3.5 rounded-xl border transition-all duration-200 group ${
                    isSelected
                      ? "bg-teal/10 border-teal shadow-[0_0_15px_rgba(0,210,255,0.1)]"
                      : "bg-card border-border hover:border-border-2 hover:bg-card-2/50"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className={`text-sm font-bold transition-colors ${isSelected ? "text-teal" : "text-foreground group-hover:text-foreground"}`}>
                      {scope.label}
                    </span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected ? "border-teal bg-teal" : "border-text-muted/50"
                    }`}>
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-text-muted leading-relaxed line-clamp-2">
                    {scope.description}
                  </span>
                </button>
              );
            })}
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


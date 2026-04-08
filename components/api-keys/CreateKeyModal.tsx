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

  const [isScopesExpanded, setIsScopesExpanded] = useState(false);

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

        <div className="space-y-2.5">
          <div 
            className="flex items-center justify-between cursor-pointer group"
            onClick={() => setIsScopesExpanded(!isScopesExpanded)}
          >
            <label className="text-sm font-medium text-text-secondary cursor-pointer">
              Permission Scopes
            </label>
            <div className="flex items-center gap-2">
              {!isScopesExpanded && (
                <span className="text-[10px] uppercase tracking-wider text-text-muted bg-card-2 px-2 py-0.5 rounded-full border border-border">
                  {selectedScopes.length} selected
                </span>
              )}
              <div className={`w-4 h-4 text-text-muted group-hover:text-white transition-transform ${isScopesExpanded ? 'rotate-180' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
          </div>

          {isScopesExpanded ? (
            <div className="grid grid-cols-1 gap-2 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
              {AVAILABLE_SCOPES.map((scope) => (
                <label
                  key={scope.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedScopes.includes(scope.id)
                      ? "bg-teal/5 border-teal/50"
                      : "bg-card border-border hover:bg-card-2"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-1 accent-teal"
                    checked={selectedScopes.includes(scope.id)}
                    onChange={() => toggleScope(scope.id)}
                  />
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {scope.label}
                    </div>
                    <div className="text-xs text-text-muted leading-tight mt-0.5">
                      {scope.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-card-2/50 border border-border/50 rounded-lg text-xs text-text-muted italic">
              {selectedScopes.map(id => AVAILABLE_SCOPES.find(s => s.id === id)?.label).join(", ")}
            </div>
          )}
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


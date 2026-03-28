import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface CreateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { name: string; environment: "live" | "test"; scopes: string[] }) => void;
  isCreating: boolean;
}

export function CreateKeyModal({ isOpen, onClose, onConfirm, isCreating }: CreateKeyModalProps) {
  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState<"live" | "test">("live");

  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onConfirm({ name, environment, scopes: ["send_notifications"] });
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Create New API Key">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-secondary">Key Name</label>
          <Input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Lambda Marketing Worker"
            autoFocus
            required
            className="w-full"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-secondary">Environment Context</label>
          <div className="grid grid-cols-2 gap-3 mt-1">
            <button
              type="button"
              onClick={() => setEnvironment("live")}
              className={`p-3 rounded-lg border text-sm font-semibold transition-all ${
                environment === "live" ? "bg-green/10 border-green text-green" : "bg-card border-border text-text-muted hover:border-text-muted hover:bg-card-2"
              }`}
            >
              Live Production
            </button>
            <button
              type="button"
              onClick={() => setEnvironment("test")}
              className={`p-3 rounded-lg border text-sm font-semibold transition-all ${
                environment === "test" ? "bg-gold/10 border-gold text-gold" : "bg-card border-border text-text-muted hover:border-text-muted hover:bg-card-2"
              }`}
            >
              Test Sandboxed
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isCreating}>Cancel</Button>
          <Button type="submit" variant="primary" isLoading={isCreating} disabled={!name.trim()}>Generate Token</Button>
        </div>
      </form>
    </Modal>
  );
}

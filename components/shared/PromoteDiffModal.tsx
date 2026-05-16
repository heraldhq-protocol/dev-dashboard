"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ArrowRight, AlertTriangle } from "lucide-react";

export type PromoteTarget = {
  type: "webhook" | "template";
  id: string;
  label: string;
  fields: { name: string; value: string }[];
};

interface PromoteDiffModalProps {
  target: PromoteTarget | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
  isLoading: boolean;
}

export function PromoteDiffModal({
  target,
  onClose,
  onConfirm,
  isLoading,
}: PromoteDiffModalProps) {
  if (!target) return null;

  return (
    <Modal
      isOpen={!!target}
      onClose={onClose}
      title="Promote to Live Environment"
    >
      <div className="flex flex-col gap-5 mt-2">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gold/5 border border-gold/20">
          <AlertTriangle className="h-4 w-4 text-gold shrink-0 mt-0.5" />
          <p className="text-xs text-text-muted leading-relaxed">
            This will create a <span className="text-foreground font-semibold">new live {target.type}</span> with the same configuration.
            Existing live records are not overwritten.
          </p>
        </div>

        {/* Diff table */}
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="px-3 py-2 bg-gold/5 text-[10px] font-bold uppercase tracking-widest text-gold">
              Sandbox (source)
            </div>
            <div className="px-3 py-2 bg-status-success/5 text-[10px] font-bold uppercase tracking-widest text-status-success">
              Live (copy)
            </div>
          </div>
          {target.fields.map((field) => (
            <div key={field.name} className="grid grid-cols-2 divide-x divide-border border-t border-border">
              <div className="px-3 py-2.5">
                <p className="text-[10px] text-text-muted uppercase tracking-wide mb-0.5">{field.name}</p>
                <p className="text-xs font-mono text-foreground truncate">{field.value}</p>
              </div>
              <div className="px-3 py-2.5 flex items-center gap-2">
                <ArrowRight className="h-3 w-3 text-status-success shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-text-muted uppercase tracking-wide mb-0.5">{field.name}</p>
                  <p className="text-xs font-mono text-foreground truncate">
                    {field.name === "name" ? `${field.value} (Live)` : field.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {target.type === "webhook" && (
            <div className="grid grid-cols-2 divide-x divide-border border-t border-border">
              <div className="px-3 py-2.5">
                <p className="text-[10px] text-text-muted uppercase tracking-wide mb-0.5">Secret</p>
                <p className="text-xs font-mono text-text-muted">••••••••••••••••</p>
              </div>
              <div className="px-3 py-2.5 flex items-center gap-2">
                <ArrowRight className="h-3 w-3 text-status-success shrink-0" />
                <div>
                  <p className="text-[10px] text-text-muted uppercase tracking-wide mb-0.5">Secret</p>
                  <p className="text-xs font-mono text-teal">New secret generated</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => onConfirm(target.id)}
            isLoading={isLoading}
            disabled={isLoading}
            className="bg-status-success hover:bg-status-success/90 text-navy font-bold"
          >
            Promote to Live
          </Button>
        </div>
      </div>
    </Modal>
  );
}

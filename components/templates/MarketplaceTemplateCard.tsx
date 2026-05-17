"use client";

import { useState } from "react";
import { Download, Eye, CheckCircle2 } from "lucide-react";
import type { MarketplaceTemplate } from "@/lib/api/templates";
import { importMarketplaceTemplate } from "@/lib/api/templates";
import { toast } from "sonner";

interface Props {
  template: MarketplaceTemplate;
  onPreview: (t: MarketplaceTemplate) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  defi: "text-teal bg-teal/10 border-teal/20",
  nft: "text-purple bg-purple/10 border-purple/20",
  governance: "text-gold bg-gold/10 border-gold/20",
  security: "text-red bg-red/10 border-red/20",
  general: "text-text-muted bg-card-2 border-border",
};

export function MarketplaceTemplateCard({ template, onPreview }: Props) {
  const [imported, setImported] = useState(false);
  const [loading, setLoading] = useState(false);

  const colorClass = CATEGORY_COLORS[template.category] ?? CATEGORY_COLORS.general;

  const handleImport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (imported) return;
    setLoading(true);
    try {
      await importMarketplaceTemplate(template.slug);
      setImported(true);
      toast.success(`"${template.name}" imported to your templates.`);
    } catch {
      toast.error("Import failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="group relative flex flex-col rounded-xl border border-border bg-navy-2 p-5 cursor-pointer
        hover:border-border-2 hover:shadow-(--card-glow-hover) hover:-translate-y-px
        transition-all duration-200 ease-in-out overflow-hidden"
      onClick={() => onPreview(template)}
    >
      {/* Corner glow */}
      <div className="pointer-events-none absolute -top-8 -right-8 h-16 w-16 rounded-full bg-teal/8 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${colorClass}`}>
            {template.category}
          </span>
          {template.isOfficial && (
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-teal">
              <CheckCircle2 className="h-3 w-3" />
              Official
            </span>
          )}
        </div>
        <span className="shrink-0 text-[10px] text-text-muted tabular-nums">
          {template.usageCount.toLocaleString()} uses
        </span>
      </div>

      {/* Name + description */}
      <h3 className="text-sm font-semibold text-foreground mb-1 truncate">{template.name}</h3>
      <p className="text-xs text-text-muted line-clamp-2 flex-1">{template.description}</p>

      {/* Use-case tag */}
      <p className="mt-3 text-[10px] font-mono text-text-muted/70 bg-card-2 inline-block px-2 py-0.5 rounded self-start">
        {template.useCaseTag}
      </p>

      {/* Channels */}
      <div className="mt-4 flex items-center gap-2">
        {template.emailHtml && (
          <span className="text-[10px] font-medium text-text-muted bg-card-2 border border-border px-1.5 py-0.5 rounded">
            Email
          </span>
        )}
        {template.smsText && (
          <span className="text-[10px] font-medium text-text-muted bg-card-2 border border-border px-1.5 py-0.5 rounded">
            SMS
          </span>
        )}
        {template.telegramText && (
          <span className="text-[10px] font-medium text-text-muted bg-card-2 border border-border px-1.5 py-0.5 rounded">
            Telegram
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 pt-4 border-t border-border/60">
        <button
          onClick={(e) => { e.stopPropagation(); onPreview(template); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card text-text-muted hover:text-foreground transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />
          Preview
        </button>
        <button
          onClick={handleImport}
          disabled={loading || imported}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-60
            ${imported
              ? "bg-teal/10 text-teal border border-teal/30"
              : "bg-teal text-navy-2 hover:bg-teal-2"
            }`}
        >
          {imported ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Imported
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5" />
              {loading ? "Importing…" : "Import"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

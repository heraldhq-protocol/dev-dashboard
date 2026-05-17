"use client";

import { useState } from "react";
import { X, Download, CheckCircle2 } from "lucide-react";
import { importMarketplaceTemplate, type MarketplaceTemplate } from "@/lib/api/templates";
import { toast } from "sonner";

interface Props {
  template: MarketplaceTemplate;
  onClose: () => void;
}

type Channel = "email" | "sms" | "telegram";

function fillExamples(text: string, variables: MarketplaceTemplate["variables"]): string {
  const ctx: Record<string, string> = {};
  for (const v of variables ?? []) {
    ctx[v.name] = v.example || `[${v.name}]`;
  }

  let out = text;

  // {{#if var}}...{{else}}...{{/if}}
  out = out.replace(
    /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_, varName, truthy, falsy) =>
      ctx[varName] && ctx[varName] !== `[${varName}]` ? truthy : falsy
  );

  // {{#if var}}...{{/if}}
  out = out.replace(
    /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_, varName, block) =>
      ctx[varName] && ctx[varName] !== `[${varName}]` ? block : ""
  );

  // {{helper arg ...}} — use first arg's example value
  out = out.replace(/\{\{(\w+)\s+([\w]+)(?:\s+[^}]*)?\}\}/g, (match, _helper, firstArg) =>
    ctx[firstArg] ?? match
  );

  // {{variable}}
  out = out.replace(/\{\{(\w+)\}\}/g, (_, name) => ctx[name] ?? `[${name}]`);

  return out;
}

export function TemplatePreviewModal({ template, onClose }: Props) {
  const [activeChannel, setActiveChannel] = useState<Channel>(() => {
    if (template.emailHtml) return "email";
    if (template.smsText) return "sms";
    return "telegram";
  });
  const [imported, setImported] = useState(false);
  const [loading, setLoading] = useState(false);

  const channels: Channel[] = [];
  if (template.emailHtml) channels.push("email");
  if (template.smsText) channels.push("sms");
  if (template.telegramText) channels.push("telegram");

  const handleImport = async () => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-navy-2 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-teal bg-teal/10 border border-teal/20 px-2 py-0.5 rounded-full capitalize">
                {template.category}
              </span>
              {template.isOfficial && (
                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-teal">
                  <CheckCircle2 className="h-3 w-3" />
                  Official
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-foreground">{template.name}</h2>
            <p className="text-xs text-text-muted mt-0.5">{template.description}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 shrink-0 rounded-md p-1.5 text-text-muted hover:text-foreground hover:bg-card-2 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Channel tabs */}
        {channels.length > 1 && (
          <div className="flex items-center gap-1 px-6 pt-4 shrink-0">
            {channels.map((ch) => (
              <button
                key={ch}
                onClick={() => setActiveChannel(ch)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  activeChannel === ch
                    ? "bg-card text-foreground"
                    : "text-text-muted hover:text-foreground"
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        )}

        {/* Preview content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
          {activeChannel === "email" && template.emailHtml && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-2">
                Subject
              </p>
              <p className="text-sm text-foreground bg-card-2 border border-border px-3 py-2 rounded-lg mb-4">
                {fillExamples(template.emailSubject ?? "", template.variables)}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-2">
                HTML Preview
              </p>
              <iframe
                srcDoc={fillExamples(template.emailHtml, template.variables)}
                sandbox="allow-same-origin"
                className="w-full rounded-lg border border-border bg-white"
                style={{ height: 320 }}
                title="Email preview"
              />
            </div>
          )}

          {activeChannel === "sms" && template.smsText && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-2">
                SMS Body
              </p>
              <div className="bg-card-2 border border-border rounded-xl p-4 max-w-xs">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {fillExamples(template.smsText, template.variables)}
                </p>
              </div>
            </div>
          )}

          {activeChannel === "telegram" && template.telegramText && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-2">
                Telegram Message
              </p>
              <div className="bg-card-2 border border-border rounded-xl p-4 max-w-sm">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {fillExamples(template.telegramText, template.variables)}
                </p>
              </div>
            </div>
          )}

          {/* Variables */}
          {template.variables && template.variables.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-3">
                Template Variables
              </p>
              <div className="space-y-2">
                {template.variables.map((v) => (
                  <div key={v.name} className="flex items-start gap-3 text-xs">
                    <code className="shrink-0 font-mono text-teal bg-teal/10 px-1.5 py-0.5 rounded">
                      {"{{"}{v.name}{"}}"}
                    </code>
                    <div className="min-w-0">
                      <span className="text-text-muted">{v.description}</span>
                      {v.example && (
                        <span className="ml-2 text-text-muted/60 italic">e.g. {v.example}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-border shrink-0">
          <span className="text-xs text-text-muted">
            {template.usageCount.toLocaleString()} protocols using this template
          </span>
          <button
            onClick={handleImport}
            disabled={loading || imported}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-60
              ${imported
                ? "bg-teal/10 text-teal border border-teal/30"
                : "bg-teal text-navy-2 hover:bg-teal-2"
              }`}
          >
            {imported ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Imported
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                {loading ? "Importing…" : "Import Template"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

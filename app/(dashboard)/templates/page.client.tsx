"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { useApi } from "@/components/providers/QueryProvider";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RippleWaveLoader } from "@/components/ui/pulsating-loader";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Copy, Check, ChevronRight, Code2, BookOpen, Wand2, Lock, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { getStarterTemplate } from "@/lib/api/templates";
import { getBillingStatus } from "@/lib/api/billing";

const CodeEditor = dynamic(
  () => import("@/components/ui/CodeEditor").then((m) => ({ default: m.CodeEditor })),
  { ssr: false }
);

interface Template {
  id: string;
  name: string;
  category: string;
  subjectTemplate?: string;
  previewText?: string;
  heraldFooter: string;
  isDefault: boolean;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// All variables available in Herald templates
const TEMPLATE_VARIABLES = [
  { name: "protocolName", desc: "Your protocol's display name", example: "Marginfi" },
  { name: "subject", desc: "Notification subject / headline", example: "Position approaching liquidation" },
  { name: "body", desc: "Main notification body (supports Markdown)", example: "Your SOL position health is **1.08**" },
  { name: "category", desc: "Notification category slug", example: "defi" },
  { name: "actionUrl", desc: "CTA button link", example: "https://app.example.com/positions" },
  { name: "actionLabel", desc: "CTA button text", example: "Manage Position" },
  { name: "walletAddress", desc: "Recipient's wallet address (truncated for display)", example: "7xKXt…YqAv" },
  { name: "txHash", desc: "Related transaction hash", example: "5KJp8nQc…" },
  { name: "unsubscribeUrl", desc: "Auto-generated unsubscribe URL — do not hardcode", example: "https://notify.useherald.xyz/…" },
  { name: "previewText", desc: "Email preview text shown in inbox before opening", example: "Your position needs attention" },
];

// Handlebars helpers available in Herald templates
const TEMPLATE_HELPERS = [
  { name: "{{money amount \"USDC\"}}", desc: "Format a number as currency" },
  { name: "{{truncateAddress address}}", desc: "Shorten a wallet address to 0x1234…abcd" },
  { name: "{{timeAgo timestamp}}", desc: "Human-readable relative time (e.g. 3h ago)" },
  { name: "{{categoryLabel category}}", desc: "Category display name (e.g. DeFi Alert)" },
  { name: "{{markdown body}}", desc: "Render body as Markdown HTML" },
  { name: "{{#if actionUrl}}…{{/if}}", desc: "Conditionally render a block" },
];

const CATEGORY_COLORS: Record<string, string> = {
  defi: "bg-red-500/10 text-red-400 border-red-500/20",
  governance: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  marketing: "bg-teal/10 text-teal border-teal/20",
  system: "bg-gold/10 text-gold border-gold/20",
};

const HERALD_FOOTER_OPTIONS = [
  { value: "full", label: "Full — privacy note + Herald logo + Unsubscribe + site" },
  { value: "small", label: "Small — Herald logo + Unsubscribe + site" },
  { value: "minimal", label: "Minimal — Herald logo + Unsubscribe" },
  { value: "enterprise", label: "Enterprise — Herald logo + Unsubscribe (no site)" },
  { value: "none", label: "None — Unsubscribe link only" },
];

export default function TemplatesPage() {
  const { axios } = useApi();
  const router = useRouter();

  const { data: billing } = useQuery({
    queryKey: ["billing-status"],
    queryFn: getBillingStatus,
    staleTime: 60_000,
  });

  const [templates, setTemplates] = useState<Template[]>([]);

  const TEMPLATE_LIMITS: Record<number, number | null> = { 0: 3, 1: 10, 2: null, 3: null };
  const currentTier = billing?.tier ?? 0;
  const templateLimit = TEMPLATE_LIMITS[currentTier] ?? 3;
  const atTemplateLimit = templateLimit !== null && templates.length >= templateLimit;
  const canCreateTemplates = !atTemplateLimit;
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    category: "defi",
    subjectTemplate: "",
    htmlSource: "",
    heraldFooter: "full",
    isDefault: false,
  });
  const [activeTab, setActiveTab] = useState<"editor" | "preview" | "variables">("editor");
  const [previewVars, setPreviewVars] = useState({
    protocolName: "Example Protocol",
    brandName: "Example Protocol",
    logoUrl: "",
    subject: "Important Notification",
    body: "This is a sample notification body with important information about your DeFi position.",
    actionUrl: "https://example.com/action",
    actionLabel: "View Details",
    unsubscribeUrl: "https://notify.useherald.xyz/unsubscribe/test123",
  });
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [noAnimations, setNoAnimations] = useState(true);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoadingStarter, setIsLoadingStarter] = useState(false);

  useEffect(() => {
    loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTemplates = async () => {
    try {
      const { data } = await axios.get("/templates");
      setTemplates(data.data || []);
    } catch (error) {
      console.error("Failed to load templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseStarterTemplate = async () => {
    setIsLoadingStarter(true);
    try {
      const { html, suggestedVariables } = await getStarterTemplate();
      setNewTemplate((prev) => ({ ...prev, htmlSource: html }));
      setPreviewVars((prev) => ({
        ...prev,
        logoUrl: suggestedVariables.logoUrl ?? prev.logoUrl,
        brandName: suggestedVariables.brandName ?? prev.brandName,
        protocolName: suggestedVariables.protocolName ?? prev.protocolName,
      }));
    } catch (error) {
      console.error("Failed to load starter template:", error);
    } finally {
      setIsLoadingStarter(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const { data } = await axios.post("/templates", newTemplate);
      if (data.success) {
        setShowCreateModal(false);
        setNewTemplate({ name: "", category: "defi", subjectTemplate: "", htmlSource: "", heraldFooter: "full", isDefault: false });
        setPreviewHtml(null);
        loadTemplates();
        toast.success("Template created successfully.");
      }
    } catch (error: any) {
      const msg: string =
        error?.response?.data?.message ??
        error?.response?.data ??
        error?.message ??
        "Failed to create template. Please try again.";
      toast.error(typeof msg === "string" ? msg : "Failed to create template.");
    } finally {
      setIsCreating(false);
    }
  };

  const handlePreview = async () => {
    if (!newTemplate.htmlSource) return;
    setIsPreviewLoading(true);
    try {
      const { data } = await axios.post("/templates/preview", {
        htmlSource: newTemplate.htmlSource,
        subjectTemplate: newTemplate.subjectTemplate,
        heraldFooter: newTemplate.heraldFooter,
        variables: previewVars,
      });
      if (data.success) {
        const html = noAnimations
          ? `<style>*, *::before, *::after { animation: none !important; transition: none !important; }</style>` + data.preview.html
          : data.preview.html;
        setPreviewHtml(html);
        setActiveTab("preview");
      }
    } catch (error) {
      console.error("Failed to preview template:", error);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleDelete = (templateId: string) => setTemplateToDelete(templateId);

  const confirmDelete = async () => {
    if (!templateToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`/templates/${templateToDelete}`);
      loadTemplates();
      setTemplateToDelete(null);
    } catch (error) {
      console.error("Failed to delete template:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <RippleWaveLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div id="templates-header" className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email Templates</h1>
          <p className="text-sm text-text-muted mt-1">
            Custom email templates for your notifications.{" "}
            {templateLimit !== null && (
              <span className={atTemplateLimit ? "text-amber-400 font-medium" : "text-text-muted/70"}>
                {templates.length}/{templateLimit} used
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/templates/marketplace"
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-border bg-card-2 text-text-muted hover:text-foreground transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            Browse Marketplace
          </Link>
          {canCreateTemplates ? (
            <Button
              id="templates-create-btn"
              onClick={() => { setShowCreateModal(true); setActiveTab("editor"); setPreviewHtml(null); setNoAnimations(true); }}
            >
              Create Template
            </Button>
          ) : (
            <a
              href="/billing"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors"
            >
              <Lock className="h-3.5 w-3.5" />
              Upgrade to unlock more
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Template limit banner */}
      {atTemplateLimit && billing && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <Lock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-300">
              Template limit reached ({templateLimit}/{templateLimit})
            </p>
            <p className="text-xs text-amber-400/80 mt-0.5">
              You&apos;re on the <span className="font-medium">{billing.tierName}</span> plan ({templateLimit} template limit).
              Upgrade to create more custom templates, or browse the{" "}
              <Link href="/templates/marketplace" className="underline hover:text-amber-300">Marketplace</Link> for pre-built options.
            </p>
          </div>
          <a
            href="/billing"
            className="shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 transition-colors"
          >
            View Plans
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      )}

      {templates.length === 0 ? (
        <Card id="templates-list" className="border border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-teal/10 border border-teal/20">
              <Code2 className="w-7 h-7 text-teal" />
            </div>
            <p className="text-foreground font-semibold mb-1">No templates yet</p>
            <p className="text-text-muted text-sm mb-5 text-center max-w-sm">
              Create your first email template to start customising notifications.
            </p>
            <Button onClick={() => { setShowCreateModal(true); setActiveTab("editor"); setPreviewHtml(null); }}>
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="border border-border hover:border-teal/40 transition-all duration-200 group"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{template.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${CATEGORY_COLORS[template.category] ?? "bg-border text-text-muted border-border"}`}>
                        {template.category}
                      </span>
                      <span className="text-[10px] text-text-dim font-mono">v{template.version}</span>
                      {template.isDefault && (
                        <span className="text-[10px] bg-teal/20 text-teal px-2 py-0.5 rounded border border-teal/20">Default</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-text-muted line-clamp-2">
                  {template.subjectTemplate || <span className="italic opacity-60">No subject template</span>}
                </p>

                {/* Template ID — the key info developers need for the Notify API */}
                <div className="flex items-center gap-1.5 p-2 bg-card-2 border border-border rounded-lg">
                  <span className="text-[10px] text-text-dim uppercase tracking-wider font-semibold shrink-0">ID</span>
                  <code className="text-[11px] font-mono text-text-muted flex-1 truncate">
                    {template.id}
                  </code>
                  <button
                    onClick={() => copyToClipboard(template.id, template.id)}
                    className="shrink-0 p-0.5 text-text-dim hover:text-teal transition-colors"
                    title="Copy template ID"
                  >
                    {copiedId === template.id
                      ? <Check className="w-3.5 h-3.5 text-teal" />
                      : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-text-dim">
                    Updated {new Date(template.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => router.push(`/templates/${template.id}`)}
                    >
                      Edit
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-400"
                      onClick={() => handleDelete(template.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Using templates in the Notify API */}
      <Card className="border border-border bg-card">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-lg bg-teal/10 border border-teal/20 flex items-center justify-center shrink-0 mt-0.5">
              <BookOpen className="w-4.5 h-4.5 text-teal" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground mb-1">Using templates in the Notify API</h3>
              <p className="text-xs text-text-muted mb-3">
                Pass a <code className="bg-card-2 px-1 rounded text-teal">templateId</code> when sending a notification to use your custom template instead of the Herald system default.
              </p>
              <div className="rounded-lg bg-[#0d1f35] border border-[#1e293b] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1e293b]">
                  <span className="text-[10px] text-[#64748b] uppercase tracking-wider font-medium">POST /v1/notify</span>
                </div>
                <pre className="text-[12px] font-mono text-[#94a3b8] p-4 overflow-x-auto leading-relaxed">{`{
  "to": "0xYourUserWalletAddress",
  "templateId": "<your-template-id>",
  "subject": "Position approaching liquidation",
  "body": "Your SOL position health is **1.08**",
  "variables": {
    "actionUrl": "https://app.example.com/positions",
    "actionLabel": "Manage Position",
    "txHash": "5KJp8nQc..."
  }
}`}</pre>
              </div>
              <p className="text-[11px] text-text-dim mt-2">
                Template variables are merged with the notify payload. The Herald footer is appended automatically based on your template&apos;s footer setting and your plan tier.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Create Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-5xl max-h-[90vh] border border-border overflow-hidden flex flex-col">
            <CardHeader className="shrink-0 pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Create Template</CardTitle>
                  <CardDescription className="mt-1">
                    Custom email templates require Growth tier or higher.
                  </CardDescription>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-text-muted hover:text-foreground transition-colors p-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </CardHeader>

            {/* Tab bar */}
            <div className="flex border-b border-border px-4 md:px-6 shrink-0 overflow-x-auto">
              {[
                { id: "editor" as const, label: "Editor", icon: <Code2 className="w-3.5 h-3.5" /> },
                { id: "preview" as const, label: "Preview", icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> },
                { id: "variables" as const, label: "Variables", icon: <BookOpen className="w-3.5 h-3.5" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === "preview" && newTemplate.htmlSource && !previewHtml) {
                      handlePreview();
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                  className={`flex items-center gap-2 py-3 px-4 md:px-5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-teal text-teal"
                      : "border-transparent text-text-muted hover:text-foreground"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <CardContent className="flex-1 overflow-y-auto p-4 md:p-6">
              {/* ── Editor Tab ── */}
              {activeTab === "editor" && (
                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-secondary">Template Name</label>
                      <Input
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                        placeholder="e.g., Liquidation Alert"
                        className="bg-card-2"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-secondary">Category</label>
                      <Select
                        value={newTemplate.category}
                        onValueChange={(val) => setNewTemplate({ ...newTemplate, category: val })}
                      >
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="defi">DeFi Alerts</SelectItem>
                          <SelectItem value="governance">Governance</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="system">System Events</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary">Subject Template</label>
                    <Input
                      value={newTemplate.subjectTemplate}
                      onChange={(e) => setNewTemplate({ ...newTemplate, subjectTemplate: e.target.value })}
                      placeholder="{{protocolName}} — {{subject}}"
                      className="bg-card-2 font-mono text-sm"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {["{{protocolName}}", "{{subject}}", "{{category}}"].map((v) => (
                        <code
                          key={v}
                          className="text-[10px] bg-teal/10 text-teal border border-teal/20 px-1.5 py-0.5 rounded cursor-pointer hover:bg-teal/20 transition-colors"
                          onClick={() => setNewTemplate((prev) => ({ ...prev, subjectTemplate: (prev.subjectTemplate + " " + v).trim() }))}
                          title="Click to insert"
                        >
                          {v}
                        </code>
                      ))}
                      <button
                        onClick={() => setActiveTab("variables")}
                        className="text-[10px] text-text-dim hover:text-teal transition-colors underline underline-offset-2"
                      >
                        see all variables →
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-text-secondary">HTML Source</label>
                      <button
                        onClick={handleUseStarterTemplate}
                        disabled={isLoadingStarter}
                        className="flex items-center gap-1.5 text-[11px] text-teal hover:text-teal/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        title="Load the Herald starter template with your saved brand logo and name pre-filled"
                      >
                        <Wand2 className="w-3 h-3" />
                        {isLoadingStarter ? "Loading…" : "Use starter template"}
                      </button>
                    </div>
                    <div className="rounded-lg overflow-hidden border border-border">
                      <CodeEditor
                        value={newTemplate.htmlSource}
                        onChange={(v) => setNewTemplate({ ...newTemplate, htmlSource: v })}
                        height="280px"
                      />
                    </div>
                    <p className="text-[10px] text-text-dim">
                      Supports standard HTML, inline CSS, and Handlebars syntax. MJML is auto-detected.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-secondary">Herald Footer</label>
                      <Select
                        value={newTemplate.heraldFooter}
                        onValueChange={(val) => setNewTemplate({ ...newTemplate, heraldFooter: val })}
                      >
                        <SelectTrigger className="w-full bg-card-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {HERALD_FOOTER_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-text-dim">Herald always appends an unsubscribe link per CAN-SPAM/GDPR.</p>
                    </div>

                    <div className="flex items-end pb-1">
                      <div className="flex items-center gap-3 p-3 bg-card-2 border border-border rounded-lg w-full">
                        <input
                          type="checkbox"
                          id="isDefault"
                          checked={newTemplate.isDefault}
                          onChange={(e) => setNewTemplate({ ...newTemplate, isDefault: e.target.checked })}
                          className="rounded w-4 h-4"
                        />
                        <div>
                          <label htmlFor="isDefault" className="text-xs font-medium text-text-secondary cursor-pointer block">
                            Set as default for category
                          </label>
                          <p className="text-[10px] text-text-dim">Used when no templateId is passed for this category.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Preview Tab ── */}
              {activeTab === "preview" && (
                <div className="h-full flex flex-col lg:flex-row gap-6">
                  <div className="lg:w-72 space-y-3 shrink-0">
                    <div className="p-3 bg-card-2 border border-border rounded-lg">
                      <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1.5">Subject Preview</p>
                      <p className="text-sm text-foreground font-medium break-words">
                        {newTemplate.subjectTemplate
                          ? newTemplate.subjectTemplate
                              .replace(/\{\{protocolName\}\}/g, previewVars.protocolName)
                              .replace(/\{\{subject\}\}/g, previewVars.subject)
                              .replace(/\{\{category\}\}/g, newTemplate.category)
                          : <span className="text-text-dim italic">(No subject template)</span>}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {Object.entries(previewVars).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <label className="text-[10px] font-medium text-text-muted capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                          </label>
                          <Input
                            value={value}
                            onChange={(e) => setPreviewVars((prev) => ({ ...prev, [key]: e.target.value }))}
                            className="h-8 text-xs bg-card-2"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handlePreview}
                        disabled={!newTemplate.htmlSource}
                        isLoading={isPreviewLoading}
                        className="gap-2 w-full justify-center"
                      >
                        Update Preview
                      </Button>
                      <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
                        <input
                          type="checkbox"
                          checked={noAnimations}
                          onChange={(e) => setNoAnimations(e.target.checked)}
                          className="rounded w-3.5 h-3.5"
                        />
                        Disable animations
                      </label>
                    </div>
                  </div>

                  <div className="flex-1 min-h-[320px]">
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-2">Email Preview</p>
                    <div className="h-full border border-border rounded-lg overflow-auto bg-white shadow-inner min-h-[320px]">
                      {previewHtml ? (
                        <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-text-muted text-center p-4 gap-3">
                          <svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm">Enter HTML in the Editor tab, then click Update Preview</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Variables Tab ── */}
              {activeTab === "variables" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">Available Variables</h3>
                    <p className="text-xs text-text-muted mb-4">
                      Use <code className="bg-card-2 px-1 rounded text-teal">{"{{"}</code>variableName<code className="bg-card-2 px-1 rounded text-teal">{"}}"}</code> anywhere in your template HTML or subject line. Values are passed via the Notify API.
                    </p>
                    <div className="rounded-lg border border-border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-card-2">
                            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-40">Variable</th>
                            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Description</th>
                            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider hidden sm:table-cell">Example</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {TEMPLATE_VARIABLES.map((v) => (
                            <tr key={v.name} className="hover:bg-card-2 transition-colors group">
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-1.5">
                                  <code className="text-[11px] font-mono text-teal bg-teal/10 px-1.5 py-0.5 rounded">
                                    {`{{${v.name}}}`}
                                  </code>
                                  <button
                                    onClick={() => copyToClipboard(`{{${v.name}}}`, v.name)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-text-dim hover:text-teal"
                                  >
                                    {copiedId === v.name
                                      ? <Check className="w-3 h-3 text-teal" />
                                      : <Copy className="w-3 h-3" />}
                                  </button>
                                </div>
                              </td>
                              <td className="px-4 py-2.5 text-xs text-text-muted">{v.desc}</td>
                              <td className="px-4 py-2.5 hidden sm:table-cell">
                                <code className="text-[10px] font-mono text-text-dim">{v.example}</code>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">Built-in Helpers</h3>
                    <p className="text-xs text-text-muted mb-4">
                      Herald registers these Handlebars helpers — use them directly in your template.
                    </p>
                    <div className="space-y-2">
                      {TEMPLATE_HELPERS.map((h) => (
                        <div key={h.name} className="flex items-center gap-3 p-3 bg-card-2 border border-border rounded-lg group">
                          <code className="text-[11px] font-mono text-teal flex-1">{h.name}</code>
                          <span className="text-xs text-text-muted hidden sm:block">{h.desc}</span>
                          <button
                            onClick={() => copyToClipboard(h.name, h.name)}
                            className="shrink-0 text-text-dim hover:text-teal transition-colors"
                          >
                            {copiedId === h.name
                              ? <Check className="w-3.5 h-3.5 text-teal" />
                              : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            <div className="flex justify-end gap-3 p-4 border-t border-border shrink-0">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button
                isLoading={isCreating}
                onClick={handleCreate}
                disabled={!newTemplate.name || !newTemplate.htmlSource}
              >
                Create Template
              </Button>
            </div>
          </Card>
        </div>
      )}

      <ConfirmModal
        isOpen={!!templateToDelete}
        onClose={() => setTemplateToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Template"
        description="Are you sure you want to delete this template? This action cannot be undone."
        confirmText="Delete Template"
        isLoading={isDeleting}
      />
    </div>
  );
}

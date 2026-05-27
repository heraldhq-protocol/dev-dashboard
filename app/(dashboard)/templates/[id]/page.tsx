"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApi } from "@/components/providers/QueryProvider";
import { toast } from "sonner";
import { RippleWaveLoader } from "@/components/ui/pulsating-loader";
import {
  ArrowLeft, Save, Eye, Code, History, CheckCircle, AlertCircle,
  ChevronDown, ChevronUp, Clock, Copy, Check, BookOpen, RotateCcw, Zap, SendHorizonal,
} from "lucide-react";
import dynamic from "next/dynamic";

const CodeEditor = dynamic(
  () => import("@/components/ui/CodeEditor").then((m) => ({ default: m.CodeEditor })),
  { ssr: false }
);

interface Template {
  id: string;
  name: string;
  category: string;
  status: "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  subjectTemplate?: string;
  htmlSource?: string;
  previewText?: string;
  isDefault: boolean;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  DRAFT:          { label: "Draft",          className: "bg-border text-text-muted border-border" },
  PENDING_REVIEW: { label: "Pending Review", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  APPROVED:       { label: "Approved",       className: "bg-teal/10 text-teal border-teal/20" },
  REJECTED:       { label: "Rejected",       className: "bg-red-500/10 text-red-400 border-red-500/20" },
};

interface TemplateVersion {
  version: number;
  createdAt: string;
  htmlSource?: string;
  subjectTemplate?: string;
}

interface ValidateResult {
  valid: boolean;
  format?: string;
  errors?: string[];
  warnings?: string[];
}

type Tab = "editor" | "preview" | "validate" | "versions" | "usage";

const PREVIEW_VARS_DEFAULT = {
  protocolName: "Example Protocol",
  subject: "Important Notification",
  body: "This is a sample notification body with important information.",
  actionUrl: "https://example.com/action",
  actionLabel: "View Details",
  unsubscribeUrl: "https://notify.useherald.xyz/unsubscribe/test123",
};

// Complete variable + helper reference shown in Usage tab
const TEMPLATE_VARIABLES = [
  { name: "protocolName", source: "auto", desc: "Your protocol's display name" },
  { name: "subject", source: "notify", desc: "Notification headline / subject" },
  { name: "body", source: "notify", desc: "Main notification body (Markdown supported)" },
  { name: "category", source: "auto", desc: "Notification category slug (defi, governance…)" },
  { name: "actionUrl", source: "variables", desc: "CTA button URL" },
  { name: "actionLabel", source: "variables", desc: "CTA button text" },
  { name: "walletAddress", source: "auto", desc: "Recipient wallet address (privacy-safe)" },
  { name: "txHash", source: "variables", desc: "Related transaction hash" },
  { name: "unsubscribeUrl", source: "auto", desc: "Signed unsubscribe URL — do not hardcode" },
  { name: "previewText", source: "variables", desc: "Email preview text shown in inbox" },
];

const SOURCE_BADGE: Record<string, string> = {
  auto: "bg-teal/10 text-teal border-teal/20",
  notify: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  variables: "bg-gold/10 text-gold border-gold/20",
};

export default function TemplateEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { axios } = useApi();

  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("editor");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    category: "defi",
    subjectTemplate: "",
    htmlSource: "",
    isDefault: false,
  });

  const [previewVars, setPreviewVars] = useState(PREVIEW_VARS_DEFAULT);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [noAnimations, setNoAnimations] = useState(true);

  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null);
  const [isRestoring, setIsRestoring] = useState<number | null>(null);

  const [validateResult, setValidateResult] = useState<ValidateResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const loadTemplate = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`/templates/${id}`);
      const tpl: Template = data.data ?? data;
      setTemplate(tpl);
      setForm({
        name: tpl.name ?? "",
        category: tpl.category ?? "defi",
        subjectTemplate: tpl.subjectTemplate ?? "",
        htmlSource: tpl.htmlSource ?? "",
        isDefault: tpl.isDefault ?? false,
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to load template");
      router.push("/templates");
    } finally {
      setIsLoading(false);
    }
  }, [axios, id, router]);

  useEffect(() => { loadTemplate(); }, [loadTemplate]);

  const handleFormChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (field === "htmlSource") setValidateResult(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.put(`/templates/${id}`, form);
      toast.success("Template saved — new version created");
      setIsDirty(false);
      loadTemplate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    setIsSubmitting(true);
    try {
      const { data } = await axios.post(`/templates/${id}/submit`);
      if (data.status === "APPROVED") {
        toast.success("Template approved automatically — it's live!");
      } else {
        toast.success("Template submitted for review. Our team will check it shortly.");
      }
      loadTemplate(); // refresh status badge
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Submit failed.";
      toast.error(typeof msg === "string" ? msg : "Submit failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = async () => {
    if (!form.htmlSource) return;
    setIsPreviewing(true);
    try {
      const { data } = await axios.post(`/templates/${id}/preview`, { variables: previewVars });
      const html = data?.preview?.html ?? data?.html ?? "";
      setPreviewHtml(
        noAnimations
          ? `<style>*, *::before, *::after { animation: none !important; transition: none !important; }</style>` + html
          : html
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Preview failed");
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleLoadVersions = async () => {
    setIsLoadingVersions(true);
    try {
      const { data } = await axios.get(`/templates/${id}/versions`);
      setVersions(data?.versions ?? data ?? []);
    } catch {
      toast.error("Failed to load version history");
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const handleRestoreVersion = async (v: TemplateVersion) => {
    setIsRestoring(v.version);
    try {
      // Restoring = overwrite form with old version's HTML (creates new version on save)
      setForm((prev) => ({
        ...prev,
        htmlSource: v.htmlSource ?? prev.htmlSource,
        subjectTemplate: v.subjectTemplate ?? prev.subjectTemplate,
      }));
      setIsDirty(true);
      setValidateResult(null);
      setPreviewHtml(null);
      setActiveTab("editor");
      toast.success(`v${v.version} loaded into editor — save to apply`);
    } finally {
      setIsRestoring(null);
    }
  };

  const handleValidate = async () => {
    if (!form.htmlSource) return;
    setIsValidating(true);
    setValidateResult(null);
    try {
      const { data } = await axios.post(`/templates/validate`, {
        htmlSource: form.htmlSource,
        subjectTemplate: form.subjectTemplate,
      });
      setValidateResult(data);
    } catch {
      toast.error("Validation request failed");
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    if (activeTab === "versions" && versions.length === 0) handleLoadVersions();
    if (activeTab === "preview" && form.htmlSource && !previewHtml) handlePreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <RippleWaveLoader />
      </div>
    );
  }

  if (!template) return null;

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "editor",   label: "Editor",   icon: <Code className="w-4 h-4" /> },
    { id: "preview",  label: "Preview",  icon: <Eye className="w-4 h-4" /> },
    { id: "validate", label: "Validate", icon: <CheckCircle className="w-4 h-4" /> },
    { id: "versions", label: "Versions", icon: <History className="w-4 h-4" /> },
    { id: "usage",    label: "Usage",    icon: <Zap className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push("/templates")}
            className="flex items-center gap-1.5 text-text-muted hover:text-foreground transition-colors text-sm shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Templates
          </button>
          <span className="text-border-2 shrink-0">/</span>
          <h1 className="text-lg font-bold text-foreground truncate max-w-xs">{template.name}</h1>
          <span className="text-xs px-2 py-0.5 rounded bg-teal/10 text-teal border border-teal/20 font-mono shrink-0">
            v{template.version}
          </span>
          {(() => {
            const s = STATUS_BADGE[template.status];
            return s ? (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${s.className}`}>
                {s.label}
              </span>
            ) : null;
          })()}
          {isDirty && (
            <span className="text-xs px-2 py-0.5 rounded bg-gold/10 text-gold border border-gold/20 shrink-0">
              Unsaved
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {(template.status === "DRAFT" || template.status === "REJECTED") && (
            <Button
              variant="outline"
              onClick={handleSubmitForReview}
              isLoading={isSubmitting}
              disabled={isDirty || isSubmitting}
              className="gap-2"
              title={isDirty ? "Save your changes before submitting" : "Run AI review and submit for approval"}
            >
              <SendHorizonal className="w-4 h-4" />
              Submit for Review
            </Button>
          )}
          <Button onClick={handleSave} isLoading={isSaving} disabled={!isDirty} className="gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-border overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "border-teal text-teal"
                : "border-transparent text-text-muted hover:text-foreground hover:border-border"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── EDITOR TAB ── */}
      {activeTab === "editor" && (
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Metadata panel */}
          <Card className="border-border bg-card lg:col-span-1">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Metadata</h2>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted">Template Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  className="bg-card-2"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted">Category</label>
                <Select value={form.category} onValueChange={(val) => handleFormChange("category", val)}>
                  <SelectTrigger className="w-full bg-card-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defi">DeFi Alerts</SelectItem>
                    <SelectItem value="governance">Governance</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="system">System Events</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted">Subject Template</label>
                <Input
                  value={form.subjectTemplate}
                  onChange={(e) => handleFormChange("subjectTemplate", e.target.value)}
                  placeholder="{{protocolName}} — {{subject}}"
                  className="bg-card-2 font-mono text-xs"
                />
                <div className="flex flex-wrap gap-1 mt-1">
                  {["{{protocolName}}", "{{subject}}", "{{category}}"].map((v) => (
                    <code
                      key={v}
                      className="text-[10px] bg-teal/10 text-teal border border-teal/20 px-1.5 py-0.5 rounded cursor-pointer hover:bg-teal/20 transition-colors"
                      onClick={() => handleFormChange("subjectTemplate", ((form.subjectTemplate || "") + " " + v).trim())}
                      title="Click to insert"
                    >
                      {v}
                    </code>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-card-2 border border-border rounded-lg">
                <input
                  type="checkbox"
                  id="isDefaultEdit"
                  checked={form.isDefault}
                  onChange={(e) => handleFormChange("isDefault", e.target.checked)}
                  className="rounded w-4 h-4"
                />
                <label htmlFor="isDefaultEdit" className="text-xs text-text-muted cursor-pointer">
                  Set as default for category
                </label>
              </div>

              {/* Template ID + timestamps */}
              <div className="pt-2 border-t border-border space-y-2.5">
                <div>
                  <p className="text-[10px] text-text-dim uppercase tracking-wider font-semibold mb-1.5">Template ID</p>
                  <div className="flex items-center gap-2 p-2 bg-card-2 border border-border rounded-lg">
                    <code className="text-[11px] font-mono text-text-muted flex-1 break-all leading-relaxed">
                      {template.id}
                    </code>
                    <button
                      onClick={() => copy(template.id, "template-id")}
                      className="shrink-0 text-text-dim hover:text-teal transition-colors p-0.5"
                      title="Copy template ID"
                    >
                      {copiedKey === "template-id"
                        ? <Check className="w-3.5 h-3.5 text-teal" />
                        : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-text-dim mt-1">Use this ID in the Notify API or SDK — see the Usage tab.</p>
                </div>
                <div className="text-[10px] text-text-dim space-y-0.5">
                  <div>Created: <span className="text-text-muted">{new Date(template.createdAt).toLocaleString()}</span></div>
                  <div>Updated: <span className="text-text-muted">{new Date(template.updatedAt).toLocaleString()}</span></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* HTML Source editor */}
          <Card className="border-border bg-card lg:col-span-2">
            <CardContent className="p-5 space-y-3 flex flex-col h-full">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">HTML Source</h2>
                <span className="text-xs text-text-dim font-mono">{form.htmlSource.length.toLocaleString()} chars</span>
              </div>
              <div className="flex-1 min-h-[500px] rounded-lg overflow-hidden border border-border">
                <CodeEditor
                  value={form.htmlSource}
                  onChange={(v) => handleFormChange("htmlSource", v)}
                  height="500px"
                />
              </div>
              <p className="text-[10px] text-text-dim">
                Supports HTML, inline CSS, and Handlebars syntax. MJML is auto-detected.
                Style blocks (<code>&lt;style&gt;</code>), Google Fonts, and all email-safe tags are preserved.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── PREVIEW TAB ── */}
      {activeTab === "preview" && (
        <div className="grid lg:grid-cols-2 gap-5">
          <Card className="border-border bg-card">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Preview Variables</h2>
              {Object.entries(previewVars).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs font-medium text-text-muted capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </label>
                  <Input
                    value={value}
                    onChange={(e) => setPreviewVars((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="bg-card-2 text-xs font-mono"
                  />
                </div>
              ))}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="noAnim"
                  checked={noAnimations}
                  onChange={(e) => setNoAnimations(e.target.checked)}
                  className="rounded w-4 h-4"
                />
                <label htmlFor="noAnim" className="text-xs text-text-muted cursor-pointer">
                  Disable animations in preview
                </label>
              </div>
              <Button onClick={handlePreview} isLoading={isPreviewing} disabled={!form.htmlSource} className="w-full gap-2">
                <Eye className="w-4 h-4" />
                Render Preview
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-0 overflow-hidden rounded-xl">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-card-2 border-b border-border">
                <Eye className="w-3.5 h-3.5 text-text-muted" />
                <span className="text-xs font-medium text-text-muted">Email Preview</span>
              </div>
              <div className="min-h-[500px] bg-white overflow-auto">
                {isPreviewing ? (
                  <div className="flex items-center justify-center h-64"><RippleWaveLoader /></div>
                ) : previewHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
                    <Eye className="w-10 h-10 opacity-30" />
                    <p className="text-sm">Click &quot;Render Preview&quot; to see your email</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── VALIDATE TAB ── */}
      {activeTab === "validate" && (
        <Card className="border-border bg-card max-w-2xl">
          <CardContent className="p-6 space-y-5">
            <div>
              <h2 className="text-base font-bold text-foreground">Validate Template</h2>
              <p className="text-sm text-text-muted mt-1">
                Check your HTML for errors and best-practice warnings without saving a version.
              </p>
            </div>
            <Button onClick={handleValidate} isLoading={isValidating} disabled={!form.htmlSource} className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Run Validation
            </Button>
            {validateResult && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className={`flex items-center gap-3 p-4 rounded-xl border ${
                  validateResult.valid
                    ? "bg-teal/5 border-teal/30 text-teal"
                    : "bg-red/5 border-red/30 text-red"
                }`}>
                  {validateResult.valid
                    ? <CheckCircle className="w-5 h-5 shrink-0" />
                    : <AlertCircle className="w-5 h-5 shrink-0" />}
                  <div>
                    <span className="font-semibold text-sm">
                      {validateResult.valid ? "Template is valid!" : "Validation failed"}
                    </span>
                    {validateResult.format && (
                      <span className="ml-2 text-xs opacity-70">Format: {validateResult.format.toUpperCase()}</span>
                    )}
                  </div>
                </div>
                {validateResult.errors && validateResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-red uppercase tracking-wider">Errors</p>
                    {validateResult.errors.map((err, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 bg-red/5 border border-red/20 rounded-lg text-sm text-red">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        {err}
                      </div>
                    ))}
                  </div>
                )}
                {validateResult.warnings && validateResult.warnings.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gold uppercase tracking-wider">Warnings</p>
                    {validateResult.warnings.map((warn, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 bg-gold/5 border border-gold/20 rounded-lg text-sm text-gold">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        {warn}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── VERSIONS TAB ── */}
      {activeTab === "versions" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Version History</h2>
              <p className="text-xs text-text-muted mt-0.5">Herald keeps the last 10 versions. Restore any version to load it into the editor.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLoadVersions} className="gap-2 text-xs">
              <History className="w-3.5 h-3.5" />
              Refresh
            </Button>
          </div>

          {isLoadingVersions ? (
            <div className="flex items-center justify-center h-32"><RippleWaveLoader /></div>
          ) : versions.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
                <History className="w-10 h-10 text-text-dim opacity-40" />
                <p className="text-sm text-text-muted">No version history available yet.</p>
                <p className="text-xs text-text-dim">Save changes to create a new version.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {versions.map((v) => {
                const isCurrent = v.version === template.version;
                return (
                  <Card key={v.version} className={`border-border bg-card transition-colors ${isCurrent ? "border-teal/30" : "hover:border-teal/20"}`}>
                    <CardContent className="p-0">
                      <button
                        className="w-full flex items-center justify-between p-4 text-left"
                        onClick={() => setExpandedVersion(expandedVersion === v.version ? null : v.version)}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-2 py-0.5 rounded border font-mono font-bold ${isCurrent ? "bg-teal/20 text-teal border-teal/30" : "bg-card-2 text-text-muted border-border"}`}>
                            v{v.version}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] bg-teal/10 text-teal px-1.5 py-0.5 rounded border border-teal/20">Current</span>
                          )}
                          <div className="flex items-center gap-1.5 text-xs text-text-muted">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(v.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!isCurrent && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1.5 text-xs h-7"
                              isLoading={isRestoring === v.version}
                              onClick={(e) => { e.stopPropagation(); handleRestoreVersion(v); }}
                            >
                              <RotateCcw className="w-3 h-3" />
                              Restore
                            </Button>
                          )}
                          {expandedVersion === v.version ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                        </div>
                      </button>

                      {expandedVersion === v.version && (
                        <div className="px-4 pb-4 space-y-3 border-t border-border">
                          {v.subjectTemplate && (
                            <div className="pt-3">
                              <p className="text-xs text-text-muted mb-1">Subject Template</p>
                              <code className="text-xs bg-card-2 border border-border px-2 py-1.5 rounded block font-mono">
                                {v.subjectTemplate}
                              </code>
                            </div>
                          )}
                          {v.htmlSource && (
                            <div>
                              <p className="text-xs text-text-muted mb-1">HTML Source</p>
                              <pre className="text-xs bg-card-2 border border-border px-3 py-2 rounded font-mono overflow-x-auto max-h-48 leading-relaxed whitespace-pre-wrap">
                                {v.htmlSource.slice(0, 800)}
                                {v.htmlSource.length > 800 && "…"}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── USAGE TAB ── */}
      {activeTab === "usage" && (
        <div className="space-y-5 max-w-3xl">
          {/* Template ID */}
          <Card className="border-border bg-card">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">Template ID</h2>
                <span className="text-[10px] font-mono text-text-dim bg-card-2 border border-border px-1.5 py-0.5 rounded">v{template.version}</span>
              </div>
              <p className="text-xs text-text-muted">
                Pass this ID in the <code className="bg-card-2 px-1 rounded text-teal">templateId</code> field of your Notify API call to use this custom template instead of the Herald default.
              </p>
              <div className="flex items-center gap-3 p-3 bg-[#0d1f35] border border-[#1e293b] rounded-lg">
                <code className="text-sm font-mono text-teal flex-1 break-all">{template.id}</code>
                <button
                  onClick={() => copy(template.id, "usage-id")}
                  className="shrink-0 text-[#64748b] hover:text-teal transition-colors"
                  title="Copy ID"
                >
                  {copiedKey === "usage-id"
                    ? <Check className="w-4 h-4 text-teal" />
                    : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Notify API example */}
          <Card className="border-border bg-card">
            <CardContent className="p-5 space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Notify API</h2>
              <p className="text-xs text-text-muted">
                Send a notification using this template via the REST API:
              </p>
              <div className="rounded-lg bg-[#0d1f35] border border-[#1e293b] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e293b]">
                  <span className="text-[10px] text-[#64748b] uppercase tracking-wider font-medium">POST /v1/notify</span>
                  <button
                    onClick={() => copy(`POST https://gateway.useherald.xyz/v1/notify\nAuthorization: Bearer <your-api-key>\n\n{\n  "to": "0xUserWallet",\n  "templateId": "${template.id}",\n  "subject": "Your subject here",\n  "body": "Your notification body here",\n  "variables": {\n    "actionUrl": "https://app.example.com",\n    "actionLabel": "Take Action"\n  }\n}`, "api-snippet")}
                    className="text-[#64748b] hover:text-teal transition-colors flex items-center gap-1 text-[10px]"
                  >
                    {copiedKey === "api-snippet" ? <Check className="w-3 h-3 text-teal" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === "api-snippet" ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="text-[12px] font-mono text-[#94a3b8] p-4 overflow-x-auto leading-relaxed">{`POST https://gateway.useherald.xyz/v1/notify
Authorization: Bearer <your-api-key>

{
  "to": "0xUserWallet",
  "templateId": "${template.id}",
  "subject": "Your subject here",
  "body": "Your notification body here",
  "variables": {
    "actionUrl": "https://app.example.com",
    "actionLabel": "Take Action"
  }
}`}</pre>
              </div>
            </CardContent>
          </Card>

          {/* TypeScript SDK example */}
          <Card className="border-border bg-card">
            <CardContent className="p-5 space-y-3">
              <h2 className="text-sm font-semibold text-foreground">TypeScript SDK</h2>
              <div className="rounded-lg bg-[#0d1f35] border border-[#1e293b] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e293b]">
                  <span className="text-[10px] text-[#64748b] uppercase tracking-wider font-medium">herald-sdk-ts</span>
                  <button
                    onClick={() => copy(`import { HeraldClient } from '@herald/sdk';\n\nconst herald = new HeraldClient({ apiKey: process.env.HERALD_API_KEY });\n\nawait herald.notify({\n  to: userWalletAddress,\n  templateId: '${template.id}',\n  subject: 'Your subject here',\n  body: 'Your notification body here',\n  variables: {\n    actionUrl: 'https://app.example.com',\n    actionLabel: 'Take Action',\n  },\n});`, "sdk-snippet")}
                    className="text-[#64748b] hover:text-teal transition-colors flex items-center gap-1 text-[10px]"
                  >
                    {copiedKey === "sdk-snippet" ? <Check className="w-3 h-3 text-teal" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === "sdk-snippet" ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="text-[12px] font-mono text-[#94a3b8] p-4 overflow-x-auto leading-relaxed">{`import { HeraldClient } from '@herald/sdk';

const herald = new HeraldClient({ apiKey: process.env.HERALD_API_KEY });

await herald.notify({
  to: userWalletAddress,
  templateId: '${template.id}',
  subject: 'Your subject here',
  body: 'Your notification body here',
  variables: {
    actionUrl: 'https://app.example.com',
    actionLabel: 'Take Action',
  },
});`}</pre>
              </div>
            </CardContent>
          </Card>

          {/* Available variables reference */}
          <Card className="border-border bg-card">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-text-muted" />
                <h2 className="text-sm font-semibold text-foreground">Available Variables</h2>
              </div>
              <div className="flex gap-3 text-[10px] text-text-dim flex-wrap">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal inline-block"></span>auto — set by Herald</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400 inline-block"></span>notify — top-level notify field</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gold inline-block"></span>variables — inside the variables object</span>
              </div>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-card-2">
                      <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Variable</th>
                      <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider hidden sm:table-cell">Source</th>
                      <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Description</th>
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
                              onClick={() => copy(`{{${v.name}}}`, v.name)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-text-dim hover:text-teal"
                            >
                              {copiedKey === v.name ? <Check className="w-3 h-3 text-teal" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 hidden sm:table-cell">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${SOURCE_BADGE[v.source]}`}>
                            {v.source}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-text-muted">{v.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

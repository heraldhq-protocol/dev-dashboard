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
  ArrowLeft,
  Save,
  Eye,
  Code,
  History,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  category: string;
  subjectTemplate?: string;
  htmlSource?: string;
  previewText?: string;
  heraldFooter: string;
  isDefault: boolean;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface TemplateVersion {
  version: number;
  createdAt: string;
  htmlSource?: string;
  subjectTemplate?: string;
}

interface ValidateResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

type Tab = "editor" | "preview" | "versions" | "validate";

const PREVIEW_VARS_DEFAULT = {
  protocolName: "Example Protocol",
  subject: "Important Notification",
  body: "This is a sample notification body with important information.",
  actionUrl: "https://example.com/action",
  actionLabel: "View Details",
  unsubscribeUrl: "https://notify.useherald.xyz/unsubscribe/test123",
};

export default function TemplateEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { axios } = useApi();

  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("editor");

  // Form state (mirrors the template for editing)
  const [form, setForm] = useState({
    name: "",
    category: "defi",
    subjectTemplate: "",
    htmlSource: "",
    isDefault: false,
  });

  // Preview state
  const [previewVars, setPreviewVars] = useState(PREVIEW_VARS_DEFAULT);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [noAnimations, setNoAnimations] = useState(true);

  // Versions state
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null);

  // Validate state
  const [validateResult, setValidateResult] = useState<ValidateResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Dirty tracking
  const [isDirty, setIsDirty] = useState(false);

  const loadTemplate = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`/templates/${id}`);
      const tpl = data.data ?? data;
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

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  const handleFormChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    // Reset validate result when source changes
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

  const handlePreview = async () => {
    if (!form.htmlSource) return;
    setIsPreviewing(true);
    try {
      const { data } = await axios.post(`/templates/${id}/preview`, {
        variables: previewVars,
      });
      const html = data?.preview?.html ?? data?.html ?? "";
      const rendered = noAnimations
        ? `<style>*, *::before, *::after { animation: none !important; transition: none !important; }</style>` + html
        : html;
      setPreviewHtml(rendered);
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
    } catch (err: any) {
      toast.error("Failed to load version history");
    } finally {
      setIsLoadingVersions(false);
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
    } catch (err: any) {
      toast.error("Validation request failed");
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    if (activeTab === "versions" && versions.length === 0) {
      handleLoadVersions();
    }
    if (activeTab === "preview" && form.htmlSource && !previewHtml) {
      handlePreview();
    }
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
    { id: "editor", label: "Editor", icon: <Code className="w-4 h-4" /> },
    { id: "preview", label: "Preview", icon: <Eye className="w-4 h-4" /> },
    { id: "validate", label: "Validate", icon: <CheckCircle className="w-4 h-4" /> },
    { id: "versions", label: "Versions", icon: <History className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/templates")}
            className="flex items-center gap-1.5 text-text-muted hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Templates
          </button>
          <span className="text-border-2">/</span>
          <h1 className="text-lg font-bold text-foreground truncate max-w-xs">
            {template.name}
          </h1>
          <span className="text-xs px-2 py-0.5 rounded bg-teal/10 text-teal border border-teal/20 font-mono">
            v{template.version}
          </span>
          {isDirty && (
            <span className="text-xs px-2 py-0.5 rounded bg-gold/10 text-gold border border-gold/20">
              Unsaved
            </span>
          )}
        </div>
        <Button
          onClick={handleSave}
          isLoading={isSaving}
          disabled={!isDirty}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
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
          {/* Metadata */}
          <Card className="border-border bg-card lg:col-span-1">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Metadata
              </h2>

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
                <Select
                  value={form.category}
                  onValueChange={(val) => handleFormChange("category", val)}
                >
                  <SelectTrigger className="w-full bg-card-2">
                    <SelectValue />
                  </SelectTrigger>
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
                <p className="text-[10px] text-text-dim leading-relaxed">
                  Variables: <code className="bg-card-2 px-1 rounded">{"{{protocolName}}"}</code>{" "}
                  <code className="bg-card-2 px-1 rounded">{"{{subject}}"}</code>{" "}
                  <code className="bg-card-2 px-1 rounded">{"{{body}}"}</code>
                </p>
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

              <div className="pt-2 border-t border-border text-xs text-text-dim space-y-1">
                <div>Created: {new Date(template.createdAt).toLocaleString()}</div>
                <div>Updated: {new Date(template.updatedAt).toLocaleString()}</div>
                <div>ID: <code className="font-mono">{template.id.slice(0, 12)}…</code></div>
              </div>
            </CardContent>
          </Card>

          {/* HTML Source */}
          <Card className="border-border bg-card lg:col-span-2">
            <CardContent className="p-5 space-y-3 flex flex-col h-full">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                  HTML Source
                </h2>
                <span className="text-xs text-text-dim font-mono">
                  {form.htmlSource.length.toLocaleString()} chars
                </span>
              </div>
              <textarea
                value={form.htmlSource}
                onChange={(e) => handleFormChange("htmlSource", e.target.value)}
                placeholder="<html><body>...</body></html>"
                className="flex-1 w-full min-h-[480px] bg-card-2 border border-border text-foreground text-xs rounded-lg px-3 py-2.5 font-mono resize-y leading-relaxed focus:outline-none focus:ring-1 focus:ring-teal/50"
                spellCheck={false}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── PREVIEW TAB ── */}
      {activeTab === "preview" && (
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Variable controls */}
          <Card className="border-border bg-card">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Preview Variables
              </h2>
              {Object.entries(previewVars).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs font-medium text-text-muted capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </label>
                  <Input
                    value={value}
                    onChange={(e) =>
                      setPreviewVars((prev) => ({ ...prev, [key]: e.target.value }))
                    }
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

              <Button
                onClick={handlePreview}
                isLoading={isPreviewing}
                disabled={!form.htmlSource}
                className="w-full gap-2"
              >
                <Eye className="w-4 h-4" />
                Render Preview
              </Button>
            </CardContent>
          </Card>

          {/* Preview frame */}
          <Card className="border-border bg-card">
            <CardContent className="p-0 overflow-hidden rounded-xl">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-card-2 border-b border-border">
                <Eye className="w-3.5 h-3.5 text-text-muted" />
                <span className="text-xs font-medium text-text-muted">Email Preview</span>
              </div>
              <div className="min-h-[480px] bg-white overflow-auto">
                {isPreviewing ? (
                  <div className="flex items-center justify-center h-64">
                    <RippleWaveLoader />
                  </div>
                ) : previewHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
                    <Eye className="w-10 h-10 opacity-30" />
                    <p className="text-sm">Click "Render Preview" to see your email</p>
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
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground">Validate Template</h2>
                <p className="text-sm text-text-muted mt-1">
                  Check your HTML source for errors and best-practice warnings without saving.
                </p>
              </div>
            </div>

            <Button
              onClick={handleValidate}
              isLoading={isValidating}
              disabled={!form.htmlSource}
              className="gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Run Validation
            </Button>

            {validateResult && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div
                  className={`flex items-center gap-3 p-4 rounded-xl border ${
                    validateResult.valid
                      ? "bg-teal/5 border-teal/30 text-teal"
                      : "bg-red/5 border-red/30 text-red"
                  }`}
                >
                  {validateResult.valid ? (
                    <CheckCircle className="w-5 h-5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0" />
                  )}
                  <span className="font-semibold text-sm">
                    {validateResult.valid ? "Template is valid!" : "Validation failed"}
                  </span>
                </div>

                {validateResult.errors && validateResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-red uppercase tracking-wider">Errors</p>
                    {validateResult.errors.map((err, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-3 bg-red/5 border border-red/20 rounded-lg text-sm text-red"
                      >
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
                      <div
                        key={i}
                        className="flex items-start gap-2 p-3 bg-gold/5 border border-gold/20 rounded-lg text-sm text-gold"
                      >
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
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Version History
            </h2>
            <Button variant="ghost" size="sm" onClick={handleLoadVersions} className="gap-2 text-xs">
              <History className="w-3.5 h-3.5" />
              Refresh
            </Button>
          </div>

          {isLoadingVersions ? (
            <div className="flex items-center justify-center h-32">
              <RippleWaveLoader />
            </div>
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
              {versions.map((v) => (
                <Card key={v.version} className="border-border bg-card hover:border-teal/30 transition-colors">
                  <CardContent className="p-0">
                    <button
                      className="w-full flex items-center justify-between p-4 text-left"
                      onClick={() =>
                        setExpandedVersion(expandedVersion === v.version ? null : v.version)
                      }
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs px-2 py-0.5 rounded bg-teal/10 text-teal border border-teal/20 font-mono font-bold">
                          v{v.version}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-text-muted">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(v.createdAt).toLocaleString()}
                        </div>
                      </div>
                      {expandedVersion === v.version ? (
                        <ChevronUp className="w-4 h-4 text-text-muted" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-text-muted" />
                      )}
                    </button>

                    {expandedVersion === v.version && (
                      <div className="px-4 pb-4 space-y-3 border-t border-border">
                        {v.subjectTemplate && (
                          <div className="pt-3">
                            <p className="text-xs text-text-muted mb-1">Subject Template</p>
                            <code className="text-xs bg-card-2 border border-border px-2 py-1 rounded block font-mono">
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
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
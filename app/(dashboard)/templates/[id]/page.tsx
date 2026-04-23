"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { useApi } from "@/components/providers/QueryProvider";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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

export default function TemplateEditorPage() {
  const { axios } = useApi();
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [noAnimations, setNoAnimations] = useState(true);
  const [showVariables, setShowVariables] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    subjectTemplate: "",
    htmlSource: "",
    previewText: "",
    heraldFooter: "full",
    isDefault: false,
  });

  const [previewVars, setPreviewVars] = useState({
    protocolName: "Example Protocol",
    subject: "Important Notification",
    body: "This is a sample notification body with important information about your DeFi position.",
    actionUrl: "https://example.com/action",
    actionLabel: "View Details",
    unsubscribeUrl: "https://notify.useherald.xyz/unsubscribe/test123",
  });

  const [customVars, setCustomVars] = useState<Record<string, string>>({});
  const [customVarKey, setCustomVarKey] = useState("");
  const [customVarValue, setCustomVarValue] = useState("");

  useEffect(() => {
    if (templateId) {
      loadTemplate();
    }
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      const { data } = await axios.get(`/v1/templates/${templateId}`);
      setTemplate(data);
      setEditForm({
        name: data.name || "",
        subjectTemplate: data.subjectTemplate || "",
        htmlSource: data.htmlSource || "",
        previewText: data.previewText || "",
        heraldFooter: data.heraldFooter || "full",
        isDefault: data.isDefault || false,
      });
    } catch (error) {
      console.error("Failed to load template:", error);
      router.push("/templates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data } = await axios.put(`/v1/templates/${templateId}`, editForm);
      if (data.success) {
        loadTemplate();
      }
    } catch (error) {
      console.error("Failed to save template:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = async () => {
    if (!editForm.htmlSource) return;
    setIsPreviewLoading(true);
    try {
      const { data } = await axios.post(`/v1/templates/preview`, {
        htmlSource: editForm.htmlSource,
        subjectTemplate: editForm.subjectTemplate,
        variables: { ...previewVars, ...customVars },
      });
      if (data.success) {
        if (noAnimations) {
          const htmlWithNoAnim = `<style>*, *::before, *::after { animation: none !important; transition: none !important; }</style>` + data.preview.html;
          setPreviewHtml(htmlWithNoAnim);
        } else {
          setPreviewHtml(data.preview.html);
        }
        setActiveTab("preview");
      }
    } catch (error) {
      console.error("Failed to preview template:", error);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const addCustomVar = () => {
    if (customVarKey && customVarValue) {
      setCustomVars({ ...customVars, [customVarKey]: customVarValue });
      setCustomVarKey("");
      setCustomVarValue("");
    }
  };

  const removeCustomVar = (key: string) => {
    const { [key]: _, ...rest } = customVars;
    setCustomVars(rest);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/templates">
            <Button variant="ghost" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{editForm.name}</h1>
            <p className="text-sm text-text-muted mt-1">
              Version {template?.version} • {template?.category.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handlePreview} disabled={!editForm.htmlSource}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </Button>
          <Button onClick={handleSave} isLoading={isSaving}>
            Save Changes
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="flex border-b border-border overflow-x-auto">
          <button
            onClick={() => setActiveTab("editor")}
            className={`py-3 px-4 md:px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "editor"
                ? "border-teal text-teal"
                : "border-transparent text-text-muted hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editor
            </span>
          </button>
          <button
            onClick={() => {
              if (!previewHtml && editForm.htmlSource) {
                handlePreview();
              } else {
                setActiveTab("preview");
              }
            }}
            className={`py-3 px-4 md:px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "preview"
                ? "border-teal text-teal"
                : "border-transparent text-text-muted hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Preview
            </span>
          </button>
        </div>

        <div className="p-4 md:p-6">
          {activeTab === "editor" ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Template Details</CardTitle>
                    <CardDescription>Basic template information.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-text-secondary flex items-center gap-2">
                        <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Template Name
                      </label>
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="bg-card-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-text-secondary flex items-center gap-2">
                        <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Subject Template
                      </label>
                      <Input
                        value={editForm.subjectTemplate}
                        onChange={(e) => setEditForm({ ...editForm, subjectTemplate: e.target.value })}
                        placeholder="e.g., {{protocolName}} - {{subject}}"
                        className="bg-card-2"
                      />
                      <p className="text-xs text-text-muted">Available: {"{{protocolName}}"}, {"{{subject}}"}, {"{{body}}"}, {"{{actionUrl}}"}, {"{{actionLabel}}"}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-text-secondary flex items-center gap-2">
                        <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                        Preview Text
                      </label>
                      <Input
                        value={editForm.previewText}
                        onChange={(e) => setEditForm({ ...editForm, previewText: e.target.value })}
                        placeholder="Text shown in email preview..."
                        className="bg-card-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-text-secondary flex items-center gap-2">
                        <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        Herald Footer
                      </label>
                      <select
                        value={editForm.heraldFooter}
                        onChange={(e) => setEditForm({ ...editForm, heraldFooter: e.target.value })}
                        className="w-full bg-card-2 border border-border text-foreground text-sm rounded-lg px-3 py-2.5"
                      >
                        <option value="full">Full (Developer)</option>
                        <option value="small">Small (Growth)</option>
                        <option value="minimal">Minimal (Scale)</option>
                        <option value="none">None (Enterprise)</option>
                        <option value="enterprise">Enterprise (Custom)</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-card-2 border border-border rounded-lg">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={editForm.isDefault}
                        onChange={(e) => setEditForm({ ...editForm, isDefault: e.target.checked })}
                        className="rounded w-4 h-4"
                      />
                      <label htmlFor="isDefault" className="text-sm text-text-muted">
                        Set as default for {template?.category}
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">HTML Source</CardTitle>
                    <CardDescription>Email template HTML code.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <textarea
                      value={editForm.htmlSource}
                      onChange={(e) => setEditForm({ ...editForm, htmlSource: e.target.value })}
                      className="w-full h-64 md:h-80 lg:h-96 bg-card-2 border border-border text-foreground text-sm rounded-lg px-3 py-2 font-mono resize-none"
                      placeholder="<html><body>...</body></html>"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="p-3 bg-card-2 border border-border rounded-lg">
                  <label className="text-xs font-medium text-text-muted block mb-2 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Subject Preview
                  </label>
                  <p className="text-sm text-foreground font-medium break-words">
                    {editForm.subjectTemplate
                      ? editForm.subjectTemplate
                          .replace(/\{\{protocolName\}\}/g, previewVars.protocolName)
                          .replace(/\{\{subject\}\}/g, previewVars.subject)
                      : "(No subject template)"}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-muted block">Protocol Name</label>
                    <Input
                      value={previewVars.protocolName}
                      onChange={(e) => setPreviewVars({ ...previewVars, protocolName: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-muted block">Subject</label>
                    <Input
                      value={previewVars.subject}
                      onChange={(e) => setPreviewVars({ ...previewVars, subject: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-medium text-text-muted block">Body</label>
                    <Input
                      value={previewVars.body}
                      onChange={(e) => setPreviewVars({ ...previewVars, body: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-muted block">Action URL</label>
                    <Input
                      value={previewVars.actionUrl}
                      onChange={(e) => setPreviewVars({ ...previewVars, actionUrl: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-muted block">Action Label</label>
                    <Input
                      value={previewVars.actionLabel}
                      onChange={(e) => setPreviewVars({ ...previewVars, actionLabel: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <button
                    onClick={() => setShowVariables(!showVariables)}
                    className="text-sm text-text-muted hover:text-foreground flex items-center gap-2 mb-3"
                  >
                    <svg className={`w-4 h-4 transition-transform ${showVariables ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Custom Variables (optional)
                  </button>
                  
                  {showVariables && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={customVarKey}
                          onChange={(e) => setCustomVarKey(e.target.value)}
                          placeholder="Variable name"
                          className="flex-1 h-9 text-sm"
                        />
                        <Input
                          value={customVarValue}
                          onChange={(e) => setCustomVarValue(e.target.value)}
                          placeholder="Value"
                          className="flex-1 h-9 text-sm"
                        />
                        <Button variant="secondary" size="sm" onClick={addCustomVar} disabled={!customVarKey || !customVarValue}>
                          Add
                        </Button>
                      </div>
                      {Object.keys(customVars).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(customVars).map(([key, value]) => (
                            <span key={key} className="inline-flex items-center gap-1 px-2 py-1 bg-card-2 border border-border rounded-lg text-xs">
                              <span className="text-teal">{"{{" + key + "}}"}</span>
                              <span className="text-text-muted">:</span>
                              <span className="text-foreground">{value}</span>
                              <button onClick={() => removeCustomVar(key)} className="ml-1 text-text-muted hover:text-red-400">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handlePreview}
                    disabled={!editForm.htmlSource}
                    className="flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Update Preview
                  </Button>
                  <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noAnimations}
                      onChange={(e) => setNoAnimations(e.target.checked)}
                      className="rounded w-4 h-4"
                    />
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v-4.64a1 1 0 00-1.555-.832L5 12v12a1 1 0 001 1h12a1 1 0 001-1v-5a1 1 0 00-.555-.832l-3.5-2A1 1 0 0014 5a1 1 0 00-.752.168l-3.197 2.132A1 1 0 009 5.23v4.64a1 1 0 001.555.832l3.5-2a1 1 0 001 1v5a1 1 0 001 1h0" />
                      </svg>
                      Disable animations
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex-1 min-h-[300px] lg:min-h-[400px]">
                <div className="text-xs font-medium text-text-muted mb-2 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Preview
                </div>
                <div className="h-full border border-border rounded-lg overflow-auto bg-white shadow-inner">
                  {previewHtml ? (
                    <div className="border border-border rounded-lg overflow-hidden">
                      <div className="bg-gray-100 border-b border-border px-3 py-2 flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                      </div>
                      <div className="bg-white">
                        <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 md:h-80 text-text-muted p-4 text-center">
                      <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm">Click "Update Preview" to see the email</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { useApi } from "@/components/providers/QueryProvider";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function TemplatesPage() {
  const { axios } = useApi();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    category: "defi",
    subjectTemplate: "",
    htmlSource: "",
    isDefault: false,
  });
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [previewVars, setPreviewVars] = useState({
    protocolName: "Example Protocol",
    subject: "Important Notification",
    body: "This is a sample notification body with important information about your DeFi position.",
    actionUrl: "https://example.com/action",
    actionLabel: "View Details",
    unsubscribeUrl: "https://notify.useherald.xyz/unsubscribe/test123",
  });
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [noAnimations, setNoAnimations] = useState(true);

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

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const { data } = await axios.post("/templates", newTemplate);
      if (data.success) {
        setShowCreateModal(false);
        setNewTemplate({
          name: "",
          category: "defi",
          subjectTemplate: "",
          htmlSource: "",
          isDefault: false,
        });
        loadTemplates();
      }
    } catch (error) {
      console.error("Failed to create template:", error);
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
        variables: previewVars,
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

  const handleDelete = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await axios.delete(`/templates/${templateId}`);
      loadTemplates();
    } catch (error) {
      console.error("Failed to delete template:", error);
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email Templates</h1>
          <p className="text-sm text-text-muted mt-1">
            Create and manage custom email templates for your notifications.
          </p>
        </div>
        <Button onClick={() => {
          setShowCreateModal(true);
          setActiveTab("editor");
          setPreviewHtml(null);
          setNoAnimations(true);
        }}>
          Create Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <svg className="w-12 h-12 text-text-muted mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2z" />
            </svg>
            <p className="text-text-muted mb-4">No templates yet. Create your first template to get started.</p>
<Button onClick={() => {
            setShowCreateModal(true);
            setActiveTab("editor");
            setPreviewHtml(null);
            setNoAnimations(true);
          }}>
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="border border-border hover:border-teal/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {template.category.toUpperCase()} • v{template.version}
                    </CardDescription>
                  </div>
                  {template.isDefault && (
                    <span className="text-xs bg-teal/20 text-teal px-2 py-0.5 rounded">Default</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-muted line-clamp-2 mb-4">
                  {template.subjectTemplate || "No subject template"}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">
                    Last updated: {new Date(template.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/templates/${template.id}`)}
                    >
                      Edit
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

{/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-5xl max-h-[90vh] border border-border overflow-hidden flex flex-col">
            <CardHeader className="shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Create Template</CardTitle>
                  <CardDescription className="mt-1">
                    Templates require Growth tier or higher.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className="flex border-b border-border px-4 md:px-6 shrink-0 overflow-x-auto">
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
                  if (!previewHtml && newTemplate.htmlSource) {
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview
                </span>
              </button>
            </div>
            <CardContent className="flex-1 overflow-y-auto p-4 md:p-6">
              {activeTab === "editor" ? (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-text-secondary flex items-center gap-2">
                        <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Template Name
                      </label>
                      <Input
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                        placeholder="e.g., Liquidation Alert"
                        className="bg-card-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-text-secondary flex items-center gap-2">
                        <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Category
                      </label>
                      <Select
                        value={newTemplate.category}
                        onValueChange={(val) => setNewTemplate({ ...newTemplate, category: val })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="defi">DeFi Alerts</SelectItem>
                          <SelectItem value="governance">Governance</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="system">System Events</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-text-secondary flex items-center gap-2">
                      <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Subject Template
                    </label>
                    <Input
                      value={newTemplate.subjectTemplate}
                      onChange={(e) => setNewTemplate({ ...newTemplate, subjectTemplate: e.target.value })}
                      placeholder="e.g., {{protocolName}} - {{subject}}"
                      className="bg-card-2"
                    />
                    <p className="text-xs text-text-muted">Available variables: {"{{protocolName}}"}, {"{{subject}}"}, {"{{body}}"}, {"{{actionUrl}}"}, {"{{actionLabel}}"}, {"{{unsubscribeUrl}}"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-text-secondary flex items-center gap-2">
                      <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      HTML Source
                    </label>
                    <textarea
                      value={newTemplate.htmlSource}
                      onChange={(e) => setNewTemplate({ ...newTemplate, htmlSource: e.target.value })}
                      placeholder="<html><body>...</body></html>"
                      className="w-full h-48 md:h-64 bg-card-2 border border-border text-foreground text-sm rounded-lg px-3 py-2 font-mono resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-card-2 border border-border rounded-lg">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={newTemplate.isDefault}
                      onChange={(e) => setNewTemplate({ ...newTemplate, isDefault: e.target.checked })}
                      className="rounded w-4 h-4"
                    />
                    <label htmlFor="isDefault" className="text-sm text-text-muted">
                      Set as default for category
                    </label>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="p-3 bg-card-2 border border-border rounded-lg">
                      <label className="text-xs font-medium text-text-muted mb-2 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Subject Preview
                      </label>
                      <p className="text-sm text-foreground font-medium wrap-break-word">
                        {newTemplate.subjectTemplate
                          ? newTemplate.subjectTemplate
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
                    
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handlePreview}
                        disabled={!newTemplate.htmlSource}
                        isLoading={isPreviewLoading}
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
                          id="noAnimations"
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
                        <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-64 md:h-80 text-text-muted p-4 text-center">
                          <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-sm">Enter HTML source in the Editor tab and click Update Preview</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <div className="flex justify-end gap-3 p-4 border-t border-border shrink-0">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
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
    </div>
  );
}
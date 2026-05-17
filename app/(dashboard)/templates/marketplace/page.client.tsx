"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { MarketplaceTemplateCard } from "@/components/templates/MarketplaceTemplateCard";
import { TemplatePreviewModal } from "@/components/templates/TemplatePreviewModal";
import { listMarketplaceTemplates, type MarketplaceTemplate } from "@/lib/api/templates";

const CATEGORIES = ["all", "defi", "nft", "governance", "security", "general"];

export default function MarketplacePage() {
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<MarketplaceTemplate | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["marketplaceTemplates", category],
    queryFn: () => listMarketplaceTemplates(category === "all" ? undefined : category),
    staleTime: 300_000,
  });

  const filtered = search.trim()
    ? data.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.description.toLowerCase().includes(search.toLowerCase()) ||
          t.useCaseTag.toLowerCase().includes(search.toLowerCase())
      )
    : data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Template Marketplace"
        description="Browse battle-tested notification templates from the Herald team and community."
        actions={
          <Link
            href="/templates"
            className="text-xs text-text-muted hover:text-foreground transition-colors"
          >
            ← My Templates
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category pills */}
        <div className="flex items-center gap-1 rounded-lg bg-card-2 border border-border p-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors capitalize ${
                category === c
                  ? "bg-card text-foreground"
                  : "text-text-muted hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates…"
            className="w-full pl-8 pr-4 py-1.5 text-xs bg-card border border-border rounded-lg text-foreground placeholder-text-muted focus:outline-none focus:border-teal/50 transition-colors"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-52 rounded-xl bg-card-2/50 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-12 w-12 rounded-xl bg-card-2 border border-border flex items-center justify-center mb-4">
            <svg className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-foreground">No templates found</p>
          <p className="text-xs text-text-muted mt-1">Try a different category or search term.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <MarketplaceTemplateCard key={t.id} template={t} onPreview={setPreview} />
          ))}
        </div>
      )}

      {preview && (
        <TemplatePreviewModal template={preview} onClose={() => setPreview(null)} />
      )}
    </div>
  );
}

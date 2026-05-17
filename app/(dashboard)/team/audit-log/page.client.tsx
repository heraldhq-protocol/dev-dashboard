"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { AuditLogTable } from "@/components/team/AuditLogTable";
import { AuditLogFilters } from "@/components/team/AuditLogFilters";
import { getAuditLog, exportAuditLog, type AuditLogFilters as Filters } from "@/lib/api/team";

const DEFAULT_FILTERS: Filters = { page: 1, limit: 50 };

export default function AuditLogPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["auditLog", filters],
    queryFn: () => getAuditLog(filters),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      await exportAuditLog();
      toast.success("Audit log exported.");
    } catch {
      toast.error("Export failed.");
    } finally {
      setIsExporting(false);
    }
  }, []);

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 50;
  const total = data?.total ?? 0;
  const hasMore = data?.hasMore ?? false;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Audit Log"
        description="A tamper-evident record of every action taken by your team."
      />

      <AuditLogFilters
        filters={filters}
        onChange={setFilters}
        onExport={handleExport}
        isExporting={isExporting}
      />

      <div className={isFetching && !isLoading ? "opacity-70 transition-opacity" : ""}>
        <AuditLogTable items={data?.items ?? []} isLoading={isLoading} />
      </div>

      {!isLoading && total > 0 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-text-muted">
            {start}–{end} of {total.toLocaleString()} events
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
              disabled={page <= 1}
              className="h-7 w-7 flex items-center justify-center rounded-md border border-border text-text-muted hover:text-foreground hover:bg-card-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs text-text-muted px-2 min-w-[60px] text-center">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
              disabled={!hasMore}
              className="h-7 w-7 flex items-center justify-center rounded-md border border-border text-text-muted hover:text-foreground hover:bg-card-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

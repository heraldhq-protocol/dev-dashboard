"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { RequestFilters } from "@/components/requests/RequestFilters";
import { RequestsTable } from "@/components/requests/RequestsTable";
import { RequestDetailDrawer } from "@/components/requests/RequestDetailDrawer";
import { getRequestLogs, type RequestLogItem, type RequestLogFilters } from "@/lib/api/requests";
import { getBillingStatus } from "@/lib/api/billing";
import { TierGatePage } from "@/components/shared/TierGatePage";

const DEFAULT_FILTERS: RequestLogFilters = {
  page: 1,
  limit: 50,
};

export default function RequestInspectorPage() {
  const [filters, setFilters] = useState<RequestLogFilters>(DEFAULT_FILTERS);
  const [selectedLog, setSelectedLog] = useState<RequestLogItem | null>(null);

  const { data: billing } = useQuery({
    queryKey: ["billing-status"],
    queryFn: getBillingStatus,
    staleTime: 60_000,
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["requests", filters],
    queryFn: () => getRequestLogs(filters),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
    enabled: (billing?.tier ?? 0) >= 2,
  });

  const handleFiltersChange = useCallback((next: RequestLogFilters) => {
    setFilters(next);
  }, []);

  const handleSelect = useCallback((item: RequestLogItem) => {
    setSelectedLog(item);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedLog(null);
  }, []);

  if (billing && billing.tier < 2) {
    return (
      <TierGatePage
        feature="Request Inspector"
        description="Inspect every API request — payloads, status codes, latency, and full response bodies."
        currentTierName={billing.tierName}
      />
    );
  }

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 50;
  const total = data?.total ?? 0;
  const hasMore = data?.hasMore ?? false;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const goToPrev = () => {
    if (page > 1) setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }));
  };

  const goToNext = () => {
    if (hasMore) setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }));
  };

  return (
    <>
      <div className="space-y-5">
        <PageHeader
          title="Request Inspector"
          description="Every API request to your Herald project — inspect payloads, status codes, and latency."
        />

        <RequestFilters filters={filters} onChange={handleFiltersChange} />

        <div className={isFetching && !isLoading ? "opacity-70 transition-opacity" : ""}>
          <RequestsTable
            items={data?.items ?? []}
            isLoading={isLoading}
            onSelect={handleSelect}
          />
        </div>

        {/* Pagination */}
        {!isLoading && total > 0 && (
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-text-muted">
              {start}–{end} of {total.toLocaleString()} requests
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={goToPrev}
                disabled={page <= 1}
                className="h-7 w-7 flex items-center justify-center rounded-md border border-border text-text-muted hover:text-foreground hover:bg-card-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="text-xs text-text-muted px-2 min-w-[60px] text-center">
                {page} / {totalPages}
              </span>
              <button
                onClick={goToNext}
                disabled={!hasMore}
                className="h-7 w-7 flex items-center justify-center rounded-md border border-border text-text-muted hover:text-foreground hover:bg-card-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <RequestDetailDrawer log={selectedLog} onClose={handleCloseDrawer} />
    </>
  );
}

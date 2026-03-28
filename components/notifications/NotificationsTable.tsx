"use client";

import { useNotificationLog } from "@/hooks/useNotificationLog";
import { StatusBadge } from "./StatusBadge";
import { ReceiptProof } from "./ReceiptProof";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/Button";

interface NotificationsTableProps {
  page: number;
  onPageChange: (page: number) => void;
  statusFilter?: string;
  categoryFilter?: string;
  search?: string;
}

export function NotificationsTable({ page, onPageChange, statusFilter, categoryFilter, search }: NotificationsTableProps) {
  const router = useRouter();
  const { data, isLoading } = useNotificationLog(page, statusFilter, categoryFilter, search);

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-text-muted">
        Loading logs...
      </div>
    );
  }

  const logs = data?.data || [];
  const totalPages = Math.ceil((data?.total || 0) / 10);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-left text-sm text-text-secondary min-w-[800px]">
          <thead className="bg-card-2 text-xs uppercase tracking-widest text-text-muted border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold">ID</th>
              <th className="px-6 py-4 font-semibold">Time</th>
              <th className="px-6 py-4 font-semibold">Wallet</th>
              <th className="px-6 py-4 font-semibold">Category</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Proof</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr 
                  key={log.id} 
                  onClick={() => router.push(`/notifications/${log.id}`)}
                  className="hover:bg-card-2/50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-text-muted group-hover:text-white transition-colors">
                    {log.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-teal">
                    {log.wallet}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">
                    {log.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ReceiptProof signature={log.txSignature} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                  No notifications found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-text-muted pt-2 pb-6">
        <div>Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, data?.total || 0)} of {data?.total} results</div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onPageChange(page - 1)} 
            disabled={page === 1}
          >
            &larr; Prev
          </Button>
          <div className="flex items-center px-4 py-1.5 font-medium text-white bg-card-2 rounded-lg border border-border">
            {page} / {totalPages || 1}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onPageChange(page + 1)} 
            disabled={page >= totalPages}
          >
            Next &rarr;
          </Button>
        </div>
      </div>
    </div>
  );
}

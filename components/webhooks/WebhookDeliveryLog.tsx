"use client";

import { Modal } from "@/components/ui/Modal";
import { useQuery } from "@tanstack/react-query";
import { getDeliveryLogs } from "@/lib/api/webhooks";

interface WebhookDeliveryLogProps {
  webhookId: string | null;
  onClose: () => void;
}

export function WebhookDeliveryLog({ webhookId, onClose }: WebhookDeliveryLogProps) {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["webhookDeliveries", webhookId],
    queryFn: () => getDeliveryLogs(webhookId as string),
    enabled: !!webhookId,
  });

  return (
    <Modal isOpen={!!webhookId} onClose={onClose} title="Delivery History">
      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-card-2 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !logs || logs.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-text-muted text-sm">No delivery events logged yet.</p>
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <div className="bg-card rounded-lg border border-border">
              <table className="w-full text-left text-sm text-text-secondary">
                <thead className="bg-card-2 text-xs uppercase tracking-widest text-text-muted border-b border-border sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Event</th>
                    <th className="px-4 py-3 font-semibold text-center">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-card-2/50">
                      <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                        {new Date(log.attemptedAt).toLocaleDateString()}{" "}
                        {new Date(log.attemptedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs max-w-[150px] truncate" title={log.event}>
                        {log.event}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${log.success ? "bg-teal/10 text-teal" : "bg-red/10 text-red"}`}>
                          {log.httpStatus || "ERR"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-text-muted whitespace-nowrap">
                        {log.latencyMs ? `${log.latencyMs}ms` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

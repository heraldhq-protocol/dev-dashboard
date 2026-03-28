"use client";

import { useQuery } from "@tanstack/react-query";

export interface LogEntry {
  id: string;
  wallet: string;
  category: "defi" | "governance" | "marketing" | "system";
  status: "delivered" | "failed" | "queued" | "processing";
  createdAt: string;
  txSignature?: string;
}

export function useNotificationLog(
  page: number, 
  statusFilter?: string, 
  categoryFilter?: string,
  search?: string
) {
  return useQuery({
    queryKey: ["notifications", { page, statusFilter, categoryFilter, search }],
    queryFn: async (): Promise<{ data: LogEntry[], total: number }> => {
      // MOCKED FOR UI DEVELOPMENT
      return {
        data: [
          { id: "notif_8x2f", wallet: "7aV...9xK", category: "defi", status: "failed", createdAt: new Date().toISOString() },
          { id: "notif_9m1p", wallet: "G2z...4rW", category: "governance", status: "delivered", createdAt: new Date(Date.now() - 3600000).toISOString(), txSignature: "5xR9K...Lp" },
          { id: "notif_2k9l", wallet: "4xP...1tB", category: "system", status: "processing", createdAt: new Date(Date.now() - 7200000).toISOString() },
          { id: "notif_4b9c", wallet: "9qW...3eM", category: "marketing", status: "queued", createdAt: new Date(Date.now() - 86400000).toISOString() },
          { id: "notif_1v4n", wallet: "2pA...7sY", category: "defi", status: "delivered", createdAt: new Date(Date.now() - 172800000).toISOString(), txSignature: "2pA7S...Yx" },
        ],
        total: 142,
      };
    },
  });
}

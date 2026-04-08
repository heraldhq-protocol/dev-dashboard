"use client";

import { useQuery } from "@tanstack/react-query";
import { listNotifications } from "@/lib/api/notifications";

export function useNotificationLog(
  page: number, 
  statusFilter?: string, 
  categoryFilter?: string,
  search?: string
) {
  return useQuery({
    queryKey: ["notifications", { page, statusFilter, categoryFilter, search }],
    queryFn: async () => {
      return listNotifications(page, 10, statusFilter, categoryFilter, search);
    },
  });
}

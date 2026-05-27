"use client";

import { useQuery } from "@tanstack/react-query";
import { listNotifications } from "@/lib/api/notifications";
import { sandboxNotifications } from "@/lib/sandbox-data";
import { useUiStore } from "@/lib/stores/ui.store";

export function useNotificationLog(
  page: number,
  statusFilter?: string,
  categoryFilter?: string,
  search?: string,
) {
  const isSandbox = useUiStore((s) => s.activeEnvironment === "sandbox");

  return useQuery({
    queryKey: ["notifications", { page, statusFilter, categoryFilter, search, isSandbox }],
    queryFn: isSandbox
      ? () =>
          Promise.resolve(
            sandboxNotifications(page, 10, statusFilter, categoryFilter, search),
          )
      : () => listNotifications(page, 10, statusFilter, categoryFilter, search),
    staleTime: isSandbox ? 0 : undefined,
  });
}

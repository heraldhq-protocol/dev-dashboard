import { create } from "zustand";

interface NotificationsState {
  status: "all" | "delivered" | "failed" | "queued" | "processing";
  category: "all" | "defi" | "governance" | "system" | "marketing";
  search: string;
  page: number;
  setStatus: (status: NotificationsState["status"]) => void;
  setCategory: (category: NotificationsState["category"]) => void;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  status: "all",
  category: "all",
  search: "",
  page: 1,
  setStatus: (status) => set({ status, page: 1 }),
  setCategory: (category) => set({ category, page: 1 }),
  setSearch: (search) => set({ search, page: 1 }),
  setPage: (page) => set({ page }),
  resetFilters: () => set({ status: "all", category: "all", search: "", page: 1 }),
}));

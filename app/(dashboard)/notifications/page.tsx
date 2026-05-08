"use client";

import { useState } from "react";
import { NotificationsTable } from "@/components/notifications/NotificationsTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [params, setParams] = useState({
    status: "",
    category: "",
    search: "",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Notification Log
        </h1>
        <p className="text-sm text-text-muted">
          Search, filter, and inspect delivery attempts and verifiable proofs.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by wallet or ID..."
          className="flex-1 bg-card border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-teal"
          value={params.search}
          onChange={(e) => {
            setParams((p) => ({ ...p, search: e.target.value }));
            setPage(1);
          }}
        />

        <Select
          value={params.status || "all"}
          onValueChange={(val) => {
            setParams((p) => ({ ...p, status: val === "all" ? "" : val }));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="queued">Queued</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={params.category || "all"}
          onValueChange={(val) => {
            setParams((p) => ({ ...p, category: val === "all" ? "" : val }));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="defi">DeFi Alerts</SelectItem>
            <SelectItem value="governance">Governance</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="system">System Events</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <NotificationsTable
        page={page}
        onPageChange={setPage}
        statusFilter={params.status}
        categoryFilter={params.category}
        search={params.search}
      />
    </div>
  );
}

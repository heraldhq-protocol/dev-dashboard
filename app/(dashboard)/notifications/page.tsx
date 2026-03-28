"use client";

import { useState } from "react";
import { NotificationsTable } from "@/components/notifications/NotificationsTable";

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [params, setParams] = useState({
    status: "",
    category: "",
    search: ""
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">Notification Log</h1>
        <p className="text-sm text-text-muted">Search, filter, and inspect delivery attempts and verifiable proofs.</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by wallet or ID..."
          className="flex-1 bg-card border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal"
          value={params.search}
          onChange={(e) => {
            setParams(p => ({ ...p, search: e.target.value }));
            setPage(1);
          }}
        />
        
        <select 
          className="bg-card border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal cursor-pointer"
          value={params.status}
          onChange={(e) => {
            setParams(p => ({ ...p, status: e.target.value }));
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          <option value="delivered">Delivered</option>
          <option value="failed">Failed</option>
          <option value="queued">Queued</option>
          <option value="processing">Processing</option>
        </select>

        <select 
          className="bg-card border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal cursor-pointer"
          value={params.category}
          onChange={(e) => {
            setParams(p => ({ ...p, category: e.target.value }));
            setPage(1);
          }}
        >
          <option value="">All Categories</option>
          <option value="defi">DeFi Alerts</option>
          <option value="governance">Governance</option>
          <option value="marketing">Marketing</option>
          <option value="system">System Events</option>
        </select>
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

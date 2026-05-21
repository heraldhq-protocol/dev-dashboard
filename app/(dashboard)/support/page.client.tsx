"use client";

import Image from "next/image";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MessageCircle, Plus, ChevronRight, ChevronLeft, Clock, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import {
  createTicket,
  listTickets,
  getTicket,
  replyToTicket,
  type SupportTicketCategory,
  type SupportTicketStatus,
} from "@/lib/api/support";

const CATEGORIES: { value: SupportTicketCategory; label: string }[] = [
  { value: "api_issue", label: "API Issue" },
  { value: "delivery_failure", label: "Delivery Failure" },
  { value: "billing", label: "Billing" },
  { value: "verification", label: "Verification" },
  { value: "account", label: "Account" },
  { value: "feature_request", label: "Feature Request" },
  { value: "other", label: "Other" },
];

const STATUS_CONFIG: Record<SupportTicketStatus, { label: string; color: string }> = {
  open: { label: "Open", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  in_progress: { label: "In Progress", color: "bg-[#00C896]/10 text-[#00C896] border-[#00C896]/20" },
  waiting_on_protocol: { label: "Waiting on You", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  resolved: { label: "Resolved", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  closed: { label: "Closed", color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
};

function StatusBadge({ status }: { status: SupportTicketStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function SupportPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"list" | "new" | "detail">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  // New ticket form state
  const [category, setCategory] = useState<SupportTicketCategory>("api_issue");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["support-tickets", page],
    queryFn: () => listTickets({ limit: PAGE_SIZE, offset: page * PAGE_SIZE }),
    staleTime: 30_000,
  });

  const { data: ticket, isLoading: ticketLoading } = useQuery({
    queryKey: ["support-ticket", selectedId],
    queryFn: () => getTicket(selectedId!),
    enabled: !!selectedId && view === "detail",
    staleTime: 15_000,
  });

  const createMutation = useMutation({
    mutationFn: createTicket,
    onSuccess: (created) => {
      toast.success("Ticket submitted — we'll be in touch soon.");
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      setSelectedId(created.id);
      setView("detail");
      setSubject("");
      setBody("");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message ?? "Failed to submit ticket");
    },
  });

  const replyMutation = useMutation({
    mutationFn: (text: string) => replyToTicket(selectedId!, text),
    onSuccess: () => {
      toast.success("Reply sent.");
      setReplyBody("");
      queryClient.invalidateQueries({ queryKey: ["support-ticket", selectedId] });
    },
    onError: () => toast.error("Failed to send reply"),
  });

  const tickets = data?.items ?? [];
  const totalTickets = data?.total ?? 0;
  const totalPages = Math.ceil(totalTickets / PAGE_SIZE);
  const openCount = tickets.filter((t) => ["open", "in_progress", "waiting_on_protocol"].includes(t.status)).length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative w-full overflow-hidden rounded-xl border border-[#1E293B]">
        <Image
          src="https://herald-storage-bucket.s3.eu-north-1.amazonaws.com/herald-support-banner.png"
          alt="Herald Support"
          width={1200}
          height={300}
          className="w-full object-cover"
          priority
        />
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#F8FAFC] font-['Syne']">Support</h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">
            {openCount > 0 ? `${openCount} open ticket${openCount > 1 ? "s" : ""}` : "No open tickets"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {view !== "list" && (
            <Button variant="ghost" size="sm" onClick={() => { setView("list"); setPage(0); }}>
              ← Back
            </Button>
          )}
          {view === "list" && (
            <Button size="sm" onClick={() => setView("new")}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              New Ticket
            </Button>
          )}
        </div>
      </div>

      {/* New ticket form */}
      {view === "new" && (
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-[#F8FAFC] font-['Syne']">Submit a support ticket</h2>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-[#64748B]">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                    category === c.value
                      ? "bg-[#00C896]/10 border-[#00C896]/40 text-[#00C896]"
                      : "border-[#1E293B] text-[#94A3B8] hover:border-[#334155] hover:text-[#F8FAFC]"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-[#64748B]">Subject</label>
            <Input
              placeholder="Brief summary of your issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={255}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-[#64748B]">Description</label>
            <textarea
              placeholder="Describe your issue in detail. Include any error codes, notification IDs, or steps to reproduce."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              maxLength={5000}
              className="w-full rounded-md border border-[#1E293B] bg-[#0A1628] px-3 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#00C896]/50 focus:outline-none focus:ring-1 focus:ring-[#00C896]/30 resize-none"
            />
            <p className="text-xs text-[#64748B] text-right">{body.length}/5000</p>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="ghost" size="sm" onClick={() => setView("list")}>Cancel</Button>
            <Button
              size="sm"
              disabled={!subject.trim() || body.length < 30 || createMutation.isPending}
              onClick={() => createMutation.mutate({ category, subject: subject.trim(), body })}
            >
              {createMutation.isPending ? (
                <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Submitting…</>
              ) : (
                "Submit Ticket"
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Ticket detail */}
      {view === "detail" && (
        <div className="space-y-4">
          {ticketLoading ? (
            <div className="flex items-center justify-center py-16 text-[#64748B]">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : ticket ? (
            <>
              <Card className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#64748B]">
                      {CATEGORIES.find((c) => c.value === ticket.category)?.label ?? ticket.category}
                    </p>
                    <h2 className="text-base font-semibold text-[#F8FAFC] font-['Syne']">{ticket.subject}</h2>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={ticket.status as SupportTicketStatus} />
                    {ticket.linearIssueUrl && (
                      <a
                        href={ticket.linearIssueUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#64748B] hover:text-[#94A3B8] transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Linear
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-xs text-[#64748B] mt-3 font-mono">
                  {ticket.id} · opened {formatDate(ticket.createdAt)}
                </p>
              </Card>

              {/* Messages */}
              <div className="space-y-3">
                {ticket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-lg border p-4 ${
                      msg.senderType === "herald_team"
                        ? "border-[#00C896]/20 bg-[#00C896]/5"
                        : "border-[#1E293B] bg-[#0D1F35]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-widest text-[#64748B]">
                        {msg.senderType === "herald_team" ? "Herald Team" : "You"}
                      </span>
                      <span className="text-xs text-[#475569]">{formatDate(msg.createdAt)}</span>
                    </div>
                    <p className="text-sm text-[#CBD5E1] whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                  </div>
                ))}
              </div>

              {/* Reply box — only for open tickets */}
              {!["resolved", "closed"].includes(ticket.status) && (
                <Card className="p-4 space-y-3">
                  <textarea
                    placeholder="Add a reply…"
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    rows={4}
                    className="w-full rounded-md border border-[#1E293B] bg-[#0A1628] px-3 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#00C896]/50 focus:outline-none focus:ring-1 focus:ring-[#00C896]/30 resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      disabled={replyBody.length < 5 || replyMutation.isPending}
                      onClick={() => replyMutation.mutate(replyBody)}
                    >
                      {replyMutation.isPending ? (
                        <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Sending…</>
                      ) : "Send Reply"}
                    </Button>
                  </div>
                </Card>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* Ticket list */}
      {view === "list" && (
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-[#64748B]">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <Card className="p-10 flex flex-col items-center gap-3 text-center">
              <MessageCircle className="h-8 w-8 text-[#1E293B]" />
              <p className="text-sm font-medium text-[#475569]">No support tickets yet</p>
              <p className="text-xs text-[#334155] max-w-xs">
                Submit a ticket and the Herald team will get back to you within one business day.
              </p>
              <Button size="sm" className="mt-2" onClick={() => setView("new")}>
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Open a Ticket
              </Button>
            </Card>
          ) : (
            <>
              {tickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setSelectedId(t.id); setView("detail"); }}
                  className="w-full text-left rounded-lg border border-[#1E293B] bg-[#0D1F35] px-4 py-3.5 hover:border-[#334155] hover:bg-[#112240] transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#64748B]">
                        {CATEGORIES.find((c) => c.value === t.category)?.label ?? t.category}
                      </p>
                      <p className="text-sm font-medium text-[#E2E8F0] truncate">{t.subject}</p>
                      <div className="flex items-center gap-1.5 text-xs text-[#475569]">
                        <Clock className="h-3 w-3" />
                        {formatDate(t.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <StatusBadge status={t.status as SupportTicketStatus} />
                      <ChevronRight className="h-4 w-4 text-[#334155] group-hover:text-[#64748B] transition-colors" />
                    </div>
                  </div>
                </button>
              ))}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-[#64748B]">
                    Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalTickets)} of {totalTickets}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                      className="p-1.5 rounded border border-[#1E293B] text-[#64748B] hover:border-[#334155] hover:text-[#94A3B8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs text-[#64748B] tabular-nums">{page + 1} / {totalPages}</span>
                    <button
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                      className="p-1.5 rounded border border-[#1E293B] text-[#64748B] hover:border-[#334155] hover:text-[#94A3B8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

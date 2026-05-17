"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { VerificationBadge } from "./VerificationBadge";
import { requestVerification } from "@/lib/api/protocol";
import type { VerificationStatus } from "@/types/api";

interface VerificationCardProps {
  status: VerificationStatus;
  verifiedAt?: string | null;
}

const BENEFITS = [
  "Relaxed rate limits on notification volume",
  "Verified badge visible to users on the Herald registry",
  "Priority support queue",
  "Early access to beta features",
];

export function VerificationCard({ status, verifiedAt }: VerificationCardProps) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: () => requestVerification({ reason }),
    onSuccess: () => {
      toast.success("Verification request submitted — we'll review it within 2 business days.");
      setShowForm(false);
      setReason("");
      queryClient.invalidateQueries({ queryKey: ["protocol"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to submit verification request.");
    },
  });

  if (status === "VERIFIED") {
    return (
      <div className="rounded-xl border border-teal/20 bg-teal/5 p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-teal/15 flex items-center justify-center shrink-0">
              <svg className="h-4 w-4 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Protocol Verified</p>
              <p className="text-xs text-text-muted mt-0.5">
                {verifiedAt
                  ? `Verified on ${new Date(verifiedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                  : "Your protocol has been verified by the Herald team."}
              </p>
            </div>
          </div>
          <VerificationBadge status="VERIFIED" size="md" />
        </div>
      </div>
    );
  }

  if (status === "PENDING") {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
            <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Verification Under Review</p>
            <p className="text-xs text-text-muted mt-0.5">
              We&apos;re reviewing your request. This typically takes 1–2 business days.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
            <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Verification Not Approved</p>
            <p className="text-xs text-text-muted mt-0.5">
              Your request wasn&apos;t approved this time. You can reapply with more detail.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-semibold text-teal hover:underline"
          >
            Reapply
          </button>
        </div>
        {showForm && <VerificationForm reason={reason} setReason={setReason} onSubmit={() => mutate()} isPending={isPending} onCancel={() => setShowForm(false)} />}
      </div>
    );
  }

  // UNVERIFIED
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-card-2 border border-border-2 flex items-center justify-center shrink-0">
            <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Get Verified</p>
            <p className="text-xs text-text-muted mt-0.5">
              Verified protocols get a trust badge and relaxed platform limits.
            </p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border border-teal/30 text-teal hover:bg-teal/10 transition-colors"
          >
            Apply
          </button>
        )}
      </div>

      {!showForm && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-center gap-2 text-xs text-text-muted">
              <svg className="h-3 w-3 text-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {b}
            </li>
          ))}
        </ul>
      )}

      {showForm && <VerificationForm reason={reason} setReason={setReason} onSubmit={() => mutate()} isPending={isPending} onCancel={() => setShowForm(false)} />}
    </div>
  );
}

function VerificationForm({
  reason,
  setReason,
  onSubmit,
  isPending,
  onCancel,
}: {
  reason: string;
  setReason: (v: string) => void;
  onSubmit: () => void;
  isPending: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-3 pt-2 border-t border-border">
      <div>
        <label className="text-xs font-semibold text-foreground block mb-1.5">
          Tell us about your protocol <span className="text-text-muted font-normal">(min 20 chars)</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Describe your protocol, its purpose, and why you're requesting verification..."
          className="w-full rounded-lg border border-border bg-card-2 px-3 py-2 text-sm text-foreground placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-teal/50 resize-none"
        />
        <p className="text-[11px] text-text-muted mt-1">{reason.length} / 20 min</p>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <button onClick={onCancel} className="text-xs text-text-muted hover:text-foreground transition-colors px-3 py-1.5">
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={isPending || reason.length < 20}
          className="text-xs font-semibold px-4 py-1.5 rounded-lg bg-teal text-navy disabled:opacity-50 transition-opacity hover:opacity-90"
        >
          {isPending ? "Submitting…" : "Submit Request"}
        </button>
      </div>
    </div>
  );
}

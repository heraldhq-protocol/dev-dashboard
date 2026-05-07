"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/switch";
import {
  getOverageStatus,
  updateOverageSettings,
  getOverageInvoices,
  getBillingStatus,
} from "@/lib/api/billing";

// ── helpers ────────────────────────────────────────────────────────────────

function usdcToDisplay(micro: string | number): string {
  return (Number(micro) / 1_000_000).toFixed(2);
}

function daysUntil(isoDate: string): number {
  return Math.max(
    0,
    Math.ceil((new Date(isoDate).getTime() - Date.now()) / 86_400_000)
  );
}

/** Estimate end-of-period overage spend based on current burn rate. */
function estimateEopSpend(
  currentMicro: number,
  periodResetAt: string
): number {
  const daysLeft = daysUntil(periodResetAt);
  const totalDays = 30; // approximate billing cycle
  const daysElapsed = Math.max(1, totalDays - daysLeft);
  const dailyRate = currentMicro / daysElapsed;
  return dailyRate * totalDays;
}

// ── component ──────────────────────────────────────────────────────────────

export function OverageManagement() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: overageData, isLoading: overageLoading, error: overageError } = useQuery({
    queryKey: ["overageStatus"],
    queryFn: getOverageStatus,
    retry: 1,
  });

  const { data: billingStatus } = useQuery({
    queryKey: ["billingStatus"],
    queryFn: getBillingStatus,
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ["overageInvoices"],
    queryFn: getOverageInvoices,
    retry: 1,
  });

  const updateMutation = useMutation({
    mutationFn: updateOverageSettings,
    onSuccess: () => {
      toast.success("Overage settings updated.");
      queryClient.invalidateQueries({ queryKey: ["overageStatus"] });
      setIsEditing(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update settings.");
    },
  });

  if (overageLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 bg-card-2 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-card-2 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-48 bg-card-2 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (overageError || !overageData) {
    return (
      <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border rounded-2xl text-center gap-3">
        <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <p className="text-sm text-text-muted">Could not load overage data.</p>
        <Button size="sm" variant="secondary" onClick={() => queryClient.invalidateQueries({ queryKey: ["overageStatus"] })}>
          Retry
        </Button>
      </div>
    );
  }

  const { settings, usage, pricing } = overageData;

  const currentSpendMicro = Number(usage.overageUsdcThisPeriod);
  const maxSpendMicro = Number(settings.maxOverageUsdc);
  const alertAtMicro = Number(settings.overageAlertAtUsdc);
  const currentSpend = currentSpendMicro / 1_000_000;
  const maxSpend = maxSpendMicro / 1_000_000;
  const overageCount = Number(usage.overagesThisPeriod);

  const periodResetAt = billingStatus?.periodResetAt ?? null;
  const daysLeft = periodResetAt ? daysUntil(periodResetAt) : null;
  const estimatedEopMicro = overageCount > 0 && periodResetAt ? estimateEopSpend(currentSpendMicro, periodResetAt) : 0;
  const estimatedEop = estimatedEopMicro / 1_000_000;

  const budgetPercent = maxSpendMicro > 0 ? Math.min((currentSpendMicro / maxSpendMicro) * 100, 100) : 0;
  const isBudgetWarning = budgetPercent >= 80;
  const isBudgetCritical = budgetPercent >= 95;

  // Parse per-send price from pricing string like "$0.08/send"
  const pricePerSend = pricing ? pricing.replace(/[^0-9.]/g, "") : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Overage Management</h2>
          <p className="text-sm text-text-muted mt-0.5">Pay-as-you-go sends beyond your plan limit.</p>
        </div>
        <div className="flex items-center gap-3">
          {pricePerSend && (
            <span className="text-xs font-mono bg-card-2 border border-border px-3 py-1 rounded-full text-text-muted">
              ${pricePerSend}/notification
            </span>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Pay-as-you-go</span>
            <Switch
              checked={settings.optInOverage}
              onCheckedChange={(checked) => updateMutation.mutate({ optInOverage: checked })}
              disabled={updateMutation.isPending}
            />
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current spend */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-medium text-text-muted uppercase tracking-widest mb-2">This Period</p>
          <p className="text-2xl font-bold text-foreground">
            ${currentSpend.toFixed(2)}
            <span className="text-xs font-normal text-text-muted ml-1">USDC</span>
          </p>
          <p className="text-xs text-text-muted mt-1">{overageCount.toLocaleString()} overage sends</p>
        </div>

        {/* Estimated EOP */}
        <div className={`bg-card border rounded-2xl p-4 ${
          estimatedEop > maxSpend && maxSpend > 0
            ? "border-red-500/40 bg-red-500/5"
            : "border-border"
        }`}>
          <p className="text-xs font-medium text-text-muted uppercase tracking-widest mb-2">Est. End-of-Period</p>
          <p className={`text-2xl font-bold ${overageCount === 0 ? "text-text-muted" : "text-foreground"}`}>
            {overageCount === 0 ? "—" : `$${estimatedEop.toFixed(2)}`}
            {overageCount > 0 && <span className="text-xs font-normal text-text-muted ml-1">USDC</span>}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {overageCount === 0 ? "No overages yet" : "At current send rate"}
          </p>
        </div>

        {/* Days until reset */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-medium text-text-muted uppercase tracking-widest mb-2">Period Resets</p>
          <p className="text-2xl font-bold text-foreground">
            {daysLeft ?? "—"}
            <span className="text-xs font-normal text-text-muted ml-1">days</span>
          </p>
          <p className="text-xs text-text-muted mt-1">
            {periodResetAt ? new Date(periodResetAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"}
          </p>
        </div>

        {/* Hard cap */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-medium text-text-muted uppercase tracking-widest mb-2">Hard Cap</p>
          {maxSpend > 0 ? (
            <>
              <p className="text-2xl font-bold text-foreground">
                ${maxSpend.toFixed(2)}
                <span className="text-xs font-normal text-text-muted ml-1">USDC</span>
              </p>
              <p className="text-xs text-text-muted mt-1">
                ${(maxSpend - currentSpend).toFixed(2)} remaining
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-text-muted">Not set</p>
              <p className="text-xs text-text-muted mt-1">No spending cap</p>
            </>
          )}
        </div>
      </div>

      {/* Budget progress + settings */}
      {settings.optInOverage ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget bar */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground">Budget Usage</h4>
              {isBudgetCritical && (
                <span className="text-xs font-semibold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
                  Near cap
                </span>
              )}
              {isBudgetWarning && !isBudgetCritical && (
                <span className="text-xs font-semibold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">
                  80% used
                </span>
              )}
            </div>
            {maxSpend > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-text-muted">
                  <span>${currentSpend.toFixed(2)} spent</span>
                  <span>${maxSpend.toFixed(2)} cap</span>
                </div>
                <div className="h-2 rounded-full bg-border overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isBudgetCritical ? "bg-red-500" : isBudgetWarning ? "bg-yellow-400" : "bg-teal"
                    }`}
                    style={{ width: `${budgetPercent}%` }}
                  />
                </div>
                <p className="text-xs text-text-muted">
                  {budgetPercent.toFixed(1)}% of cap used
                </p>
              </div>
            ) : (
              <p className="text-sm text-text-muted">Set a hard cap to track budget usage.</p>
            )}

            {/* Alert threshold indicator */}
            {alertAtMicro > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-border text-sm">
                <span className="text-text-muted">Alert threshold</span>
                <span className={`font-medium ${currentSpendMicro >= alertAtMicro ? "text-yellow-400" : "text-foreground"}`}>
                  ${usdcToDisplay(alertAtMicro)} USDC
                  {currentSpendMicro >= alertAtMicro && " ⚠ Reached"}
                </span>
              </div>
            )}

            <p className="text-xs text-text-muted italic">
              Overages are billed at end of your 30-day period.
            </p>
          </div>

          {/* Settings */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h4 className="font-semibold text-foreground">Auto-Stop & Alerts</h4>
              {!isEditing && (
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                  Edit Limits
                </Button>
              )}
            </div>

            {isEditing ? (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const maxVal = parseFloat(fd.get("maxOverageUsdc") as string);
                  const alertVal = parseFloat(fd.get("overageAlertAtUsdc") as string);
                  if (maxVal < 1) return toast.error("Hard cap must be at least $1.00");
                  updateMutation.mutate({
                    maxOverageUsdc: (maxVal * 1_000_000).toString(),
                    overageAlertAtUsdc: (alertVal * 1_000_000).toString(),
                  });
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Hard Cap (USDC)
                    </label>
                    <Input
                      name="maxOverageUsdc"
                      type="number"
                      step="0.01"
                      min="1"
                      defaultValue={maxSpend > 0 ? maxSpend.toFixed(2) : ""}
                      placeholder="e.g. 50.00"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Alert At (USDC)
                    </label>
                    <Input
                      name="overageAlertAtUsdc"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={(alertAtMicro / 1_000_000).toFixed(2)}
                      placeholder="e.g. 40.00"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Button size="sm" type="submit" isLoading={updateMutation.isPending}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" type="button" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Hard Cap Stop</p>
                    <p className="text-xs text-text-muted">Pause sends when cap is reached</p>
                  </div>
                  <Switch
                    checked={settings.overageHardCapEnabled}
                    onCheckedChange={(checked) => updateMutation.mutate({ overageHardCapEnabled: checked })}
                    disabled={updateMutation.isPending}
                  />
                </div>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Monthly Cap</p>
                    <p className="text-xs text-text-muted">Max overage spend this period</p>
                  </div>
                  <span className="text-sm font-mono font-semibold text-foreground">
                    {maxSpend > 0 ? `$${maxSpend.toFixed(2)}` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Alert Threshold</p>
                    <p className="text-xs text-text-muted">Email alert when reached</p>
                  </div>
                  <span className="text-sm font-mono font-semibold text-foreground">
                    {alertAtMicro > 0 ? `$${usdcToDisplay(alertAtMicro)}` : "—"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center">
          <div className="w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="font-semibold text-foreground mb-2">Keep sending after your limit</h3>
          <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto">
            Enable pay-as-you-go to continue delivering notifications after you hit your plan limit.
            {pricePerSend && ` Charged at $${pricePerSend} per notification.`}
          </p>
          <Button
            onClick={() => updateMutation.mutate({ optInOverage: true })}
            isLoading={updateMutation.isPending}
          >
            Enable Pay-as-you-go
          </Button>
        </div>
      )}

      {/* Invoice History */}
      {invoices.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4">Overage Invoices</h3>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-card-2 border-b border-border">
                  <th className="px-5 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">Period</th>
                  <th className="px-5 py-3 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Sends</th>
                  <th className="px-5 py-3 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Amount</th>
                  <th className="px-5 py-3 text-xs font-bold text-text-muted uppercase tracking-wider text-center">Status</th>
                  <th className="px-5 py-3 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-card-2/50 transition-colors">
                    <td className="px-5 py-3 text-sm text-foreground">
                      {new Date(inv.periodStart).toLocaleDateString()} – {new Date(inv.periodEnd).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-sm text-foreground text-right font-mono">
                      {Number(inv.totalOverages).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-foreground text-right">
                      ${(Number(inv.totalUsdc) / 1_000_000).toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        inv.status === "paid"
                          ? "bg-teal/20 text-teal"
                          : inv.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {inv.status === "pending" && inv.helioPaymentLink ? (
                        <Button variant="secondary" size="sm" onClick={() => (window.location.href = inv.helioPaymentLink!)}>
                          Pay Now
                        </Button>
                      ) : inv.solanaTxSignature ? (
                        <a
                          href={`https://solscan.io/tx/${inv.solanaTxSignature}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-teal hover:underline font-mono"
                        >
                          View Tx
                        </a>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

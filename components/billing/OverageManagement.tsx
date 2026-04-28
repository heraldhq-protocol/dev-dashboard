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
  getOverageInvoices 
} from "@/lib/api/billing";
import { cn } from "@/lib/utils";

import { UsageProgressBar } from "./UsageProgressBar";

export function OverageManagement() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: overageData, isLoading: overageLoading } = useQuery({
    queryKey: ["overageStatus"],
    queryFn: getOverageStatus,
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ["overageInvoices"],
    queryFn: getOverageInvoices,
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

  if (overageLoading || !overageData) {
    return (
      <div className="animate-pulse bg-card/50 rounded-2xl h-64 border border-border" />
    );
  }

  const { settings, usage, pricing } = overageData;
  const currentSpend = Number(usage.overageUsdcThisPeriod) / 1_000_000;
  const maxSpend = Number(settings.maxOverageUsdc) / 1_000_000;


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: '"Syne", system-ui, sans-serif' }}>Overage Management</h2>
        <div className="flex items-center gap-2 bg-teal/10 px-3 py-1 rounded-full w-fit">
          <span className="text-[10px] sm:text-xs font-semibold text-teal uppercase tracking-wider whitespace-nowrap">
            {pricing}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage & Status Card */}
        <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-teal/10 transition-colors" />
          
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] sm:text-xs font-medium text-text-muted uppercase tracking-widest mb-1">
                  Current Period Overage
                </p>
                <h3 className="text-2xl font-bold text-foreground">
                  ${currentSpend.toFixed(2)} <span className="text-sm font-normal text-text-muted">USDC</span>
                </h3>
              </div>
              <div className="flex items-center gap-3 bg-card-2/50 sm:bg-transparent p-2 sm:p-0 rounded-lg border border-border/50 sm:border-0 w-full sm:w-auto justify-between sm:justify-start">
                <span className="text-xs font-medium text-text-muted">Pay-as-you-go</span>
                <Switch 
                  checked={settings.optInOverage}
                  onCheckedChange={(checked) => updateMutation.mutate({ optInOverage: checked })}
                  disabled={updateMutation.isPending}
                />
              </div>
            </div>

            {settings.optInOverage ? (
              <div className="space-y-4">
                <UsageProgressBar 
                  used={Number(usage.overageUsdcThisPeriod)} 
                  quota={Number(settings.maxOverageUsdc)}
                  label={`Usage toward cap ($${maxSpend.toFixed(2)})`}
                />
                <p className="text-xs text-text-muted italic">
                  * Overages are billed at the end of your 30-day period.
                </p>
              </div>
            ) : (
              <div className="bg-navy/50 border border-dashed border-border rounded-xl p-8 text-center">
                <p className="text-sm text-text-muted mb-4 text-balance">
                  Enable overage to keep sending notifications after you hit your plan limit.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => updateMutation.mutate({ optInOverage: true })}
                  isLoading={updateMutation.isPending}
                >
                  Enable Pay-as-you-go
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Settings Card */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-semibold text-foreground">Auto-Stop & Alerts</h4>
            {!isEditing && (
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                Edit Limits
              </Button>
            )}
          </div>

          {isEditing ? (
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const maxVal = parseFloat(formData.get("maxOverageUsdc") as string);
              const alertVal = parseFloat(formData.get("overageAlertAtUsdc") as string);
              
              if (maxVal < 1) return toast.error("Maximum cap must be at least $1.00");
              
              updateMutation.mutate({
                maxOverageUsdc: (maxVal * 1_000_000).toString(),
                overageAlertAtUsdc: (alertVal * 1_000_000).toString(),
              });
            }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Hard Cap (USDC)
                  </label>
                  <Input 
                    name="maxOverageUsdc" 
                    type="number" 
                    step="0.01" 
                    defaultValue={maxSpend.toFixed(2)} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Alert At (USDC)
                  </label>
                  <Input 
                    name="overageAlertAtUsdc" 
                    type="number" 
                    step="0.01" 
                    defaultValue={(Number(settings.overageAlertAtUsdc) / 1_000_000).toFixed(2)} 
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button size="sm" type="submit" isLoading={updateMutation.isPending}>
                  Save Changes
                </Button>
                <Button size="sm" variant="ghost" type="button" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">Hard Cap Stop</p>
                  <p className="text-xs text-text-muted max-w-[200px] sm:max-w-none">Pause API sends immediately if cap is reached</p>
                </div>
                <div className="w-full sm:w-auto flex justify-end">
                  <Switch 
                    variant="destructive"
                    checked={settings.overageHardCapEnabled}
                    onCheckedChange={(checked) => updateMutation.mutate({ overageHardCapEnabled: checked })}
                    disabled={updateMutation.isPending}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border pt-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">Monthly Alert</p>
                  <p className="text-xs text-text-muted text-balance">
                    Notify admins when overage reaches ${(Number(settings.overageAlertAtUsdc) / 1_000_000).toFixed(2)}
                  </p>
                </div>
                <div className="bg-navy px-3 py-1 rounded border border-border text-xs font-mono w-fit">
                  ${(Number(settings.overageAlertAtUsdc) / 1_000_000).toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice History */}
      {invoices.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-bold text-foreground mb-4">Overage Invoices</h3>
          <div className="bg-card border border-border rounded-xl overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-navy/50 border-b border-border">
                  <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Period</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest text-center">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-navy/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-primary">
                        {new Date(inv.periodStart).toLocaleDateString()} - {new Date(inv.periodEnd).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-text-muted font-mono uppercase mt-0.5">
                        {inv.totalOverages} notifications
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-bold text-foreground">
                        ${(Number(inv.totalUsdc) / 1_000_000).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                        inv.status === 'paid' ? 'bg-teal/20 text-teal' : 
                        inv.status === 'pending' ? 'bg-warning/20 text-warning' : 
                        'bg-error/20 text-error'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {inv.status === 'pending' && inv.helioPaymentLink ? (
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => window.location.href = inv.helioPaymentLink!}
                        >
                          Pay Now
                        </Button>
                      ) : (inv.solanaTxSignature ? (
                        <a 
                          href={`https://solscan.io/tx/${inv.solanaTxSignature}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] text-teal hover:underline font-mono"
                        >
                          View Tx
                        </a>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      ))}
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

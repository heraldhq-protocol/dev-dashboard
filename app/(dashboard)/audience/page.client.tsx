"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { RegistrationTrendChart } from "@/components/audience/RegistrationTrendChart";
import { ChannelCoverageDonut } from "@/components/audience/ChannelCoverageDonut";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { getAudienceAnalytics } from "@/lib/api/analytics";
import { getProtocol } from "@/lib/api/protocol";
import { useUiStore } from "@/lib/stores/ui.store";
import { sandboxAudienceAnalytics } from "@/lib/sandbox-data";
import { Check, Copy } from "lucide-react";

export default function AudiencePage() {
  const [copied, setCopied] = useState(false);
  const isSandbox = useUiStore((s) => s.activeEnvironment === "sandbox");

  const { data, isLoading } = useQuery({
    queryKey: ["audienceAnalytics", isSandbox],
    queryFn: isSandbox ? sandboxAudienceAnalytics : getAudienceAnalytics,
    staleTime: isSandbox ? 0 : 120_000,
  });

  const { data: protocol } = useQuery({
    queryKey: ["protocol"],
    queryFn: getProtocol,
    staleTime: 300_000,
  });

  const protocolId = protocol?.id ?? protocol?.protocolId ?? "YOUR_PROTOCOL_ID";

  const trendSparkline = data?.registrationTrend.slice(-14).map((d) => d.count) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audience"
        description="Track subscriber growth, channel coverage, and retention across your protocol."
      />

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Registered"
          value={isLoading ? "—" : (data?.totalRegistered ?? 0).toLocaleString()}
          detail="unique subscribers"
          sparklineData={trendSparkline}
          isLoading={isLoading}
        />
        <StatCard
          label="Active (30 days)"
          value={isLoading ? "—" : (data?.activeLastThirtyDays ?? 0).toLocaleString()}
          detail="received a notification"
          isLoading={isLoading}
        />
        <StatCard
          label="Retention Rate"
          value={isLoading ? "—" : `${data?.retentionRate ?? 0}%`}
          detail="active / total"
          deltaType={
            (data?.retentionRate ?? 0) >= 50
              ? "positive"
              : (data?.retentionRate ?? 0) >= 25
              ? "neutral"
              : "negative"
          }
          isLoading={isLoading}
        />
        <StatCard
          label="Broadcastable"
          value={isLoading ? "—" : (data?.broadcastableSubscribers ?? 0).toLocaleString()}
          detail="reachable via broadcast"
          isLoading={isLoading}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <DashboardCard
          className="lg:col-span-2"
          header={{ title: "Registration Trend", action: <span className="text-[10px] text-text-muted">Last 90 days</span> }}
        >
          {isLoading ? (
            <div className="h-[220px] animate-shimmer rounded-lg opacity-20" />
          ) : (
            <RegistrationTrendChart data={data?.registrationTrend ?? []} />
          )}
        </DashboardCard>

        <DashboardCard header={{ title: "Channel Coverage" }}>
          {isLoading ? (
            <div className="h-[180px] flex items-center justify-center">
              <div className="animate-shimmer h-32 w-32 rounded-full opacity-20" />
            </div>
          ) : (
            <ChannelCoverageDonut
              email={data?.channelCoverage.email ?? 0}
              telegram={data?.channelCoverage.telegram ?? 0}
              sms={data?.channelCoverage.sms ?? 0}
            />
          )}

          {/* Channel breakdown list */}
          {!isLoading && data && (
            <div className="mt-4 space-y-2 border-t border-border pt-4">
              {(() => {
                const { email, telegram, sms } = data.channelCoverage;
                const channelTotal = email + telegram + sms;
                return [
                  { label: "Email", value: email, color: "#00C896" },
                  { label: "Telegram", value: telegram, color: "#6366f1" },
                  { label: "SMS", value: sms, color: "#f59e0b" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-text-muted">{label}</span>
                    </div>
                    <span className="font-semibold text-foreground tabular-nums">
                      {channelTotal > 0 ? Math.round((value / channelTotal) * 100) : 0}%
                    </span>
                  </div>
                ));
              })()}
            </div>
          )}
        </DashboardCard>
      </div>

      {/* Source breakdown */}
      {!isLoading && data?.bySource && Object.keys(data.bySource).length > 0 && (
        <DashboardCard header={{ title: "Subscriber Sources" }}>
          <div className="grid gap-3 sm:grid-cols-3">
            {Object.entries(data.bySource).map(([source, count]) => (
              <div key={source} className="flex items-center justify-between rounded-lg border border-border bg-card-2 px-4 py-3">
                <span className="text-xs text-text-muted capitalize">{source.replace(/_/g, " ")}</span>
                <span className="text-sm font-semibold text-foreground tabular-nums">{(count as number).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      )}

      {/* Audience Registration — shareable link */}
      <DashboardCard
        header={{
          title: "Grow Your Audience",
          action: (
            <span className="text-[10px] text-text-muted font-mono">
              share with your users
            </span>
          ),
        }}
      >
        <p className="text-xs text-text-muted mb-5 leading-relaxed max-w-2xl">
          Share this link with your users. They connect their Solana wallet, encrypt their email in-browser,
          and sign one transaction — Herald routes notifications without ever seeing their email.
          No SDK integration required.
        </p>

        {/* Shareable link row */}
        {(() => {
          const joinUrl = `https://notify.useherald.xyz/join/${protocolId}`;

          const handleCopyLink = () => {
            navigator.clipboard.writeText(joinUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          };

          return (
            <div className="space-y-4">
              {/* URL bar */}
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card-2 px-4 py-2.5">
                <span className="flex-1 font-mono text-xs text-teal truncate select-all">{joinUrl}</span>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 shrink-0 text-[11px] font-semibold text-text-muted hover:text-foreground transition-colors"
                >
                  {copied ? (
                    <><Check className="h-3.5 w-3.5 text-teal" /><span className="text-teal">Copied!</span></>
                  ) : (
                    <><Copy className="h-3.5 w-3.5" />Copy</>
                  )}
                </button>
              </div>

              {/* How to use it */}
              <div className="grid gap-3 sm:grid-cols-3 text-center">
                {[
                  { step: "1", title: "Share the link", body: "Drop it in your docs, site, or Discord." },
                  { step: "2", title: "User connects & signs", body: "One wallet transaction. Email encrypted in-browser." },
                  { step: "3", title: "Herald routes alerts", body: "Sends on your behalf — plaintext never leaves the user's device." },
                ].map(({ step, title, body }) => (
                  <div key={step} className="rounded-lg border border-border bg-card-2 px-4 py-4 text-left">
                    <div className="mb-2 flex h-5 w-5 items-center justify-center rounded-full bg-teal/15 text-[10px] font-extrabold text-teal">
                      {step}
                    </div>
                    <p className="text-xs font-semibold text-foreground mb-0.5">{title}</p>
                    <p className="text-[11px] text-text-muted leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>

              {/* HTML button embed */}
              <details className="group">
                <summary className="cursor-pointer list-none text-[11px] font-semibold text-text-muted hover:text-foreground transition-colors flex items-center gap-1.5">
                  <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
                  Embed a button on your site
                </summary>
                <div className="mt-3 rounded-lg border border-border overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-card-2 border-b border-border">
                    <span className="text-[10px] font-mono text-text-muted">HTML · no dependencies</span>
                  </div>
                  <pre className="p-4 text-[11px] font-mono text-text-muted overflow-x-auto whitespace-pre leading-relaxed bg-[#0a1929]">{`<a
  href="https://notify.useherald.xyz/join/${protocolId}"
  target="_blank"
  rel="noopener noreferrer"
  style="display:inline-flex;align-items:center;gap:8px;background:#00C896;color:#000;font-weight:700;font-size:14px;padding:10px 20px;border-radius:8px;text-decoration:none;"
>
  🔔 Enable Notifications
</a>`}</pre>
                </div>
              </details>
            </div>
          );
        })()}
      </DashboardCard>
    </div>
  );
}

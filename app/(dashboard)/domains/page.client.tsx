"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { useApi } from "@/components/providers/QueryProvider";
import { toast } from "sonner";
import { CopyButton } from "@/components/shared/CopyButton";
import { useSession } from "next-auth/react";
import { Globe, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { RippleWaveLoader } from "@/components/ui/pulsating-loader";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { getBillingStatus } from "@/lib/api/billing";
import { TierGatePage } from "@/components/shared/TierGatePage";
import { SandboxLockedAction } from "@/components/shared/SandboxLockedAction";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

interface DnsRecord {
  type: string;
  name: string;
  value: string;
  record?: string;
  ttl?: string;
  status?: string;
}

interface Domain {
  id: string;
  domain: string;
  selector: string;
  dns_verified: boolean;
  ses_verified: boolean;
  resend_verified: boolean;
  registered: boolean;
  dnsRecordName?: string;
  dnsRecordValue?: string;
  ses_cname_records?: DnsRecord[] | null;
  resend_dns_records?: DnsRecord[] | null;
  created_at: string;
}

interface BimiConfig {
  bimi_enabled: boolean;
  logoUrl?: string;
  vmcUrl?: string;
  dns_record_name?: string;
  dns_record_value?: string;
}

interface RegisterResult {
  domain: string;
  ses: { success: boolean; cnameRecords: DnsRecord[] | null; error: string | null };
  resend: { success: boolean; records: DnsRecord[] | null; error: string | null };
}

interface DomainWithState extends Domain {
  showSetup: boolean;
  bimiData?: BimiConfig | null;
  bimiLoading?: boolean;
}

// ── BIMI Section ───────────────────────────────────────────────────────────────

function BimiSection({
  bimi,
  isLoading,
  onSave,
}: {
  bimi: BimiConfig | null;
  isLoading: boolean;
  onSave: (logoUrl: string) => void;
}) {
  const [logoUrl, setLogoUrl] = useState(bimi?.logoUrl ?? "");

  if (isLoading) {
    return (
      <div className="mt-4 p-3 rounded-lg border border-border bg-card animate-pulse text-xs text-text-muted">
        Loading BIMI config…
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-teal/20 bg-teal/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-teal">BIMI (Brand Indicators)</p>
        {bimi?.bimi_enabled && (
          <span className="text-[10px] px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-semibold uppercase tracking-wider">
            Active
          </span>
        )}
      </div>
      <p className="text-xs text-text-muted">
        Display your brand logo next to emails in Gmail and Yahoo Mail.
      </p>
      {bimi?.dns_record_name && (
        <div className="text-xs space-y-1">
          <p className="text-text-muted font-medium">DNS TXT record to publish:</p>
          <div className="flex items-center gap-2">
            <code className="bg-background px-2 py-1 rounded text-[10px] font-mono break-all flex-1">{bimi.dns_record_name}</code>
            <CopyButton text={bimi.dns_record_name ?? ""} size="sm" variant="ghost" className="shrink-0" />
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-background px-2 py-1 rounded text-[10px] font-mono break-all flex-1">{bimi.dns_record_value}</code>
            <CopyButton text={bimi.dns_record_value ?? ""} size="sm" variant="ghost" className="shrink-0" />
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://yourdomain.com/logo.svg"
          className="flex-1 text-xs"
        />
        <SandboxLockedAction>
          <Button size="sm" onClick={() => onSave(logoUrl)} disabled={!logoUrl}>
            Save
          </Button>
        </SandboxLockedAction>
      </div>
      <p className="text-[10px] text-text-dim">SVG format, max 32 KB, square, publicly accessible.</p>
    </div>
  );
}

// ── Provider Status Badge ──────────────────────────────────────────────────────

function ProviderBadge({ label, verified }: { label: string; verified: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border",
        verified
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          : "bg-border text-text-dim border-border"
      )}
    >
      {verified ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Circle className="w-2.5 h-2.5" />}
      {label}
    </span>
  );
}

// ── DNS Records Modal ──────────────────────────────────────────────────────────

function RegisterDnsModal({
  result,
  onClose,
}: {
  result: RegisterResult;
  onClose: () => void;
}) {
  const sesCnames = result.ses.cnameRecords ?? [];
  const resendRecords = result.resend.records ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl border-border max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-teal/10 border border-teal/20">
              <Globe className="w-5 h-5 text-teal" />
            </div>
            <div>
              <CardTitle>Add DNS Records — {result.domain}</CardTitle>
              <CardDescription className="mt-0.5">
                Add all of the following DNS records to your provider. Herald will route email through whichever provider is healthy.
              </CardDescription>
            </div>
          </div>

          {/* Provider registration status */}
          <div className="flex flex-wrap gap-2 mt-3">
            <ProviderBadge label="AWS SES" verified={result.ses.success} />
            <ProviderBadge label="Resend" verified={result.resend.success} />
          </div>

          {(result.ses.error || result.resend.error) && (
            <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 space-y-1">
              {result.ses.error && <p><span className="font-semibold">SES:</span> {result.ses.error}</p>}
              {result.resend.error && <p><span className="font-semibold">Resend:</span> {result.resend.error}</p>}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-5">

          {/* SES CNAME records */}
          {sesCnames.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">AWS SES — Easy DKIM</span>
                <span className="text-[10px] text-text-muted">({sesCnames.length} CNAME records)</span>
              </div>
              <p className="text-xs text-text-muted mb-3">Required for SES to sign and deliver your email.</p>
              <div className="space-y-2">
                {sesCnames.map((r, i) => (
                  <DnsRecordRow key={i} record={r} />
                ))}
              </div>
            </div>
          )}

          {/* Resend DNS records */}
          {resendRecords.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">Resend</span>
                <span className="text-[10px] text-text-muted">({resendRecords.length} records)</span>
              </div>
              <p className="text-xs text-text-muted mb-3">Required for Resend to send from your domain.</p>
              <div className="space-y-2">
                {resendRecords.map((r, i) => (
                  <DnsRecordRow key={i} record={r} label={r.record} />
                ))}
              </div>
            </div>
          )}

          {sesCnames.length === 0 && resendRecords.length === 0 && (
            <p className="text-sm text-text-muted text-center py-4">
              No DNS records were returned. Check the errors above and try again.
            </p>
          )}

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
            <span className="font-semibold">Note:</span> DNS propagation takes 5–72 hours. You can close this dialog — records are saved and available in your domain card.
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground">Quick reference by provider:</p>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-text-muted">
              {[
                ["Cloudflare", "DNS → Add record"],
                ["Vercel", "Settings → Domains → DNS Records"],
                ["GoDaddy", "DNS → Manage → Add Record"],
                ["Namecheap", "Advanced DNS → Add New Record"],
              ].map(([name, path]) => (
                <div key={name} className="bg-card rounded p-2">
                  <span className="font-semibold text-foreground">{name}:</span> {path}
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        <div className="sticky bottom-0 bg-background border-t border-border p-4">
          <Button onClick={onClose} className="w-full">Done — I've added the records</Button>
        </div>
      </Card>
    </div>
  );
}

function DnsRecordRow({ record, label }: { record: DnsRecord; label?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2 text-xs">
      <div className="flex items-center gap-2">
        {label && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted bg-border px-1.5 py-0.5 rounded">
            {label}
          </span>
        )}
        <span className="text-[10px] font-bold uppercase tracking-wider text-teal bg-teal/10 border border-teal/20 px-1.5 py-0.5 rounded">
          {record.type}
        </span>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-text-muted w-10 shrink-0 font-medium">Name</span>
          <code className="flex-1 font-mono text-[10px] bg-background px-2 py-1 rounded break-all">{record.name}</code>
          <CopyButton text={record.name} size="sm" variant="ghost" className="shrink-0" />
        </div>
        <div className="flex items-start gap-2">
          <span className="text-text-muted w-10 shrink-0 font-medium pt-1">Value</span>
          <code className="flex-1 font-mono text-[10px] bg-background px-2 py-1 rounded break-all">{record.value}</code>
          <CopyButton text={record.value} size="sm" variant="ghost" className="shrink-0" />
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function DomainsPage() {
  const { axios } = useApi();
  const { data: session, status } = useSession();

  const { data: billing } = useQuery({
    queryKey: ["billing-status"],
    queryFn: getBillingStatus,
    staleTime: 60_000,
  });

  const [domains, setDomains] = useState<DomainWithState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addedDomainDns, setAddedDomainDns] = useState<Domain | null>(null);
  const [registerResult, setRegisterResult] = useState<RegisterResult | null>(null);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [domainToDelete, setDomainToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDomains = async () => {
    if (!session?.accessToken) return;
    setIsLoading(true);
    try {
      const { data } = await axios.get("/domains");
      setDomains((data || []).map((d: Domain) => ({ ...d, showSetup: false })));
    } catch {
      toast.error("Failed to load domains");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true);
    } else if (status === "authenticated" && session?.accessToken) {
      loadDomains();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  const handleCreate = async () => {
    if (!newDomain) return;
    setIsCreating(true);
    try {
      const { data } = await axios.post("/domains", { domain: newDomain });
      if (data) {
        toast.success("Domain added. Add the DNS record below to verify ownership.");
        setShowAddModal(false);
        setNewDomain("");
        setAddedDomainDns(data);
        loadDomains();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add domain");
    } finally {
      setIsCreating(false);
    }
  };

  const handleVerify = async (domainId: string) => {
    try {
      const { data } = await axios.post(`/domains/${domainId}/verify`);
      if (data.dnsVerified) {
        toast.success("Domain DKIM record verified ✓");
      } else {
        toast.warning(data.message || "DNS record not found yet — wait for propagation and try again.");
      }
      loadDomains();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to verify domain");
    }
  };

  const handleRegister = async (domainId: string) => {
    setRegisteringId(domainId);
    try {
      const { data } = await axios.post(`/domains/${domainId}/register`);
      setRegisterResult(data);
      if (data.ses.success || data.resend.success) {
        toast.success(
          data.ses.success && data.resend.success
            ? "Domain registered with SES and Resend."
            : `Partial registration — ${data.ses.success ? "SES ✓" : "SES ✗"} ${data.resend.success ? "Resend ✓" : "Resend ✗"}`
        );
      } else {
        toast.error("Registration failed for both providers. Check the DNS modal for details.");
      }
      loadDomains();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to register domain");
    } finally {
      setRegisteringId(null);
    }
  };

  const handleShowSavedRecords = (domain: DomainWithState) => {
    // Re-open the DNS modal using persisted records from the domain record
    if (domain.ses_cname_records || domain.resend_dns_records) {
      setRegisterResult({
        domain: domain.domain,
        ses: { success: domain.ses_verified, cnameRecords: domain.ses_cname_records ?? null, error: null },
        resend: { success: domain.resend_verified, records: domain.resend_dns_records ?? null, error: null },
      });
    }
  };

  const handleLoadBimi = async (domainId: string) => {
    setDomains((prev) => prev.map((d) => d.id === domainId ? { ...d, bimiLoading: true } : d));
    try {
      const { data } = await axios.get(`/domains/${domainId}/bimi`);
      setDomains((prev) => prev.map((d) => d.id === domainId ? { ...d, bimiData: data, bimiLoading: false } : d));
    } catch {
      setDomains((prev) => prev.map((d) => d.id === domainId ? { ...d, bimiData: null, bimiLoading: false } : d));
    }
  };

  const handleSetBimi = async (domainId: string, logoUrl: string) => {
    try {
      await axios.post(`/domains/${domainId}/bimi`, { logoUrl });
      toast.success("BIMI logo saved. Add the DNS TXT record shown below.");
      handleLoadBimi(domainId);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save BIMI config");
    }
  };

  const confirmDelete = async () => {
    if (!domainToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`/domains/${domainToDelete}`);
      toast.success("Domain removed");
      loadDomains();
      setDomainToDelete(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to remove domain");
    } finally {
      setIsDeleting(false);
    }
  };

  if (billing && billing.tier < 1) {
    return (
      <TierGatePage
        feature="Custom Domains"
        description="Send emails from your own branded domain with custom DKIM signing and BIMI brand indicators."
        currentTierName={billing.tierName}
        requiredTier="Growth"
      />
    );
  }

  if (isLoading || status === "loading") {
    return <div className="flex items-center justify-center h-[400px]"><RippleWaveLoader /></div>;
  }

  if (status === "unauthenticated") {
    return <div className="flex items-center justify-center h-[400px]"><p className="text-text-muted">Please sign in to view your domains.</p></div>;
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email Domains</h1>
          <p className="text-sm text-text-muted mt-1">
            Custom sending domains with DKIM, SES, and Resend registration.
          </p>
        </div>
        <SandboxLockedAction>
          <Button onClick={() => setShowAddModal(true)} className="shrink-0">
            Add Domain
          </Button>
        </SandboxLockedAction>
      </div>

      {/* Domain list */}
      {domains.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <Globe className="w-12 h-12 text-text-dim" />
            <p className="text-text-muted">No custom domains yet.</p>
            <SandboxLockedAction>
              <Button onClick={() => setShowAddModal(true)}>Add Domain</Button>
            </SandboxLockedAction>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {domains.map((domain) => (
            <Card key={domain.id} className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base truncate">{domain.domain}</CardTitle>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <ProviderBadge label="DKIM" verified={domain.dns_verified} />
                      <ProviderBadge label="SES" verified={domain.ses_verified} />
                      <ProviderBadge label="Resend" verified={domain.resend_verified} />
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] px-2 py-1 rounded border shrink-0 font-semibold uppercase tracking-wider",
                    domain.dns_verified ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  )}>
                    {domain.dns_verified ? "✓ Verified" : "Pending DNS"}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">

                {/* DKIM TXT record (shown until verified) */}
                {!domain.dns_verified && (
                  <div className="rounded-lg border border-border bg-card-2 p-4 space-y-3">
                    <p className="text-xs font-semibold text-foreground">Step 1 — Add DKIM TXT record</p>
                    <p className="text-xs text-text-muted">Add this to your DNS to verify domain ownership.</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-text-muted w-10 shrink-0 font-medium">Host</span>
                        <code className="text-[10px] bg-background px-2 py-1.5 rounded flex-1 break-all font-mono">
                          {domain.selector}._domainkey.{domain.domain}
                        </code>
                        <CopyButton text={`${domain.selector}._domainkey.${domain.domain}`} size="sm" variant="ghost" className="shrink-0" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-text-muted w-10 shrink-0 font-medium">Type</span>
                        <span className="text-xs font-medium">TXT</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-text-muted w-10 shrink-0 font-medium">Value</span>
                        <code className="text-[10px] bg-background px-2 py-1.5 rounded flex-1 break-all font-mono max-h-20 overflow-y-auto">
                          {domain.dnsRecordValue ?? "—"}
                        </code>
                        <CopyButton text={domain.dnsRecordValue ?? ""} size="sm" variant="ghost" className="shrink-0" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2 — Register with providers */}
                {domain.dns_verified && !domain.registered && (
                  <div className="rounded-lg border border-teal/20 bg-teal/5 p-4 space-y-2">
                    <p className="text-xs font-semibold text-teal">Step 2 — Register with SES & Resend</p>
                    <p className="text-xs text-text-muted">
                      Register your domain with both email providers in one click. You&apos;ll receive the DNS records to add.
                    </p>
                  </div>
                )}

                {/* View saved provider records */}
                {domain.registered && (domain.ses_cname_records || domain.resend_dns_records) && (
                  <div className="rounded-lg border border-border bg-card-2 p-3 flex items-center justify-between gap-3">
                    <p className="text-xs text-text-muted">Provider DNS records saved.</p>
                    <Button variant="outline" size="xs" onClick={() => handleShowSavedRecords(domain)}>
                      View Records
                    </Button>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  <SandboxLockedAction>
                    <Button variant="outline" size="sm" onClick={() => handleVerify(domain.id)}>
                      Verify DNS
                    </Button>
                  </SandboxLockedAction>

                  <SandboxLockedAction>
                    <Button
                      variant={domain.registered ? "outline" : "default"}
                      size="sm"
                      disabled={!domain.dns_verified || registeringId === domain.id}
                      onClick={() => handleRegister(domain.id)}
                    >
                      {registeringId === domain.id ? (
                        <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> Registering…</>
                      ) : domain.registered ? (
                        "Re-register"
                      ) : (
                        "Register Domain"
                      )}
                    </Button>
                  </SandboxLockedAction>

                  {domain.dns_verified && (
                    <SandboxLockedAction>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleLoadBimi(domain.id);
                          setDomains((prev) => prev.map((d) => d.id === domain.id ? { ...d, bimiData: d.bimiData ?? undefined } : d));
                        }}
                      >
                        {domain.bimiLoading ? "Loading…" : "BIMI Config"}
                      </Button>
                    </SandboxLockedAction>
                  )}

                  <SandboxLockedAction>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDomainToDelete(domain.id)}
                    >
                      Remove
                    </Button>
                  </SandboxLockedAction>
                </div>

                {/* BIMI */}
                {domain.dns_verified && domain.bimiData !== undefined && (
                  <BimiSection
                    bimi={domain.bimiData ?? null}
                    isLoading={domain.bimiLoading ?? false}
                    onSave={(logoUrl) => handleSetBimi(domain.id, logoUrl)}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Domain modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md border-border">
            <CardHeader>
              <CardTitle>Add Custom Domain</CardTitle>
              <CardDescription>
                Enter your sending domain. Herald will generate a DKIM key and give you a DNS record to publish.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Domain</label>
                <Input
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="alerts.myprotocol.com"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>
              <div className="rounded-lg border border-border bg-card-2 p-3 text-xs text-text-muted space-y-1">
                <p className="font-medium text-foreground">What happens next:</p>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>You&apos;ll get a DNS TXT record to publish (DKIM verification)</li>
                  <li>Click Verify DNS once it&apos;s live</li>
                  <li>Click Register Domain — Herald registers with SES &amp; Resend in one go</li>
                  <li>Add the provider DNS records shown</li>
                </ol>
              </div>
            </CardContent>
            <div className="flex justify-end gap-3 p-4 border-t border-border">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <SandboxLockedAction>
                <Button isLoading={isCreating} onClick={handleCreate} disabled={!newDomain}>
                  Add Domain
                </Button>
              </SandboxLockedAction>
            </div>
          </Card>
        </div>
      )}

      {/* Post-add DKIM record modal */}
      {addedDomainDns && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg border-border max-h-[85vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal/10 border border-teal/20 rounded-xl flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-teal" />
                </div>
                <div>
                  <CardTitle>Domain Added — Verify Ownership</CardTitle>
                  <CardDescription>{addedDomainDns.domain}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-text-muted">
                Add this TXT record to your DNS provider, then click <strong>Verify DNS</strong> on the domain card.
              </p>
              <div className="rounded-lg border border-border bg-card-2 p-4 space-y-3">
                {[
                  { label: "Host", value: `${addedDomainDns.selector}._domainkey.${addedDomainDns.domain}` },
                  { label: "Type", value: "TXT" },
                  { label: "Value", value: addedDomainDns.dnsRecordValue ?? "" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start gap-2">
                    <span className="text-xs text-text-muted w-10 shrink-0 font-medium">{label}</span>
                    <code className="text-[10px] bg-background px-2 py-1.5 rounded flex-1 break-all font-mono">{value}</code>
                    {label !== "Type" && <CopyButton text={value} size="sm" variant="ghost" className="shrink-0" />}
                  </div>
                ))}
              </div>
              <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                DNS changes take 5–30 minutes to propagate. Some providers auto-append your root domain — if so, use just <code className="bg-background px-1 rounded">{addedDomainDns.selector}._domainkey</code> as the host.
              </p>
            </CardContent>
            <div className="sticky bottom-0 bg-background border-t border-border p-4">
              <Button onClick={() => setAddedDomainDns(null)} className="w-full">Got it</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Register result — combined DNS modal */}
      {registerResult && (
        <RegisterDnsModal
          result={registerResult}
          onClose={() => setRegisterResult(null)}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!domainToDelete}
        onClose={() => setDomainToDelete(null)}
        onConfirm={confirmDelete}
        title="Remove Domain"
        description="This will remove the domain from Herald, AWS SES, and Resend. Emails sent from this domain may fail until you reconfigure your sending setup."
        confirmText="Remove Domain"
        isLoading={isDeleting}
      />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { useApi } from "@/components/providers/QueryProvider";
import { toast } from "sonner";
import { CopyButton } from "@/components/shared/CopyButton";
import { useSession } from "next-auth/react";

interface Domain {
  id: string;
  domain: string;
  selector: string;
  dns_verified: boolean;
  dnsRecordName?: string;
  dnsRecordValue?: string;
  instructions?: string;
  created_at: string;
}

interface DomainWithConfig extends Domain {
  showConfig: boolean;
}

export default function DomainsPage() {
  const { axios } = useApi();
  const { data: session, status } = useSession();
  const [domains, setDomains] = useState<DomainWithConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [configModalData, setConfigModalData] = useState<Domain | null>(null);

  const loadDomains = async () => {
    if (!session?.accessToken) return;
    setIsLoading(true);
    try {
      const { data } = await axios.get("/domains");
      setDomains((data || []).map((d: Domain) => ({ ...d, showConfig: false })));
    } catch (error) {
      console.error("Failed to load domains:", error);
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
  }, [status, session]);

  const handleCreate = async () => {
    if (!newDomain) return;
    setIsCreating(true);
    try {
      const { data } = await axios.post("/domains", {
        domain: newDomain,
      });
      if (data) {
        toast.success("Domain added successfully");
        setShowAddModal(false);
        setNewDomain("");
        setConfigModalData(data);
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
      if (data.dns_verified) {
        toast.success("Domain verified successfully");
      } else {
        toast.warning("DNS records not found yet. Please check your DNS configuration.");
      }
      loadDomains();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to verify domain");
    }
  };

  const handleSesRegister = async (domainId: string) => {
    try {
      const { data } = await axios.post(`/domains/${domainId}/ses-register`);
      toast.success("Domain registered with SES");
      loadDomains();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to register with SES");
    }
  };

  const handleDelete = async (domainId: string) => {
    if (!confirm("Are you sure you want to remove this domain?")) return;
    try {
      await axios.delete(`/domains/${domainId}`);
      toast.success("Domain removed");
      loadDomains();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to remove domain");
    }
  };

  const toggleConfig = (domainId: string) => {
    setDomains(domains.map(d => 
      d.id === domainId ? { ...d, showConfig: !d.showConfig } : d
    ));
  };

  if (isLoading || status === "loading") {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <p className="text-text-muted mb-4">Please sign in to view your domains.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email Domains</h1>
          <p className="text-sm text-text-muted mt-1">
            Manage custom domains for sending emails with DKIM authentication.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="shrink-0">
          Add Domain
        </Button>
      </div>

      {domains.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <svg className="w-12 h-12 text-text-muted mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945a2 2 0 01-.865 1.175l-.837 1.477a1 125 1 125 0 00-.263 1.002 7 7 0 007.263 7.263l.837-1.477a2.002 2.002 0 011.175-.865H15a2 2 0 012 2v1a2 2 0 01-2 2 2 2 0 01-2-2v-1a2 2 0 00-2-2H5.055z" />
            </svg>
            <p className="text-text-muted mb-4">No custom domains yet. Add one to get started.</p>
            <Button onClick={() => setShowAddModal(true)}>
              Add Domain
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {domains.map((domain) => (
            <Card key={domain.id} className="border border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{domain.domain}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Selector: <code className="bg-muted px-1 rounded">{domain.selector}</code>
                    </CardDescription>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded shrink-0 ${
                    domain.dns_verified 
                      ? "bg-green-500/20 text-green-400" 
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {domain.dns_verified ? "Verified" : "Pending"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!domain.dns_verified && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-sm text-blue-300 font-medium mb-2">
                      DNS Configuration Required
                    </p>
                    <p className="text-xs text-blue-200/80 mb-3">
                      Add the following TXT record to your DNS provider to verify ownership.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-200/80 w-12 shrink-0">Host:</span>
                        <code className="text-xs bg-blue-500/20 px-2 py-1 rounded flex-1 break-all">
                          {domain.selector}._domainkey.{domain.domain}
                        </code>
                        <CopyButton 
                          text={`${domain.selector}._domainkey.${domain.domain}`}
                          size="sm"
                          variant="secondary"
                          className="shrink-0"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-200/80 w-12 shrink-0">Type:</span>
                        <span className="text-xs">TXT</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-200/80 w-12 shrink-0">Value:</span>
                        <code className="text-xs bg-blue-500/20 px-2 py-1 rounded flex-1 break-all max-h-20 overflow-y-auto">
                          v=DKIM1; k=rsa; p={domain.dnsRecordValue?.split('p=')[1] || '...'}
                        </code>
                        <CopyButton 
                          text={domain.instructions?.split('Value: ')[1] || domain.dnsRecordValue || ''}
                          size="sm"
                          variant="secondary"
                          className="shrink-0"
                        />
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => toggleConfig(domain.id)}
                    >
                      {domain.showConfig ? "Hide" : "View"} Full Instructions
                    </Button>
                  </div>
                )}

                {domain.showConfig && (
                  <div className="bg-muted rounded-lg p-4 text-xs">
                    <p className="font-medium mb-2">Configuration Instructions</p>
                    <ol className="space-y-2 text-text-muted">
                      <li>1. Log in to your DNS provider (Vercel, Render, Cloudflare, GoDaddy, Namecheap)</li>
                      <li>2. Navigate to DNS settings for your domain</li>
                      <li>3. Add a new TXT record:
                        <ul className="ml-4 mt-1 space-y-1">
                          <li><strong>Name/Host:</strong> <code className="bg-background px-1 rounded">{domain.selector}._domainkey.{domain.domain}</code></li>
                          <li><strong>Type:</strong> TXT</li>
                          <li><strong>Value:</strong> <code className="bg-background px-1 rounded break-all">{domain.instructions?.split('Value: ')[1] || domain.dnsRecordValue}</code></li>
                        </ul>
                      </li>
                      <li>4. Save the record and wait 5-30 minutes for propagation</li>
                      <li>5. Click &quot;Verify&quot; to check if the record is active</li>
                    </ol>
                    <div className="mt-3 p-2 bg-yellow-500/20 rounded border border-yellow-500/30">
                      <p className="text-yellow-300">
                        <strong>Tip:</strong> Some DNS providers (Vercel, Render) automatically append your root domain. If so, just enter <code className="bg-background px-1 rounded">{domain.selector}._domainkey</code> as the name.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleVerify(domain.id)}
                  >
                    Verify
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSesRegister(domain.id)}
                    disabled={!domain.dns_verified}
                  >
                    Register SES
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => handleDelete(domain.id)}
                  >
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md border border-border">
            <CardHeader>
              <CardTitle>Add Custom Domain</CardTitle>
              <CardDescription>
                Enter your domain to generate DKIM configuration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-secondary">Domain</label>
                <Input
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="e.g., alerts.myprotocol.com"
                />
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-xs text-blue-200">
                  After adding your domain, you&apos;ll receive step-by-step instructions on how to configure DNS TXT records to verify ownership.
                </p>
              </div>
            </CardContent>
            <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 border-t border-border">
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button
                isLoading={isCreating}
                onClick={handleCreate}
                disabled={!newDomain}
              >
                Add Domain
              </Button>
            </div>
          </Card>
        </div>
      )}

      {configModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg border border-border max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <CardTitle>Domain Added!</CardTitle>
                  <CardDescription>{configModalData.domain}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-text-muted">
                To complete setup, add the following DNS TXT record to your domain provider:
              </p>

              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-text-muted w-16 shrink-0">Host:</span>
                  <code className="bg-background px-2 py-1 rounded text-sm flex-1 break-all">
                    {configModalData.selector}._domainkey.{configModalData.domain}
                  </code>
                  <CopyButton text={`${configModalData.selector}._domainkey.${configModalData.domain}`} size="sm" variant="secondary" className="shrink-0" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-text-muted w-16 shrink-0">Type:</span>
                  <span className="font-medium">TXT</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-text-muted w-16 shrink-0">Value:</span>
                  <code className="bg-background px-2 py-1 rounded text-xs flex-1 break-all max-h-32 overflow-y-auto">
                    {configModalData.instructions?.split('Value: ')[1] || configModalData.dnsRecordValue}
                  </code>
                  <CopyButton text={configModalData.instructions?.split('Value: ')[1] || configModalData.dnsRecordValue || ''} size="sm" variant="secondary" className="shrink-0" />
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-xs text-yellow-300">
                  <strong>Important:</strong> DNS changes may take 5-30 minutes to propagate. Click &quot;Verify&quot; on the domain card after adding the record.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Quick Reference for Popular Providers:</p>
                <div className="grid gap-2 text-xs text-text-muted">
                  <div className="bg-muted rounded p-2">
                    <strong>Vercel:</strong> Settings → Domains → Select domain → DNS Records → Add TXT
                  </div>
                  <div className="bg-muted rounded p-2">
                    <strong>Render:</strong> Domains → Your domain → Configure DNS → Add Record → TXT
                  </div>
                  <div className="bg-muted rounded p-2">
                    <strong>Cloudflare:</strong> DNS → Records → Add record → Type: TXT
                  </div>
                  <div className="bg-muted rounded p-2">
                    <strong>GoDaddy:</strong> DNS → Manage → Add → Type: TXT
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="sticky bottom-0 bg-background border-t border-border p-4">
              <Button onClick={() => setConfigModalData(null)} className="w-full">
                Got it!
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
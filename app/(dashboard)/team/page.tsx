"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { TeamMemberDto } from "@/types/api";
import { formatDistanceToNow } from "date-fns";
import { Modal } from "@/components/ui/Modal";
import { useRouter } from "next/navigation";
import { FiUsers, FiMail, FiTrash2, FiUserPlus, FiClock, FiShield } from "react-icons/fi";
import { RippleWaveLoader } from "@/components/ui/pulsating-loader";
import { cn } from "@/lib/utils";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { listTeam, inviteMember, removeMember, updateMemberRole } from "@/lib/api/team";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export default function TeamPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamMemberDto["role"]>("developer");

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["team"],
    queryFn: listTeam,
  });


  const inviteMutation = useMutation({
    mutationFn: inviteMember,
    onSuccess: (data) => {
      setIsInviteOpen(false);
      setInviteEmail("");
      queryClient.invalidateQueries({ queryKey: ["team"] });
      // Show token directly if no email transport yet
      toast.success(`Invite created! Token: ${data.inviteToken}`, { duration: 10000 });
    },
    onError: (err: any) => {
      const data = err?.data || err?.response?.data;
      if (data?.error === "TEAM_MEMBER_LIMIT") {
        toast.error("Team member limit reached", {
          description: data.message || "Upgrade to add more members.",
          action: {
            label: "Upgrade Plan",
            onClick: () => router.push("/billing"),
          },
        });
      } else {
        toast.error(err?.message || data?.message || "Failed to invite member");
      }
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeMember,
    onSuccess: () => {
      toast.success("Member removed");
      queryClient.invalidateQueries({ queryKey: ["team"] });
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    // Note: team endpoint takes 'admin' | 'developer' | 'read_only'
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole as any });
  };

  const handleRemove = (id: string) => {
    if (confirm("Are you sure you want to remove this member?")) {
      removeMutation.mutate(id);
    }
  };

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => updateMemberRole(id, role),
    onSuccess: () => {
      toast.success("Role updated successfully");
      queryClient.invalidateQueries({ queryKey: ["team"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update role");
    },
  });

  const handleRoleChange = (id: string, newRole: string) => {
    updateRoleMutation.mutate({ id, role: newRole });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 animate-in fade-in duration-700">
        <RippleWaveLoader />
        <div className="flex flex-col items-center gap-1">
          <h3 className="text-lg font-semibold text-foreground tracking-tight">Syncing Team Data</h3>
          <p className="text-sm text-text-muted">Retrieving permissions and member status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-teal font-bold text-xs uppercase tracking-[0.2em] mb-1">
            <FiUsers className="w-4 h-4" />
            <span>Organization</span>
          </div>
          <h1 className="text-lg font-extrabold tracking-tight text-foreground sm:text-xl" style={{ fontFamily: 'var(--font-heading)' }}>
            Team Management
          </h1>
          <p className="text-sm text-text-muted max-w-2xl">
            Control access levels and manage permissions for your Herald protocol infrastructure.
          </p>
        </div>
        <Button
          onClick={() => setIsInviteOpen(true)}
          className="gap-2 h-12 px-6 rounded-xl shadow-lg shadow-teal/20 hover:shadow-teal/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <FiUserPlus className="h-4 w-4" />
          <span>Invite New Member</span>
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead>
              <tr className="bg-card-2/30 text-[10px] uppercase tracking-[0.15em] text-text-muted border-b border-border">
                <th className="px-8 py-5 font-bold">Teammate Details</th>
                <th className="px-6 py-5 font-bold">Access Role</th>
                <th className="px-6 py-5 font-bold">Account Status</th>
                <th className="px-6 py-5 font-bold">Last Activity</th>
                <th className="px-8 py-5 font-bold text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {members.map((m) => (
                <tr
                  key={m.id}
                  className="hover:bg-card-2/40 transition-colors group/row"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-linear-to-br from-teal/20 to-teal/5 text-teal flex items-center justify-center font-bold text-sm border border-teal/10 shadow-sm">
                        {m.email ? m.email.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-foreground font-semibold truncate max-w-[200px]">
                          {m.email || "No email"}
                        </span>
                        {m.walletPubkey && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-text-dim font-mono bg-navy px-1.5 py-0.5 rounded border border-border/50">
                              {m.walletPubkey.slice(0, 8)}...{m.walletPubkey.slice(-6)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {m.role === "owner" ? (
                      <div className="flex items-center gap-2 text-text-muted">
                        <FiShield className="w-3.5 h-3.5" />
                        <span className="capitalize text-xs font-medium">Owner</span>
                      </div>
                    ) : (
                      <Select
                        value={m.role}
                        onValueChange={(val) => handleRoleChange(m.id, val)}
                        disabled={updateRoleMutation.isPending}
                      >
                        <SelectTrigger size="sm" className="w-[130px] h-9 capitalize bg-background/50 border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-navy border-border">
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="developer">Developer</SelectItem>
                          <SelectItem value="read_only">Read Only</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <Badge
                      variant={m.status === "active" ? "secondary" : "default"}
                      className={cn(
                        "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        m.status === "active" ? "bg-teal/10 text-teal border-teal/20" : "bg-text-muted/10 text-text-muted border-text-muted/20"
                      )}
                    >
                      {m.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-text-muted">
                      <FiClock className="w-3.5 h-3.5" />
                      <span className="text-xs">
                        {m.lastLoginAt
                          ? formatDistanceToNow(new Date(m.lastLoginAt), {
                              addSuffix: true,
                            })
                          : "Never"}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    {m.role !== "owner" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={removeMutation.isPending}
                        onClick={() => handleRemove(m.id)}
                        className="text-red hover:bg-red/10 hover:text-red opacity-0 group-hover/row:opacity-100 transition-all h-9 w-9 p-0 rounded-lg border border-transparent hover:border-red/20"
                        title="Remove member"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Team Member"
      >
        <form onSubmit={handleInvite} className="flex flex-col gap-6 mt-3 rounded-2xl">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">
              Email Address
            </label>
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@example.com"
              autoFocus
              required
              className="w-full mt-2"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">
              Role Assignment
            </label>
            <Select
              value={inviteRole}
              onValueChange={(val) => setInviteRole(val as any)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin (Full Access)</SelectItem>
                <SelectItem value="developer">
                  Developer (API Keys & Logs only)
                </SelectItem>
                <SelectItem value="read_only">Read Only (Analytics only)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsInviteOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={!inviteEmail || inviteMutation.isPending} isLoading={inviteMutation.isPending}>
              Send Invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

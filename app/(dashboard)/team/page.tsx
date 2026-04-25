"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { TeamMemberDto } from "@/types/api";
import { formatDistanceToNow } from "date-fns";
import { Modal } from "@/components/ui/Modal";
import { useRouter } from "next/navigation";

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
    return <div className="text-text-muted">Loading team members…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Team Members
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage who has access to your Herald protocol dashboard and their
            permissions.
          </p>
        </div>
        <Button
          onClick={() => setIsInviteOpen(true)}
          className="gap-2 shrink-0"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
          Invite Member
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-left text-sm text-text-secondary min-w-[700px]">
          <thead className="bg-card-2 text-xs uppercase tracking-widest text-text-muted border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold">Teammate</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Last Login</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((m) => (
              <tr
                key={m.id}
                className="hover:bg-card-2/50 transition-colors group"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-teal/20 text-teal flex items-center justify-center font-bold text-xs">
                      {m.email ? m.email.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{m.email || "No email"}</span>
                      {m.walletPubkey && <span className="text-xs text-text-dim font-mono">{m.walletPubkey.slice(0, 8)}...</span>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {m.role === "owner" ? (
                    <span className="capitalize text-text-muted">Owner</span>
                  ) : (
                    <Select
                      value={m.role}
                      onValueChange={(val) => handleRoleChange(m.id, val)}
                      disabled={updateRoleMutation.isPending}
                    >
                      <SelectTrigger size="sm" className="w-[120px] capitalize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="read_only">Read Only</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    variant={m.status === "active" ? "secondary" : "outline"}
                  >
                    {m.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-text-muted">
                  {m.lastLoginAt
                    ? formatDistanceToNow(new Date(m.lastLoginAt), {
                        addSuffix: true,
                      })
                    : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {m.role !== "owner" && (
                    <Button
                      variant="ghost"
                      disabled={removeMutation.isPending}
                      onClick={() => handleRemove(m.id)}
                      className="text-red hover:bg-red/10 hover:text-red opacity-0 group-hover:opacity-100 transition-opacity h-8 px-3 text-xs"
                    >
                      Remove
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

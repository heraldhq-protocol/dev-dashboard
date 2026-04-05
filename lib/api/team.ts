import { apiClient } from "@/lib/api-client";
import type {
  TeamMemberDto,
  InviteMemberDto,
  AcceptInviteDto,
} from "@/types/api";

const BASE = "/team";

export async function listTeam(): Promise<TeamMemberDto[]> {
  const { data } = await apiClient.get<TeamMemberDto[]>(BASE);
  return data;
}

export async function inviteMember(
  dto: InviteMemberDto
): Promise<{ memberId: string; inviteToken: string; expiresAt: string | null }> {
  const { data } = await apiClient.post(`${BASE}/invite`, dto);
  return data;
}

export async function acceptInvite(dto: AcceptInviteDto): Promise<{
  memberId: string;
  protocolId: string;
  role: string;
}> {
  const { data } = await apiClient.post(`${BASE}/accept`, dto);
  return data;
}

export async function updateMemberRole(
  memberId: string,
  role: string
): Promise<{ memberId: string; newRole: string }> {
  const { data } = await apiClient.patch(`${BASE}/${memberId}/role`, { role });
  return data;
}

export async function removeMember(memberId: string): Promise<void> {
  await apiClient.delete(`${BASE}/${memberId}`);
}

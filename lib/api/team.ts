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

export interface AuditLogActor {
  id: string;
  role: string;
  walletPubkey: string | null;
  emailHash: string | null;
}

export interface AuditLogItem {
  id: string;
  actorId: string | null;
  actorRole: string | null;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  oldValue: unknown;
  newValue: unknown;
  ipHash: string | null;
  userAgent: string | null;
  timestamp: string;
  actor?: AuditLogActor | null;
}

export interface AuditLogPage {
  items: AuditLogItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  actorId?: string;
  action?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
}

export async function getAuditLog(filters: AuditLogFilters = {}): Promise<AuditLogPage> {
  const params: Record<string, string> = {
    page: String(filters.page ?? 1),
    limit: String(filters.limit ?? 50),
  };
  if (filters.actorId) params.actorId = filters.actorId;
  if (filters.action) params.action = filters.action;
  if (filters.resourceType) params.resourceType = filters.resourceType;
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  const { data } = await apiClient.get<AuditLogPage>(`${BASE}/audit-log`, { params });
  return data;
}

export async function exportAuditLog(): Promise<void> {
  const response = await apiClient.get(`${BASE}/audit-log/export`, { responseType: "blob" });
  const url = URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "audit-log.csv";
  a.click();
  URL.revokeObjectURL(url);
}

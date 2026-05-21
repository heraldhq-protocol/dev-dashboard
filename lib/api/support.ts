import { apiClient } from "../api-client";

export type SupportTicketCategory =
  | "api_issue"
  | "delivery_failure"
  | "billing"
  | "verification"
  | "account"
  | "abuse_report"
  | "feature_request"
  | "other";

export type SupportTicketStatus =
  | "open"
  | "in_progress"
  | "waiting_on_protocol"
  | "resolved"
  | "closed";

export interface SupportTicket {
  id: string;
  category: SupportTicketCategory;
  subject: string;
  status: SupportTicketStatus;
  priority: string;
  linearIssueUrl: string | null;
  resolvedAt: string | null;
  resolutionNote: string | null;
  createdAt: string;
  updatedAt: string;
  messages: SupportTicketMessage[];
}

export interface SupportTicketMessage {
  id: string;
  senderType: "protocol" | "herald_team";
  body: string;
  isInternal: boolean;
  createdAt: string;
}

export interface CreateTicketPayload {
  category: SupportTicketCategory;
  subject: string;
  body: string;
  priority?: string;
  affectedApiKeyId?: string;
  affectedNotifId?: string;
}

export async function createTicket(payload: CreateTicketPayload): Promise<SupportTicket> {
  const { data } = await apiClient.post<SupportTicket>("/support/tickets", payload);
  return data;
}

export async function listTickets(params?: {
  status?: SupportTicketStatus;
  limit?: number;
  offset?: number;
}): Promise<{ items: SupportTicket[]; total: number }> {
  const { data } = await apiClient.get<{ items: SupportTicket[]; total: number }>(
    "/support/tickets",
    { params }
  );
  return data;
}

export async function getTicket(id: string): Promise<SupportTicket> {
  const { data } = await apiClient.get<SupportTicket>(`/support/tickets/${id}`);
  return data;
}

export async function replyToTicket(id: string, body: string): Promise<void> {
  await apiClient.post(`/support/tickets/${id}/reply`, { body });
}

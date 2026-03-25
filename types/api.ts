export interface ProtocolProfileDto {
  id: string;
  name: string;
  websiteUrl: string | null;
  logoUrl: string | null;
  fromName: string | null;
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  environment: "sandbox" | "live";
  lastUsedAt: string | null;
  createdAt: string;
}

export interface NotificationDto {
  id: string;
  walletAddress: string;
  category: "defi" | "governance" | "system" | "marketing";
  status: "delivered" | "failed" | "queued" | "processing";
  subject: string;
  sentAt: string;
  receiptTxHash?: string;
}

export interface WebhookDto {
  id: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
  createdAt: string;
}

export interface TeamMemberDto {
  id: string;
  email: string;
  role: "owner" | "admin" | "developer" | "read_only";
  status: "active" | "invited";
  lastLoginAt: string | null;
}

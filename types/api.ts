// ──────────────────────────────────────────────────────────────────────────────
// types/api.ts  —  Full type-safe API shapes for the Herald Admin API
// ──────────────────────────────────────────────────────────────────────────────

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
}

// ── Protocol ─────────────────────────────────────────────────────────────────

export interface ProtocolProfileDto {
  id: string;
  name: string;
  websiteUrl: string | null;
  logoUrl: string | null;
  fromName: string | null;
  // Extended fields from backend
  protocolId?: string;
  protocolPubkey?: string;
  protocolName?: string;
  tier?: number;
  tierName?: string;
  isActive?: boolean;
  website?: string;
  customFromName?: string;
  notificationCategories?: string[];
  createdAt?: string;
  sendsThisPeriod?: number;
}

export interface UpdateProtocolDto {
  protocolName?: string;
  website?: string;
  logoUrl?: string;
  customFromName?: string;
  notificationCategories?: string[];
}

export interface RegisterProtocolDto {
  walletPubkey: string;
  signature: string;
  message: string;
  protocolName: string;
  website?: string;
  adminEmail: string;
}

export interface RegisterProtocolResponse {
  protocolId: string;
  programTxSignature?: string;
  apiKey: string;
  apiKeyPrefix: string;
  dashboardUrl: string;
}

export interface ProtocolStatusDto {
  protocolId: string;
  tier: number;
  tierName: string;
  isActive: boolean;
  isSuspended: boolean;
  subscriptionStatus: string;
  subscriptionExpiry: string | null;
  sendsUsed: number;
  sendsLimit: number;
  programId?: string;
}

// ── API Keys ──────────────────────────────────────────────────────────────────

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  environment: "sandbox" | "live";
  lastUsedAt: string | null;
  createdAt: string;
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface NotificationDto {
  id: string;
  protocolId: string;
  walletHash: string;
  category: "defi" | "governance" | "system" | "marketing";
  status: "delivered" | "failed" | "queued" | "processing";
  subjectHash: string;
  queuedAt: string;
  deliveredAt: string | null;
  receiptTx: string | undefined;
}

// ── Webhooks ──────────────────────────────────────────────────────────────────

export interface WebhookDto {
  id: string;
  url: string;
  secret?: string; // returned ONCE on creation
  secretPrefix: string | null;
  events: string[];
  isActive: boolean;
  failureCount: number;
  lastSuccessAt: string | null;
  createdAt: string;
}

export interface CreateWebhookDto {
  url: string;
  events: string[];
  description?: string;
}

export interface UpdateWebhookDto {
  url?: string;
  events?: string[];
  isActive?: boolean;
}

export interface WebhookDelivery {
  id: string;
  event: string;
  httpStatus: number | null;
  latencyMs: number | null;
  attempt: number;
  success: boolean;
  error: string | null;
  attemptedAt: string;
}

// ── Team ──────────────────────────────────────────────────────────────────────

export interface TeamMemberDto {
  id: string;
  email?: string; // decrypted on frontend display; backend sends walletPubkey
  walletPubkey?: string | null;
  role: "owner" | "admin" | "developer" | "read_only";
  status: "active" | "invited";
  lastLoginAt: string | null;
  createdAt?: string;
}

export interface InviteMemberDto {
  email: string;
  role: "admin" | "developer" | "read_only";
}

export interface AcceptInviteDto {
  inviteToken: string;
  walletPubkey?: string;
}

// ── Billing ───────────────────────────────────────────────────────────────────

export interface BillingPlanDto {
  tier: 0 | 1 | 2 | 3;
  name: string;
  monthlyPrice: number;
  sendLimit: number;
  currentUsage: number;
  nextBillingDate: string;
}

export interface BillingStatusDto {
  protocolId: string;
  protocolPubkey: string;
  tier: number;
  tierName: string;
  isActive: boolean;
  status: string; // 'active' | 'inactive' | 'cancelled'
  expiresAt: string | null;
  daysRemaining: number;
  sendsThisPeriod: number;
  sendsLimit: number;
  usagePercent: number;
  periodResetAt: string;
  cancelAtPeriodEnd: boolean;
}

export interface PaymentDto {
  id: string;
  amountUsdc: number;
  tokenSymbol: string;
  paymentSource: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  createdAt: string;
}

export interface UsageStatsDto {
  sendsThisPeriod: number;
  sendsLimit: number;
  sendsRemaining: number;
  usagePercent: number;
  periodResetAt: string;
}

export interface TierInfo {
  tier: number;
  name: string;
  priceUsdc: number;
  limit: number;
}

export interface TestSendDto {
  walletAddress: string;
  subject: string;
  body: string;
  category: "defi" | "governance" | "system" | "marketing";
  previewOnly?: boolean;
}

export interface TestSendResult {
  notificationId: string;
  status: "sent" | "previewed" | "failed";
  renderedHtml?: string;
  error?: string;
}

export interface PaginatedNotifications {
  items: NotificationDto[];
  total: number;
  page: number;
  limit: number;
}



import "next-auth";

declare module "next-auth" {
  interface User {
    walletAddress?: string;
    protocolId: string | null;
    role: "owner" | "admin" | "developer" | "read_only" | null;
    tier: number;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
  }

  interface Session {
    accessToken: string;
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    walletAddress?: string;
    protocolId?: string | null;
    role?: "owner" | "admin" | "developer" | "read_only" | null;
    tier?: number;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}
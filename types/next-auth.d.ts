import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    protocolId: string;
    role: "owner" | "admin" | "developer" | "read_only";
    tier: number;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
  }

  interface Session {
    user: User & DefaultSession["user"];
    accessToken: string;
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    protocolId: string;
    role: "owner" | "admin" | "developer" | "read_only";
    tier: number;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    error?: string;
  }
}

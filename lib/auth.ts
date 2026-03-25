import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";

const ADMIN_API_URL = process.env.NEXT_PUBLIC_HERALD_ADMIN_API_URL || "https://admin-api.herald.xyz";

async function refreshAccessToken(token: JWT) {
  // MOCKED FOR UI DEVELOPMENT
  return {
    ...token,
    accessToken: "mock_jwt_token_for_ui_dev",
    accessTokenExpires: Date.now() + 86400 * 1000,
    refreshToken: token.refreshToken,
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "wallet",
      name: "Wallet",
      credentials: {
        wallet: { label: "Wallet Address", type: "text" },
        signature: { label: "Signature", type: "text" },
        message: { label: "Message", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.wallet || !credentials?.signature || !credentials?.message) return null;
        
        // MOCKED FOR UI DEVELOPMENT
        return {
          id: credentials.wallet,
          protocolId: "proto_mock123",
          role: "admin",
          tier: 2,
          accessToken: "mock_jwt_token_for_ui_dev",
          refreshToken: "mock_refresh_token",
          accessTokenExpires: Date.now() + 86400 * 1000,
        };
      },
    }),
    CredentialsProvider({
      id: "email",
      name: "Email and TOTP",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totp: { label: "TOTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        // MOCKED FOR UI DEVELOPMENT
        return {
          id: credentials.email,
          protocolId: "proto_mock123",
          role: "admin",
          tier: 2,
          accessToken: "mock_jwt_token_for_ui_dev",
          refreshToken: "mock_refresh_token",
          accessTokenExpires: Date.now() + 86400 * 1000,
        };
      },
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        return {
          ...token,
          id: user.id,
          protocolId: user.protocolId,
          role: user.role,
          tier: user.tier,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.protocolId = token.protocolId as string;
        session.user.role = token.role;
        session.user.tier = token.tier as number;
        session.accessToken = token.accessToken as string;
        session.error = token.error as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

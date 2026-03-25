import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";

const ADMIN_API_URL = process.env.NEXT_PUBLIC_HERALD_ADMIN_API_URL || "https://admin-api.herald.xyz";

async function refreshAccessToken(token: JWT) {
  try {
    const res = await fetch(`${ADMIN_API_URL}/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });

    const refreshedTokens = await res.json();

    if (!res.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.accessToken,
      accessTokenExpires: Date.now() + (refreshedTokens.expiresIn || 3600) * 1000,
      refreshToken: refreshedTokens.refreshToken ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
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
        
        try {
          const res = await fetch(`${ADMIN_API_URL}/v1/auth/wallet-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              wallet: credentials.wallet,
              signature: credentials.signature,
              message: credentials.message,
            }),
          });

          const data = await res.json();

          if (res.ok && data.accessToken) {
            return {
              id: credentials.wallet,
              protocolId: data.protocolId,
              role: data.role,
              tier: data.tier,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              // Token expiry defaults to 1h
              accessTokenExpires: Date.now() + (data.expiresIn || 3600) * 1000,
            };
          }
        } catch (error) {
          console.error("Wallet login error:", error);
        }
        return null;
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
        
        try {
          const res = await fetch(`${ADMIN_API_URL}/v1/auth/email-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              totp: credentials.totp,
            }),
          });

          const data = await res.json();

          if (res.ok && data.accessToken) {
            return {
              id: credentials.email,
              protocolId: data.protocolId,
              role: data.role,
              tier: data.tier,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              accessTokenExpires: Date.now() + (data.expiresIn || 3600) * 1000,
            };
          }
        } catch (error) {
          console.error("Email login error:", error);
        }
        return null;
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

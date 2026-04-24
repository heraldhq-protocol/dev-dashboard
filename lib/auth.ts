import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";

const ADMIN_API_URL =
  process.env.NEXT_PUBLIC_HERALD_ADMIN_API_URL ||
  "http://localhost:3001/v1";

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    if (!token.refreshToken) {
      return { ...token, error: "NoRefreshTokenError" };
    }

    const res = await fetch(`${ADMIN_API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });

    if (!res.ok) {
      return { ...token, error: "RefreshAccessTokenError" };
    }

    const data = await res.json();
    return {
      ...token,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? token.refreshToken,
      accessTokenExpires: Date.now() + 14 * 60 * 1000, // 14 min (access token = 15 min)
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    // ── Wallet sign-in ────────────────────────────────────────────────
    CredentialsProvider({
      id: "wallet",
      name: "Wallet",
      credentials: {
        wallet: { label: "Wallet Address", type: "text" },
        signature: { label: "Signature", type: "text" },
        message: { label: "Message", type: "text" },
      },
      async authorize(credentials) {
        if (
          !credentials?.wallet ||
          !credentials?.signature ||
          !credentials?.message
        ) {
          return null;
        }

        try {
          const res = await fetch(`${ADMIN_API_URL}/auth/wallet-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              walletPubkey: credentials.wallet,
              signature: credentials.signature,
              message: credentials.message,
            }),
          });

          if (!res.ok) {
            const errorText = await res.text();
            console.error("[AUTH] Backend error:", res.status, errorText);
            return null;
          }

          const data = await res.json();

          // Decode the access token to get protocolId + role safely
          const base64Url = data.accessToken.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const payload = JSON.parse(Buffer.from(base64, "base64").toString());

          return {
            id: payload.sub,
            protocolId: payload.protocolId ?? null,
            role: payload.role ?? null,
            tier: 0,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken ?? "",
            accessTokenExpires: Date.now() + 14 * 60 * 1000,
          };
        } catch (err) {
          console.error("[AUTH] authorize() error:", err);
          return null;
        }
      },
    }),

  ],

  callbacks: {
    async jwt({ token, user }) {
      // Initial sign-in
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

      // Token still valid
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Token expired — refresh (only if we have a refresh token)
      if (token.refreshToken) {
        return refreshAccessToken(token);
      }

      return { ...token, error: "NoRefreshTokenError" };
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.protocolId = token.protocolId as string | null;
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

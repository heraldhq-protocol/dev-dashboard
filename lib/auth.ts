import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
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
      accessTokenExpires: Date.now() + 14 * 60 * 1000,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
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
          console.error("[AUTH] Missing wallet-login credentials:", {
            hasWallet: !!credentials?.wallet,
            hasSignature: !!credentials?.signature,
            hasMessage: !!credentials?.message,
          });
          return null;
        }

        try {
          console.log("[AUTH] wallet-login →", `${ADMIN_API_URL}/auth/wallet-login`, {
            wallet: credentials.wallet,
          });
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

          const base64Url = data.accessToken.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const payload = JSON.parse(Buffer.from(base64, "base64").toString());

          return {
            id: payload.sub,
            walletAddress: credentials.wallet as string,
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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          walletAddress: user.walletAddress,
          protocolId: user.protocolId,
          role: user.role,
          tier: user.tier,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
        };
      }

      // Allow the client to sync a freshly-created/known protocolId into the JWT
      // (e.g. after registration, or when an older token predates the protocol).
      // Without this, proxy.ts bounces the user between /onboarding and /overview.
      if (trigger === "update" && session && typeof session === "object") {
        const data = session as { protocolId?: string | null };
        if (data.protocolId) {
          token.protocolId = data.protocolId;
        }
      }

      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      if (token.refreshToken) {
        return refreshAccessToken(token);
      }

      return { ...token, error: "NoRefreshTokenError" };
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.walletAddress = token.walletAddress as string | undefined;
        session.user.protocolId = token.protocolId as string | null;
        session.user.role = token.role as "owner" | "admin" | "developer" | "read_only" | null;
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
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
});

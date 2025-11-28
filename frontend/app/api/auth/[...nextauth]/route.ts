import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8080/api";

export const authOptions = {
  session: { strategy: "jwt" as const },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const res = await fetch(`${BACKEND_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: credentials.email, password: credentials.password }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        const meRes = await fetch(`${BACKEND_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${data.accessToken}` },
        });
        const me = meRes.ok ? await meRes.json() : {};
        // Persist access token for WS connect (STOMP hook reads it)
        try { localStorage.setItem("accessToken", data.accessToken); } catch {}
        try { localStorage.setItem("refreshToken", data.refreshToken); } catch {}
        return {
          id: me.id?.toString() || credentials.email,
          name: me.username || credentials.email,
          email: me.email || credentials.email,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.expiresIn = user.expiresIn;
        token.accessTokenIssuedAt = Date.now();
      }
      // Auto-refresh if nearing expiry (within 60s)
      const issuedAt: number = token.accessTokenIssuedAt || 0;
      const ttl: number = token.expiresIn || 0;
      const expAt = issuedAt + ttl;
      if (Date.now() > expAt - 60000 && token.refreshToken) {
        try {
          const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: token.refreshToken }),
          });
          if (res.ok) {
            const data = await res.json();
            token.accessToken = data.accessToken;
            token.refreshToken = data.refreshToken || token.refreshToken;
            token.expiresIn = data.expiresIn;
            token.accessTokenIssuedAt = Date.now();
            try { localStorage.setItem("accessToken", data.accessToken); } catch {}
            try { if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken); } catch {}
          }
        } catch {}
      }
      return token;
    },
    async session({ session, token }: any) {
      (session as any).accessToken = token.accessToken;
      (session as any).refreshToken = token.refreshToken;
      return session;
    },
  },
};

const handler = NextAuth(authOptions as any);
export { handler as GET, handler as POST };

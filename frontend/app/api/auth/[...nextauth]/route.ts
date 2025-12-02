import NextAuth, { NextAuthOptions, Session, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";

interface AuthUser extends User {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

interface AuthSession extends Session {
  accessToken?: string;
  refreshToken?: string;
}

interface AuthToken extends JWT {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  accessTokenIssuedAt?: number;
}

interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

interface UserData {
  id?: number | string;
  username?: string;
  email?: string;
  roles?: string[];
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8080/api";

function safeJson<T = any>(input: Response | string | null): T | null {
  try {
    if (!input) {
      return null;
    }
    if (typeof input === "string") {
      return JSON.parse(input) as T;
    }
    const ct = input.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return null;
    }
    // @ts-ignore - we'll coerce to T
    return input.json();
  } catch {
    return null;
  }
}

const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" as const },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        let data: TokenResponse | null = null;
        try {
          const res = await fetch(`${BACKEND_URL}/auth/signin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          });
          if (!res.ok) {
            return null;
          }
          // Prefer JSON but guard against non-JSON error bodies
          data = (await safeJson<TokenResponse>(res)) as any;
          if (!data || !data.accessToken) {
            return null;
          }
        } catch {
          return null;
        }

        let me: UserData = {};
        try {
          const r = await fetch(`${BACKEND_URL}/users/me`, {
            headers: { Authorization: `Bearer ${data.accessToken}` },
          });
          me = (await safeJson<UserData>(r)) || {};
        } catch {
          me = {};
        }

        try {
          localStorage.setItem("accessToken", data.accessToken);
        } catch {}
        try {
          localStorage.setItem("refreshToken", data.refreshToken || "");
        } catch {}

        return {
          id: me.id?.toString() || credentials.email,
          name: me.username || credentials.email,
          email: me.email || credentials.email,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
        } as AuthUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const authToken = token as AuthToken;

      if (user) {
        const authUser = user as AuthUser;
        authToken.accessToken = authUser.accessToken;
        authToken.refreshToken = authUser.refreshToken;
        authToken.expiresIn = authUser.expiresIn;
        authToken.accessTokenIssuedAt = Date.now();
      }

      // Auto-refresh if nearing expiry (within 60s)
      const issuedAt: number = authToken.accessTokenIssuedAt || 0;
      const ttl: number = authToken.expiresIn || 0;
      const expAt = issuedAt + ttl;

      if (Date.now() > expAt - 60000 && authToken.refreshToken) {
        try {
          const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: authToken.refreshToken }),
          });
          if (res.ok) {
            const data = (await safeJson<TokenResponse>(res)) || null;
            if (data && data.accessToken) {
              authToken.accessToken = data.accessToken;
              authToken.refreshToken = data.refreshToken || authToken.refreshToken;
              authToken.expiresIn = data.expiresIn;
              authToken.accessTokenIssuedAt = Date.now();
              try {
                localStorage.setItem("accessToken", data.accessToken);
              } catch {}
              try {
                if (data.refreshToken) {
                  localStorage.setItem("refreshToken", data.refreshToken);
                }
              } catch {}
            }
          }
        } catch (error) {
          console.error("Token refresh failed:", error);
        }
      }

      return authToken;
    },
    async session({ session, token }) {
      const authSession = session as AuthSession;
      const authToken = token as AuthToken;

      authSession.accessToken = authToken.accessToken;
      authSession.refreshToken = authToken.refreshToken;

      return authSession;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

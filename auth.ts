import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { env } from "@/lib/env";
import { findUserByEmail } from "@/repositories/user-repository";

const SESSION_MAX_AGE = 90 * 24 * 60 * 60; // 90 days
const SESSION_UPDATE_AGE = 12 * 60 * 60; // 12 hours

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  secret: env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
    updateAge: SESSION_UPDATE_AGE,
  },
  jwt: {
    maxAge: SESSION_MAX_AGE,
  },
  cookies: {
    sessionToken: {
      name:
        env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        maxAge: SESSION_MAX_AGE,
        sameSite: "lax" as const,
        path: "/",
        secure: env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // redirect auth errors back to login with ?error=
  },
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_ID || undefined,
      clientSecret: env.AUTH_GOOGLE_SECRET || undefined,
      allowDangerousEmailAccountLinking: true, // Allow automatic account linking if emails match
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1. Validate input shape
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        // 2. Find user – normalise email to lower-case
        const user = await findUserByEmail(parsed.data.email.toLowerCase());
        if (!user?.hashedPassword) return null;

        // 3. Constant-time password compare
        const valid = await bcrypt.compare(
          parsed.data.password,
          user.hashedPassword
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image, // Cloudinary URL
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      // On first sign-in, persist user data into the token
      if (user) {
        token.id = user.id;
        token.role = "role" in user ? user.role : "USER";
        token.picture = user.image ?? token.picture;
      }
      // On session update (e.g. after avatar change) refresh image
      if (trigger === "update" && session?.image) {
        token.picture = session.image;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "USER" | "ADMIN") ?? "USER";
        session.user.name = (token.name as string) ?? session.user.name;
        session.user.email = (token.email as string) ?? session.user.email;
        session.user.image = (token.picture as string) ?? session.user.image;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

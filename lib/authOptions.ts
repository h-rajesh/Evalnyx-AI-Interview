import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { loginLimiter } from "@/lib/ratelimit";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        // Login rate limit — keyed on IP, falls back to a stable dev key
        const ip =
          (req?.headers?.["x-forwarded-for"] as string | undefined)
            ?.split(",")[0]
            .trim() ?? "127.0.0.1";

        const { success } = await loginLimiter.limit(ip);
        if (!success) {
          throw new Error("Too many login attempts. Please try again later.");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) return null;
          if (!user.password) return null;

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          if (!isValid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      const email = user?.email ?? token.email;
      if (!email) return token;

      const dbUser = await prisma.user.findUnique({
        where: { email },
      });

      if (!dbUser) {
        return {} as any;
      }

      token.id = dbUser.id;
      token.name = dbUser.name;
      token.email = dbUser.email;
      token.emailVerified = dbUser.emailVerified;

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.emailVerified = token.emailVerified as Date | null;
      } else {
        return {
          ...session,
          user: undefined,
        } as any;
      }

      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

import NextAuth, { DefaultSession } from "next-auth";

// Extend the default session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      // add more fields if you store them in your DB
    } & DefaultSession["user"];
  }
}

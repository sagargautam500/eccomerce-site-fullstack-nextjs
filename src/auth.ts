// /src/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { signinSchema } from "@/lib/zod";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Facebook from "next-auth/providers/facebook";
import prisma from "./lib/prisma";
import { User } from "./types/user";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // GitHub OAuth
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),


    // Facebook OAuth
    Facebook({
      clientId: process.env.FACEBOOK_ID!,
      clientSecret: process.env.FACEBOOK_SECRET!,
    }),

    // Credentials
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "enter your email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "enter password",
        },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null;

        const parsed = signinSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user) return null;

        const isValid = await bcrypt.compare(
          parsed.data.password,
          user.password || ""
        );
        if (!isValid) return null;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  session: { strategy: "jwt", maxAge: 60 * 60 * 8 }, // 8 hours
  jwt: { maxAge: 60 * 60 * 8 },

  callbacks: {
    // Auto-create user on first OAuth login
    async signIn({ user, account }) {
  if (account?.provider !== "credentials" && user?.email) {
    let dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    // If new OAuth user → create in DB
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          name: user.name ?? "No Name",
          email: user.email,
          password: "",
          role: "user",
        },
      });
    }

    // 👇 VERY IMPORTANT
    // Attach the DB user ID so jwt() receives correct id
    (user as User).id = dbUser.id;
    (user as User).role = dbUser.role as "user" | "admin";
  }

  return true;
},


    async jwt({ token, user }) {
      if (user) {
        token.id = (user as User).id;
        token.role = (user as User).role ?? "user";
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "user";
      }
      return session;
    },
    //autherize(route protection) handled by edge middleware (auth-edge)
  },
  // signIn page handled by edge middleware (auth-edge)
});

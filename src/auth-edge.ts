// src/auth-edge.ts
import NextAuth from "next-auth";

export const { auth } = NextAuth({
  providers: [],
  session: { strategy: "jwt" },

  callbacks: {
    async session({ session, token }) {
      session.user.role = (token as any)?.role ?? "user";
      return session;
    },

    authorized({ request: { nextUrl }, auth }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const pathname = nextUrl.pathname.replace(/\/$/, "");

      // Prevent logged-in users from seeing sign-in/up pages
      if (pathname === "/auth/signin" && isLoggedIn)
        return Response.redirect(new URL("/", nextUrl));
      if (pathname === "/auth/signup" && isLoggedIn)
        return Response.redirect(new URL("/", nextUrl));

      // PROTECTED ROUTES
      const protectedRoutes = [
        "/checkout",
        "/payment",
        "/orders",
      ];

      if (protectedRoutes.some((p) => pathname.startsWith(p))) {
        if (!isLoggedIn) {
          return Response.redirect(new URL("/auth/signin", nextUrl));
        }
      }

      // ADMIN ROUTE
      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn)
          return Response.redirect(new URL("/auth/signin", nextUrl));

        if (role !== "admin")
          return Response.redirect(new URL("/", nextUrl));
      }

      return true;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },
});

// src/proxy.ts
import { auth } from "@/auth-edge";

export default auth((req) => {});

export const config = {
  matcher: [
    "/checkout/:path*",
    "/payment/:path*",
    "/orders/:path*",
    "/admin/:path*",
    "/user/:path*",
    "/auth/signin",
    "/auth/signup",
  ],
};

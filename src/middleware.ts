import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Middleware pakai config edge-safe (tanpa Prisma adapter / bcrypt)
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const user = req.auth?.user;
  const path = nextUrl.pathname;

  const needsAuth =
    path.startsWith("/dashboard") || path.startsWith("/admin") || path === "/order/new";

  if (needsAuth && !user) {
    const url = new URL("/login", nextUrl);
    url.searchParams.set("callbackUrl", path + nextUrl.search);
    return Response.redirect(url);
  }

  if (path.startsWith("/admin") && user?.role !== "admin") {
    return Response.redirect(new URL("/dashboard", nextUrl));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/order/new"],
};

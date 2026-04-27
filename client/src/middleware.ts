import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes jahan login required hai (dashboard group)
const protectedPaths = [
  "/dashboard",
  "/posts",
  "/scheduler",
  "/analytics",
  "/accounts",
  "/users",
  "/social-config",
  "/ai-config",
  "/admin-settings",
  "/settings",
  "/facebook",
];

// Routes jahan already logged-in user ko nahi jaana chahiye
const authPaths = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Root route ko handle karo (agar / pe jaye to seedha dashboard ya login pe bhejo)
  if (pathname === "/") {
    const token = request.cookies.get("token")?.value;
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Token cookies ya header se check karo
  // Note: localStorage server-side pe accessible nahi hota,
  // isliye hum cookie-based token check karenge.
  // Login ke waqt cookie bhi set karni hogi (niche dekho).
  const token = request.cookies.get("token")?.value;

  // Check: kya current path protected hai?
  const isProtectedPath = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  // Check: kya current path auth (login/signup) hai?
  const isAuthPath = authPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  // Agar protected route aur token nahi → login pe redirect
  if (isProtectedPath && !token) {
    const loginUrl = new URL("/login", request.url);
    // Jahan se aaya tha woh URL save karo taaki login ke baad wapas aa sake
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Agar auth route (login/signup) aur token hai → dashboard pe redirect
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};

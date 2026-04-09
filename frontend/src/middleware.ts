import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/admin", "/learning"];

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const role = request.cookies.get("role")?.value;

  const isProtected = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));
  if (!isProtected) return NextResponse.next();

  if (!accessToken) return NextResponse.redirect(new URL("/login", request.url));

  if (request.nextUrl.pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL(role === "instructor" ? "/dashboard/instructor" : "/dashboard/student", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/dashboard/instructor") && role !== "instructor") {
    return NextResponse.redirect(new URL(role === "admin" ? "/admin" : "/dashboard/student", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/dashboard/student") && role !== "student") {
    return NextResponse.redirect(new URL(role === "admin" ? "/admin" : "/dashboard/instructor", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/dashboard") && role === "admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/learning/:path*"],
};


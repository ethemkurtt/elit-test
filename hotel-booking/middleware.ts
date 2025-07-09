// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

type JwtPayload = {
  id: string;
  role: "admin" | "customer";
  email: string;
  exp?: number;
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Giriş yapılmamışsa ve korumalı sayfadaysa → anasayfaya yönlendir
  if (!token) {
    const isProtected = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );
    if (isProtected) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Giriş yapılmışsa → rol kontrolü
  let role: JwtPayload["role"] | null = null;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    role = decoded.role;
  } catch {
    // Token bozuksa anasayfaya
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Admin olmayan biri dashboard'a girmeye çalışıyorsa
  if (pathname.startsWith("/dashboard") && role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Customer olmayan biri otel sayfasına girmeye çalışıyorsa
  if (pathname.startsWith("/otel") && role !== "customer") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Giriş yapmış kullanıcı anasayfaya geldiğinde yönlendirme (isteğe bağlı)
  if (pathname === "/") {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else if (role === "customer") {
      return NextResponse.redirect(new URL("/otel", request.url));
    }
  }

  return NextResponse.next();
}

const protectedRoutes = ["/dashboard", "/otel"];

export const config = {
  matcher: ["/", "/dashboard/:path*", "/otel/:path*"],
};

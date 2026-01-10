import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow all public routes
  const publicRoutes = [
    '/',
    '/role-select',
    '/citizen',
    '/auth',
    '/api'
  ];
  
  // Check if the current path is public or starts with a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Allow authority routes (they handle their own authentication)
  if (pathname.startsWith('/authority')) {
    return NextResponse.next();
  }
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

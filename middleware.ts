import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip middleware for these paths
  const publicPaths = [
    '/auth/login',
    '/auth/register',
    '/auth-admin/login',
    '/_next',
    '/api',
    '/'
  ]

  if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next()
  }

  const token = request.cookies.get('accessToken')?.value;
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/tenant-dashboard');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth') || request.nextUrl.pathname.startsWith('/auth-admin');

  // If no token and trying to access protected route
  if (!token && (isDashboardRoute || isAdminRoute)) {
    const redirectUrl = isAdminRoute ? '/auth-admin/login' : '/auth/login';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // If has token and trying to access auth routes
  if (token && isAuthRoute) {
    const redirectUrl = request.nextUrl.pathname.startsWith('/auth-admin') 
      ? '/admin/dashboard'
      : '/tenant-dashboard';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // For admin routes, verify admin status from token
  if (isAdminRoute && token) {
    try {
      const [, payload] = token.split('.');
      const decodedPayload = JSON.parse(atob(payload));
      
      if (!decodedPayload.isSuperAdmin) {
        return NextResponse.redirect(new URL('/tenant-dashboard', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/auth-admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/tenant-dashboard/:path*',
    '/admin/:path*',
    '/auth/:path*',
    '/auth-admin/:path*',
  ],
} 
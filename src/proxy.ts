/**
 * FILE: src/proxy.ts
 * TYPE: Route Protection Middleware
 *
 * PURPOSE: Protects dashboard routes using Better Auth session cookies
 *
 * PROTECTED ROUTES: /dashboard, /eventi, /finance, /persone, /files, /impostazioni, /guida
 * PUBLIC ROUTES: /, /login, /signup, /api/auth
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/api/auth',
  '/pricing',
  '/contact',
  '/features',
]

// Dashboard routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/eventi',
  '/finance',
  '/persone',
  '/files',
  '/impostazioni',
  '/guida',
  '/files-list',
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Allow API routes except protected ones
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/protected/')) {
    return NextResponse.next()
  }

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  if (isProtectedRoute) {
    // Check for Better Auth session cookie
    const sessionCookie = request.cookies.get('better-auth.session_token')

    if (!sessionCookie) {
      // No session - redirect to login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Session exists - allow access
    // Note: Full session validation happens in Server Components
    return NextResponse.next()
  }

  // Allow all other routes
  return NextResponse.next()
}

// Configure which paths the proxy should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
}

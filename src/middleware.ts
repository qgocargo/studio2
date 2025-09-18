
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('__session');
  const { pathname } = request.nextUrl
 
  // If the user is trying to access the login page but has a valid session,
  // redirect them to the dashboard.
  if (sessionCookie && pathname === '/login') {
     // Here you might want to verify the cookie with Firebase Admin SDK if needed
     // For now, we'll assume if the cookie exists, it's valid.
    return NextResponse.redirect(new URL('/', request.url))
  }
 
  // If the user is trying to access a protected page but is not logged in,
  // redirect them to the login page.
  if (!sessionCookie && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - *.png, *.jpg, *.svg etc (image files in public)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}

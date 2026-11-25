import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;
  const { pathname } = request.nextUrl;
  const isProtectedPath = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  // Optimistic redirect only: server routes and Server Actions must still verify session & authorization
  if (isProtectedPath && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    if (pathname.startsWith('/') && !pathname.startsWith('//')) {
      loginUrl.searchParams.set('from', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  response.headers.set('X-Enterprise-Request-Id', crypto.randomUUID());
  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*'
  ]
};

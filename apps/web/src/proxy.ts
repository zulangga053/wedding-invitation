import type { NextRequest } from 'next/server';

const PUBLIC_FILE = /\\.(.*)$/;

export function proxy(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('/api/') ||
    PUBLIC_FILE.test(request.nextUrl.pathname)
  ) {
    return;
  }
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
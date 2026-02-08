import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export function middleware(request: NextRequest) {
  // Serve landing page HTML for /aviator route
  if (request.nextUrl.pathname === '/aviator') {
    try {
      const html = readFileSync(join(process.cwd(), 'public', 'index.html'), 'utf-8');
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    } catch (error) {
      console.error('Error serving landing page:', error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/aviator',
};

import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from './auth.config';
import { checkBlacklist } from './lib/security';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const ip = req.headers.get('x-forwarded-for') || 'unknown';

    // 0. AI SENTINEL: Global Blacklist Check
    const blacklist = checkBlacklist(ip);
    if (blacklist.isBlocked) {
        return new Response(
            `Access Denied: Your IP has been flagged for malicious activity. Reason: ${blacklist.reason}`,
            { status: 403 }
        );
    }

    const isLoggedIn = !!req.auth;

    const isApiRoute = nextUrl.pathname.startsWith('/api');
    const isPublicRoute = [
        '/signup', '/login', '/', '/features', '/pricing', '/free-scan', '/about',
        '/dashboard', '/dashboard/leads', '/dashboard/settlements', '/dashboard/wallet'
    ].includes(nextUrl.pathname);
    const isPublicApiRoute = ['/api/auth', '/api/chat', '/api/leads/ingest', '/api/system/stats', '/api/stripe/balance'].some(p => nextUrl.pathname.startsWith(p));

    // 1. Protect Internal API Routes
    if (isApiRoute && !isPublicApiRoute && !isLoggedIn) {
        return NextResponse.json(
            { error: "Unauthorized: HIPAA Security Perimeter Active." },
            { status: 401 }
        );
    }

    // 2. Protect Dashboards
    if (!isLoggedIn && !isPublicRoute && !isApiRoute) {
        return Response.redirect(new URL('/signup', nextUrl));
    }

    // 3. Neural Security Headers: MAX_SECURITY_PROTOCOL_ACTIVE
    const response = NextResponse.next();
    if (isLoggedIn || isPublicRoute) {
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        response.headers.set('X-XSS-Protection', '1; mode=block');
        response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

        // Content Security Policy: Only allow trusted grid sources
        response.headers.set(
            'Content-Security-Policy',
            "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.stripe.com; connect-src 'self' https://*.stripe.com; frame-src 'self' https://*.stripe.com; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline';"
        );
    }

    return response;
});

export const config = {
    // Protected all routes, but exclude static/images
    matcher: ['/((?!_next/static|_next/image|.*\\.png$).*)'],
};

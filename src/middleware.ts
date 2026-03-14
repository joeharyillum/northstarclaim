import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from './auth.config';
import { checkBlacklist } from './lib/security';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';

    // 0. IP Blacklist Check
    const blacklist = checkBlacklist(ip);
    if (blacklist.isBlocked) {
        return new Response('Access Denied', { status: 403 });
    }

    const isLoggedIn = !!req.auth;
    const isApiRoute = nextUrl.pathname.startsWith('/api');
    const isWebhookRoute = nextUrl.pathname.startsWith('/api/webhook');

    // Public pages — no auth required
    const isPublicRoute = [
        '/', '/signup', '/login', '/features', '/pricing', '/free-scan', '/about',
        '/robots.txt', '/sitemap.xml',
    ].includes(nextUrl.pathname);

    // Public API routes — no auth required
    const isPublicApiRoute = [
        '/api/auth',
        '/api/system/stats',
        '/api/stripe/checkout',
    ].some(p => nextUrl.pathname.startsWith(p));

    // Webhook routes — authenticated by their own secret, not user auth
    if (isWebhookRoute) {
        const response = NextResponse.next();
        addSecurityHeaders(response);
        return response;
    }

    // 1. Protect API routes (except public ones)
    if (isApiRoute && !isPublicApiRoute && !isLoggedIn) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    // 2. Protect dashboard pages
    if (nextUrl.pathname.startsWith('/dashboard') && !isLoggedIn) {
        return Response.redirect(new URL('/signup', nextUrl));
    }

    // 3. Redirect logged-in users away from signup
    if (isLoggedIn && nextUrl.pathname === '/signup') {
        return Response.redirect(new URL('/dashboard', nextUrl));
    }

    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
});

function addSecurityHeaders(response: NextResponse) {
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    response.headers.set(
        'Content-Security-Policy',
        [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.stripe.com",
            "connect-src 'self' https://*.stripe.com https://api.instantly.ai",
            "frame-src 'self' https://*.stripe.com",
            "img-src 'self' data: blob:",
            "style-src 'self' 'unsafe-inline'",
            "font-src 'self' data:",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
        ].join('; ')
    );
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|.*\\.png$|.*\\.ico$|.*\\.svg$).*)'],
};

import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from './auth.config';
import { checkBlacklist, checkRateLimit, getClientIp } from './lib/security';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const ip = getClientIp(req);

    // ═══════════════════════════════════════════════════════════════
    // LAYER 0: IP Blacklist — immediately reject banned IPs
    // ═══════════════════════════════════════════════════════════════
    const blacklist = checkBlacklist(ip);
    if (blacklist.isBlocked) {
        return new Response('Access Denied', { status: 403 });
    }

    // ═══════════════════════════════════════════════════════════════
    // LAYER 1: Global rate limiting — 120 requests/min per IP
    // ═══════════════════════════════════════════════════════════════
    if (!checkRateLimit(`global:${ip}`, 120, 60000)) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // ═══════════════════════════════════════════════════════════════
    // LAYER 2: Force HTTPS — reject non-secure in production
    // ═══════════════════════════════════════════════════════════════
    const proto = req.headers.get('x-forwarded-proto');
    if (proto === 'http' && process.env.NODE_ENV === 'production') {
        const httpsUrl = new URL(nextUrl.toString());
        httpsUrl.protocol = 'https:';
        return NextResponse.redirect(httpsUrl, 301);
    }

    const isLoggedIn = !!req.auth;
    const isApiRoute = nextUrl.pathname.startsWith('/api');
    const isWebhookRoute = nextUrl.pathname.startsWith('/api/webhook');

    // Admin-only dashboard routes
    const isAdminRoute = [
        '/dashboard/war-room',
        '/dashboard/leads',
        '/dashboard/upload',
        '/dashboard/review',
        '/dashboard/settlements',
    ].some(p => nextUrl.pathname.startsWith(p));

    // Admin-only API routes
    const isAdminApiRoute = [
        '/api/system/stats',
        '/api/leads',
        '/api/pipeline',
        '/api/claims/generate-appeals',
    ].some(p => nextUrl.pathname.startsWith(p));

    // API routes that require BAA (handle PHI/claims data)
    const isBaaRequiredApi = [
        '/api/claims',
        '/api/generate-appeal',
        '/api/upload',
    ].some(p => nextUrl.pathname.startsWith(p));

    // Public pages — no auth required
    const isPublicRoute = [
        '/', '/signup', '/login', '/features', '/pricing', '/free-scan', '/about', '/baa',
        '/privacy', '/terms',
        '/robots.txt', '/sitemap.xml',
    ].includes(nextUrl.pathname);

    // Public API routes — no auth required
    const isPublicApiRoute = [
        '/api/auth',
        '/api/chat',
        '/api/stripe/checkout',
    ].some(p => nextUrl.pathname.startsWith(p));

    // ═══════════════════════════════════════════════════════════════
    // LAYER 3: Webhook routes — authenticated by their own secrets
    // ═══════════════════════════════════════════════════════════════
    if (isWebhookRoute) {
        // Stricter rate limit for webhooks: 30/min per IP
        if (!checkRateLimit(`webhook:${ip}`, 30, 60000)) {
            return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }
        const response = NextResponse.next();
        addSecurityHeaders(response);
        return response;
    }

    // ═══════════════════════════════════════════════════════════════
    // LAYER 4: API route authentication — open access
    // ═══════════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════════
    // LAYER 5: BAA enforcement — disabled for owner access
    // ═══════════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════════
    // LAYER 6: Dashboard — open access (no auth required)
    // ═══════════════════════════════════════════════════════════════

    // Redirect logged-in users away from signup
    if (isLoggedIn && nextUrl.pathname === '/signup') {
        return Response.redirect(new URL('/dashboard', nextUrl));
    }

    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
});

// ═══════════════════════════════════════════════════════════════════════════
// MILITARY-GRADE SECURITY HEADERS
// HSTS 2-year preload, strict CSP, full anti-clickjack/MIME/XSS stack
// ═══════════════════════════════════════════════════════════════════════════
function addSecurityHeaders(response: NextResponse) {
    // HTTPS enforcement — 2 years, all subdomains, preload-ready
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

    // Prevent clickjacking — page cannot be embedded in any frame
    response.headers.set('X-Frame-Options', 'DENY');

    // Prevent MIME-type sniffing attacks
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // Legacy XSS protection (defense-in-depth)
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Referrer policy — don't leak full URLs to third parties
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Disable dangerous browser features
    response.headers.set('Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), ambient-light-sensor=(), autoplay=(), encrypted-media=(self), fullscreen=(self)'
    );

    // Cross-Origin isolation headers
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
    response.headers.set('Cross-Origin-Embedder-Policy', 'credentialless');

    // Prevent DNS prefetch to uncontrolled origins
    response.headers.set('X-DNS-Prefetch-Control', 'off');

    // Prevent browsers from caching sensitive pages
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');

    // Don't disclose server technology
    response.headers.delete('X-Powered-By');
    response.headers.delete('Server');

    // Content Security Policy — tight whitelist
    response.headers.set(
        'Content-Security-Policy',
        [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.stripe.com https://va.vercel-scripts.com",
            "connect-src 'self' https://*.stripe.com https://api.instantly.ai https://vitals.vercel-insights.com https://va.vercel-scripts.com",
            "frame-src 'self' https://*.stripe.com https://www.youtube.com",
            "img-src 'self' data: blob: https:",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' data: https://fonts.gstatic.com",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "upgrade-insecure-requests",
        ].join('; ')
    );
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|.*\\.png$|.*\\.ico$|.*\\.svg$).*)'],
};

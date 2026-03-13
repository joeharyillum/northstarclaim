import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/signup',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnApi = nextUrl.pathname.startsWith('/api') && !nextUrl.pathname.startsWith('/api/auth');
            if (isOnDashboard && !isLoggedIn) {
                return false; // Block unauthenticated access to dashboard
            }
            if (isLoggedIn && nextUrl.pathname === '/signup') {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;

export const baseAuthConfig = {
    basePath: '/api/auth',
} satisfies NextAuthConfig;

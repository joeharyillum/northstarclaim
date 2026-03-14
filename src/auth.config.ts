import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/signup',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            // Let middleware.ts handle all route protection logic
            // This callback only handles the basic auth check
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            if (isOnDashboard && !isLoggedIn) {
                return false; // Block unauthenticated access to dashboard
            }
            return true;
        },
    },
    providers: [],
} satisfies NextAuthConfig;

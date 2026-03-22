import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            if (isOnDashboard && !isLoggedIn) {
                return false; 
            }
            return true;
        },
    },
    providers: [], // Providers added dynamically in auth.ts to avoid next-edge issues
} satisfies NextAuthConfig;

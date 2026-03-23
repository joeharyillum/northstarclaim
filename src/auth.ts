import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Apple from 'next-auth/providers/apple';
import { authConfig } from './auth.config';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { checkLoginAllowed, recordLoginFailure, clearLoginFailures, getClientIp } from '@/lib/security';

// Build providers dynamically — only include Google/Apple when credentials exist
const providers: any[] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }));
}

if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET) {
    providers.push(Apple({
        clientId: process.env.APPLE_CLIENT_ID,
        clientSecret: process.env.APPLE_CLIENT_SECRET,
    }));
}

providers.push(Credentials({
    name: "Credentials",
    credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "2FA Code", type: "text" }
    },
    async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const ip = getClientIp(req);

        // Brute-force protection — check if IP is locked out
        const loginCheck = checkLoginAllowed(ip);
        if (!loginCheck.allowed) {
            throw new Error(`Account locked. Try again in ${loginCheck.remainingLockout} seconds.`);
        }

        const email = (credentials.email as string).toLowerCase().trim();
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || !user.password) {
            await recordLoginFailure(ip, email);
            return null;
        }

        const pwMatch = await bcrypt.compare(credentials.password as string, user.password);

        if (!pwMatch) {
            await recordLoginFailure(ip, email);
            return null;
        }

        // If 2FA enabled, verify code
        if (user.twoFactorEnabled) {
            if (!credentials.code) {
                throw new Error("2FA_REQUIRED");
            }
            // TODO: Implement TOTP verification with user.twoFactorSecret
        }

        // Success — clear any login failure records
        clearLoginFailures(ip);

        return {
            id: user.id,
            email: user.email,
            name: user.clinicName,
            stripeAccountId: user.stripeAccountId,
            role: user.role || 'client',
            baaSignedAt: user.baaSignedAt?.toISOString() || null,
        };
    },
}));

export const { auth, signIn, signOut, handlers: { GET, POST } } = NextAuth({
    ...authConfig,
    session: {
        strategy: "jwt",
        maxAge: 8 * 60 * 60,       // 8 hours — HIPAA-appropriate session lifetime
        updateAge: 30 * 60,         // Refresh token every 30 minutes
    },
    providers,
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.stripeAccountId = (user as any).stripeAccountId;
                token.role = (user as any).role || 'client';
                token.baaSignedAt = (user as any).baaSignedAt || null;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.stripeAccountId = token.stripeAccountId as string;
                session.user.role = token.role as string;
                session.user.baaSignedAt = token.baaSignedAt as string | null;
            }
            return session;
        },
    }
});


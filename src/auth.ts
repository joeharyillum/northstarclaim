import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { checkLoginAllowed, recordLoginFailure, clearLoginFailures, getClientIp } from '@/lib/security';

export const { auth, signIn, signOut, handlers: { GET, POST } } = NextAuth({
    ...authConfig,
    session: {
        strategy: "jwt",
        maxAge: 8 * 60 * 60,       // 8 hours — HIPAA-appropriate session lifetime
        updateAge: 30 * 60,         // Refresh token every 30 minutes
    },
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
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
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.stripeAccountId = user.stripeAccountId;
                token.role = user.role || 'client';
                token.baaSignedAt = user.baaSignedAt || null;
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


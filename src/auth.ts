import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const { auth, signIn, signOut, handlers: { GET, POST } } = NextAuth({
    ...authConfig,
    session: { strategy: "jwt" },
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                });

                if (!user || !user.password) return null;

                const pwMatch = await bcrypt.compare(credentials.password as string, user.password);

                if (!pwMatch) return null;

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


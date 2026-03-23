import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/sendgrid-client';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        if (!process.env.SENDGRID_API_KEY) {
            throw new Error('SENDGRID_API_KEY is missing in production environment');
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            // We return 200 even if user doesn't exist for security (avoid enumeration)
            return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' });
        }

        // Generate a random token
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour from now

        // Clean up any old reset tokens for this email
        await prisma.verificationToken.deleteMany({
            where: { identifier: email },
        });

        // Store the new token
        await prisma.verificationToken.create({
            data: { identifier: email, token, expires }
        });

        const resetUrl = `${process.env.NEXTAUTH_URL || 'https://www.northstarmedic.com'}/reset-password?token=${token}`;

        await sendPasswordResetEmail(email, resetUrl);

        return NextResponse.json({ message: 'Reset link sent' });
    } catch (error: any) {
        console.error('[FORGOT_PASSWORD_API] Error:', error.message);
        // Exposing error temporarily for debugging
        return NextResponse.json({ error: 'Internal error: ' + error.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetCode } from '@/lib/sendgrid-client';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            // We return 200 even if user doesn't exist for security (avoid enumeration)
            return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' });
        }

        // Generate a random 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 15 * 60000); // 15 minutes from now

        // Store the code (we abuse VerificationToken table for this)
        await prisma.verificationToken.deleteMany({
            where: { identifier: email },
        });

        await prisma.verificationToken.create({
            data: { identifier: email, token: code, expires }
        });

        await sendPasswordResetCode(email, code);

        return NextResponse.json({ message: 'Security code sent to your email.' });
    } catch (error: any) {
        console.error('[FORGOT_PASSWORD_API] Error:', error.message);
        // Exposing error temporarily for debugging
        return NextResponse.json({ error: 'Internal error: ' + error.message }, { status: 500 });
    }
}

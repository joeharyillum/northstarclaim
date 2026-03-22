import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
        }

        // Find the token in the database
        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token }
        });

        if (!verificationToken || verificationToken.expires < new Date()) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
        }

        const email = verificationToken.identifier;

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update the user's password
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });

        // Delete the token so it can't be used again
        await prisma.verificationToken.delete({
            where: { token }
        });

        return NextResponse.json({ message: 'Password reset successfully' });
    } catch (error: any) {
        console.error('[RESET_PASSWORD_API] Error:', error.message);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

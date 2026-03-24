import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { sendBaaConfirmationEmail } from '@/lib/sendgrid-client';

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';

        // Update user with BAA signing data
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                baaSignedAt: new Date(),
                baaSignedIp: ip !== 'unknown' ? ip : null,
            },
        });

        // Log the BAA signing event for HIPAA compliance
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: 'BAA_SIGNED',
                details: `BAA electronically signed by user ${session.user.email}`,
                ipAddress: ip !== 'unknown' ? ip : null,
            },
        });

        // Send BAA confirmation email (non-blocking)
        sendBaaConfirmationEmail(
            session.user.email!,
            session.user.email!,
            new Date(),
            ip !== 'unknown' ? ip : null
        ).catch(err => console.error('[SENDGRID] BAA confirmation email failed:', err.message));

        return NextResponse.json({ success: true, message: 'BAA signed successfully' });
    } catch (error: any) {
        console.error('BAA signing error:', error?.message || 'Unknown error');
        return NextResponse.json({ error: 'Failed to sign BAA' }, { status: 500 });
    }
}

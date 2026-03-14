import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { checkRateLimit } from '@/lib/security';

export async function POST(req: Request) {
    // Rate limit: max 5 registrations per minute per IP
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip, 5)) {
        return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
    }

    try {
        const { email, password, clinicName, baaAccepted } = await req.json();

        if (!email || !password || !clinicName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (!baaAccepted) {
            return NextResponse.json({ error: "BAA agreement must be accepted" }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof email !== 'string' || !emailRegex.test(email)) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
        }

        // Validate password strength
        if (typeof password !== 'string' || password.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
        }

        if (typeof clinicName !== 'string' || clinicName.length > 200) {
            return NextResponse.json({ error: "Invalid clinic name" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // First user gets founder role automatically
        const userCount = await prisma.user.count();
        const assignedRole = userCount === 0 ? 'founder' : 'client';

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                clinicName,
                role: assignedRole,
                baaSignedAt: new Date(),
                baaSignedIp: ip !== 'unknown' ? ip : null,
            }
        });

        // Log BAA signing for HIPAA compliance
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'BAA_SIGNED_AT_REGISTRATION',
                details: `BAA electronically signed by ${email} for clinic ${clinicName}. Role: ${assignedRole}`,
                ipAddress: ip !== 'unknown' ? ip : null,
            },
        });

        return NextResponse.json({
            success: true,
            message: "User registered successfully",
            userId: user.id
        });

    } catch (error: any) {
        console.error("Registration Error:", error);
        return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
    }
}

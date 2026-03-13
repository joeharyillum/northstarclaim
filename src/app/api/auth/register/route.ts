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
        const { email, password, clinicName } = await req.json();

        if (!email || !password || !clinicName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                clinicName,
            }
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

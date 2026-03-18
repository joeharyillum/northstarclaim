import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { checkRateLimit, validatePasswordStrength, sanitizeInput, getClientIp } from '@/lib/security';
import { sendWelcomeEmail, sendAdminNotification } from '@/lib/sendgrid-client';

export async function POST(req: Request) {
    const ip = getClientIp(req);

    // Rate limit: max 3 registrations per minute per IP (tighter than before)
    if (!checkRateLimit(`register:${ip}`, 3, 60000)) {
        return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
    }

    try {
        const body = await req.json();
        const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
        const password = typeof body.password === 'string' ? body.password : '';
        const clinicName = typeof body.clinicName === 'string' ? sanitizeInput(body.clinicName, 200) : '';
        const baaAccepted = body.baaAccepted;

        if (!email || !password || !clinicName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (!baaAccepted) {
            return NextResponse.json({ error: "BAA agreement must be accepted" }, { status: 400 });
        }

        // Strict email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email) || email.length > 254) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
        }

        // Military-grade password validation
        const pwCheck = validatePasswordStrength(password);
        if (!pwCheck.valid) {
            return NextResponse.json({
                error: "Password does not meet security requirements",
                details: pwCheck.errors
            }, { status: 400 });
        }

        if (clinicName.length < 2) {
            return NextResponse.json({ error: "Clinic name is too short" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            // Don't reveal whether email exists — generic message
            return NextResponse.json({ error: "Registration failed. Please try again or contact support." }, { status: 400 });
        }

        // bcrypt with cost factor 12 (stronger than default 10)
        const hashedPassword = await bcrypt.hash(password, 12);

        // First user gets admin role automatically
        const userCount = await prisma.user.count();
        const assignedRole = userCount === 0 ? 'admin' : 'client';

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

        // HIPAA audit log
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'BAA_SIGNED_AT_REGISTRATION',
                details: `BAA electronically signed by ${email} for clinic ${clinicName}. Role: ${assignedRole}`,
                ipAddress: ip !== 'unknown' ? ip : null,
            },
        });

        // Send welcome email (non-blocking)
        sendWelcomeEmail(email, clinicName).catch(err =>
            console.error('[SENDGRID] Welcome email failed:', err.message)
        );

        // Notify admin of new signup (non-blocking)
        sendAdminNotification(
            'New User Registration',
            `New signup: ${email}\nClinic: ${clinicName}\nRole: ${assignedRole}\nIP: ${ip}`
        ).catch(err => console.error('[SENDGRID] Admin notification failed:', err.message));

        return NextResponse.json({
            success: true,
            message: "User registered successfully",
        });

    } catch (error: any) {
        console.error("Registration Error:", error?.message || 'Unknown error');
        return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
    }
}

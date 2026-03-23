import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
const { authenticator } = require('otplib');

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { twoFactorEnabled: true }
    });

    return NextResponse.json({ enabled: user?.twoFactorEnabled || false });
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(session.user.email, "NorthStar Medic", secret);

    return NextResponse.json({ secret, qrCode: otpauth });
}

export async function PUT(req: Request) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { code, secret } = body;

        const isValid = authenticator.check(code, secret);

        if (!isValid) {
            return NextResponse.json({ success: false, error: "Invalid code" }, { status: 400 });
        }

        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                twoFactorEnabled: true,
                twoFactorSecret: secret,
            }
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.user.update({
        where: { email: session.user.email },
        data: {
            twoFactorEnabled: false,
            twoFactorSecret: null,
        }
    });

    return NextResponse.json({ success: true });
}

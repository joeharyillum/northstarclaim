import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getOwnerSession } from '@/lib/owner-session';
import { checkRateLimit } from '@/lib/security';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-04-30.basil' as Stripe.LatestApiVersion,
});

export async function POST(request: Request) {
    // AUTH GATE: Only authenticated users can onboard
    const session = await getOwnerSession();

    // Rate limit: max 5 onboard attempts per minute
    if (!checkRateLimit(session.user.id, 5)) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    try {
        const body = await request.json();
        const { email, clinicName } = body;

        if (!email || typeof email !== 'string' || !clinicName || typeof clinicName !== 'string') {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ error: 'Payment system not configured' }, { status: 503 });
        }

        // REAL STRIPE CONNECT LOGIC
        // 1. Create a Custom Connect Account for the Biller/Clinic
        // We use 'express' so we can control the fee split programmatically.
        const account = await stripe.accounts.create({
            type: 'express',
            country: 'US',
            email: email,
            business_type: 'company',
            company: {
                name: clinicName,
            },
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true }, // Required for us to route the 50/50 split
            },
        });

        // --- DATABASE INTEGRATION: Save User & Stripe ID ---
        const { default: prisma } = await import('@/lib/prisma');
        // Only allow users to update their own record
        await prisma.user.update({
            where: { id: session.user.id },
            data: { stripeAccountId: account.id, clinicName: clinicName }
        });

        // 2. Create the Account Link so the user can complete Stripe KYC
        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/signup?stripe_refresh=true`,
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard?stripe_success=true`,
            type: 'account_onboarding',
        });

        return NextResponse.json({
            success: true,
            accountId: account.id,
            onboardingUrl: accountLink.url
        });

    } catch (error: any) {
        console.error("Stripe Onboarding Error:", error);
        return NextResponse.json(
            { error: 'Failed to create payment account' },
            { status: 500 }
        );
    }
}

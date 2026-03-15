import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getOwnerSession } from '@/lib/owner-session';
import { checkRateLimit, validateFinancialConsent, logAudit } from '@/lib/security';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16' as any,
});

export async function POST(req: Request) {
    // AML GATE: Only authenticated founder can trigger payouts
    const session = await getOwnerSession();

    // Rate limit: max 3 payouts per minute
    if (!checkRateLimit(session.user.id, 3)) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    try {
        // FINANCIAL SOVEREIGNTY: Only founder can authorize outbound capital
        await validateFinancialConsent(session.user.id, 'STRIPE_PAYOUT', 'CAPITAL_OUTBOUND');

        const { amount, destination } = await req.json();

        // AML validation: reject suspicious amounts
        if (typeof amount !== 'number' || amount <= 0 || amount > 250000) {
            await logAudit(session.user.id, 'SUSPICIOUS_PAYOUT_BLOCKED', `Rejected payout amount: ${amount}`, req.headers.get('x-forwarded-for') || 'unknown');
            return NextResponse.json({ error: 'Invalid payout amount' }, { status: 400 });
        }

        if (!destination || typeof destination !== 'string') {
            return NextResponse.json({ error: 'Invalid destination' }, { status: 400 });
        }

        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ error: 'Payment system not configured' }, { status: 503 });
        }

        // Real Payout logic for Stripe Connect
        // This is a simplified version. For true "Instant Payouts", 
        // you'd typically use Stripe's payout API with 'instant' method if supported.
        const payout = await stripe.payouts.create({
            amount: Math.round(amount * 100),
            currency: 'usd',
            method: 'instant', // Request instant delivery
        });

        return NextResponse.json({
            success: true,
            payoutId: payout.id,
            arrival: 'INSTANT_AUTHORIZED',
            arrival_date: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('Payout Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Payout processing failed'
        }, { status: 500 });
    }
}

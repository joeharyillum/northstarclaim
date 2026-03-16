import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getOwnerSession } from '@/lib/owner-session';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16' as any,
});

export async function GET() {
    const session = await getOwnerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({
                available: 0,
                pending: 0,
                total: 0,
            });
        }

        const balanceData = await Promise.race([
            stripe.balance.retrieve(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Stripe Timeout')), 2000))
        ]) as any;

        // Sum up available balance in USD
        const available = balanceData.available.find((b: { currency: string; amount: number }) => b.currency === 'usd')?.amount || 0;
        const pending = balanceData.pending.find((b: { currency: string; amount: number }) => b.currency === 'usd')?.amount || 0;
        const instant_available = balanceData.instant_available?.find((b: { currency: string; amount: number }) => b.currency === 'usd')?.amount || 0;

        return NextResponse.json({
            available: available / 100,
            pending: pending / 100,
            instant_available: instant_available / 100,
            total: (available + pending) / 100
        });
    } catch (error) {
        console.error('Error fetching Stripe balance:', error);
        return NextResponse.json({
            available: 0,
            pending: 0,
            total: 0,
            error_note: 'Balance temporarily unavailable'
        });
    }
}

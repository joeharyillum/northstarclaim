import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/auth';
import { checkRateLimit } from '@/lib/security';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16' as any,
});

export async function POST(req: Request) {
    // AUTH GATE: Only authenticated users can initiate checkout
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: max 5 checkout attempts per minute
    if (!checkRateLimit(session.user.id, 5)) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    try {
        const { tier } = await req.json();

        let amount = 0;
        let name = '';

        if (tier === 'starter') {
            amount = 9900; // $99.00
            name = 'Starter Tier - Northstar Claim';
        } else if (tier === 'professional') {
            amount = 29900; // $299.00
            name = 'Professional Tier - Northstar Claim';
        } else {
            return new NextResponse('Invalid tier', { status: 400 });
        }

        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ error: 'Payment system not configured' }, { status: 503 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: name,
                            description: 'Monthly SaaS Access & AI Guardian Recovery',
                        },
                        unit_amount: amount,
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
    }
}

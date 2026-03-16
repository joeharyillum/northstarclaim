import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getOwnerSession } from '@/lib/owner-session';
import { checkRateLimit } from '@/lib/security';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-04-30.basil' as Stripe.LatestApiVersion,
});

export async function POST(req: Request) {
    const session = await getOwnerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limit: max 5 checkout attempts per minute
    if (!checkRateLimit(session.user.id, 5)) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    try {
        const { tier } = await req.json();

        let amount = 0;
        let name = '';

        if (tier === 'guardian-pilot') {
            amount = 250000; // $2,500.00
            name = 'Guardian Pilot - NorthStar Medic';
        } else if (tier === 'growth-lattice') {
            amount = 750000; // $7,500.00
            name = 'Growth Lattice - NorthStar Medic';
        } else {
            return new NextResponse('Invalid tier', { status: 400 });
        }

        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ error: 'Payment system not configured' }, { status: 503 });
        }

        const checkoutSession = await stripe.checkout.sessions.create({
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

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
    }
}

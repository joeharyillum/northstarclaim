import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { checkRateLimit, getClientIp } from '@/lib/security';

const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || '').trim(), {
    apiVersion: '2025-04-30.basil' as Stripe.LatestApiVersion,
});

export async function POST(req: Request) {
    // PUBLIC endpoint — cold email leads checkout without login
    const ip = getClientIp(req);

    // Rate limit by IP: max 5 checkout attempts per minute
    if (!checkRateLimit(`checkout:${ip}`, 5)) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    try {
        const { tier, email } = await req.json();

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
            ...(email && typeof email === 'string' ? { customer_email: email } : {}),
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
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/signup?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing`,
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error: any) {
        console.error('Stripe checkout error:', error?.message || 'Unknown error');
        return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
    }
}

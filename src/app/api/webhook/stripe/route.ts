import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-04-30.basil' as Stripe.LatestApiVersion,
});

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error('[STRIPE WEBHOOK] STRIPE_WEBHOOK_SECRET not configured');
        return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error(`[STRIPE WEBHOOK] Signature verification failed: ${message}`);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const customerEmail = session.customer_details?.email || session.customer_email || 'unknown';
                const customerName = session.customer_details?.name || null;
                const amount = session.amount_total || 0;

                // Determine tier from amount
                let tier = 'unknown';
                if (amount === 250000) tier = 'guardian-pilot';
                else if (amount === 750000) tier = 'growth-lattice';

                // Record payment in database
                await prisma.payment.create({
                    data: {
                        stripeSessionId: session.id,
                        stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
                        stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : null,
                        customerEmail,
                        customerName,
                        tier,
                        amount,
                        currency: session.currency || 'usd',
                        status: 'completed',
                    },
                });

                // Audit log
                await prisma.auditLog.create({
                    data: {
                        userId: 'STRIPE',
                        action: 'PAYMENT_RECEIVED',
                        details: `${tier} payment of $${(amount / 100).toFixed(2)} from ${customerEmail}`,
                    },
                });

                console.log(`[STRIPE] Payment received: $${(amount / 100).toFixed(2)} from ${customerEmail} (${tier})`);
                break;
            }

            case 'invoice.paid': {
                const invoice = event.data.object as Stripe.Invoice;
                const email = invoice.customer_email || 'unknown';
                const amount = invoice.amount_paid || 0;

                await prisma.auditLog.create({
                    data: {
                        userId: 'STRIPE',
                        action: 'INVOICE_PAID',
                        details: `Subscription invoice $${(amount / 100).toFixed(2)} paid by ${email}`,
                    },
                });

                console.log(`[STRIPE] Invoice paid: $${(amount / 100).toFixed(2)} from ${email}`);
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                const email = invoice.customer_email || 'unknown';

                await prisma.auditLog.create({
                    data: {
                        userId: 'STRIPE',
                        action: 'PAYMENT_FAILED',
                        details: `Payment failed for ${email} — invoice ${invoice.id}`,
                    },
                });

                console.log(`[STRIPE] Payment failed for ${email}`);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;

                await prisma.auditLog.create({
                    data: {
                        userId: 'STRIPE',
                        action: 'SUBSCRIPTION_CANCELLED',
                        details: `Subscription ${subscription.id} cancelled`,
                    },
                });

                console.log(`[STRIPE] Subscription cancelled: ${subscription.id}`);
                break;
            }

            default:
                console.log(`[STRIPE] Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('[STRIPE WEBHOOK] Processing error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

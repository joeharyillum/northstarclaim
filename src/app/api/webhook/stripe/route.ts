import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { sendPaymentReceiptEmail, sendPaymentFailedEmail, sendAdminNotification } from '@/lib/sendgrid-client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-04-30.basil' as Stripe.LatestApiVersion,
});

/**
 * Commission Split: When a claim recovery payment arrives,
 * auto-transfer the biller's 15% cut to their Stripe Connect account.
 */
async function processCommissionSplit(customerEmail: string, amount: number, sessionId: string) {
    try {
        // Idempotency guard — prevent duplicate commission transfers on webhook retries
        const alreadyProcessed = await prisma.auditLog.findFirst({
            where: {
                action: 'COMMISSION_TRANSFERRED',
                details: { contains: sessionId },
            },
        });
        if (alreadyProcessed) {
            console.log(`[COMMISSION] Session ${sessionId} already processed — skipping duplicate`);
            return;
        }

        // Find the user by email to check if they have a biller/partner referrer
        const user = await prisma.user.findUnique({
            where: { email: customerEmail },
            select: { id: true, stripeAccountId: true, role: true },
        });

        if (!user) return;

        // Find invoices linked to this user's claims that have a biller commission
        const pendingInvoices = await prisma.invoice.findMany({
            where: {
                status: 'PENDING',
                claim: { batch: { userId: user.id } },
                billerCommission: { gt: 0 },
            },
            include: {
                claim: {
                    include: {
                        batch: {
                            include: { user: true },
                        },
                    },
                },
            },
        });

        for (const invoice of pendingInvoices) {
            const billerUser = invoice.claim.batch.user;
            if (!billerUser.stripeAccountId) continue;

            const commissionCents = Math.round(invoice.billerCommission * 100);
            if (commissionCents < 100) continue; // Minimum $1 transfer

            try {
                // Transfer biller's commission to their Connect account
                const transfer = await stripe.transfers.create({
                    amount: commissionCents,
                    currency: 'usd',
                    destination: billerUser.stripeAccountId,
                    description: `Commission for claim ${invoice.claimId}`,
                    metadata: { sessionId, invoiceId: invoice.id },
                },
                { idempotencyKey: `commission-${sessionId}-${invoice.id}` });

                // Mark invoice as paid
                await prisma.invoice.update({
                    where: { id: invoice.id },
                    data: { status: 'PAID', stripeInvoiceId: transfer.id },
                });

                await prisma.auditLog.create({
                    data: {
                        userId: 'STRIPE_COMMISSION',
                        action: 'COMMISSION_TRANSFERRED',
                        details: `$${(commissionCents / 100).toFixed(2)} transferred to ${billerUser.email} (${billerUser.stripeAccountId}) for claim ${invoice.claimId}`,
                    },
                });

                console.log(`[COMMISSION] $${(commissionCents / 100).toFixed(2)} → ${billerUser.email}`);
            } catch (transferErr: any) {
                console.error(`[COMMISSION] Transfer failed for invoice ${invoice.id}:`, transferErr.message);
                await prisma.auditLog.create({
                    data: {
                        userId: 'STRIPE_COMMISSION',
                        action: 'COMMISSION_TRANSFER_FAILED',
                        details: `Failed to transfer $${(commissionCents / 100).toFixed(2)} to ${billerUser.stripeAccountId}: ${transferErr.message}`,
                    },
                });
            }
        }
    } catch (err: any) {
        console.error('[COMMISSION] Split processing error:', err.message);
    }
}

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret || webhookSecret === 'whsec_REPLACE_ME') {
        console.error('[STRIPE WEBHOOK] STRIPE_WEBHOOK_SECRET not configured — set it in Vercel env vars from Stripe Dashboard → Webhooks');
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

                // Send payment receipt (non-blocking)
                if (customerEmail !== 'unknown') {
                    sendPaymentReceiptEmail(customerEmail, amount, tier, session.id)
                        .catch(err => console.error('[SENDGRID] Payment receipt failed:', err.message));
                }

                // Notify admin (non-blocking)
                sendAdminNotification(
                    `Payment: $${(amount / 100).toFixed(2)}`,
                    `New payment received:\nCustomer: ${customerEmail}\nAmount: $${(amount / 100).toFixed(2)}\nTier: ${tier}\nSession: ${session.id}`
                ).catch(err => console.error('[SENDGRID] Admin notification failed:', err.message));

                // Process commission splits for biller partners (non-blocking)
                processCommissionSplit(customerEmail, amount, session.id)
                    .catch(err => console.error('[COMMISSION] Split failed:', err.message));

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

                // Notify customer of failed payment (non-blocking)
                if (email !== 'unknown') {
                    sendPaymentFailedEmail(email, invoice.id || 'N/A')
                        .catch(err => console.error('[SENDGRID] Payment failed email failed:', err.message));
                }

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
    } catch (error: any) {
        console.error('[STRIPE WEBHOOK] Processing error:', error?.message || 'Unknown error');
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

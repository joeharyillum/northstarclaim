import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getOwnerSession } from '@/lib/owner-session';
import { validateFinancialConsent, checkRateLimit } from '@/lib/security';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-01-28.clover',
});

// The Total SaaS Fee the platform charges the clinic
// (30% by default, or 3000 basis points) - Optimal for AI Denial Recovery
const TOTAL_FEE_PERCENTAGE = 0.30;

// The rev-share split the Independent Biller gets from our 30% fee
// If our total fee is 30%, and PARTNER_REVENUE_SPLIT is 0.50, the independent platform takes 50% of that 30% payment.
const PARTNER_REVENUE_SPLIT = 0.50;

export async function POST(request: Request) {
    const session = await getOwnerSession();

    // Rate limit: max 10 invoices per minute
    if (!checkRateLimit(session.user.id, 10)) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    try {
        // FINANCIAL SOVEREIGNTY GATE: AI is authorized for INBOUND revenue
        await validateFinancialConsent(session.user.id, "STRIPE_INVOICE_PROCESS", 'REVENUE_INBOUND');

        const body = await request.json();

        // claimAmount is the TOTAL amount the insurance company paid the clinic.
        // E.g., The AI appealed and won $1,000.
        // connectedAccountId is the Biller's Stripe ID (from /api/stripe/onboard)
        // clinicCustomerId is the Clinic's Stripe Customer ID (who pays the bill)
        const { claimAmount, connectedAccountId, clinicCustomerId } = body;

        // --- THE MATH ---
        // We create an invoice on the Clinic's actual Stripe account. 
        const totalFeeAmount = claimAmount * TOTAL_FEE_PERCENTAGE; // $1000 * 30% = $300
        const feeInCents = Math.round(totalFeeAmount * 100);

        // 2. Calculate the Biller's commission (The Affiliate/Partner split)
        const partnerCommissionAmount = totalFeeAmount * PARTNER_REVENUE_SPLIT; // $300 * 50% = $150
        const partnerCommissionInCents = Math.round(partnerCommissionAmount * 100);

        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ error: 'Payment system not configured' }, { status: 503 });
        }

        // --- REAL STRIPE INVOICE CREATION ---

        // 1. Create an Invoice Item for the Clinic
        await stripe.invoiceItems.create({
            customer: clinicCustomerId,
            amount: feeInCents,
            currency: 'usd',
            description: `Performance Fee (30%) for Successful AI Claim Recovery ($${claimAmount.toFixed(2)})`,
            metadata: {
                claimAmount: claimAmount.toFixed(2),
                feePercentage: TOTAL_FEE_PERCENTAGE.toFixed(2),
                partnerRevenueSplit: PARTNER_REVENUE_SPLIT.toFixed(2),
            },
        });

        // 2. Generate and finalize the Invoice
        // We charge the Clinic the full 30% ($300)
        const invoice = await stripe.invoices.create({
            customer: clinicCustomerId,
            collection_method: 'charge_automatically',
            auto_advance: true, // Attempt payment immediately
            // 3. THIS IS THE MAGIC ROUTING
            // We tell Stripe to route 50% of the money ($150) direct to the Biller's dashboard.
            // MediClaim AI keeps the remainder ($150). Zero touch payout.
            transfer_data: {
                destination: connectedAccountId,
                amount: partnerCommissionInCents,
            },
        });

        // Pay it
        const finalizedInvoice = await stripe.invoices.pay(invoice.id);

        // --- DATABASE INTEGRATION: Save Claim and Invoice ---
        // We generate a dummy or temporary UUID for the batchId since the full OCR pipeline
        // isn't integrated yet, ensuring database integrity.
        const { default: prisma } = await import('@/lib/prisma');

        const mockBatch = await prisma.uploadBatch.create({
            data: {
                userId: session.user.id,
                fileName: "api-generated-batch",
                status: "COMPLETED"
            }
        });

        const savedClaim = await prisma.claim.create({
            data: {
                batchId: mockBatch.id,
                patientId: "System-Generated",
                cptCode: "AUTO_BILLED",
                billedAmount: claimAmount,
                denialReason: "Resolved via AI",
                status: "RECOVERABLE"
            }
        });

        await prisma.invoice.create({
            data: {
                claimId: savedClaim.id,
                stripeInvoiceId: finalizedInvoice.id,
                amountEarned: totalFeeAmount,
                billerCommission: partnerCommissionAmount,
                status: finalizedInvoice.status === 'paid' ? 'PAID' : 'PENDING'
            }
        });

        return NextResponse.json({
            success: true,
            invoiceId: finalizedInvoice.id,
            totalCharged: feeInCents / 100,
            billerCommission: partnerCommissionInCents / 100,
            status: finalizedInvoice.status,
            dbClaimId: savedClaim.id
        });

    } catch (error: any) {
        console.error("Stripe Invoicing Error:", error);
        return NextResponse.json(
            { error: 'Invoice processing failed' },
            { status: 500 }
        );
    }
}

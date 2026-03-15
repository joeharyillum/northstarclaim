import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { getOwnerSession } from '@/lib/owner-session';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16' as any,
});

export async function GET() {
    // PRIVATE: Only authenticated company users can see system stats
    const session = await getOwnerSession();
    try {
        // 1. Fetch Stripe Balance
        let stripeTotal = 0;
        if (process.env.STRIPE_SECRET_KEY) {
            const balance = await stripe.balance.retrieve();
            const available = balance.available.find(b => b.currency === 'usd')?.amount || 0;
            const pending = balance.pending.find(b => b.currency === 'usd')?.amount || 0;
            stripeTotal = (available + pending) / 100;
        }

        // 2. Fetch Database Aggregates
        let totalClaimsCount = 0;
        let paidRevenue = 0;
        let pipelineRevenue = 0;
        try {
            totalClaimsCount = await prisma.claim.count();
            const paidInvoices = await prisma.invoice.aggregate({
                _sum: { amountEarned: true },
                where: { status: 'PAID' }
            });
            const recoverableClaims = await prisma.claim.aggregate({
                _sum: { billedAmount: true },
                where: { status: 'RECOVERABLE' }
            });
            paidRevenue = paidInvoices._sum.amountEarned || 0;
            pipelineRevenue = recoverableClaims._sum.billedAmount || 0;
        } catch (dbError: any) {
            console.warn('DB Query slow or failed.', dbError.message);
        }

        const systemWideRevenue = stripeTotal + paidRevenue + pipelineRevenue;

        return NextResponse.json({
            success: true,
            data: {
                totalRevenue: systemWideRevenue,
                stripeBalance: stripeTotal,
                pipelineRevenue: pipelineRevenue,
                paidRevenue: paidRevenue,
                totalClaims: totalClaimsCount,
                networkStatus: 'OPERATIONAL',
            }
        });
    } catch (error: any) {
        console.error('System Stats Error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

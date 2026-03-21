import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOwnerSession } from '@/lib/owner-session';
import { checkRateLimit } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getOwnerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!checkRateLimit(`partner-stats:${session.user.id}`, 10)) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true, referralCode: true, stripeAccountId: true },
        });

        if (!user || user.role !== 'biller') {
            return NextResponse.json({ error: 'Partner access required' }, { status: 403 });
        }

        // Generate referral code if missing
        let referralCode = user.referralCode;
        if (!referralCode) {
            referralCode = `NS-${session.user.id.slice(0, 8).toUpperCase()}`;
            await prisma.user.update({
                where: { id: session.user.id },
                data: { referralCode },
            });
        }

        // Count referred clients
        const referredClients = await prisma.user.findMany({
            where: { referredBy: referralCode },
            select: {
                id: true,
                clinicName: true,
                email: true,
                createdAt: true,
                uploadBatches: { select: { id: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Calculate commission earnings from referred clients' claims
        const referredUserIds = referredClients.map(c => c.id);
        const commissionData = referredUserIds.length > 0
            ? await prisma.invoice.aggregate({
                _sum: { billerCommission: true },
                where: {
                    status: 'PAID',
                    claim: { batch: { userId: { in: referredUserIds } } },
                },
            })
            : { _sum: { billerCommission: null } };

        const pendingCommission = referredUserIds.length > 0
            ? await prisma.invoice.aggregate({
                _sum: { billerCommission: true },
                where: {
                    status: 'PENDING',
                    claim: { batch: { userId: { in: referredUserIds } } },
                },
            })
            : { _sum: { billerCommission: null } };

        // Total claims from referred clients
        const totalReferredClaims = referredUserIds.length > 0
            ? await prisma.claim.count({
                where: { batch: { userId: { in: referredUserIds } } },
            })
            : 0;

        // Recent payouts (audit log entries for this partner)
        const recentPayouts = await prisma.auditLog.findMany({
            where: {
                action: 'COMMISSION_TRANSFERRED',
                details: { contains: session.user.email },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        return NextResponse.json({
            referralCode,
            referralLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.northstarmedic.com'}/signup?ref=${referralCode}`,
            stripeConnected: !!user.stripeAccountId,
            stats: {
                totalReferrals: referredClients.length,
                totalClaims: totalReferredClaims,
                totalEarned: commissionData._sum.billerCommission || 0,
                pendingCommission: pendingCommission._sum.billerCommission || 0,
            },
            clients: referredClients.map(c => ({
                id: c.id,
                clinicName: c.clinicName,
                email: c.email,
                joinedAt: c.createdAt,
                claimsCount: c.uploadBatches.length,
            })),
            recentPayouts: recentPayouts.map(p => ({
                id: p.id,
                details: p.details,
                date: p.createdAt,
            })),
        });
    } catch (error: any) {
        console.error('[PARTNER] Stats error:', error?.message);
        return NextResponse.json({ error: 'Failed to load partner stats' }, { status: 500 });
    }
}

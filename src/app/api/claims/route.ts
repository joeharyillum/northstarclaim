import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/claims — Returns claims for the authenticated user ONLY.
 * HIPAA isolation: Users can only see their own claims via batch ownership.
 * No PHI leaks to other users or billers.
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const batchId = searchParams.get('batchId');

  const where: any = {
    batch: { userId: session.user.id },
  };
  if (status) where.status = status;
  if (batchId) where.batchId = batchId;

  const claims = await prisma.claim.findMany({
    where,
    include: {
      appeal: { select: { id: true, approvedByClinic: true, generatedAt: true } },
      batch: { select: { fileName: true, createdAt: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  // Aggregate stats
  const totalBilled = claims.reduce((sum, c) => sum + c.billedAmount, 0);
  const recovered = claims.filter(c => c.status === 'RECOVERED' || c.status === 'SETTLED');
  const totalRecovered = recovered.reduce((sum, c) => sum + c.billedAmount, 0);
  const pending = claims.filter(c =>
    ['PENDING_ANALYSIS', 'RECOVERABLE', 'APPEALED', 'QUEUED_FOR_LIVE_NEGOTIATION'].includes(c.status)
  );

  return NextResponse.json({
    success: true,
    data: {
      claims: claims.map(c => ({
        id: c.id,
        patientId: c.patientId,
        cptCode: c.cptCode,
        billedAmount: c.billedAmount,
        denialReason: c.denialReason,
        status: c.status,
        createdAt: c.createdAt,
        hasAppeal: !!c.appeal,
        appealApproved: c.appeal?.approvedByClinic || false,
        batchFile: c.batch.fileName,
      })),
      stats: {
        total: claims.length,
        pending: pending.length,
        recovered: recovered.length,
        totalBilled,
        totalRecovered,
        recoveryRate: claims.length > 0 ? ((recovered.length / claims.length) * 100).toFixed(1) : '0',
      },
    },
  });
}

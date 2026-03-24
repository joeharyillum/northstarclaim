import { NextRequest, NextResponse } from 'next/server';
import { getOwnerSession } from '@/lib/owner-session';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

/**
 * POST /api/claims/generate-appeals
 * 
 * Takes a batchId, finds all PENDING_ANALYSIS claims in that batch,
 * generates appeal letters for each, and saves them to the Appeal model.
 * 
 * This is the CORE revenue engine — appeals are what earn the 30% fee.
 */
export async function POST(req: NextRequest) {
  const session = await getOwnerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { batchId } = body;

  if (!batchId) {
    return NextResponse.json({ error: 'batchId required' }, { status: 400 });
  }

  // HIPAA: Verify the batch belongs to this user
  const batch = await prisma.uploadBatch.findFirst({
    where: { id: batchId, userId: session.user.id },
  });
  if (!batch) {
    return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
  }

  // Get claims that need appeals
  const claims = await prisma.claim.findMany({
    where: { batchId, status: 'PENDING_ANALYSIS' },
  });

  if (claims.length === 0) {
    return NextResponse.json({ success: true, message: 'No pending claims', appealsGenerated: 0 });
  }

  const results = [];

  for (const claim of claims) {
    try {
      // Generate appeal letter with GPT-4
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are an elite healthcare attorney and medical billing expert. Draft a legally bulletproof appeal letter to overturn a medical claim denial.

The letter must include:
1. Formal header with date, patient ID, CPT code, and billed amount
2. Direct demand for reprocessing and payment
3. Medical necessity justification citing CMS guidelines, Medicare LCDs, and NCCI edits
4. Legal citations: ERISA Section 503, ACA prompt payment rules, applicable state insurance regulations
5. Warning of escalation: State DOI complaint, ALJ hearing, bad faith litigation
6. Demand for payment within 30 days
7. Sign off as "NorthStar Medic | AI Appeals Department"

Tone: Professional, firm, authoritative. No fluff.

Respond in JSON:
{
  "appealLetter": "the complete letter text",
  "clinicalJustification": "2-3 sentence medical necessity summary",
  "winProbability": number (0-100),
  "citedRegulations": ["list of cited laws/regulations"]
}`,
          },
          {
            role: 'user',
            content: `Draft an appeal for this denied claim:
- Patient ID: ${claim.patientId}
- CPT Code: ${claim.cptCode}
- Billed Amount: $${claim.billedAmount.toLocaleString()}
- Denial Reason: ${claim.denialReason}
- Date of Service: ${claim.createdAt.toISOString().split('T')[0]}`,
          },
        ],
      });

      const parsed = JSON.parse(response.choices[0].message.content || '{}');

      // Save appeal to database
      await prisma.appeal.create({
        data: {
          claimId: claim.id,
          draftedLetter: parsed.appealLetter || 'Appeal generation failed',
          clinicalJustification: parsed.clinicalJustification || 'See appeal letter',
        },
      });

      // Update claim status
      await prisma.claim.update({
        where: { id: claim.id },
        data: { status: 'RECOVERABLE' },
      });

      results.push({
        claimId: claim.id,
        status: 'appeal_generated',
        winProbability: parsed.winProbability,
      });
    } catch (err: any) {
      console.error(`Appeal generation failed for claim ${claim.id}:`, err.message);
      results.push({ claimId: claim.id, status: 'failed', error: err.message });
    }
  }

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: 'APPEALS_GENERATED',
      details: `Batch ${batchId}: ${results.filter(r => r.status === 'appeal_generated').length}/${claims.length} appeals generated`,
    },
  });

  return NextResponse.json({
    success: true,
    appealsGenerated: results.filter(r => r.status === 'appeal_generated').length,
    total: claims.length,
    results,
  });
}

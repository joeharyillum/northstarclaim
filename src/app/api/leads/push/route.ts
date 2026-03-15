/**
 * Bulk Push Leads to Instantly.ai Campaign
 * 
 * POST: Push leads from DB to Instantly.ai campaign
 *   - Filters by status, source, state
 *   - Generates personalized pitches
 *   - Pushes to Instantly.ai for real email outreach
 * 
 * GET: Get push stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOwnerSession } from '@/lib/owner-session';
import { prisma } from '@/lib/prisma';
import { addLeadsToCampaign, type InstantlyLead } from '@/lib/instantly-client';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function generatePitch(lead: { firstName: string; lastName: string; company: string; title: string }): string {
  const pitches: Record<string, string> = {
    'ceo': `As ${lead.company}'s CEO, denied claims represent your largest controllable revenue leak`,
    'cfo': `As CFO at ${lead.company}, every denied claim sitting unrecovered is cash left on the table`,
    'director': `Your team at ${lead.company} shouldn't spend hours on appeals that AI drafts in seconds`,
    'vp': `${lead.company}'s revenue cycle likely has 6-12% of billings trapped in wrongful denials`,
    'manager': `The billing team at ${lead.company} shouldn't have to spend hours on appeals that AI can draft in seconds`,
    'administrator': `${lead.company}'s bottom line depends on claim recovery — most practices leave 8-15% on the table`,
    'billing': `At ${lead.company}, your billing team deals with denials daily. What if that fight was fully automated?`,
  };

  const titleLower = lead.title.toLowerCase();
  for (const [role, pitch] of Object.entries(pitches)) {
    if (titleLower.includes(role)) return pitch;
  }

  return `At ${lead.company}, denied claims likely represent a significant revenue leak. Our AI recovery engine finds and appeals them automatically — zero upfront cost, we only earn when you recover money.`;
}

export async function POST(request: NextRequest) {
  const session = await getOwnerSession();

  try {
    const body = await request.json();
    const limit = Math.min(body.limit || 100, 500);
    const source = body.source;
    const state = body.state;
    const dryRun = body.dryRun || false;

    // Build filter
    const where: any = { status: 'new', pushedAt: null };
    if (source) where.source = source;
    if (state) where.state = state;

    const leads = await prisma.lead.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'asc' },
    });

    if (leads.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No unpushed leads found matching filters.',
        pushed: 0,
      });
    }

    // Format for Instantly
    const instantlyLeads: InstantlyLead[] = leads.map(lead => ({
      email: lead.email,
      first_name: lead.firstName,
      last_name: lead.lastName,
      company_name: lead.company,
      phone: lead.phone || '',
      custom_variables: {
        title: lead.title,
        city: lead.city,
        state: lead.state,
        industry: lead.industry,
        personalization: generatePitch(lead),
      },
    }));

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        wouldPush: leads.length,
        sample: instantlyLeads.slice(0, 3),
      });
    }

    // Push to Instantly
    const result = await addLeadsToCampaign(instantlyLeads);

    // Mark pushed leads in DB
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID || null;
    await prisma.lead.updateMany({
      where: { id: { in: leads.map(l => l.id) } },
      data: {
        status: 'contacted',
        pushedAt: new Date(),
        campaignId,
      },
    });

    return NextResponse.json({
      success: true,
      pushed: result.leadsAdded,
      skipped: result.leadsSkipped,
      totalProcessed: leads.length,
      campaignId,
    });
  } catch (error: any) {
    console.error('Bulk push error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to push leads' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getOwnerSession();

  const [total, newLeads, contacted, bySource, byState] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: 'new' } }),
    prisma.lead.count({ where: { status: 'contacted' } }),
    prisma.lead.groupBy({ by: ['source'], _count: true }),
    prisma.lead.groupBy({ by: ['state'], _count: true, orderBy: { _count: { state: 'desc' } }, take: 10 }),
  ]);

  return NextResponse.json({
    total,
    new: newLeads,
    contacted,
    readyToPush: newLeads,
    bySource,
    topStates: byState,
  });
}

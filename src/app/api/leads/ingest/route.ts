import { NextRequest, NextResponse } from 'next/server';
import { getOwnerSession } from '@/lib/owner-session';
import { checkRateLimit } from '@/lib/security';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await getOwnerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: max 10 ingestions per minute
  if (!checkRateLimit(session.user.id, 10)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const { leads } = await request.json();

    if (!Array.isArray(leads) || leads.length === 0 || leads.length > 10000) {
      return NextResponse.json(
        { error: 'Invalid leads data. Max 10,000 per batch.' },
        { status: 400 }
      );
    }

    // Format leads for bulk insert
    const formattedLeads = [];
    for (const lead of leads) {
      const email = (lead.email || lead.Email || '').trim().toLowerCase();
      if (!email) continue;
      formattedLeads.push({
        email,
        firstName: lead.firstName || lead.FirstName || lead.first_name || '',
        lastName: lead.lastName || lead.LastName || lead.last_name || '',
        company: lead.company || lead.CompanyName || lead.Company || lead.company_name || '',
        title: lead.title || lead.Title || '',
        city: lead.city || lead.City || '',
        state: lead.state || lead.State || '',
        phone: String(lead.phone || lead.Phone || ''),
        industry: String(lead.industry || lead.Industry || 'Healthcare'),
        source: lead.source || 'csv',
        status: 'new',
        campaignId: lead.campaignId || null,
      });
    }

    const { count } = await prisma.lead.createMany({
        data: formattedLeads,
        skipDuplicates: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Ingested ${count} new leads efficiently in bulk.`,
        inserted: count,
        skipped: leads.length - count,
        total: leads.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Lead ingest error:', error?.message || 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to ingest leads' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getOwnerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [leads, total, contacted, bySource] = await Promise.all([
    prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: 'contacted' } }),
    prisma.lead.groupBy({ by: ['source'], _count: true }),
  ]);

  return NextResponse.json({
    leads,
    stats: { total, contacted, pending: total - contacted },
    bySource,
  });
}
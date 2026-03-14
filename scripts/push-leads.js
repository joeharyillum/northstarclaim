/**
 * Direct Lead Push Script — bypasses web auth, talks to DB + Instantly API directly
 * Usage:
 *   DRY RUN:  node scripts/push-leads.js --dry-run --limit 50
 *   REAL:     node scripts/push-leads.js --limit 50
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const INSTANTLY_V2_BASE = 'https://api.instantly.ai/api/v2';
const API_KEY = process.env.INSTANTLY_API_KEY;
const CAMPAIGN_ID = process.env.INSTANTLY_CAMPAIGN_ID;

// ── Role-based personalized pitch generator ──
function generatePitch(lead) {
  const pitches = {
    ceo: `As ${lead.company}'s CEO, denied claims represent your largest controllable revenue leak`,
    cfo: `As CFO at ${lead.company}, every denied claim sitting unrecovered is cash left on the table`,
    director: `Your team at ${lead.company} shouldn't spend hours on appeals that AI drafts in seconds`,
    vp: `${lead.company}'s revenue cycle likely has 6-12% of billings trapped in wrongful denials`,
    manager: `The billing team at ${lead.company} shouldn't have to spend hours on appeals that AI can draft in seconds`,
    administrator: `${lead.company}'s bottom line depends on claim recovery — most practices leave 8-15% on the table`,
    billing: `At ${lead.company}, your billing team deals with denials daily. What if that fight was fully automated?`,
  };
  const titleLower = (lead.title || '').toLowerCase();
  for (const [role, pitch] of Object.entries(pitches)) {
    if (titleLower.includes(role)) return pitch;
  }
  return `At ${lead.company}, denied claims likely represent a significant revenue leak. Our AI recovery engine finds and appeals them automatically — zero upfront cost, we only earn when you recover money.`;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : 50;

  console.log(`\n${'='.repeat(60)}`);
  console.log(dryRun ? '🔍 DRY RUN MODE — No emails will be sent' : '🚀 LIVE MODE — Real emails will be sent');
  console.log(`Limit: ${limit} leads`);
  console.log(`Campaign: ${CAMPAIGN_ID}`);
  console.log(`${'='.repeat(60)}\n`);

  // Fetch unpushed leads
  const leads = await prisma.lead.findMany({
    where: { status: 'new', pushedAt: null },
    take: limit,
    orderBy: { createdAt: 'asc' },
  });

  console.log(`📊 Found ${leads.length} unpushed leads\n`);

  if (leads.length === 0) {
    console.log('No unpushed leads found. All leads may already be pushed.');
    await prisma['$disconnect']();
    return;
  }

  // Show preview of what we'll push
  console.log('Preview of leads to push:');
  console.log('-'.repeat(90));
  leads.forEach((l, i) => {
    const pitch = generatePitch(l);
    console.log(`  ${i + 1}. ${l.firstName} ${l.lastName} | ${l.title} @ ${l.company}`);
    console.log(`     📧 ${l.email} | 📍 ${l.city}, ${l.state}`);
    console.log(`     💬 "${pitch.substring(0, 80)}..."`);
    console.log('');
  });

  if (dryRun) {
    console.log(`\n✅ DRY RUN COMPLETE — Would push ${leads.length} leads`);
    console.log('Run without --dry-run to send for real.');
    await prisma['$disconnect']();
    return;
  }

  // ── LIVE PUSH ──
  if (!API_KEY) { console.error('❌ INSTANTLY_API_KEY not set'); process.exit(1); }
  if (!CAMPAIGN_ID) { console.error('❌ INSTANTLY_CAMPAIGN_ID not set'); process.exit(1); }

  let added = 0;
  let skipped = 0;

  for (const lead of leads) {
    const pitch = generatePitch(lead);
    const payload = {
      email: lead.email,
      first_name: lead.firstName,
      last_name: lead.lastName,
      company_name: lead.company,
      phone: lead.phone || '',
      campaign: CAMPAIGN_ID,
      skip_if_in_workspace: true,
      custom_variables: {
        title: lead.title,
        city: lead.city,
        state: lead.state,
        industry: lead.industry || 'Healthcare',
        personalization: pitch,
      },
    };

    try {
      const response = await fetch(`${INSTANTLY_V2_BASE}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (errorText.includes('already exists') || response.status === 409) {
          skipped++;
        } else {
          console.warn(`  ⚠️ ${lead.email}: ${response.status} - ${errorText.substring(0, 100)}`);
          skipped++;
        }
      } else {
        added++;
        process.stdout.write(`  ✅ ${added}/${leads.length} pushed: ${lead.email}\r`);
      }

      // Throttle 150ms between requests
      await new Promise(r => setTimeout(r, 150));
    } catch (err) {
      console.error(`  ❌ ${lead.email}: ${err.message}`);
      skipped++;
    }
  }

  console.log(`\n\n📬 Push complete: ${added} added, ${skipped} skipped`);

  // Mark pushed leads in DB
  if (added > 0) {
    const pushedEmails = leads.slice(0, added).map(l => l.id);
    await prisma.lead.updateMany({
      where: { id: { in: leads.map(l => l.id) } },
      data: { status: 'contacted', pushedAt: new Date(), campaignId: CAMPAIGN_ID },
    });
    console.log(`📝 Marked ${leads.length} leads as "contacted" in database`);
  }

  await prisma['$disconnect']();
}

main().catch(e => { console.error(e); process.exit(1); });

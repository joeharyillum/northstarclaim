/**
 * EMERGENCY DIRECT SEND — Bypass Instantly, send via SendGrid
 * Sends personalized emails to highest-value leads RIGHT NOW
 */
process.chdir(__dirname);
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = 'joe@northstarclaim.com'; // Domain authenticated in SendGrid
const FROM_NAME = 'Joe Hary — NorthStar Claim AI';
const REPLY_TO = 'joehary@northstarmedic.com';

const BATCH_SIZE = 50; // Conservative first batch — stay off spam radar
const DELAY_MS = 2000; // 2 seconds between sends

function personalize(lead) {
    const t = (lead.title || '').toLowerCase();
    const c = lead.company || 'your organization';
    if (t.includes('ceo') || t.includes('president') || t.includes('owner'))
        return `As ${c}'s leader, you know denied claims are your largest controllable revenue leak.`;
    if (t.includes('cfo') || t.includes('finance') || t.includes('vp'))
        return `As a finance leader at ${c}, every denied claim sitting unrecovered is cash left on the table.`;
    if (t.includes('director') || t.includes('medical'))
        return `At ${c}, our AI catches the 5-10% of complex denials that slip past human billers — found money.`;
    if (t.includes('billing') || t.includes('revenue'))
        return `Your revenue cycle at ${c} likely has 6-12% of billings trapped in wrongful denials.`;
    if (t.includes('manager') || t.includes('admin'))
        return `${c}'s bottom line depends on claim recovery — most practices leave 8-15% on the table.`;
    return `At ${c}, denied claims likely represent a significant revenue leak.`;
}

function buildEmail(lead) {
    const firstName = lead.firstName || 'there';
    const company = lead.company || 'your organization';
    const hook = personalize(lead);

    const subject = `Recovering denied claims for ${company}`;
    const html = `
<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333;">
  <p>Hi ${firstName},</p>
  <p>${hook}</p>
  <p>We built an AI that reads denial letters, writes clinical rebuttals, and resubmits — on autopilot. 
  We only charge 30% of what we recover. <strong>If we recover nothing, you pay nothing.</strong></p>
  <p>Would a free 48-hour pilot on your hardest denials be worth 15 minutes of your time?</p>
  <p>Just reply to this email and I'll set it up personally.</p>
  <p>Best,<br/>
  Joe Hary<br/>
  <em>NorthStar Claim AI</em><br/>
  <a href="https://www.northstarmedic.com">www.northstarmedic.com</a></p>
</div>
<div style="font-size: 11px; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
  <p>NorthStar Medical Solutions | This is a one-time outreach email.<br/>
  If you'd prefer not to hear from us, simply reply with "unsubscribe" and we'll remove you immediately.</p>
</div>`.trim();

    const text = `Hi ${firstName},\n\n${hook}\n\nWe built an AI that reads denial letters, writes clinical rebuttals, and resubmits — on autopilot. We only charge 30% of what we recover. If we recover nothing, you pay nothing.\n\nWould a free 48-hour pilot on your hardest denials be worth 15 minutes of your time?\n\nJust reply to this email and I'll set it up personally.\n\nBest,\nJoe Hary\nNorthStar Claim AI\nhttps://www.northstarmedic.com\n\n---\nNorthStar Medical Solutions | Reply "unsubscribe" to opt out.`;

    return { subject, html, text };
}

async function sendEmail(lead) {
    const { subject, html, text } = buildEmail(lead);

    const payload = {
        personalizations: [{ to: [{ email: lead.email, name: `${lead.firstName || ''} ${lead.lastName || ''}`.trim() }] }],
        from: { email: FROM_EMAIL, name: FROM_NAME },
        reply_to: { email: REPLY_TO, name: FROM_NAME },
        subject,
        content: [
            { type: 'text/plain', value: text },
            { type: 'text/html', value: html },
        ],
        tracking_settings: {
            click_tracking: { enable: false }, // No click tracking = less spammy
            open_tracking: { enable: false },
        },
    };

    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        },
        body: JSON.stringify(payload),
    });

    if (res.status === 202) return true;
    const err = await res.text();
    console.error(`  FAIL ${lead.email}: ${res.status} - ${err.slice(0, 150)}`);
    return false;
}

async function run() {
    console.log('=== EMERGENCY DIRECT SEND ===');
    console.log(`Sending from: ${FROM_EMAIL}`);
    console.log(`Batch size: ${BATCH_SIZE}\n`);

    // Get highest-value leads: C-suite first, then directors, then managers
    const leads = await prisma.lead.findMany({
        where: {
            OR: [
                { title: { contains: 'CEO', mode: 'insensitive' } },
                { title: { contains: 'CFO', mode: 'insensitive' } },
                { title: { contains: 'President', mode: 'insensitive' } },
                { title: { contains: 'Owner', mode: 'insensitive' } },
                { title: { contains: 'Director', mode: 'insensitive' } },
                { title: { contains: 'VP', mode: 'insensitive' } },
                { title: { contains: 'Administrator', mode: 'insensitive' } },
                { title: { contains: 'Manager', mode: 'insensitive' } },
            ],
        },
        select: {
            id: true, email: true, firstName: true, lastName: true,
            company: true, title: true, status: true,
        },
        take: BATCH_SIZE,
    });

    console.log(`Found ${leads.length} high-value leads\n`);

    if (leads.length === 0) {
        // Fallback: take any leads
        const fallback = await prisma.lead.findMany({
            select: { id: true, email: true, firstName: true, lastName: true, company: true, title: true },
            take: BATCH_SIZE,
        });
        leads.push(...fallback);
        console.log(`Fallback: ${fallback.length} leads\n`);
    }

    let sent = 0;
    let failed = 0;

    for (const lead of leads) {
        try {
            const ok = await sendEmail(lead);
            if (ok) {
                sent++;
                console.log(`  ✓ ${sent}/${leads.length} → ${lead.email} (${lead.title} @ ${lead.company})`);
                // Mark as contacted
                await prisma.lead.update({
                    where: { id: lead.id },
                    data: { status: 'contacted', pushedAt: new Date() },
                });
            } else {
                failed++;
            }
        } catch (e) {
            failed++;
            console.error(`  ✗ ${lead.email}: ${e.message}`);
        }

        // Rate limit
        await new Promise(r => setTimeout(r, DELAY_MS));
    }

    console.log(`\n=== RESULTS ===`);
    console.log(`Sent: ${sent}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total: ${sent + failed}`);

    await prisma.$disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });

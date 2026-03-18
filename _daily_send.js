/**
 * DAILY AUTO-SENDER — Runs once per day, sends up to 95 leads (staying under 100 free limit)
 * Set up via Windows Task Scheduler to run automatically
 */
process.chdir(__dirname);
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = 'joe@northstarclaim.com';
const FROM_NAME = 'Joe Hary — NorthStar Claim AI';
const REPLY_TO = 'joe@northstarclaim.com'; // Routes through SendGrid inbound parse → AI auto-reply webhook
const DAILY_LIMIT = 95; // Stay under 100 free limit
const DELAY_MS = 1500;
const LOG_FILE = __dirname + '/_send_log.txt';

function log(msg) {
    const line = `[${new Date().toISOString()}] ${msg}`;
    console.log(line);
    fs.appendFileSync(LOG_FILE, line + '\n');
}

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

async function sendOne(lead) {
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
  <p>Best,<br/>Joe Hary<br/><em>NorthStar Claim AI</em><br/>
  <a href="https://www.northstarmedic.com">www.northstarmedic.com</a></p>
</div>
<div style="font-size: 11px; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
  <p>NorthStar Medical Solutions | This is a one-time outreach email.<br/>
  If you'd prefer not to hear from us, simply reply with "unsubscribe" and we'll remove you immediately.</p>
</div>`.trim();

    const text = `Hi ${firstName},\n\n${hook}\n\nWe built an AI that reads denial letters, writes clinical rebuttals, and resubmits — on autopilot. We only charge 30% of what we recover. If we recover nothing, you pay nothing.\n\nWould a free 48-hour pilot on your hardest denials be worth 15 minutes of your time?\n\nJust reply to this email and I'll set it up personally.\n\nBest,\nJoe Hary\nNorthStar Claim AI\nhttps://www.northstarmedic.com\n\n---\nReply "unsubscribe" to opt out.`;

    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SENDGRID_API_KEY}` },
        body: JSON.stringify({
            personalizations: [{ to: [{ email: lead.email, name: `${lead.firstName || ''} ${lead.lastName || ''}`.trim() }] }],
            from: { email: FROM_EMAIL, name: FROM_NAME },
            reply_to: { email: REPLY_TO, name: FROM_NAME },
            subject,
            content: [{ type: 'text/plain', value: text }, { type: 'text/html', value: html }],
            tracking_settings: { click_tracking: { enable: false }, open_tracking: { enable: false } },
        }),
    });

    if (res.status === 202) return true;
    if (res.status === 429 || res.status === 403) {
        const err = await res.text();
        if (err.includes('exceeded')) { log('DAILY LIMIT HIT — stopping'); return 'limit'; }
    }
    return false;
}

async function run() {
    log('=== DAILY AUTO-SEND STARTING ===');

    const remaining = await prisma.lead.findMany({
        where: { status: { notIn: ['contacted', 'replied', 'failed'] } },
        select: { id: true, email: true, firstName: true, lastName: true, company: true, title: true },
        take: DAILY_LIMIT,
    });

    log(`Leads to send today: ${remaining.length}`);
    if (remaining.length === 0) { log('ALL LEADS SENT! No more remaining.'); await prisma.$disconnect(); return; }

    let sent = 0, failed = 0;

    for (const lead of remaining) {
        const result = await sendOne(lead);
        if (result === 'limit') break;
        if (result) {
            sent++;
            await prisma.lead.update({ where: { id: lead.id }, data: { status: 'contacted', pushedAt: new Date() } });
            log(`✓ ${sent} → ${lead.email} (${lead.title || 'no title'} @ ${lead.company || 'unknown'})`);
        } else {
            failed++;
        }
        await new Promise(r => setTimeout(r, DELAY_MS));
    }

    const totalRemaining = await prisma.lead.count({ where: { status: { notIn: ['contacted', 'replied', 'failed'] } } });
    log(`=== TODAY DONE: Sent ${sent} | Failed ${failed} | Still remaining: ${totalRemaining} ===\n`);
    await prisma.$disconnect();
}

run().catch(e => { log(`ERROR: ${e.message}`); process.exit(1); });

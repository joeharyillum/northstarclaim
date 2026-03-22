require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = 'joe@northstarclaim.com'; 
const FROM_NAME = 'Joe Hary — NorthStar Medic';
const REPLY_TO = 'joe@northstarclaim.com'; 

async function sendWhaleEmail(lead) {
    const firstName = lead.firstName || 'there';
    const company = lead.company || 'your organization';
    const title = lead.title || 'executive';
    
    const subject = `Recovering denied claims for ${company}`;
    
    // High-level enterprise pitch customized for whales
    const html = `
<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333;">
  <p>Hi ${firstName},</p>
  <p>As ${title} at ${company}, you know denied claims are likely your largest controllable revenue leak.</p>
  <p>We built an enterprise AI engine that reads denial letters, writes clinical rebuttals referencing specific payer guidelines, and resubmits — on autopilot.</p>
  <p>We only charge a percentage of what we successfully recover. <strong>If we recover nothing, you pay nothing.</strong></p>
  <p>Would a free 48-hour pilot on a batch of your hardest denials be worth 15 minutes of your time?</p>
  <p>Just reply to this email to coordinate.</p>
  <p>Best,<br/>Joe Hary<br/><em>NorthStar Medic</em><br/>
  <a href="https://www.northstarmedic.com">www.northstarmedic.com</a></p>
</div>
<div style="font-size: 11px; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
  <p>NorthStar Medical Solutions | This is a one-time outreach email.<br/>
  If you'd prefer not to hear from us, simple reply with "unsubscribe".</p>
</div>`.trim();

    const text = `Hi ${firstName},\n\nAs ${title} at ${company}, you know denied claims are likely your largest controllable revenue leak.\n\nWe built an enterprise AI engine that reads denial letters, writes clinical rebuttals referencing specific payer guidelines, and resubmits — on autopilot.\n\nWe only charge a percentage of what we successfully recover. If we recover nothing, you pay nothing.\n\nWould a free 48-hour pilot on a batch of your hardest denials be worth 15 minutes of your time?\n\nJust reply to this email to coordinate.\n\nBest,\nJoe Hary\nNorthStar Medic\nhttps://www.northstarmedic.com`;

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

    if (res.status === 202) return 'success';
    if (res.status === 429 || res.status === 403) return 'limit';
    
    const err = await res.text();
    console.error(`Failed for ${lead.email}: ${res.status} - ${err}`);
    return 'error';
}

async function blastWhales() {
    console.log('🚀 INITIATING SENDGRID DIRECT WHALE BLAST (Bypassing Instantly)');
    
    // Get up to 100 whales that haven't been contacted via this mechanism yet
    const whales = await prisma.lead.findMany({
        where: { 
            source: 'whale_target',
            status: { in: ['new', 'contacted'] } // Even if we marked them contacted by Instantly earlier, Instantly failed to send.
        },
        take: 100
    });
    
    console.log(`Found ${whales.length} whales in database. Blasting now...`);
    
    let sent = 0;
    let failed = 0;
    
    for (const whale of whales) {
        console.log(`Sending to: ${whale.email} (${whale.company})...`);
        const result = await sendWhaleEmail(whale);
        
        if (result === 'limit') {
            console.log('\n🛑 SENDGRID DAILY LIMIT HIT (100/day). Stopping blast.');
            break;
        } else if (result === 'success') {
            sent++;
            // Update status in db so we don't double send tomorrow
            await prisma.lead.update({
                where: { id: whale.id },
                data: { status: 'sent_via_sendgrid' }
            });
        } else {
            failed++;
        }
        
        // Wait sending 1.5s between emails to prevent rate limiting
        await new Promise(r => setTimeout(r, 1500));
    }
    
    console.log(`\n✅ DONE: Successfully sent ${sent} emails via SendGrid.`);
    if (failed > 0) console.log(`❌ Failed: ${failed}`);
    await prisma.$disconnect();
}

blastWhales().catch(console.error);

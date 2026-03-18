require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    // DB status
    const dbCount = await prisma.lead.count();
    const byStatus = await prisma.lead.groupBy({ by: ['status'], _count: true });
    console.log('=== DATABASE ===');
    console.log('Total leads:', dbCount);
    byStatus.forEach(s => console.log(`  ${s.status}: ${s._count}`));

    // Check Instantly campaign
    const API_KEY = process.env.INSTANTLY_API_KEY;
    const CAMPAIGN_ID = process.env.INSTANTLY_CAMPAIGN_ID;

    const res = await fetch(`https://api.instantly.ai/api/v2/campaigns/${CAMPAIGN_ID}`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` },
    });
    const campaign = await res.json();
    console.log('\n=== INSTANTLY CAMPAIGN ===');
    console.log('Name:', campaign.name);
    console.log('Status:', campaign.status, campaign.status === 1 ? '(ACTIVE)' : '(PAUSED)');

    // Check emails endpoint for sent count
    const emailsRes = await fetch(`https://api.instantly.ai/api/v2/emails?campaign_id=${CAMPAIGN_ID}&limit=5`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` },
    });
    const emails = await emailsRes.json();
    console.log('\n=== EMAILS SENT ===');
    if (emails.items) {
        console.log('Total sent:', emails.items.length);
        emails.items.forEach(e => console.log(`  to: ${e.to_email} | sent: ${e.timestamp || e.sent_at}`));
    } else {
        console.log(JSON.stringify(emails).substring(0, 300));
    }

    // Try listing leads still in Instantly
    const leadsRes = await fetch('https://api.instantly.ai/api/v2/leads/list', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: CAMPAIGN_ID, limit: 5 }),
    });
    const leadsData = await leadsRes.json();
    console.log('\n=== LEADS IN INSTANTLY ===');
    if (leadsData.items) {
        console.log('Returned:', leadsData.items.length, '| Total:', leadsData.total_count || 'unknown');
        leadsData.items.forEach(l => console.log(`  ${l.email} | status=${l.lead_status || l.status}`));
    } else {
        console.log(JSON.stringify(leadsData).substring(0, 300));
    }

    // Check sending account
    const acctRes = await fetch('https://api.instantly.ai/api/v2/accounts?limit=5', {
        headers: { 'Authorization': `Bearer ${API_KEY}` },
    });
    const accts = await acctRes.json();
    console.log('\n=== SENDING ACCOUNTS ===');
    if (accts.items) {
        accts.items.forEach(a => console.log(`  ${a.email} | status=${a.status} | daily_limit=${a.daily_limit || 'N/A'}`));
    }

    await prisma.$disconnect();
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });

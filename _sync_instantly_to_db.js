/**
 * Sync leads from Instantly campaign back into the database
 * Pulls in batches of 100, uses createMany for speed
 */
process.chdir(__dirname);
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const API_KEY = process.env.INSTANTLY_API_KEY;
const CAMPAIGN_ID = process.env.INSTANTLY_CAMPAIGN_ID;

async function fetchLeadsBatch(startingAfter) {
    const body = { campaign_id: CAMPAIGN_ID, limit: 100 };
    if (startingAfter) body.starting_after = startingAfter;

    const res = await fetch('https://api.instantly.ai/api/v2/leads/list', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`API ${res.status}: ${text}`);
    }

    return res.json();
}

function mapToDbLead(lead) {
    return {
        email: lead.email,
        firstName: lead.first_name || '',
        lastName: lead.last_name || '',
        company: lead.company_name || '',
        title: lead.title || '',
        city: lead.city || '',
        state: lead.state || '',
        phone: lead.phone || '',
        industry: 'Healthcare',
        source: 'instantly_sync',
        status: 'new',
        campaignId: CAMPAIGN_ID,
        pushedAt: new Date(),
    };
}

async function run() {
    let startingAfter = null;
    let totalSynced = 0;
    let totalSkipped = 0;
    let page = 0;

    console.log('Starting Instantly -> DB sync...');
    console.log('Campaign:', CAMPAIGN_ID);

    while (true) {
        page++;
        let data;
        try {
            data = await fetchLeadsBatch(startingAfter);
        } catch (e) {
            if (e.message.includes('429')) {
                console.log('Rate limited, waiting 5s...');
                await new Promise(r => setTimeout(r, 5000));
                continue;
            }
            console.error(`Error page ${page}: ${e.message}`);
            break;
        }

        const items = (data.items || []).filter(l => l.email);
        if (items.length === 0) break;

        // Bulk insert, skip duplicates
        try {
            const result = await prisma.lead.createMany({
                data: items.map(mapToDbLead),
                skipDuplicates: true,
            });
            totalSynced += result.count;
            totalSkipped += items.length - result.count;
            console.log(`Page ${page}: +${result.count} synced, ${items.length - result.count} dupes (total: ${totalSynced})`);
        } catch (e) {
            console.error(`DB error page ${page}: ${e.message}`);
        }

        if (items.length < 100 || !data.next_starting_after) break;
        startingAfter = data.next_starting_after;

        await new Promise(r => setTimeout(r, 250));
    }

    const dbCount = await prisma.lead.count();
    console.log(`\n=== SYNC COMPLETE ===`);
    console.log(`Synced: ${totalSynced}`);
    console.log(`Skipped: ${totalSkipped}`);
    console.log(`DB total: ${dbCount}`);

    await prisma.$disconnect();
}

run().catch(e => { console.error(e.message); process.exit(1); });

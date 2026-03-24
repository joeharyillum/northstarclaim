/**
 * TURBO SYNC — Fastest possible Instantly → DB sync
 * Streams pages, dedupes in memory, bulk inserts
 */
process.chdir(__dirname);
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const API_KEY = process.env.INSTANTLY_API_KEY;
const CAMPAIGN_ID = process.env.INSTANTLY_CAMPAIGN_ID;

async function run() {
    const prisma = new PrismaClient();

    // Get existing emails from DB to skip them
    const existing = await prisma.lead.findMany({ select: { email: true } });
    const existingSet = new Set(existing.map(e => e.email.toLowerCase()));
    console.log(`DB already has ${existingSet.size} leads — will skip these`);

    // Stream from Instantly, dedupe in memory, collect new leads
    const seen = new Set();
    let newLeads = [];
    let startingAfter = null;
    let page = 0;
    let totalFetched = 0;

    while (true) {
        page++;
        const body = { campaign_id: CAMPAIGN_ID, limit: 100 };
        if (startingAfter) body.starting_after = startingAfter;

        const res = await fetch('https://api.instantly.ai/api/v2/leads/list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            if (res.status === 429) {
                console.log('Rate limited, waiting 3s...');
                await new Promise(r => setTimeout(r, 3000));
                continue;
            }
            console.log(`API error ${res.status}, stopping`);
            break;
        }

        const data = await res.json();
        const items = (data.items || []).filter(l => l.email);
        totalFetched += items.length;

        for (const lead of items) {
            const email = lead.email.toLowerCase();
            if (!existingSet.has(email) && !seen.has(email)) {
                seen.add(email);
                newLeads.push({
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
                });
            }
        }

        // Bulk insert every 5000 new leads to keep memory manageable
        if (newLeads.length >= 5000) {
            const result = await prisma.lead.createMany({ data: newLeads, skipDuplicates: true });
            console.log(`Page ${page} | Fetched: ${totalFetched} | Inserted: ${result.count} batch | New unique: ${seen.size}`);
            newLeads = [];
        } else if (page % 50 === 0) {
            console.log(`Page ${page} | Fetched: ${totalFetched} | Queued: ${newLeads.length} | New unique: ${seen.size}`);
        }

        if (items.length < 100 || !data.next_starting_after) break;
        startingAfter = data.next_starting_after;

        // Minimal delay — just enough to avoid rate limits
        await new Promise(r => setTimeout(r, 100));
    }

    // Final insert of remaining
    if (newLeads.length > 0) {
        const result = await prisma.lead.createMany({ data: newLeads, skipDuplicates: true });
        console.log(`Final batch inserted: ${result.count}`);
    }

    const total = await prisma.lead.count();
    console.log(`\n=== DONE ===`);
    console.log(`Fetched: ${totalFetched} from Instantly`);
    console.log(`New unique: ${seen.size}`);
    console.log(`DB total: ${total}`);

    await prisma.$disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });

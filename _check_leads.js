require('dotenv').config();
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const API_KEY = process.env.INSTANTLY_API_KEY;
const CAMPAIGN_ID = process.env.INSTANTLY_CAMPAIGN_ID;

// Load fake emails for comparison
const fakeEmails = new Set(
    fs.existsSync('_fake_emails.json')
        ? JSON.parse(fs.readFileSync('_fake_emails.json', 'utf-8'))
        : []
);

async function run() {
    // Check DB
    const dbLeads = await prisma.lead.findMany();
    console.log(`=== DATABASE ===`);
    console.log(`DB leads: ${dbLeads.length}`);
    dbLeads.forEach(l => console.log(`  ${l.email}`));

    // Check Instantly - paginate through all leads
    console.log(`\n=== INSTANTLY CAMPAIGN ===`);
    console.log(`Campaign ID: ${CAMPAIGN_ID}`);
    let allLeads = [];
    let startingAfter = null;
    let page = 0;

    while (true) {
        page++;
        const body = { campaign_id: CAMPAIGN_ID, limit: 100 };
        if (startingAfter) body.starting_after = startingAfter;

        console.log(`Fetching page ${page}...`);
        try {
            const res = await fetch('https://api.instantly.ai/api/v2/leads/list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`,
                },
                body: JSON.stringify(body),
            });

            const text = await res.text();
            if (!res.ok) {
                console.log(`API error on page ${page}: ${res.status} ${text}`);
                break;
            }

            let data;
            try { data = JSON.parse(text); } catch(e) { console.log('Bad JSON:', text.slice(0,200)); break; }
            const items = data.items || [];
            console.log(`  Got ${items.length} leads on page ${page}`);
            allLeads.push(...items);

            if (items.length < 100 || !data.next_starting_after) break;
            startingAfter = data.next_starting_after;

            // Small delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 200));
        } catch (e) {
            console.log(`Error on page ${page}: ${e.message}`);
            break;
        }
    }

    console.log(`Total Instantly leads: ${allLeads.length}`);

    // Separate real vs fake
    const realLeads = allLeads.filter(l => !fakeEmails.has(l.email));
    const fakeInInstantly = allLeads.filter(l => fakeEmails.has(l.email));

    console.log(`\n=== BREAKDOWN ===`);
    console.log(`Fake leads still in Instantly: ${fakeInInstantly.length}`);
    console.log(`REAL leads in Instantly: ${realLeads.length}`);

    if (realLeads.length > 0) {
        console.log(`\n=== REAL LEADS (DO NOT DELETE) ===`);
        realLeads.forEach(l => console.log(`  ${l.email} | ${l.first_name || ''} ${l.last_name || ''} | ${l.company_name || ''}`));
    }

    await prisma.$disconnect();
}

run().catch(e => { console.error(e.message); process.exit(1); });

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

const INSTANTLY_API = 'https://api.instantly.ai/api/v2';
const API_KEY = process.env.INSTANTLY_API_KEY;
const CAMPAIGN_ID = process.env.INSTANTLY_CAMPAIGN_ID;
const BATCH_SIZE = 5000;

// Whale = C-suite, VP, Director, President, Administrator
const WHALE_KEYWORDS = ['CEO', 'CFO', 'CTO', 'CMO', 'VP', 'Vice President', 'Director', 'Chief', 'President', 'Administrator'];

function isWhale(title) {
    if (!title) return false;
    const t = title.toLowerCase();
    return WHALE_KEYWORDS.some(k => t.includes(k.toLowerCase()));
}

function generatePitch(lead) {
    const pitches = {
        'ceo': `As ${lead.company}'s CEO, denied claims are your largest controllable revenue leak — our AI recovers them automatically.`,
        'cfo': `As CFO at ${lead.company}, every denied claim sitting unrecovered is cash left on the table. Our AI fixes that.`,
        'vp': `As a VP at ${lead.company}, you know revenue cycle leaks cost millions. Our AI recovers denied claims at 35-40% success.`,
        'director': `As Director at ${lead.company}, your team shouldn't spend hours on appeals that AI can draft in seconds.`,
        'president': `At ${lead.company}, denied claims likely represent 8-15% of revenue left unrecovered. Our AI changes that.`,
        'administrator': `${lead.company}'s bottom line depends on claim recovery — our AI finds and appeals denied claims automatically.`,
    };
    const t = (lead.title || '').toLowerCase();
    for (const [role, pitch] of Object.entries(pitches)) {
        if (t.includes(role)) return pitch;
    }
    return `At ${lead.company}, denied claims likely represent significant lost revenue. Our AI recovery engine appeals them automatically — zero upfront cost, we only earn when you recover money.`;
}

async function pushToInstantly(lead) {
    const payload = {
        email: lead.email,
        first_name: lead.firstName,
        last_name: lead.lastName,
        company_name: lead.company,
        campaign: CAMPAIGN_ID,
        skip_if_in_workspace: true,
        custom_variables: {
            personalization: generatePitch(lead),
            title: lead.title,
            state: lead.state,
        },
    };
    const res = await fetch(`${INSTANTLY_API}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
        body: JSON.stringify(payload),
    });
    return res.ok;
}

(async () => {
    console.log('=== WHALE LEAD PUSH — 500 BATCH ===');
    console.log(`Campaign: ${CAMPAIGN_ID}`);
    console.log(`API Key: ${API_KEY ? API_KEY.substring(0, 8) + '...' : 'MISSING'}`);

    if (!API_KEY || !CAMPAIGN_ID) {
        console.error('MISSING: INSTANTLY_API_KEY or INSTANTLY_CAMPAIGN_ID');
        process.exit(1);
    }

    // Pull unpushed leads, prioritize whales
    const allLeads = await p.lead.findMany({
        where: { status: 'new', pushedAt: null },
        select: { id: true, firstName: true, lastName: true, email: true, company: true, title: true, state: true },
        take: 10000,
    });

    // Sort: whales first
    const whales = allLeads.filter(l => isWhale(l.title));
    const others = allLeads.filter(l => !isWhale(l.title));
    const sorted = [...whales, ...others];
    const batch = sorted.slice(0, BATCH_SIZE);

    console.log(`\nFound ${whales.length} whale leads, ${others.length} others`);
    console.log(`Sending top ${batch.length} (${batch.filter(l => isWhale(l.title)).length} whales first)\n`);

    let added = 0, skipped = 0;
    for (let i = 0; i < batch.length; i++) {
        const lead = batch[i];
        try {
            const ok = await pushToInstantly(lead);
            if (ok) {
                added++;
                // Mark as pushed in DB
                await p.lead.update({ where: { id: lead.id }, data: { status: 'contacted', pushedAt: new Date() } });
            } else {
                skipped++;
            }
        } catch (e) {
            skipped++;
        }

        if ((i + 1) % 50 === 0) {
            console.log(`  Progress: ${i + 1}/${batch.length} | Added: ${added} | Skipped: ${skipped}`);
        }

        // 50ms throttle for rate limits
        await new Promise(r => setTimeout(r, 50));
    }

    console.log(`\n=== COMPLETE ===`);
    console.log(`Added: ${added}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Total processed: ${added + skipped}`);

    await p.$disconnect();
})();

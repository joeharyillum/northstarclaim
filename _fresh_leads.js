/**
 * FRESH LEAD ENGINE — Fetch from Apollo + Push to Instantly + Save to DB
 * Pulls 5000 fresh healthcare leads across multiple pages
 */
process.chdir(__dirname);
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const APOLLO_API_KEY = process.env.APOLLO_API_KEY;
const INSTANTLY_API_KEY = process.env.INSTANTLY_API_KEY;
const CAMPAIGN_ID = process.env.INSTANTLY_CAMPAIGN_ID;

const TARGET = 5000;
const APOLLO_PER_PAGE = 100;
const STATES = ['Florida', 'Texas', 'California', 'New York', 'Illinois', 'Pennsylvania', 'Ohio', 'Georgia', 'North Carolina', 'Michigan'];
const TITLES = [
    'CEO', 'CFO', 'Chief Financial Officer', 'Medical Director',
    'Practice Manager', 'Revenue Cycle Manager', 'Billing Manager',
    'Director of Revenue Cycle', 'VP Finance', 'Office Manager',
    'Administrator', 'COO', 'Director of Finance',
];
const INDUSTRIES = [
    'hospital & health care', 'medical practice',
    'health, wellness and fitness',
];

// Pain-point personalization by role
function personalize(lead) {
    const t = (lead.title || '').toLowerCase();
    const c = lead.company || 'your organization';
    if (t.includes('ceo')) return `As ${c}'s CEO, you know denied claims are your largest controllable revenue leak.`;
    if (t.includes('cfo') || t.includes('finance')) return `As CFO at ${c}, every denied claim sitting unrecovered is cash left on the table.`;
    if (t.includes('director') || t.includes('medical')) return `At ${c}, our AI catches the 5-10% of complex denials that slip past human billers — found money.`;
    if (t.includes('billing') || t.includes('revenue')) return `Your revenue cycle at ${c} likely has 6-12% of billings trapped in wrongful denials.`;
    if (t.includes('manager') || t.includes('admin')) return `${c}'s bottom line depends on claim recovery — most practices leave 8-15% on the table.`;
    return `At ${c}, denied claims likely represent a significant revenue leak. Our AI recovery engine finds and appeals them automatically — zero upfront cost.`;
}

async function fetchFromApollo(stateIdx, page) {
    const state = STATES[stateIdx % STATES.length];
    const body = {
        api_key: APOLLO_API_KEY,
        per_page: APOLLO_PER_PAGE,
        page,
        q_organization_keyword_tags: INDUSTRIES,
        person_titles: TITLES,
        person_locations: [state],
        contact_email_status: ['verified', 'guessed', 'likely'],
    };

    const res = await fetch('https://api.apollo.io/api/v1/mixed_people/api_search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Api-Key': APOLLO_API_KEY },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Apollo ${res.status}: ${txt.slice(0, 200)}`);
    }

    const data = await res.json();
    return (data.people || [])
        .filter(p => p.email)
        .map(p => ({
            email: p.email,
            firstName: p.first_name || '',
            lastName: p.last_name || '',
            title: p.title || '',
            company: p.organization?.name || '',
            city: p.city || '',
            state: p.state || '',
            phone: p.phone_numbers?.[0]?.sanitized_number || '',
            domain: p.organization?.primary_domain || '',
            industry: p.organization?.industry || 'Healthcare',
            employeeCount: p.organization?.estimated_num_employees || 0,
        }));
}

async function pushToInstantly(leads) {
    // Use bulk endpoint
    const payload = leads.map(l => ({
        email: l.email,
        first_name: l.firstName,
        last_name: l.lastName,
        company_name: l.company,
        phone: l.phone,
        website: l.domain ? `https://${l.domain}` : '',
        custom_variables: {
            title: l.title,
            city: l.city,
            state: l.state,
            personalization: personalize(l),
        },
    }));

    const res = await fetch('https://api.instantly.ai/api/v2/leads', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
        },
        body: JSON.stringify({
            campaign: CAMPAIGN_ID,
            skip_if_in_workspace: true,
            leads: payload,
        }),its north
    });

    if (!res.ok) {
        // Try single-push fallback
        let added = 0;
        for (const lead of payload) {
            try {
                const r2 = await fetch('https://api.instantly.ai/api/v2/leads', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
                    },
                    body: JSON.stringify({ ...lead, campaign: CAMPAIGN_ID, skip_if_in_workspace: true }),
                });
                if (r2.ok) added++;
                await new Promise(r => setTimeout(r, 50));
            } catch {}
        }
        return added;
    }

    const data = await res.json();
    return data.leads_added || data.count || leads.length;
}

async function saveToDb(leads) {
    const result = await prisma.lead.createMany({
        data: leads.map(l => ({
            email: l.email,
            firstName: l.firstName,
            lastName: l.lastName,
            company: l.company,
            title: l.title,
            city: l.city,
            state: l.state,
            phone: l.phone,
            industry: l.industry || 'Healthcare',
            source: 'apollo',
            status: 'new',
            campaignId: CAMPAIGN_ID,
            pushedAt: new Date(),
        })),
        skipDuplicates: true,
    });
    return result.count;
}

async function run() {
    console.log(`=== FRESH LEAD ENGINE ===`);
    console.log(`Target: ${TARGET} leads across ${STATES.length} states`);
    console.log(`Campaign: ${CAMPAIGN_ID}\n`);

    // Load existing emails to dedupe
    const existing = await prisma.lead.findMany({ select: { email: true } });
    const existingEmails = new Set(existing.map(e => e.email.toLowerCase()));
    console.log(`Existing DB leads: ${existingEmails.size}\n`);

    let totalFetched = 0;
    let totalPushed = 0;
    let totalSaved = 0;
    let stateIdx = 0;
    let page = 1;
    const seenEmails = new Set();

    while (totalPushed < TARGET) {
        try {
            // Fetch from Apollo
            const leads = await fetchFromApollo(stateIdx, page);
            if (leads.length === 0) {
                console.log(`  No more leads for ${STATES[stateIdx % STATES.length]} page ${page}, next state...`);
                stateIdx++;
                page = 1;
                if (stateIdx >= STATES.length * 5) break; // Safety: don't loop forever
                continue;
            }

            totalFetched += leads.length;

            // Dedupe
            const fresh = leads.filter(l => {
                const e = l.email.toLowerCase();
                if (existingEmails.has(e) || seenEmails.has(e)) return false;
                seenEmails.add(e);
                existingEmails.add(e);
                return true;
            });

            if (fresh.length === 0) {
                console.log(`  ${STATES[stateIdx % STATES.length]} p${page}: ${leads.length} fetched, 0 new (all dupes)`);
                page++;
                if (page > 20) { stateIdx++; page = 1; }
                continue;
            }

            // Push to Instantly
            const pushed = await pushToInstantly(fresh);
            totalPushed += pushed;

            // Save to DB
            const saved = await saveToDb(fresh);
            totalSaved += saved;

            console.log(`  ${STATES[stateIdx % STATES.length]} p${page}: ${leads.length} fetched → ${fresh.length} new → ${pushed} pushed → ${saved} saved | TOTAL: ${totalPushed}/${TARGET}`);

            page++;
            if (page > 20) { stateIdx++; page = 1; }

            // Rate limit for Apollo (400 req/min)
            await new Promise(r => setTimeout(r, 200));

        } catch (e) {
            console.error(`Error: ${e.message}`);
            if (e.message.includes('429')) {
                console.log('Rate limited, waiting 10s...');
                await new Promise(r => setTimeout(r, 10000));
                continue;
            }
            stateIdx++;
            page = 1;
        }
    }

    const dbTotal = await prisma.lead.count();
    console.log(`\n=== RESULTS ===`);
    console.log(`Fetched from Apollo: ${totalFetched}`);
    console.log(`Pushed to Instantly: ${totalPushed}`);
    console.log(`Saved to DB: ${totalSaved}`);
    console.log(`DB total leads: ${dbTotal}`);

    await prisma.$disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });

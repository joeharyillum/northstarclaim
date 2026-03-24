/**
 * REAL LEAD PULL — Apollo.io → DB → Instantly
 * Tries multiple search strategies to find real verified leads
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const APOLLO_KEY = process.env.APOLLO_API_KEY;
const INSTANTLY_KEY = process.env.INSTANTLY_API_KEY;
const CAMPAIGN_ID = process.env.INSTANTLY_CAMPAIGN_ID;

// Multiple search strategies
const SEARCHES = [
    {
        name: 'Healthcare Executives - FL & TX',
        body: {
            per_page: 100,
            page: 1,
            person_titles: ['CEO', 'CFO', 'Chief Financial Officer', 'Medical Director', 'Revenue Cycle Manager', 'Director of Billing', 'Practice Manager', 'Administrator'],
            person_locations: ['Florida, United States', 'Texas, United States'],
            q_organization_keyword_tags: ['hospital', 'medical', 'healthcare', 'clinic'],
            contact_email_status: ['verified'],
            organization_num_employees_ranges: ['51,200', '201,500', '501,1000', '1001,5000', '5001,10000'],
        }
    },
    {
        name: 'Billing Directors - All US',
        body: {
            per_page: 100,
            page: 1,
            person_titles: ['Director of Billing', 'Billing Manager', 'Revenue Cycle Director', 'Revenue Cycle Manager', 'VP Revenue Cycle'],
            person_locations: ['United States'],
            q_organization_keyword_tags: ['hospital', 'health system', 'medical center'],
            contact_email_status: ['verified'],
            organization_num_employees_ranges: ['201,500', '501,1000', '1001,5000', '5001,10000'],
        }
    },
    {
        name: 'Healthcare C-Suite - Large Orgs',
        body: {
            per_page: 100,
            page: 1,
            person_titles: ['CEO', 'CFO', 'COO', 'Chief Revenue Officer'],
            person_locations: ['United States'],
            q_organization_keyword_tags: ['hospital'],
            contact_email_status: ['verified'],
            organization_num_employees_ranges: ['1001,5000', '5001,10000'],
        }
    },
    {
        name: 'Healthcare Execs - Keyword Search',
        body: {
            per_page: 100,
            page: 1,
            person_titles: ['CEO', 'CFO', 'Medical Director', 'Practice Manager'],
            q_organization_keyword_tags: ['health', 'medical'],
            person_locations: ['United States'],
            contact_email_status: ['verified', 'likely'],
        }
    },
];

async function searchApollo(searchConfig) {
    console.log(`\n--- Searching: ${searchConfig.name} ---`);
    
    try {
        const res = await fetch('https://api.apollo.io/api/v1/mixed_people/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': APOLLO_KEY,
            },
            body: JSON.stringify(searchConfig.body),
        });

        if (!res.ok) {
            const err = await res.text();
            console.log(`  API Error ${res.status}: ${err.substring(0, 200)}`);
            return [];
        }

        const data = await res.json();
        const people = data.people || [];
        const total = data.pagination?.total_entries || 0;

        console.log(`  Found: ${people.length} people (total available: ${total})`);

        const leads = [];
        for (const p of people) {
            if (p.email && p.email.includes('@') && !p.email.includes('gmail') && !p.email.includes('yahoo') && !p.email.includes('hotmail')) {
                leads.push({
                    email: p.email.toLowerCase(),
                    firstName: p.first_name || '',
                    lastName: p.last_name || '',
                    title: p.title || '',
                    company: p.organization?.name || '',
                    city: p.city || '',
                    state: p.state || '',
                    phone: p.phone_numbers?.[0]?.sanitized_number || '',
                    industry: p.organization?.industry || 'Healthcare',
                    domain: p.organization?.primary_domain || '',
                });
            }
        }
        console.log(`  Leads with business emails: ${leads.length}`);
        return leads;

    } catch (e) {
        console.log(`  Error: ${e.message}`);
        return [];
    }
}

async function run() {
    console.log('=== REAL LEAD PULL FROM APOLLO ===');
    console.log(`Apollo Key: ${APOLLO_KEY ? APOLLO_KEY.substring(0, 8) + '...' : 'MISSING'}`);

    // First check Apollo health
    try {
        const healthRes = await fetch('https://api.apollo.io/api/v1/auth/health', {
            headers: { 'X-Api-Key': APOLLO_KEY },
        });
        const health = await healthRes.json();
        console.log('Apollo Health:', JSON.stringify(health));
    } catch (e) {
        console.log('Apollo Health Check Failed:', e.message);
    }

    // Run all searches
    const allLeads = [];
    const seen = new Set();

    for (const search of SEARCHES) {
        const leads = await searchApollo(search);
        for (const lead of leads) {
            if (!seen.has(lead.email)) {
                seen.add(lead.email);
                allLeads.push(lead);
            }
        }
        console.log(`  Running total (deduped): ${allLeads.length}`);
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log(`\n=== TOTAL UNIQUE LEADS: ${allLeads.length} ===`);

    if (allLeads.length === 0) {
        console.log('\n⚠️  Apollo returned 0 leads. This is a free tier limitation.');
        console.log('To get real leads, you need to either:');
        console.log('  1. Upgrade Apollo plan (starts at $49/mo for 1,000 credits)');
        console.log('  2. Export from Apollo dashboard manually (CSV download)');
        console.log('  3. Use another lead provider');
        await prisma.$disconnect();
        return;
    }

    // Save to DB
    console.log('\nSaving to database...');
    let inserted = 0;
    let skipped = 0;

    for (const lead of allLeads) {
        try {
            await prisma.lead.upsert({
                where: { email: lead.email },
                update: {},
                create: {
                    email: lead.email,
                    firstName: lead.firstName,
                    lastName: lead.lastName,
                    company: lead.company,
                    title: lead.title,
                    city: lead.city,
                    state: lead.state,
                    phone: lead.phone,
                    industry: lead.industry,
                    source: 'apollo',
                    status: 'new',
                },
            });
            inserted++;
        } catch (e) {
            skipped++;
        }
    }

    console.log(`DB: ${inserted} inserted, ${skipped} skipped`);

    // Push to Instantly
    console.log('\nPushing to Instantly campaign...');
    let pushed = 0;
    let pushErrors = 0;

    for (const lead of allLeads) {
        try {
            const res = await fetch('https://api.instantly.ai/api/v2/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${INSTANTLY_KEY}`,
                },
                body: JSON.stringify({
                    email: lead.email,
                    first_name: lead.firstName,
                    last_name: lead.lastName,
                    company_name: lead.company,
                    campaign: CAMPAIGN_ID,
                    skip_if_in_workspace: true,
                    custom_variables: {
                        title: lead.title,
                        city: lead.city,
                        state: lead.state,
                        personalization: generatePitch(lead),
                    },
                }),
            });

            if (res.ok) {
                pushed++;
            } else {
                pushErrors++;
            }
        } catch (e) {
            pushErrors++;
        }
        await new Promise(r => setTimeout(r, 100));
    }

    console.log(`Instantly: ${pushed} pushed, ${pushErrors} errors`);

    // Update DB status
    if (pushed > 0) {
        await prisma.lead.updateMany({
            where: { source: 'apollo', status: 'new' },
            data: { status: 'contacted', pushedAt: new Date(), campaignId: CAMPAIGN_ID },
        });
    }

    console.log('\n=== DONE ===');
    console.log(`  Real leads found: ${allLeads.length}`);
    console.log(`  In DB: ${inserted}`);
    console.log(`  In Instantly: ${pushed}`);

    await prisma.$disconnect();
}

function generatePitch(lead) {
    const t = (lead.title || '').toLowerCase();
    if (t.includes('ceo') || t.includes('cfo') || t.includes('chief'))
        return `As ${lead.company}'s ${lead.title}, denied claims represent your largest controllable revenue leak. Our AI recovers them automatically — zero manual work, zero upfront cost.`;
    if (t.includes('director') || t.includes('manager'))
        return `At ${lead.company}, your team fights denials daily. What if every denied claim was automatically appealed and recovered by AI? We only charge when we win.`;
    return `At ${lead.company}, denied claims likely represent a significant revenue leak. Our AI finds and appeals them automatically — zero upfront cost, we only earn when you recover money.`;
}

run().catch(e => { console.error(e.message); process.exit(1); });

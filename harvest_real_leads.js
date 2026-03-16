require('dotenv').config();
const fs = require('fs');

/**
 * REAL LEAD HARVESTER — Apollo → Instantly
 * Searches for REAL, verified healthcare decision-makers
 * and pushes them directly to your Instantly campaign.
 * 
 * Usage:
 *   node harvest_real_leads.js           # Default: 50 leads
 *   node harvest_real_leads.js --count 100   # Custom count
 */

const args = process.argv.slice(2);
const getArg = (key) => args.find((a, i) => args[i - 1] === key);
const TARGET_COUNT = parseInt(getArg('--count') || '50');
const PER_PAGE = Math.min(TARGET_COUNT, 100); // Apollo max 100 per page
const PAGES = Math.ceil(TARGET_COUNT / PER_PAGE);

async function harvestRealLeads() {
    const apolloKey = process.env.APOLLO_API_KEY;
    const instantlyKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;

    if (!apolloKey || !instantlyKey || !campaignId) {
        console.error('❌ Missing API keys in .env (APOLLO_API_KEY, INSTANTLY_API_KEY, INSTANTLY_CAMPAIGN_ID)');
        process.exit(1);
    }

    console.log(`\n🎯 REAL LEAD HARVESTER — Targeting ${TARGET_COUNT} verified leads`);
    console.log(`   Apollo → Instantly Campaign: ${campaignId}\n`);

    let allLeads = [];

    for (let page = 1; page <= PAGES; page++) {
        const remaining = TARGET_COUNT - allLeads.length;
        const pageSize = Math.min(PER_PAGE, remaining);

        console.log(`📡 Searching Apollo (page ${page}, ${pageSize} per page)...`);

        const searchBody = {
            per_page: pageSize,
            page: page,
            person_titles: [
                'CEO', 'CFO', 'Chief Financial Officer', 'Medical Director',
                'Practice Manager', 'Revenue Cycle Manager', 'Billing Manager',
                'Director of Revenue Cycle', 'VP Finance', 'Office Manager',
                'Administrator', 'VP Revenue Cycle', 'Director of Billing',
                'Chief Operating Officer', 'COO'
            ],
            person_locations: ['Texas, United States', 'Florida, United States'],
            q_organization_keyword_tags: ['healthcare', 'medical', 'hospital', 'clinic', 'health system'],
            contact_email_status: ['verified'],
            organization_num_employees_ranges: ['11,50', '51,200', '201,500', '501,1000', '1001,5000', '5001,10000'],
        };

        try {
            const searchRes = await fetch('https://api.apollo.io/api/v1/mixed_people/search', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Api-Key': apolloKey,
                },
                body: JSON.stringify(searchBody),
            });

            if (!searchRes.ok) {
                const err = await searchRes.text();
                console.error(`❌ Apollo search failed: ${err}`);
                break;
            }

            const searchData = await searchRes.json();
            const people = searchData.people || [];

            console.log(`   Found ${people.length} people on page ${page}`);

            for (const p of people) {
                if (p.email && p.email.includes('@')) {
                    allLeads.push({
                        email: p.email,
                        firstName: p.first_name || '',
                        lastName: p.last_name || '',
                        company: p.organization?.name || '',
                        title: p.title || '',
                        city: p.city || '',
                        state: p.state || '',
                        linkedinUrl: p.linkedin_url || '',
                    });
                }
            }

            console.log(`   Total leads with verified emails: ${allLeads.length}`);

            if (people.length < pageSize) {
                console.log('   No more results from Apollo.');
                break;
            }

        } catch (e) {
            console.error(`❌ Search error: ${e.message}`);
            break;
        }

        // Delay between pages
        if (page < PAGES) await new Promise(r => setTimeout(r, 1000));
    }

    if (allLeads.length === 0) {
        console.log('\n❌ No verified leads found. Check your Apollo credits and filters.');
        return;
    }

    // Deduplicate by email
    const seen = new Set();
    allLeads = allLeads.filter(l => {
        if (seen.has(l.email.toLowerCase())) return false;
        seen.add(l.email.toLowerCase());
        return true;
    });

    console.log(`\n✅ ${allLeads.length} unique verified leads ready to push\n`);

    // Save leads to JSON for records
    fs.writeFileSync('real_leads_harvested.json', JSON.stringify(allLeads, null, 2));
    console.log('💾 Saved to real_leads_harvested.json\n');

    // Push to Instantly
    let pushed = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < allLeads.length; i++) {
        const lead = allLeads[i];

        const personalization = lead.title.toLowerCase().includes('ceo') || lead.title.toLowerCase().includes('cfo')
            ? `As ${lead.company}'s ${lead.title}, you know denied claims represent your largest controllable revenue leak. Our AI recovers them automatically — zero manual work.`
            : lead.title.toLowerCase().includes('director') || lead.title.toLowerCase().includes('manager')
            ? `At ${lead.company}, your team fights denials daily. What if every denied claim was automatically appealed and recovered by AI?`
            : `At ${lead.company}, denied claims likely represent a 7-figure revenue leak. Our AI finds and appeals them automatically.`;

        const payload = {
            email: lead.email,
            first_name: lead.firstName,
            last_name: lead.lastName,
            company_name: lead.company,
            campaign_id: campaignId,
            skip_if_in_workspace: true,
            custom_variables: {
                title: lead.title,
                city: lead.city,
                state: lead.state,
                personalization: personalization,
            },
        };

        try {
            const res = await fetch('https://api.instantly.ai/api/v2/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${instantlyKey}`,
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                pushed++;
                console.log(`✅ [${i + 1}/${allLeads.length}] ${lead.firstName} ${lead.lastName} — ${lead.title} @ ${lead.company}`);
            } else {
                const err = await res.text();
                if (err.includes('already') || err.includes('duplicate')) {
                    skipped++;
                    console.log(`⏭️  [${i + 1}/${allLeads.length}] Skipped (exists): ${lead.email}`);
                } else if (err.includes('Lead limit reached')) {
                    console.log('🛑 Instantly lead limit reached. Stopping.');
                    break;
                } else {
                    errors++;
                    console.log(`❌ [${i + 1}/${allLeads.length}] Failed: ${lead.email} — ${err}`);
                }
            }
        } catch (e) {
            errors++;
            console.error(`❌ Error: ${e.message}`);
        }

        // Rate limit delay
        await new Promise(r => setTimeout(r, 500));
    }

    console.log(`\n${'═'.repeat(50)}`);
    console.log(`  🏁 HARVEST COMPLETE`);
    console.log(`${'═'.repeat(50)}`);
    console.log(`  ✅ Pushed:   ${pushed}`);
    console.log(`  ⏭️  Skipped:  ${skipped}`);
    console.log(`  ❌ Errors:   ${errors}`);
    console.log(`  📊 Total:    ${allLeads.length} real verified leads`);
    console.log(`${'═'.repeat(50)}\n`);
}

harvestRealLeads().catch(console.error);

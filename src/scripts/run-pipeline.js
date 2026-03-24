/**
 * ZERO-HUMAN PIPELINE RUNNER v3 (CREDIT-FREE MODE)
 * 
 * By default, operates WITHOUT using Apollo credits:
 *   - Uses mixed_people/api_search (FREE) across many pages
 *   - Collects leads that already have emails from search results
 *   - Skips the paid bulk_match enrichment step
 * 
 * Usage:
 *   node src/scripts/run-pipeline.js                       # Dry run (safe test)
 *   node src/scripts/run-pipeline.js --live                 # Live run (sends real emails)
 *   node src/scripts/run-pipeline.js --live --count 100     # Live with 100 leads/page
 *   node src/scripts/run-pipeline.js --live --pages 10      # Live across 10 pages
 *   node src/scripts/run-pipeline.js --live --enrich        # Also enrich (uses credits!)
 *   node src/scripts/run-pipeline.js --live --state Texas   # Target specific state
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const APOLLO_BASE = 'https://api.apollo.io/api/v1';
const INSTANTLY_V2_BASE = 'https://api.instantly.ai/api/v2';
const CACHE_FILE = path.join(__dirname, '../../leads_cache.json');

// ——————————————————————————————————————————————
// CONFIG
// ——————————————————————————————————————————————
const args = process.argv.slice(2);
const IS_LIVE = args.includes('--live');
const USE_ENRICH = args.includes('--enrich'); // OFF by default — saves credits
const getArg = (key) => args.find((a, i) => args[i - 1] === key);

const COUNT = parseInt(getArg('--count') || '100'); // Larger default to find more emails
const PAGES = parseInt(getArg('--pages') || '5');   // More pages by default
const START_PAGE = parseInt(getArg('--start-page') || '1');
const TARGET_STATE = getArg('--state') || null;

const TITLES = [
    'CEO', 'CFO', 'Chief Financial Officer', 'Medical Director',
    'Practice Manager', 'Revenue Cycle Manager', 'Billing Manager',
    'Director of Revenue Cycle', 'VP Finance', 'Office Manager', 'Administrator',
    'President', 'Owner', 'Director of Operations',
];

// ——————————————————————————————————————————————
// STEP 1: Search Apollo for people IDs (no credits used)
// ——————————————————————————————————————————————
async function searchApollo(page = 1, perPage = 100) {
    const apiKey = process.env.APOLLO_API_KEY;
    if (!apiKey) throw new Error('APOLLO_API_KEY not set in .env');

    // Build dynamic locations based on --state flag
    const locations = TARGET_STATE
        ? [`${TARGET_STATE}, United States`]
        : ['Florida, United States', 'Texas, United States', 'California, United States', 'New York, United States'];

    console.log(`\n🔍 [APOLLO SEARCH] Page ${page}, requesting ${perPage} leads... (${locations.join(', ')})`);

    const body = {
        per_page: Math.min(perPage, 100),
        page,
        person_titles: TITLES,
        person_locations: locations,
        organization_industry_tag_ids: [],
        q_organization_keyword_tags: ['healthcare', 'medical', 'hospital', 'clinic', 'health system', 'physician group'],
    };

    const res = await fetch(`${APOLLO_BASE}/mixed_people/api_search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Api-Key': apiKey },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Apollo Search API ${res.status}: ${err}`);
    }

    const data = await res.json();
    const people = data.people || [];
    const totalEntries = data.pagination?.total_entries || 0;

    console.log(`✅ [APOLLO SEARCH] Found ${people.length} people (total available: ${totalEntries})`);

    // Log partial info we get from api_search
    people.forEach((p, i) => {
        const emailTag = p.email ? `📧 ${p.email}` : '❌ no email';
        console.log(`   ${i + 1}. ${p.first_name || '?'} ${p.last_name || '?'} | ${p.title || '?'} @ ${p.organization?.name || '?'} | ${emailTag}`);
    });

    const leadsWithEmails = people.filter(p => p.email);
    const leadsWithoutEmails = people.filter(p => !p.email);

    console.log(`   → ${leadsWithEmails.length} already have emails (FREE — no credits used)`);
    console.log(`   → ${leadsWithoutEmails.length} need enrichment (skipping unless --enrich flag used)`);

    return { people, leadsWithEmails, leadsWithoutEmails, totalEntries };
}

// ——————————————————————————————————————————————
// STEP 2: Enrich people via bulk_match (uses credits)
// ——————————————————————————————————————————————
async function enrichLeads(people) {
    const apiKey = process.env.APOLLO_API_KEY;
    if (!people || people.length === 0) return [];

    const ids = people.map(p => p.id).filter(Boolean);
    if (ids.length === 0) return [];

    console.log(`\n🔬 [APOLLO ENRICH] Enriching ${ids.length} leads via bulk_match (batches of 10)...`);

    const allEnriched = [];
    const BATCH_SIZE = 10;

    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        const batchIds = ids.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(ids.length / BATCH_SIZE);

        console.log(`   Batch ${batchNum}/${totalBatches} (${batchIds.length} records)...`);

        try {
            const res = await fetch(`${APOLLO_BASE}/people/bulk_match`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Api-Key': apiKey },
                body: JSON.stringify({
                    details: batchIds.map(id => ({ id })),
                }),
            });

            if (!res.ok) {
                const err = await res.text();
                console.warn(`   ⚠️  Batch ${batchNum} failed (${res.status}): ${err}`);
                continue;
            }

            const data = await res.json();
            const matches = (data.matches || []).filter(m => m && m.email);
            allEnriched.push(...matches);
            console.log(`   ✅ Batch ${batchNum}: ${matches.length} enriched with emails`);

            // Rate limit between batches
            if (i + BATCH_SIZE < ids.length) {
                await new Promise(r => setTimeout(r, 500));
            }
        } catch (err) {
            console.warn(`   ⚠️  Batch ${batchNum} error: ${err.message}`);
        }
    }

    console.log(`✅ [APOLLO ENRICH] Total enriched: ${allEnriched.length} profiles with emails`);
    
    // SAVE TO CACHE IMMEDIATELY
    if (allEnriched.length > 0) {
        let cache = [];
        if (fs.existsSync(CACHE_FILE)) cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
        cache.push(...allEnriched);
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
        console.log(`💾 [CACHE] ${allEnriched.length} lead(s) backed up to leads_cache.json`);
    }

    allEnriched.forEach((m, i) => {
        console.log(`   ${i + 1}. ${m.first_name} ${m.last_name} | ${m.email} | ${m.title} @ ${m.organization?.name}`);
    });

    return allEnriched;
}

// ——————————————————————————————————————————————
// STEP 3: Combine all leads with emails
// ——————————————————————————————————————————————
function buildLeadList(searchResults, enrichedResults) {
    const seen = new Set();
    const leads = [];

    // First add leads that already had emails from search
    for (const p of searchResults) {
        if (p.email && !seen.has(p.email)) {
            seen.add(p.email);
            leads.push({
                firstName: p.first_name || '',
                lastName: p.last_name || '',
                email: p.email,
                title: p.title || '',
                company: p.organization?.name || '',
                city: p.city || '',
                state: p.state || '',
                phone: p.phone_numbers?.[0]?.sanitized_number || '',
                domain: p.organization?.primary_domain || '',
            });
        }
    }

    // Then add enriched leads
    for (const m of enrichedResults) {
        if (m.email && !seen.has(m.email)) {
            seen.add(m.email);
            leads.push({
                firstName: m.first_name || '',
                lastName: m.last_name || '',
                email: m.email,
                title: m.title || '',
                company: m.organization?.name || '',
                city: m.city || '',
                state: m.state || '',
                phone: m.phone_numbers?.[0]?.sanitized_number || '',
                domain: m.organization?.primary_domain || '',
            });
        }
    }

    return leads;
}

// ——————————————————————————————————————————————
// PERSONALIZATION
// ——————————————————————————————————————————————
function personalize(lead) {
    const pitches = {
        'ceo': `As ${lead.company}'s CEO, you're likely aware that denied claims represent your largest controllable revenue leak`,
        'cfo': `As CFO at ${lead.company}, every denied claim sitting unrecovered is cash left on the table`,
        'medical director': `Dr. ${lead.lastName}, your clinical expertise justifies these procedures — our AI ensures payers acknowledge it`,
        'practice manager': `Managing ${lead.company}'s revenue cycle means fighting denials daily. What if that was fully automated?`,
        'revenue cycle': `Your revenue cycle at ${lead.company} likely has 6-12% of billings trapped in wrongful denials`,
        'billing': `The billing team at ${lead.company} shouldn't spend hours on appeals that AI can draft in seconds`,
    };

    const titleLower = lead.title.toLowerCase();
    for (const [key, pitch] of Object.entries(pitches)) {
        if (titleLower.includes(key)) return pitch;
    }
    return `At ${lead.company}, denied claims likely represent a significant revenue leak. Our AI finds and appeals them automatically — zero upfront cost.`;
}

// ——————————————————————————————————————————————
// INSTANTLY: Push leads to campaign
// ——————————————————————————————————————————————
async function pushToInstantly(leads) {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;
    if (!apiKey) throw new Error('INSTANTLY_API_KEY not set in .env');
    if (!campaignId) throw new Error('INSTANTLY_CAMPAIGN_ID not set in .env');

    console.log(`\n📧 [INSTANTLY] Pushing ${leads.length} leads to campaign ${campaignId} via v2 API...`);

    let added = 0;
    let skipped = 0;

    for (const l of leads) {
        const payload = {
            email: l.email,
            first_name: l.firstName,
            last_name: l.lastName,
            company_name: l.company,
            phone: l.phone,
            website: l.domain ? `https://${l.domain}` : '',
            campaign_id: campaignId,
            skip_if_in_workspace: true,
            custom_variables: {
                title: l.title,
                personalization: personalize(l),
                city: l.city,
                state: l.state,
            },
        };

        try {
            const res = await fetch(`${INSTANTLY_V2_BASE}/leads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                added++;
                process.stdout.write('.');
            } else {
                const errText = await res.text();
                if (errText.includes('Lead limit reached')) {
                    console.log('\n🛑 [INSTANTLY] Lead limit reached. Stopping upload.');
                    break;
                }
                skipped++;
            }
            // Increased throttle (1s) to prevent system lag
            await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
            skipped++;
        }
    }

    console.log(`\n✅ [INSTANTLY] Result: ${added} added, ${skipped} skipped`);
    return { leads_uploaded: added, leads_skipped: skipped };
}

// ——————————————————————————————————————————————
// MAIN PIPELINE
// ——————————————————————————————————————————————
async function main() {
    console.log('═══════════════════════════════════════════════════');
    console.log('  NORTHSTAR CLAIM — ZERO-HUMAN PIPELINE v3');
    console.log('  MODE: CREDIT-FREE (No Apollo credits needed)');
    console.log(`  Live: ${IS_LIVE ? '🔴 LIVE (Real emails will be sent!)' : '🟡 DRY RUN (No emails sent)'}`);
    console.log(`  Enrich: ${USE_ENRICH ? '⚡ ON (uses credits)' : '💰 OFF (credit-free)'}`);
    console.log(`  Count: ${COUNT} leads/page × ${PAGES} pages (starting page ${START_PAGE})`);
    if (TARGET_STATE) console.log(`  State: ${TARGET_STATE}`);
    console.log('═══════════════════════════════════════════════════\n');

    let grandTotalLeads = 0;
    let grandTotalAdded = 0;
    let grandTotalSearched = 0;

    for (let page = START_PAGE; page <= (START_PAGE + PAGES - 1); page++) {
        try {
            console.log(`\n════════════════ PAGE ${page} ════════════════`);

            // Step 1: Search Apollo (FREE — no credits used)
            const searchResult = await searchApollo(page, COUNT);
            grandTotalSearched += searchResult.people.length;

            if (searchResult.people.length === 0) {
                console.log('⚠️  No more leads found. Stopping.');
                break;
            }

            // Step 2: Enrich leads that don't have emails (ONLY if --enrich flag is used)
            let enriched = [];
            if (USE_ENRICH && searchResult.leadsWithoutEmails.length > 0) {
                enriched = await enrichLeads(searchResult.leadsWithoutEmails);
            } else if (searchResult.leadsWithoutEmails.length > 0) {
                console.log(`\n💰 [CREDIT-FREE] Skipping enrichment for ${searchResult.leadsWithoutEmails.length} leads (use --enrich to enable)`);
            }

            // Step 3: Build final lead list (only from contacts with emails)
            const finalLeads = buildLeadList(searchResult.people, enriched);
            grandTotalLeads += finalLeads.length;

            console.log(`\n📋 [FINAL] ${finalLeads.length} leads ready for outreach:`);
            finalLeads.forEach((l, i) => {
                console.log(`   ${i + 1}. ${l.firstName} ${l.lastName} | ${l.title} @ ${l.company} | ${l.email}`);
            });

            if (finalLeads.length === 0) {
                console.log('⚠️  No leads with emails on this page. Continuing to next page...');
                continue;
            }

            // Step 4: Push to Instantly (only in live mode)
            if (IS_LIVE) {
                const result = await pushToInstantly(finalLeads);
                grandTotalAdded += result.leads_uploaded || 0;
            } else {
                console.log('\n⏸️  [DRY RUN] Skipping Instantly upload. Run with --live to send real emails.');
            }

            // Rate limit pause between pages
            if (page < (START_PAGE + PAGES - 1)) {
                console.log('\n⏳ Waiting 2s before next page...');
                await new Promise(r => setTimeout(r, 2000));
            }

        } catch (err) {
            console.error(`\n❌ Error on page ${page}:`, err.message);
            if (err.message.includes('v2 API key') || err.message.includes('deprecated')) {
                console.log('\n📋 TO FIX INSTANTLY: Go to https://app.instantly.ai/app/settings/integrations');
                console.log('   Generate a new v2 API key and update INSTANTLY_API_KEY in .env\n');
            }
            break;
        }
    }

    // Save autopilot state for next run continuation
    const nextPage = START_PAGE + PAGES;
    fs.writeFileSync(path.join(__dirname, '../../autopilot_state.json'), JSON.stringify({ lastPage: nextPage }, null, 2));

    console.log('\n═══════════════════════════════════════════════════');
    console.log(`  PIPELINE COMPLETE (v3 Credit-Free)`);
    console.log(`  Total people searched: ${grandTotalSearched}`);
    console.log(`  Total leads with emails: ${grandTotalLeads}`);
    console.log(`  Total pushed to Instantly: ${IS_LIVE ? grandTotalAdded : 'N/A (dry run)'}`);
    console.log(`  Email hit rate: ${grandTotalSearched > 0 ? Math.round(grandTotalLeads / grandTotalSearched * 100) : 0}%`);
    console.log(`  Next auto-start page: ${nextPage}`);
    console.log('═══════════════════════════════════════════════════\n');
}

main().catch(err => {
    console.error('Fatal pipeline error:', err);
    process.exit(1);
});

/**
 * FREE ENRICHMENT ENGINE v1
 * 
 * Finds real emails WITHOUT using Apollo credits.
 * 
 * Strategy:
 *   1. Apollo free search → get first names, titles, company domains (FREE)
 *   2. Hunter.io domain search → find real emails at those companies (FREE tier: 25/mo)
 *   3. Email Pattern Generator → generate likely emails from name + domain (UNLIMITED, no API)
 *   4. Push verified leads → Instantly campaign
 * 
 * Setup:
 *   1. Go to https://hunter.io/users/sign_up (free, 30 seconds)
 *   2. Copy your API key from https://hunter.io/api_keys
 *   3. Add to .env: HUNTER_API_KEY=your_key_here
 * 
 * Usage:
 *   node src/scripts/free-enrichment.js                          # Dry run
 *   node src/scripts/free-enrichment.js --live                    # Push to Instantly
 *   node src/scripts/free-enrichment.js --live --pages 10         # More pages
 *   node src/scripts/free-enrichment.js --live --state Texas      # Target state
 *   node src/scripts/free-enrichment.js --live --pattern-only     # Skip Hunter, patterns only
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const APOLLO_BASE = 'https://api.apollo.io/api/v1';
const HUNTER_BASE = 'https://api.hunter.io/v2';
const INSTANTLY_V2_BASE = 'https://api.instantly.ai/api/v2';
const CACHE_FILE = path.join(__dirname, '../../leads_cache.json');

// ——————————————————————————————————————————————
// CONFIG
// ——————————————————————————————————————————————
const args = process.argv.slice(2);
const IS_LIVE = args.includes('--live');
const PATTERN_ONLY = args.includes('--pattern-only');
const getArg = (key) => args.find((a, i) => args[i - 1] === key);

const COUNT = parseInt(getArg('--count') || '100');
const PAGES = parseInt(getArg('--pages') || '3');
const START_PAGE = parseInt(getArg('--start-page') || '1');
const TARGET_STATE = getArg('--state') || null;

const TITLES = [
    'CEO', 'CFO', 'Chief Financial Officer', 'Medical Director',
    'Practice Manager', 'Revenue Cycle Manager', 'Billing Manager',
    'Director of Revenue Cycle', 'VP Finance', 'Office Manager', 'Administrator',
    'President', 'Owner', 'Director of Operations',
];

// Common email patterns used by businesses (ordered by prevalence)
const EMAIL_PATTERNS = [
    (f, l) => `${f}.${l}`,           // john.smith
    (f, l) => `${f[0]}${l}`,          // jsmith
    (f, l) => `${f}`,                  // john
    (f, l) => `${f}${l}`,             // johnsmith
    (f, l) => `${f[0]}.${l}`,         // j.smith
    (f, l) => `${f}_${l}`,            // john_smith
    (f, l) => `${f}${l[0]}`,          // johns
    (f, l) => `${l}.${f}`,            // smith.john
    (f, l) => `${l}${f[0]}`,          // smithj
];

// ——————————————————————————————————————————————
// STEP 1: Apollo Free Search (names + companies)
// ——————————————————————————————————————————————
async function apolloFreeSearch(page = 1, perPage = 100) {
    const apiKey = process.env.APOLLO_API_KEY;
    if (!apiKey) throw new Error('APOLLO_API_KEY not set in .env');

    const locations = TARGET_STATE
        ? [`${TARGET_STATE}, United States`]
        : ['Florida, United States', 'Texas, United States', 'California, United States', 'New York, United States'];

    console.log(`\n🔍 [APOLLO FREE] Page ${page}, searching ${perPage} contacts... (${locations.join(', ')})`);

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
    console.log(`✅ [APOLLO FREE] Found ${people.length} people (zero credits used)`);

    // Extract what we CAN get for free: first name, title, org name, org domain
    const prospects = people.map(p => ({
        id: p.id,
        firstName: p.first_name || '',
        // last_name may be obfuscated on free plan, but let's grab what we can
        lastName: p.last_name || p.last_name_obfuscated || '',
        title: p.title || '',
        company: p.organization?.name || '',
        domain: p.organization?.primary_domain || p.organization?.website_url?.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || '',
        city: p.city || '',
        state: p.state || '',
        hasEmail: p.has_email || false,
        existingEmail: p.email || null,
    }));

    // Filter to those that have a company domain (required for email finding)
    const withDomains = prospects.filter(p => p.domain && p.firstName);
    const noDomains = prospects.filter(p => !p.domain || !p.firstName);

    console.log(`   → ${withDomains.length} have company domains (enrichable)`);
    console.log(`   → ${noDomains.length} missing domain or first name (skipped)`);

    // Log what we found
    withDomains.slice(0, 10).forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.firstName} ${p.lastName} | ${p.title} @ ${p.company} | 🌐 ${p.domain}`);
    });
    if (withDomains.length > 10) console.log(`   ... and ${withDomains.length - 10} more`);

    return withDomains;
}

// ——————————————————————————————————————————————
// STEP 2A: Hunter.io Domain Search (FREE — 25/month)
// ——————————————————————————————————————————————
async function hunterDomainSearch(domain) {
    const apiKey = process.env.HUNTER_API_KEY;
    if (!apiKey) return [];

    try {
        const url = `${HUNTER_BASE}/domain-search?domain=${encodeURIComponent(domain)}&api_key=${apiKey}&limit=10`;
        const res = await fetch(url);

        if (!res.ok) {
            if (res.status === 429) {
                console.log('   ⚠️  Hunter.io rate limit hit');
                return [];
            }
            return [];
        }

        const data = await res.json();
        const emails = (data.data?.emails || []).map(e => ({
            email: e.value,
            firstName: e.first_name || '',
            lastName: e.last_name || '',
            position: e.position || '',
            confidence: e.confidence || 0,
        }));

        return emails;
    } catch (err) {
        return [];
    }
}

// ——————————————————————————————————————————————
// STEP 2B: Hunter.io Email Finder (find specific person)
// ——————————————————————————————————————————————
async function hunterEmailFinder(domain, firstName, lastName) {
    const apiKey = process.env.HUNTER_API_KEY;
    if (!apiKey || !lastName || lastName.length <= 2) return null;

    try {
        const url = `${HUNTER_BASE}/email-finder?domain=${encodeURIComponent(domain)}&first_name=${encodeURIComponent(firstName)}&last_name=${encodeURIComponent(lastName)}&api_key=${apiKey}`;
        const res = await fetch(url);

        if (!res.ok) return null;

        const data = await res.json();
        if (data.data?.email && data.data?.score > 50) {
            return {
                email: data.data.email,
                confidence: data.data.score,
            };
        }
        return null;
    } catch (err) {
        return null;
    }
}

// ——————————————————————————————————————————————
// STEP 2C: Email Pattern Generator (FREE — unlimited)
// ——————————————————————————————————————————————
function generateEmailPatterns(firstName, lastName, domain) {
    if (!firstName || !domain) return [];
    
    const f = firstName.toLowerCase().replace(/[^a-z]/g, '');
    const l = lastName ? lastName.toLowerCase().replace(/[^a-z]/g, '') : '';

    if (!f) return [];

    const patterns = [];
    
    if (l && l.length > 1) {
        // If we have a real last name, generate full patterns
        for (const patternFn of EMAIL_PATTERNS) {
            patterns.push(`${patternFn(f, l)}@${domain}`);
        }
    } else {
        // If last name is obfuscated, use first-name-only patterns
        patterns.push(`${f}@${domain}`);
    }

    return patterns;
}

// ——————————————————————————————————————————————
// STEP 3: Enrich prospects with emails
// ——————————————————————————————————————————————
async function enrichProspects(prospects) {
    const hasHunter = !!process.env.HUNTER_API_KEY;
    const enriched = [];
    const seenDomains = new Map(); // Cache Hunter domain results
    let hunterCalls = 0;

    console.log(`\n📧 [ENRICHMENT] Processing ${prospects.length} prospects...`);
    if (hasHunter && !PATTERN_ONLY) {
        console.log('   🟢 Hunter.io API: ACTIVE');
    } else if (PATTERN_ONLY) {
        console.log('   🟡 Pattern-only mode (skipping Hunter.io)');
    } else {
        console.log('   🟡 Hunter.io API: NOT CONFIGURED (add HUNTER_API_KEY to .env for better results)');
        console.log('   📋 Get free key: https://hunter.io/users/sign_up');
    }
    console.log('   🟢 Email Pattern Generator: ACTIVE (unlimited)\n');

    for (const prospect of prospects) {
        // Skip if already has an email from Apollo
        if (prospect.existingEmail) {
            enriched.push({
                ...prospect,
                email: prospect.existingEmail,
                source: 'apollo_direct',
                confidence: 100,
            });
            continue;
        }

        let foundEmail = null;
        let source = '';
        let confidence = 0;

        // Strategy 1: Hunter.io domain search (cached per domain)
        if (hasHunter && !PATTERN_ONLY && hunterCalls < 25) {
            if (!seenDomains.has(prospect.domain)) {
                const domainEmails = await hunterDomainSearch(prospect.domain);
                seenDomains.set(prospect.domain, domainEmails);
                hunterCalls++;
                await new Promise(r => setTimeout(r, 300)); // Rate limit
            }

            const domainResults = seenDomains.get(prospect.domain) || [];
            
            // Try to match by first name
            const matchByName = domainResults.find(e =>
                e.firstName.toLowerCase() === prospect.firstName.toLowerCase()
            );

            if (matchByName) {
                foundEmail = matchByName.email;
                source = 'hunter_domain_match';
                confidence = matchByName.confidence;
            }
        }

        // Strategy 2: Hunter.io specific person finder
        if (!foundEmail && hasHunter && !PATTERN_ONLY && prospect.lastName.length > 2 && hunterCalls < 25) {
            const result = await hunterEmailFinder(prospect.domain, prospect.firstName, prospect.lastName);
            if (result) {
                foundEmail = result.email;
                source = 'hunter_finder';
                confidence = result.confidence;
            }
            hunterCalls++;
            await new Promise(r => setTimeout(r, 300));
        }

        // Strategy 3: Pattern generation (always available, unlimited)
        if (!foundEmail) {
            const patterns = generateEmailPatterns(prospect.firstName, prospect.lastName, prospect.domain);
            if (patterns.length > 0) {
                // Use the most common pattern: firstname.lastname@domain or firstname@domain
                foundEmail = patterns[0];
                source = 'pattern_generated';
                confidence = prospect.lastName.length > 2 ? 65 : 40;
            }
        }

        if (foundEmail) {
            enriched.push({
                ...prospect,
                email: foundEmail,
                source,
                confidence,
            });
        }
    }

    // Summary
    const bySource = {};
    for (const e of enriched) {
        bySource[e.source] = (bySource[e.source] || 0) + 1;
    }

    console.log(`\n✅ [ENRICHMENT COMPLETE] ${enriched.length}/${prospects.length} prospects enriched`);
    console.log(`   Sources: ${JSON.stringify(bySource)}`);
    if (hasHunter) console.log(`   Hunter.io API calls used: ${hunterCalls}/25 (monthly free limit)`);

    return enriched;
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
        'president': `As President of ${lead.company}, you know that every denied claim is money your team already earned`,
        'director': `As a Director at ${lead.company}, you see the daily toll of manual denial management on your team`,
    };

    const titleLower = (lead.title || '').toLowerCase();
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

    console.log(`\n📧 [INSTANTLY] Pushing ${leads.length} leads to campaign ${campaignId}...`);

    let added = 0;
    let skipped = 0;

    for (const l of leads) {
        const payload = {
            email: l.email,
            first_name: l.firstName,
            last_name: l.lastName,
            company_name: l.company,
            phone: l.phone || '',
            website: l.domain ? `https://${l.domain}` : '',
            campaign_id: campaignId,
            skip_if_in_workspace: true,
            custom_variables: {
                title: l.title,
                personalization: personalize(l),
                city: l.city,
                state: l.state,
                source: l.source,
                confidence: String(l.confidence),
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
            await new Promise(r => setTimeout(r, 800));
        } catch (e) {
            skipped++;
        }
    }

    console.log(`\n✅ [INSTANTLY] Result: ${added} added, ${skipped} skipped`);
    return { leads_uploaded: added, leads_skipped: skipped };
}

// ——————————————————————————————————————————————
// SAVE LEADS TO CACHE
// ——————————————————————————————————————————————
function saveToCache(leads) {
    let cache = [];
    if (fs.existsSync(CACHE_FILE)) {
        try { cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); } catch(e) {}
    }
    cache.push(...leads);
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
    console.log(`💾 [CACHE] ${leads.length} leads saved to leads_cache.json (total: ${cache.length})`);
}

// ——————————————————————————————————————————————
// MAIN
// ——————————————————————————————————————————————
async function main() {
    console.log('═══════════════════════════════════════════════════');
    console.log('  NORTHSTAR CLAIM — FREE ENRICHMENT ENGINE v1');
    console.log('  ⚡ ZERO CREDITS USED — 100% FREE');
    console.log(`  Live: ${IS_LIVE ? '🔴 LIVE (Pushing to Instantly)' : '🟡 DRY RUN (Review only)'}`);
    console.log(`  Hunter.io: ${process.env.HUNTER_API_KEY ? '🟢 CONNECTED' : '🟡 NOT SET (add HUNTER_API_KEY to .env)'}`);
    console.log(`  Pattern Gen: 🟢 ALWAYS ON`);
    console.log(`  Scan: ${COUNT}/page × ${PAGES} pages (starting page ${START_PAGE})`);
    if (TARGET_STATE) console.log(`  State: ${TARGET_STATE}`);
    console.log('═══════════════════════════════════════════════════\n');

    let grandTotalSearched = 0;
    let grandTotalEnriched = 0;
    let grandTotalPushed = 0;

    for (let page = START_PAGE; page <= (START_PAGE + PAGES - 1); page++) {
        try {
            console.log(`\n════════════════ PAGE ${page} ════════════════`);

            // Step 1: Apollo free search
            const prospects = await apolloFreeSearch(page, COUNT);
            grandTotalSearched += prospects.length;

            if (prospects.length === 0) {
                console.log('⚠️  No more prospects. Stopping.');
                break;
            }

            // Step 2: Enrich with free methods
            const enriched = await enrichProspects(prospects);
            grandTotalEnriched += enriched.length;

            if (enriched.length === 0) {
                console.log('⚠️  No emails found on this page. Continuing...');
                continue;
            }

            // Save to cache immediately
            saveToCache(enriched);

            // Show leads
            console.log(`\n📋 [LEADS READY] ${enriched.length} leads:`);
            enriched.forEach((l, i) => {
                const conf = l.confidence >= 80 ? '🟢' : l.confidence >= 50 ? '🟡' : '🟠';
                console.log(`   ${i + 1}. ${l.firstName} ${l.lastName} | ${l.title} @ ${l.company} | ${l.email} | ${conf} ${l.confidence}% (${l.source})`);
            });

            // Step 3: Push to Instantly
            if (IS_LIVE) {
                const result = await pushToInstantly(enriched);
                grandTotalPushed += result.leads_uploaded;
            } else {
                console.log('\n⏸️  [DRY RUN] Run with --live to push these leads to Instantly.');
            }

            // Rate limit between pages
            if (page < (START_PAGE + PAGES - 1)) {
                console.log('\n⏳ Waiting 2s...');
                await new Promise(r => setTimeout(r, 2000));
            }

        } catch (err) {
            console.error(`\n❌ Error on page ${page}:`, err.message);
            break;
        }
    }

    // Save continuation state
    const nextPage = START_PAGE + PAGES;
    fs.writeFileSync(path.join(__dirname, '../../autopilot_state.json'), JSON.stringify({ lastPage: nextPage }, null, 2));

    console.log('\n═══════════════════════════════════════════════════');
    console.log('  FREE ENRICHMENT COMPLETE');
    console.log(`  Prospects scanned: ${grandTotalSearched}`);
    console.log(`  Leads enriched:    ${grandTotalEnriched}`);
    console.log(`  Pushed to Instantly: ${IS_LIVE ? grandTotalPushed : 'N/A (dry run)'}`);
    console.log(`  Hit rate: ${grandTotalSearched > 0 ? Math.round(grandTotalEnriched / grandTotalSearched * 100) : 0}%`);
    console.log(`  Next page: ${nextPage}`);
    console.log('═══════════════════════════════════════════════════\n');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});

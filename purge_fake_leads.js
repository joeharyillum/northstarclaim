require('dotenv').config();

// ═══════════════════════════════════════════════════════════════════════
// NORTHSTAR MEDIC — FULL-SPEED FAKE LEAD PURGE
// Scans all 650K+ leads, identifies fakes, deletes at max throughput
// Run: node purge_fake_leads.js
// ═══════════════════════════════════════════════════════════════════════

const API = 'https://api.instantly.ai/api/v2';
const KEY = process.env.INSTANTLY_API_KEY;
const CAMPAIGN = process.env.INSTANTLY_CAMPAIGN_ID;
const BATCH_SIZE = 100;       // Max leads per list request
const DELETE_CONCURRENCY = 25; // Parallel deletes at once
const RETRY_DELAY = 2000;     // ms to wait on 429
const MAX_RETRIES = 5;

// ═══════════════════════════════════════════════════════════════════════
// FAKE LEAD DETECTION — expanded patterns from Gemini agent damage
// ═══════════════════════════════════════════════════════════════════════
const FAKE_DOMAINS = [
    'example.com', 'example.org', 'example.net', 'example-medical.com',
    'test.com', 'fake.com', 'placeholder.com', 'sample.com',
    'tempmail.com', 'mailinator.com', 'guerrillamail.com',
    'yopmail.com', 'throwaway.email', 'sharklasers.com',
    'grr.la', 'guerrillamailblock.com', 'pokemail.net',
    'spam4.me', 'trashmail.com', 'dispostable.com',
];

const FAKE_EMAIL_PREFIXES = [
    'test-success', 'test-', 'test_', 'fake-', 'fake_',
    'executive@', 'admin@', 'demo@', 'sample@',
    'noreply@', 'no-reply@', 'donotreply@',
];

const FAKE_LASTNAMES = [
    'professional', 'test', 'fake', 'sample', 'demo',
    'placeholder', 'unknown', 'n/a', 'na', 'none',
];

const FAKE_COMPANY_PATTERNS = [
    'test hospital', 'fake clinic', 'sample medical',
    'example health', 'demo practice',
];

// Known fabricated hospital domains from Gemini agent (March 9-12)
const FABRICATED_DOMAINS = [
    'bostonchildrenshospital.org',
    'mountsinaihealthsystem.org',
    'cedars-sinaimedicalcenter.org',
    'mayoclinichealthsystem.org',
    'clevelandclinicflorida.org',
    'naborhoodhealth.org',
    'generalmedicalassociates.com',
];

function isFake(lead) {
    const email = (lead.email || '').toLowerCase().trim();
    const domain = email.split('@')[1] || '';
    const lastName = (lead.last_name || '').toLowerCase().trim();
    const firstName = (lead.first_name || '').toLowerCase().trim();
    const company = (lead.company_name || '').toLowerCase().trim();

    // 1. Known fake domains
    if (FAKE_DOMAINS.some(d => domain === d || domain.endsWith('.' + d))) return 'fake_domain';

    // 2. Fabricated hospital domains (Gemini-created)
    if (FABRICATED_DOMAINS.some(d => domain === d)) return 'fabricated_domain';

    // 3. Fake email prefixes
    if (FAKE_EMAIL_PREFIXES.some(p => email.startsWith(p))) return 'fake_prefix';

    // 4. Domain contains "example" or "test" or "fake"
    if (/example|\.test\b|fake|placeholder|sample/.test(domain)) return 'suspicious_domain';

    // 5. Fake last names
    if (FAKE_LASTNAMES.includes(lastName)) return 'fake_lastname';

    // 6. Both first+last are generic single words like "Test Test"
    if (firstName === lastName && ['test', 'fake', 'demo', 'sample'].includes(firstName)) return 'generic_name';

    // 7. Fake company names
    if (FAKE_COMPANY_PATTERNS.some(p => company.includes(p))) return 'fake_company';

    // 8. Email is clearly machine-generated (no real name patterns)
    if (/^[a-f0-9]{8,}@/.test(email)) return 'hash_email';

    return false;
}

// ═══════════════════════════════════════════════════════════════════════
// API HELPERS
// ═══════════════════════════════════════════════════════════════════════

async function apiCall(endpoint, method, body, retries = MAX_RETRIES) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const opts = {
                method,
                headers: {
                    'Authorization': 'Bearer ' + KEY,
                    'Content-Type': 'application/json',
                },
            };
            if (body) opts.body = JSON.stringify(body);

            const res = await fetch(API + endpoint, opts);

            if (res.ok) return { ok: true, data: await res.json() };

            if (res.status === 429) {
                const wait = RETRY_DELAY * (attempt + 1);
                process.stdout.write(`[429 rate limit, waiting ${wait}ms] `);
                await sleep(wait);
                continue;
            }

            return { ok: false, status: res.status, error: await res.text() };
        } catch (e) {
            if (attempt < retries - 1) {
                await sleep(1000);
                continue;
            }
            return { ok: false, error: e.message };
        }
    }
    return { ok: false, error: 'Max retries exceeded' };
}

async function deleteLead(leadId) {
    return apiCall('/leads/' + leadId, 'DELETE');
}

async function listLeads(cursor) {
    const body = { campaign_id: CAMPAIGN, limit: BATCH_SIZE };
    if (cursor) body.starting_after = cursor;
    return apiCall('/leads/list', 'POST', body);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ═══════════════════════════════════════════════════════════════════════
// MAIN PURGE ENGINE
// ═══════════════════════════════════════════════════════════════════════

async function purge() {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║  NORTHSTAR MEDIC — FULL-SPEED FAKE LEAD PURGE             ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║  Campaign: ' + CAMPAIGN + '  ║');
    console.log('║  Concurrency: ' + DELETE_CONCURRENCY + ' parallel deletes                     ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');

    if (!KEY || !CAMPAIGN) {
        console.error('Missing INSTANTLY_API_KEY or INSTANTLY_CAMPAIGN_ID in .env');
        process.exit(1);
    }

    const startTime = Date.now();
    let totalScanned = 0;
    let totalDeleted = 0;
    let totalKept = 0;
    let cursor = null;
    let pageNum = 0;
    let consecutiveEmpty = 0;
    const fakeReasons = {};

    // Phase 1: Scan + Delete
    console.log('PHASE 1: Scanning all leads & deleting fakes...\n');

    while (true) {
        pageNum++;
        const result = await listLeads(cursor);

        if (!result.ok) {
            console.log('API Error on page ' + pageNum + ':', result.error);
            if (result.status === 429) {
                await sleep(5000);
                continue;
            }
            break;
        }

        const items = result.data.items || result.data || [];
        if (!Array.isArray(items) || items.length === 0) {
            consecutiveEmpty++;
            if (consecutiveEmpty > 3) break;
            await sleep(500);
            continue;
        }
        consecutiveEmpty = 0;

        const fakes = [];
        const reals = [];

        for (const lead of items) {
            const reason = isFake(lead);
            if (reason) {
                fakes.push(lead);
                fakeReasons[reason] = (fakeReasons[reason] || 0) + 1;
            } else {
                reals.push(lead);
            }
        }

        totalScanned += items.length;
        totalKept += reals.length;

        // Delete fakes in parallel batches
        if (fakes.length > 0) {
            for (let i = 0; i < fakes.length; i += DELETE_CONCURRENCY) {
                const batch = fakes.slice(i, i + DELETE_CONCURRENCY);
                const results = await Promise.all(batch.map(l => deleteLead(l.id)));
                const successCount = results.filter(r => r.ok).length;
                totalDeleted += successCount;
            }
        }

        // Progress report every 10 pages
        if (pageNum % 10 === 0 || fakes.length > 0) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
            const rate = Math.round(totalScanned / (elapsed / 60 || 1));
            process.stdout.write(
                `\r  [${elapsed}s] Page ${pageNum} | Scanned: ${totalScanned.toLocaleString()} | ` +
                `Deleted: ${totalDeleted.toLocaleString()} | Kept: ${totalKept.toLocaleString()} | ` +
                `Rate: ${rate.toLocaleString()}/min`
            );
        }

        // Advance cursor past real leads
        if (reals.length > 0) {
            cursor = reals[reals.length - 1].id;
        } else if (fakes.length > 0 && reals.length === 0) {
            // Entire page was fakes — deleted, restart from same position
            cursor = null;
        }

        if (items.length < BATCH_SIZE) break;
    }

    console.log('\n');

    // Phase 2: Second pass to catch any stragglers (list shifted after deletions)
    if (totalDeleted > 0) {
        console.log('PHASE 2: Verification pass (catching stragglers)...\n');
        let pass2Deleted = 0;
        cursor = null;
        let pass2Pages = 0;

        while (true) {
            pass2Pages++;
            const result = await listLeads(cursor);
            if (!result.ok || !result.data) break;

            const items = result.data.items || result.data || [];
            if (!Array.isArray(items) || items.length === 0) break;

            const fakes = items.filter(l => isFake(l));
            const reals = items.filter(l => !isFake(l));

            if (fakes.length > 0) {
                for (let i = 0; i < fakes.length; i += DELETE_CONCURRENCY) {
                    const batch = fakes.slice(i, i + DELETE_CONCURRENCY);
                    const results = await Promise.all(batch.map(l => deleteLead(l.id)));
                    pass2Deleted += results.filter(r => r.ok).length;
                }
            }

            if (reals.length > 0) {
                cursor = reals[reals.length - 1].id;
            } else {
                cursor = null;
            }

            if (pass2Pages % 20 === 0) {
                process.stdout.write(`\r  Pass 2: page ${pass2Pages} | Extra fakes found: ${pass2Deleted}`);
            }

            if (items.length < BATCH_SIZE) break;
        }

        totalDeleted += pass2Deleted;
        console.log(`\n  Pass 2 complete: ${pass2Deleted} additional fakes removed\n`);
    }

    // Phase 3: Final count
    console.log('PHASE 3: Counting remaining clean leads...\n');
    let finalCount = 0;
    cursor = null;
    let countPages = 0;

    while (true) {
        countPages++;
        const result = await listLeads(cursor);
        if (!result.ok || !result.data) break;

        const items = result.data.items || result.data || [];
        if (!Array.isArray(items) || items.length === 0) break;

        finalCount += items.length;
        cursor = items[items.length - 1].id;

        if (countPages % 50 === 0) {
            process.stdout.write(`\r  Counting... ${finalCount.toLocaleString()} leads so far (page ${countPages})`);
        }

        if (items.length < BATCH_SIZE) break;
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(0);
    const minutes = (totalTime / 60).toFixed(1);

    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║  PURGE COMPLETE                                             ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║  Leads Scanned:  ' + totalScanned.toLocaleString().padEnd(41) + '║');
    console.log('║  Fakes Deleted:  ' + totalDeleted.toLocaleString().padEnd(41) + '║');
    console.log('║  Clean Remaining:' + finalCount.toLocaleString().padEnd(41) + '║');
    console.log('║  Time:           ' + (minutes + ' minutes').padEnd(41) + '║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║  Fake Breakdown:                                            ║');

    for (const [reason, count] of Object.entries(fakeReasons).sort((a, b) => b[1] - a[1])) {
        console.log('║    ' + (reason + ': ' + count).padEnd(55) + '║');
    }

    if (Object.keys(fakeReasons).length === 0) {
        console.log('║    No fakes found — campaign is clean!                     ║');
    }

    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
}

purge().catch(e => {
    console.error('\nFatal error:', e);
    process.exit(1);
});

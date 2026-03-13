/**
 * 🚀 MEGA UPLOAD ENGINE v1
 * 
 * Blasts leads from CSV into Instantly campaign at HIGH SPEED.
 * Uses bulk batch endpoint for maximum throughput.
 * 
 * Usage:
 *   node mega_upload.js                          # Dry run (shows what would be sent)
 *   node mega_upload.js --live                    # Live upload from medical_whales_5000.csv
 *   node mega_upload.js --live --file leads.csv   # Live upload from custom CSV
 *   node mega_upload.js --live --batch 50         # Override batch size (default: 25)
 *   node mega_upload.js --live --skip 1000        # Skip first 1000 rows (resume)
 *   node mega_upload.js --live --limit 5000       # Only upload first 5000 leads
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════
const args = process.argv.slice(2);
const IS_LIVE = args.includes('--live');
const getArg = (key) => args.find((a, i) => args[i - 1] === key);

const CSV_FILE = getArg('--file') || 'medical_whales_5000.csv';
const BATCH_SIZE = parseInt(getArg('--batch') || '25');
const SKIP_ROWS = parseInt(getArg('--skip') || '0');
const LIMIT = parseInt(getArg('--limit') || '0'); // 0 = no limit
const DELAY_MS = parseInt(getArg('--delay') || '500'); // ms between batches
const STATE_FILE = path.join(__dirname, 'mega_upload_state.json');

// ═══════════════════════════════════════════
// CSV PARSER (zero dependency)
// ═══════════════════════════════════════════
function parseCSV(filePath) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const lines = raw.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return [];

    const headers = parseCSVLine(lines[0]);
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row = {};
        headers.forEach((h, idx) => {
            row[h.trim()] = (values[idx] || '').trim();
        });
        rows.push(row);
    }

    return rows;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += ch;
        }
    }
    result.push(current);
    return result;
}

// ═══════════════════════════════════════════
// PERSONALIZATION ENGINE
// ═══════════════════════════════════════════
function personalize(lead) {
    const pitches = {
        'ceo': `As ${lead.CompanyName}'s CEO, you\'re likely aware that denied claims represent your largest controllable revenue leak.`,
        'cfo': `As CFO at ${lead.CompanyName}, every denied claim sitting unrecovered is cash left on the table.`,
        'chief financial': `As CFO at ${lead.CompanyName}, every denied claim sitting unrecovered is cash left on the table.`,
        'medical director': `Dr. ${lead.LastName}, your clinical expertise justifies these procedures — our AI ensures payers acknowledge it.`,
        'director': `At ${lead.CompanyName}, your team fights denials daily. What if that was fully automated?`,
        'practice manager': `Managing ${lead.CompanyName}'s revenue cycle means fighting denials daily. What if that was fully automated?`,
        'revenue cycle': `Your revenue cycle at ${lead.CompanyName} likely has 6-12% of billings trapped in wrongful denials.`,
        'billing': `The billing team at ${lead.CompanyName} shouldn't spend hours on appeals that AI can draft in seconds.`,
        'vp': `At ${lead.CompanyName}, denied claims likely represent a 7-figure revenue leak. Our AI plugs it.`,
        'administrator': `As ${lead.CompanyName}'s Administrator, you know your A/R team is overwhelmed by denials. AI can fix that overnight.`,
    };

    const titleLower = (lead.Title || '').toLowerCase();
    for (const [key, pitch] of Object.entries(pitches)) {
        if (titleLower.includes(key)) return pitch;
    }
    return `At ${lead.CompanyName}, denied claims likely represent a significant revenue leak. Our AI finds and appeals them automatically — zero upfront cost.`;
}

// ═══════════════════════════════════════════
// INSTANTLY UPLOAD (one-by-one with speed)
// ═══════════════════════════════════════════
async function uploadLeads(leads) {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;

    if (!apiKey || !campaignId) {
        throw new Error('Missing INSTANTLY_API_KEY or INSTANTLY_CAMPAIGN_ID in .env');
    }

    let added = 0;
    let skipped = 0;
    let errors = 0;
    let limitHit = false;
    const startTime = Date.now();

    const total = leads.length;
    console.log(`\n🚀 Uploading ${total.toLocaleString()} leads to campaign ${campaignId}...\n`);

    for (let i = 0; i < leads.length; i++) {
        const lead = leads[i];
        const payload = {
            email: lead.Email,
            first_name: lead.FirstName,
            last_name: lead.LastName,
            company_name: lead.CompanyName,
            campaign_id: campaignId,
            skip_if_in_workspace: true,
            custom_variables: {
                title: lead.Title || '',
                city: lead.City || '',
                state: lead.State || '',
                personalization: personalize(lead),
            },
        };

        try {
            const res = await fetch('https://api.instantly.ai/api/v2/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                added++;
            } else {
                const errText = await res.text();
                if (errText.includes('Lead limit reached') || errText.includes('limit')) {
                    console.log(`\n\n🛑 LEAD LIMIT REACHED after ${added} uploads. Stopping.`);
                    limitHit = true;
                    break;
                }
                skipped++;
            }
        } catch (e) {
            errors++;
        }

        // Progress display every 25 leads
        if ((i + 1) % 25 === 0 || i === leads.length - 1) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            const rate = (added / (elapsed || 1)).toFixed(1);
            const pct = ((i + 1) / total * 100).toFixed(1);
            const remaining = ((total - i - 1) / (rate || 1)).toFixed(0);
            process.stdout.write(`\r   📊 [${pct}%] ${added} added | ${skipped} skipped | ${errors} errors | ${rate}/s | ~${remaining}s remaining   `);
        }

        // Throttle to avoid hammering the API
        if ((i + 1) % BATCH_SIZE === 0) {
            await new Promise(r => setTimeout(r, DELAY_MS));
        }

        // Save checkpoint every 100 leads
        if ((i + 1) % 100 === 0) {
            saveState({ lastIndex: SKIP_ROWS + i + 1, added, skipped, errors, timestamp: new Date().toISOString() });
        }
    }

    console.log('\n');
    return { added, skipped, errors, limitHit };
}

// ═══════════════════════════════════════════
// STATE MANAGEMENT
// ═══════════════════════════════════════════
function loadState() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
        }
    } catch (e) { }
    return null;
}

function saveState(state) {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ═══════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════
async function main() {
    const csvPath = path.resolve(__dirname, CSV_FILE);

    console.log('══════════════════════════════════════════════════════════');
    console.log('  🚀 MEGA UPLOAD ENGINE v1');
    console.log('══════════════════════════════════════════════════════════');
    console.log(`  CSV File:    ${CSV_FILE}`);
    console.log(`  Mode:        ${IS_LIVE ? '🔴 LIVE' : '🟡 DRY RUN'}`);
    console.log(`  Batch Size:  ${BATCH_SIZE}`);
    console.log(`  Skip Rows:   ${SKIP_ROWS}`);
    console.log(`  Limit:       ${LIMIT || 'No limit'}`);
    console.log(`  Delay:       ${DELAY_MS}ms between batches`);

    if (!fs.existsSync(csvPath)) {
        console.error(`\n❌ CSV file not found: ${csvPath}`);
        process.exit(1);
    }

    // Parse CSV
    console.log(`\n📂 Parsing ${CSV_FILE}...`);
    let leads = parseCSV(csvPath);
    console.log(`   Found ${leads.length.toLocaleString()} total leads in CSV`);

    // Apply skip
    if (SKIP_ROWS > 0) {
        leads = leads.slice(SKIP_ROWS);
        console.log(`   Skipped first ${SKIP_ROWS} — ${leads.length.toLocaleString()} remaining`);
    }

    // Apply limit
    if (LIMIT > 0 && leads.length > LIMIT) {
        leads = leads.slice(0, LIMIT);
        console.log(`   Limited to ${leads.length.toLocaleString()} leads`);
    }

    // Preview first 5
    console.log(`\n📋 Preview (first 5 leads):`);
    leads.slice(0, 5).forEach((l, i) => {
        console.log(`   ${i + 1}. ${l.FirstName} ${l.LastName} | ${l.Title} @ ${l.CompanyName} | ${l.Email}`);
    });

    // Check for previous state
    const prevState = loadState();
    if (prevState) {
        console.log(`\n📌 Previous upload state found:`);
        console.log(`   Last index: ${prevState.lastIndex}, Added: ${prevState.added}, At: ${prevState.timestamp}`);
        console.log(`   💡 Use --skip ${prevState.lastIndex} to resume from where you left off`);
    }

    console.log('══════════════════════════════════════════════════════════\n');

    if (!IS_LIVE) {
        console.log('⏸️  DRY RUN — No leads uploaded. Run with --live to push leads.\n');
        return;
    }

    // GO TIME
    const startTime = Date.now();
    const result = await uploadLeads(leads);
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('══════════════════════════════════════════════════════════');
    console.log('  📊 UPLOAD COMPLETE');
    console.log('══════════════════════════════════════════════════════════');
    console.log(`  ✅ Added:      ${result.added.toLocaleString()}`);
    console.log(`  ⏭️  Skipped:    ${result.skipped.toLocaleString()}`);
    console.log(`  ❌ Errors:     ${result.errors}`);
    console.log(`  ⏱️  Time:       ${totalTime}s`);
    console.log(`  🚀 Rate:       ${(result.added / (totalTime || 1)).toFixed(1)} leads/sec`);
    if (result.limitHit) {
        console.log(`  🛑 LIMIT HIT — Upgrade Instantly plan for more capacity`);
    }
    console.log('══════════════════════════════════════════════════════════\n');

    // Save final state
    saveState({
        lastIndex: SKIP_ROWS + leads.length,
        added: result.added,
        skipped: result.skipped,
        errors: result.errors,
        limitHit: result.limitHit,
        totalTime,
        timestamp: new Date().toISOString(),
    });
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});

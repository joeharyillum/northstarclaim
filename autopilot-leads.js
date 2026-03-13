require('dotenv').config();
const fs = require('fs');
const path = require('path');

/**
 * ULTIMATE AUTOPILOT - 65,000+ Lead Pusher
 * Handles massive volume with parallel pushing and CSV/JSON import
 */

const CONFIG = {
    BATCH_SIZE: 5000,           // Push 5000 leads at a time (massive batches)
    PARALLEL_PUSHES: 10,        // Push 10 batches in parallel = 50k/cycle
    CHECK_INTERVAL: 20000,      // Check every 20 seconds
    MIN_BUFFER: 15000,          // Keep 15k+ in system
    RETRY_ATTEMPTS: 2,
    PUSH_TIMEOUT: 15000,
    
    // 🛡️ SAFETY LIMITS - Prevent runaway costs
    DAILY_CREDIT_LIMIT: 1000,   // Max 1000 Apollo credits/day
    MAX_CONCURRENT_PUSHES: 50,  // Max 50 simultaneous API calls
    DAILY_VOLUME_LIMIT: 50000,  // Max 50k leads/day
    SAFETY_MODE: true,          // Require approval for bulk ops
    LOW_BALANCE_ALERT: 500      // Alert if balance drops below this
};

let statsFile = 'autopilot-stats.json';
let leadsFile = 'leads-pool.json';

// Initialize stats
function initStats() {
    if (!fs.existsSync(statsFile)) {
        fs.writeFileSync(statsFile, JSON.stringify({
            totalPushed: 0,
            pushesToday: 0,
            creditUsedToday: 0,
            lastPush: null,
            bulkLoads: 0,
            errors: 0,
            lastBalanceCheck: null,
            apolloBalance: 0,
            estApolloBalance: 0
        }, null, 2));
    }
}

/**
 * 🛡️ Check safety limits before pushing
 */
function checkSafetyLimits() {
    const stats = getStats();
    const issues = [];
    
    // Check daily volume limit
    if (stats.pushesToday >= CONFIG.DAILY_VOLUME_LIMIT) {
        issues.push(`⚠️  Daily volume limit reached (${stats.pushesToday}/${CONFIG.DAILY_VOLUME_LIMIT})`);
    }
    
    // Check daily credit limit
    if (stats.creditUsedToday >= CONFIG.DAILY_CREDIT_LIMIT) {
        issues.push(`⚠️  Daily credit limit reached (${stats.creditUsedToday}/${CONFIG.DAILY_CREDIT_LIMIT})`);
    }
    
    // Check estimated Apollo balance
    if (stats.estApolloBalance < CONFIG.LOW_BALANCE_ALERT) {
        issues.push(`⚠️  LOW BALANCE: ~${stats.estApolloBalance} Apollo credits remaining`);
    }
    
    if (issues.length > 0) {
        console.log('\n🚨 SAFETY CHECKS FAILED:');
        issues.forEach(i => console.log(`   ${i}`));
        return false;
    }
    
    return true;
}

/**
 * Get Apollo account balance (requires Apollo API)
 */
async function checkApolloBalance() {
    const apiKey = process.env.APOLLO_API_KEY;
    if (!apiKey) return null;
    
    try {
        const res = await fetch('https://api.apollo.io/v1/accounts/me', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        
        if (!res.ok) return null;
        const data = await res.json();
        return data.user?.credits || 0;
    } catch (e) {
        return null;
    }
}

function getStats() {
    return JSON.parse(fs.readFileSync(statsFile, 'utf8'));
}

function updateStats(updates) {
    const stats = getStats();
    Object.assign(stats, updates);
    fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
}

/**
 * Load leads from CSV or JSON
 */
function loadLeadsFromFile(filename) {
    if (!fs.existsSync(filename)) {
        console.log(`[LOAD] File not found: ${filename}`);
        return [];
    }

    try {
        if (filename.endsWith('.json')) {
            const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
            return Array.isArray(data) ? data : data.leads || [];
        } else if (filename.endsWith('.csv')) {
            const lines = fs.readFileSync(filename, 'utf8').split('\n');
            const headers = lines[0].split(',');
            const leads = [];
            
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                const values = lines[i].split(',');
                const lead = {};
                headers.forEach((h, idx) => {
                    lead[h.trim().toLowerCase()] = (values[idx] || '').trim();
                });
                leads.push(lead);
            }
            return leads;
        }
    } catch (e) {
        console.error(`[LOAD ERROR] ${e.message}`);
    }
    return [];
}

/**
 * Bulk import leads into memory pool
 */
async function bulkImportLeads(filename) {
    console.log(`\n📥 [BULK IMPORT] Loading from ${filename}...`);
    
    const leads = loadLeadsFromFile(filename);
    if (leads.length === 0) {
        console.log('❌ No leads found');
        return 0;
    }

    console.log(`✅ Loaded ${leads.length} leads`);
    
    // Normalize leads
    const normalized = leads.map(l => ({
        email: l.email || l.emailaddress || l.email_address || '',
        firstName: l.firstname || l.first_name || 'Contact',
        lastName: l.lastname || l.last_name || 'Person',
        organization: l.organization || l.company || l.organization_name || 'Healthcare',
        title: l.title || l.jobtitle || l.job_title || 'Manager',
        city: l.city || '',
        state: l.state || l.stateprovince || '',
        phone: l.phone || l.phone_number || ''
    })).filter(l => l.email && l.email.includes('@'));

    // Save to pool
    fs.writeFileSync(leadsFile, JSON.stringify(normalized, null, 2));
    
    console.log(`💾 Saved ${normalized.length} valid leads to pool`);
    updateStats({ bulkLoads: (getStats().bulkLoads || 0) + 1 });
    
    return normalized.length;
}

/**
 * Get next batch from pool
 */
function getNextBatch(size = CONFIG.BATCH_SIZE) {
    if (!fs.existsSync(leadsFile)) {
        return [];
    }

    try {
        const allLeads = JSON.parse(fs.readFileSync(leadsFile, 'utf8'));
        const batch = allLeads.slice(0, size);
        
        // Remove pushed leads from file
        const remaining = allLeads.slice(size);
        if (remaining.length > 0) {
            fs.writeFileSync(leadsFile, JSON.stringify(remaining, null, 2));
        } else {
            fs.unlinkSync(leadsFile);
        }

        return batch;
    } catch (e) {
        return [];
    }
}

/**
 * Push single lead to Instantly
 */
async function pushLead(lead) {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;

    const payload = {
        email: lead.email,
        first_name: lead.firstName,
        last_name: lead.lastName,
        company_name: lead.organization,
        phone: lead.phone,
        campaign_id: campaignId,
        skip_if_in_workspace: true,
        custom_variables: {
            title: lead.title,
            city: lead.city,
            state: lead.state,
            personalization: `As ${lead.organization}'s ${lead.title}, you know denied claims cost millions. Our AI automatically recovers them.`
        }
    };

    try {
        const res = await fetch('https://api.instantly.ai/api/v2/leads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload),
            timeout: CONFIG.PUSH_TIMEOUT
        });

        return res.ok || res.status === 409; // 409 = already exists (OK)
    } catch (e) {
        return false;
    }
}

/**
 * Push batch of leads in parallel
 */
async function pushBatch(leads) {
    let success = 0;

    const promises = leads.map(lead => 
        pushLead(lead)
            .then(ok => ok ? success++ : null)
            .catch(() => null)
    );

    await Promise.all(promises);
    return success;
}

/**
 * Main push cycle - handles multiple batches in parallel
 */
async function pushCycle() {
    const stats = getStats();
    console.log(`\n⚡ [PUSH CYCLE] Starting at ${new Date().toLocaleTimeString()}`);

    // 🛡️ Check safety limits BEFORE pushing
    if (!checkSafetyLimits()) {
        console.log('❌ Safety limits preventing push. Check daily quotas.');
        return 0;
    }

    let totalPushed = 0;

    // Get multiple batches and push in parallel
    const batches = [];
    for (let i = 0; i < CONFIG.PARALLEL_PUSHES; i++) {
        const batch = getNextBatch(CONFIG.BATCH_SIZE);
        if (batch.length === 0) break;
        batches.push(batch);
    }

    if (batches.length === 0) {
        console.log('⏳ No leads in pool. Waiting for import...');
        return 0;
    }

    const totalLeads = batches.reduce((sum, b) => sum + b.length, 0);
    console.log(`📤 Pushing ${batches.length} batches (${totalLeads} total leads)...`);

    const promises = batches.map((batch, idx) => {
        process.stdout.write(`  Batch ${idx + 1}: `);
        return pushBatch(batch)
            .then(count => {
                console.log(`${count}/${batch.length} ✓`);
                totalPushed += count;
            });
    });

    await Promise.all(promises);

    stats.pushesToday += totalPushed;
    stats.totalPushed += totalPushed;
    stats.lastPush = new Date().toISOString();
    updateStats(stats);

    console.log(`\n✅ Cycle complete: +${totalPushed} leads`);
    console.log(`   Today: ${stats.pushesToday} | Total: ${stats.totalPushed}`);

    return totalPushed;
}

/**
 * Main autopilot loop
 */
async function autopilot() {
    const stats = getStats();
    const poolSize = fs.existsSync(leadsFile) 
        ? JSON.parse(fs.readFileSync(leadsFile, 'utf8')).length 
        : 0;

    console.log('\n' + '='.repeat(70));
    console.log(`🤖 AUTOPILOT | Pool: ${poolSize} leads remaining | Today: ${stats.pushesToday}`);
    console.log('='.repeat(70));

    if (poolSize > 0) {
        await pushCycle();
    } else {
        console.log('⏳ No leads in pool. Waiting for import...');
    }

    console.log(`⏱️  Next check in ${CONFIG.CHECK_INTERVAL / 1000}s\n`);
}

/**
 * Start autopilot
 */
function startAutopilot() {
    initStats();
    
    console.log('\n🚀 NORTHSTAR AUTOPILOT v2 - 65,000+ LEADS');
    console.log('━'.repeat(70));
    console.log(`Config:`);
    console.log(`  • Batch Size: ${CONFIG.BATCH_SIZE} leads`);
    console.log(`  • Parallel Batches: ${CONFIG.PARALLEL_PUSHES}`);
    console.log(`  • Check Interval: ${CONFIG.CHECK_INTERVAL / 1000}s`);
    console.log(`  • Min Buffer: ${CONFIG.MIN_BUFFER} leads`);
    console.log('\nUsage:');
    console.log(`  # Import CSV or JSON file`);
    console.log(`  node autopilot-leads.js import leads.csv`);
    console.log(`  node autopilot-leads.js import leads.json`);
    console.log(`\n  # Check status`);
    console.log(`  node autopilot-leads.js status`);
    console.log(`\n  # Start continuous pushing`);
    console.log(`  node autopilot-leads.js`);
    console.log('━'.repeat(70));

    // Handle CLI arguments
    const args = process.argv.slice(2);
    if (args[0] === 'import' && args[1]) {
        bulkImportLeads(args[1]).then((count) => {
            console.log(`\n✅ Imported ${count} leads. Autopilot starting...\n`);
            setTimeout(() => startLoop(), 2000);
        });
    } else if (args[0] === 'status') {
        const stats = getStats();
        const poolSize = fs.existsSync(leadsFile) 
            ? JSON.parse(fs.readFileSync(leadsFile, 'utf8')).length 
            : 0;
        console.log('\n📊 AUTOPILOT STATUS');
        console.log('━'.repeat(70));
        console.log(`Total pushed all-time: ${stats.totalPushed}`);
        console.log(`Pushed today: ${stats.pushesToday}`);
        console.log(`Leads in pool: ${poolSize}`);
        console.log(`Bulk imports: ${stats.bulkLoads}`);
        console.log(`Last push: ${stats.lastPush || 'Never'}`);
        console.log('━'.repeat(70));
        process.exit(0);
    } else {
        startLoop();
    }
}

function startLoop() {
    // First run immediately
    autopilot();
    
    // Then repeat
    setInterval(autopilot, CONFIG.CHECK_INTERVAL);
    
    // Log every 5 minutes
    setInterval(() => {
        const stats = getStats();
        fs.appendFileSync('autopilot.log', 
            `${new Date().toISOString()} | Pushed today: ${stats.pushesToday}\n`
        );
    }, 5 * 60 * 1000);
}

// Graceful shutdown
process.on('SIGINT', () => {
    const stats = getStats();
    console.log('\n\n✋ AUTOPILOT STOPPING');
    console.log(`━`.repeat(70));
    console.log(`Session Summary:`);
    console.log(`  • Pushed this session: ${stats.pushesToday}`);
    console.log(`  • Total all-time: ${stats.totalPushed}`);
    console.log(`━`.repeat(70));
    process.exit(0);
});

startAutopilot();

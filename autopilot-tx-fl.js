#!/usr/bin/env node

/**
 * 🚀 NORTHSTAR ATTACK SEQUENCE - TEXAS & FLORIDA HAMMER CAMPAIGN
 * 
 * Purpose: Aggressive lead pushing targeting high-value healthcare markets
 * Markets: Texas, Florida (top 2 medical claim markets)
 * Volume: 650,000+ leads at maximum velocity
 * Mode: LIVE FIRE 🔥
 */

require('dotenv').config();
const fs = require('fs');

const CONFIG = {
    // TARGETING: Texas + Florida (top healthcare markets)
    TARGET_STATES: ['Texas', 'Florida', 'TX', 'FL'],
    TARGET_CITIES: [
        // TEXAS (450+ hospitals)
        'Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth', 'Arlington', 'Corpus Christi',
        'Plano', 'Laredo', 'Irving', 'Garland', 'Lubbock', 'Brownsville', 'Beaumont',
        // FLORIDA (235+ hospitals)
        'Miami', 'Tampa', 'Orlando', 'Jacksonville', 'Fort Lauderdale', 'West Palm Beach',
        'Tallahassee', 'Cape Coral', 'Sarasota', 'Clearwater', 'Gainesville', 'Pensacola'
    ],
    
    // LEAD VELOCITY PARAMETERS
    BATCH_SIZE: 5000,           // Push 5,000 per batch
    PARALLEL_PUSHES: 15,        // 15 concurrent batches = 75,000/cycle
    CHECK_INTERVAL: 15000,      // Check every 15 seconds (faster)
    PUSH_TIMEOUT: 12000,        // Faster timeout
    
    // TARGET DECISION MAKERS
    TARGET_ROLES: [
        'CEO', 'CFO', 'Chief Financial Officer', 'Medical Director',
        'Practice Manager', 'Revenue Cycle Manager', 'Billing Manager',
        'Director of Revenue Cycle', 'VP Finance', 'Office Manager',
        'Administrator', 'Finance Director', 'Operations Manager',
        'Chief Operating Officer', 'VP Operations', 'Controller',
        'Billing Director', 'Compliance Officer', 'Executive Director'
    ],
    
    // VOLUME TARGETS
    MIN_BUFFER: 20000,          // Keep min 20k in the chamber
    PEAK_HOURS: true,           // Send during payer peak hours (9-11 AM EST)
    
    // CAMPAIGN TRACKING
    CAMPAIGN_NAME: 'HAMMER_TX_FL',
    MIN_DAILY_TARGET: 100000,   // Push minimum 100k/day
};

let sessionStats = {
    startTime: new Date(),
    leadsPushed: 0,
    leadsFailed: 0,
    batchesCompleted: 0,
    currentRate: 0,
    targetAllocations: {
        'Texas': 0,
        'Florida': 0
    }
};

/**
 * Load leads from your CSV/JSON file
 */
function loadLeadsPool(filename) {
    if (!fs.existsSync(filename)) {
        console.error(`❌ [LOAD] File not found: ${filename}`);
        return [];
    }

    try {
        if (filename.endsWith('.json')) {
            const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
            return Array.isArray(data) ? data : data.leads || [];
        } else if (filename.endsWith('.csv')) {
            const lines = fs.readFileSync(filename, 'utf8').split('\n');
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const leads = [];
            
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                const values = lines[i].split(',').map(v => v.trim());
                const lead = {};
                headers.forEach((h, idx) => {
                    lead[h] = values[idx] || '';
                });
                leads.push(lead);
            }
            return leads;
        }
    } catch (e) {
        console.error(`❌ [LOAD ERROR] ${e.message}`);
    }
    return [];
}

/**
 * Filter leads by Texas & Florida only
 */
function filterTargetLeads(leads) {
    return leads.filter(lead => {
        const state = (lead.state || lead.stateprovince || '').toUpperCase();
        return CONFIG.TARGET_STATES.includes(state);
    });
}

/**
 * Push single lead to Instantly
 */
async function pushLead(lead) {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;

    const payload = {
        email: lead.email || lead.emailaddress || '',
        first_name: lead.firstname || lead.first_name || 'Contact',
        last_name: lead.lastname || lead.last_name || 'Person',
        company_name: lead.organization || lead.company || 'Healthcare',
        phone: lead.phone || '',
        campaign_id: campaignId,
        skip_if_in_workspace: true,
        custom_variables: {
            state: lead.state || '',
            title: lead.title || 'Manager',
            personalization: `Your ${lead.organization || 'healthcare facility'} is leaving money on the table. We automatically recover denied claims. 100% contingency.`
        }
    };

    if (!payload.email || !payload.email.includes('@')) {
        return { success: false, reason: 'invalid_email' };
    }

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

        if (res.ok || res.status === 409) return { success: true };
        return { success: false, reason: `http_${res.status}` };
    } catch (e) {
        return { success: false, reason: 'network_error' };
    }
}

/**
 * Push batch in parallel
 */
async function pushBatchParallel(leads) {
    const promises = leads.map(lead => pushLead(lead));
    const results = await Promise.all(promises);
    return results.filter(r => r.success).length;
}

/**
 * Main attack sequence
 */
async function hammerCampaign() {
    console.log('\n' + '⚡'.repeat(70));
    console.log('🔥 NORTHSTAR ATTACK SEQUENCE - TEXAS & FLORIDA HAMMER CAMPAIGN');
    console.log('⚡'.repeat(70));
    
    const allLeads = loadLeadsPool('leads.csv') || loadLeadsPool('leads.json');
    
    if (allLeads.length === 0) {
        console.error('❌ No leads loaded. Please import CSV/JSON first:');
        console.error('   node autopilot-tx-fl.js import leads.csv');
        process.exit(1);
    }

    // Filter to TX + FL only
    const targetLeads = filterTargetLeads(allLeads);
    console.log(`\n📊 [TARGETING] Total leads: ${allLeads.length}`);
    console.log(`🎯 [FILTERED] Texas + Florida only: ${targetLeads.length}`);
    console.log(`💰 [REVENUE] @ 30% × $50k avg = $${(targetLeads.length * 50000 * 0.3 / 1000000).toFixed(1)}M potential\n`);

    if (targetLeads.length === 0) {
        console.error('❌ No leads found in Texas or Florida. Check your data.');
        process.exit(1);
    }

    let totalProcessed = 0;
    let totalPushed = 0;

    // Push in waves
    while (totalProcessed < targetLeads.length) {
        const batches = [];
        
        for (let i = 0; i < CONFIG.PARALLEL_PUSHES; i++) {
            const startIdx = totalProcessed + (i * CONFIG.BATCH_SIZE);
            const endIdx = Math.min(startIdx + CONFIG.BATCH_SIZE, targetLeads.length);
            
            if (startIdx >= targetLeads.length) break;
            
            batches.push(targetLeads.slice(startIdx, endIdx));
        }

        if (batches.length === 0) break;

        console.log(`\n⚡ [WAVE] Pushing ${batches.length} batches...`);
        
        const batchPromises = batches.map((batch, idx) => {
            process.stdout.write(`  Batch ${idx + 1}/${batches.length}: `);
            return pushBatchParallel(batch).then(count => {
                console.log(`${count}/${batch.length} ✓`);
                totalPushed += count;
                sessionStats.leadsPushed += count;
                sessionStats.batchesCompleted++;
            });
        });

        await Promise.all(batchPromises);
        
        totalProcessed += batches.reduce((sum, b) => sum + b.length, 0);
        
        const elapsed = (Date.now() - sessionStats.startTime.getTime()) / 1000;
        const rate = (totalPushed / elapsed * 60).toFixed(0);
        
        console.log(`\n📈 [PROGRESS] ${totalPushed}/${targetLeads.length} leads pushed`);
        console.log(`⏱️  [RATE] ${rate} leads/minute`);
        console.log(`⏳ [ETA] ${Math.ceil((targetLeads.length - totalPushed) / (rate || 1000))} minutes remaining\n`);

        if (totalProcessed < targetLeads.length) {
            await new Promise(r => setTimeout(r, CONFIG.CHECK_INTERVAL));
        }
    }

    // Final report
    console.log('\n' + '✅'.repeat(70));
    console.log('🎯 CAMPAIGN SUMMARY - TEXAS & FLORIDA OFFENSIVE');
    console.log('✅'.repeat(70));
    console.log(`\n📊 Final Results:`);
    console.log(`   Total Leads Targeted: ${targetLeads.length}`);
    console.log(`   Successfully Pushed: ${totalPushed}`);
    console.log(`   Success Rate: ${((totalPushed / targetLeads.length) * 100).toFixed(1)}%`);
    console.log(`   Time Elapsed: ${((Date.now() - sessionStats.startTime.getTime()) / 60000).toFixed(1)} minutes`);
    console.log(`   Average Rate: ${(totalPushed / ((Date.now() - sessionStats.startTime.getTime()) / 60000)).toFixed(0)} leads/minute`);
    console.log(`\n💰 Revenue Projection (30% × $50k average):`);
    console.log(`   Potential Year 1 Recovery: $${(totalPushed * 50000).toLocaleString()}`);
    console.log(`   Your Revenue (30%): $${(totalPushed * 50000 * 0.30).toLocaleString()}`);
    console.log(`   Your Commission (50% to billers): $${(totalPushed * 50000 * 0.30 * 0.50).toLocaleString()}`);
    console.log(`\n🎯 Next Steps:`);
    console.log(`   1. Monitor inbox for replies`);
    console.log(`   2. Push signup replies to /signup`);
    console.log(`   3. First recovery target: 21-35 days`);
    console.log(`   4. Scale to other states once TX/FL locked\n`);

    fs.appendFileSync('campaign-log.txt', `${new Date().toISOString()} | TX/FL Campaign | Pushed: ${totalPushed} | Success Rate: ${((totalPushed / targetLeads.length) * 100).toFixed(1)}%\n`);
}

/**
 * CLI Handler
 */
async function main() {
    const args = process.argv.slice(2);
    
    if (args[0] === 'import' && args[1]) {
        console.log(`\n📥 Importing leads from ${args[1]}...`);
        const leads = loadLeadsPool(args[1]);
        const filtered = filterTargetLeads(leads);
        
        console.log(`✅ Loaded: ${leads.length} total`);
        console.log(`🎯 Texas + Florida: ${filtered.length}`);
        console.log(`\nState Breakdown:`);
        
        const stateCount = {};
        filtered.forEach(l => {
            const state = (l.state || l.stateprovince || 'UNKNOWN').toUpperCase();
            stateCount[state] = (stateCount[state] || 0) + 1;
        });
        
        Object.entries(stateCount).forEach(([state, count]) => {
            console.log(`  ${state}: ${count}`);
        });
        
        console.log(`\n✅ Ready to hammer. Run: node autopilot-tx-fl.js hammer\n`);
    } else if (args[0] === 'hammer') {
        await hammerCampaign();
    } else {
        console.log(`\n🚀 NORTHSTAR TX/FL HAMMER CAMPAIGN\n`);
        console.log(`Usage:`);
        console.log(`  node autopilot-tx-fl.js import leads.csv   (Load your 650k)`);
        console.log(`  node autopilot-tx-fl.js hammer              (FIRE!)\n`);
    }
}

main().catch(console.error);

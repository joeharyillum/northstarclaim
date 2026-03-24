#!/usr/bin/env node

/**
 * 🚨 EMERGENCY LEAD REPUSH - RESTORE CAMPAIGN
 * Pushes all 5000 leads from medical_whales_5000.csv back to Instantly
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const CONFIG = {
    CAMPAIGN_ID: process.env.INSTANTLY_CAMPAIGN_ID,
    API_KEY: process.env.INSTANTLY_API_KEY,
    BATCH_SIZE: 500,  // 500 per batch
    PARALLEL_BATCHES: 5,  // 5 parallel = 2500/request
    DELAY_BETWEEN_CYCLES: 5000  // 5 second delay between cycles
};

async function readCSV(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const lines = data.trim().split('\n');
        const header = lines[0].split(',').map(h => h.trim());
        
        const leads = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const lead = {};
            header.forEach((h, i) => {
                lead[h.toLowerCase()] = values[i];
            });
            return lead;
        });
        
        return leads;
    } catch (e) {
        console.error(`❌ Error reading CSV: ${e.message}`);
        return [];
    }
}

async function pushLeadBatch(leads) {
    try {
        const body = JSON.stringify({
            campaign_id: CONFIG.CAMPAIGN_ID,
            leads: leads.map(lead => ({
                email: lead.email,
                first_name: lead.firstname || lead.first_name || '',
                last_name: lead.lastname || lead.last_name || '',
                company: lead.companyname || lead.company || '',
                phone: lead.phone || '',
                custom_fields: {
                    title: lead.title || '',
                    city: lead.city || '',
                    state: lead.state || ''
                }
            }))
        });

        const res = await fetch('https://api.instantly.ai/api/v2/leads/add', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: body,
            timeout: 30000
        });

        if (!res.ok) {
            const err = await res.text();
            return {
                success: false,
                error: `API ${res.status}: ${err}`,
                pushed: 0
            };
        }

        const data = await res.json();
        return {
            success: true,
            pushed: leads.length,
            response: data
        };
    } catch (e) {
        return {
            success: false,
            error: e.message,
            pushed: 0
        };
    }
}

async function repushAllLeads() {
    console.log('\n' + '═'.repeat(80));
    console.log('🚨 EMERGENCY LEAD REPUSH TO INSTANTLY');
    console.log('═'.repeat(80) + '\n');

    // Read leads from local CSV
    console.log('📖 Reading leads from medical_whales_5000.csv...');
    const allLeads = await readCSV(path.join(__dirname, 'medical_whales_5000.csv'));
    
    if (allLeads.length === 0) {
        console.error('❌ No leads found in CSV file!');
        process.exit(1);
    }

    console.log(`✅ Found ${allLeads.length.toLocaleString()} leads to push\n`);

    let totalPushed = 0;
    let totalFailed = 0;
    const batchCount = Math.ceil(allLeads.length / CONFIG.BATCH_SIZE);

    // Process in parallel batches
    for (let i = 0; i < batchCount; i += CONFIG.PARALLEL_BATCHES) {
        const batchGroup = [];
        
        for (let j = 0; j < CONFIG.PARALLEL_BATCHES && i + j < batchCount; j++) {
            const startIdx = (i + j) * CONFIG.BATCH_SIZE;
            const endIdx = Math.min(startIdx + CONFIG.BATCH_SIZE, allLeads.length);
            const batch = allLeads.slice(startIdx, endIdx);
            
            console.log(`📤 Pushing batch ${i + j + 1}/${batchCount} (${batch.length} leads)...`);
            batchGroup.push(pushLeadBatch(batch));
        }

        // Wait for all parallel pushes to complete
        const results = await Promise.all(batchGroup);
        
        results.forEach((result, idx) => {
            if (result.success) {
                console.log(`   ✅ Batch ${i + idx + 1}: ${result.pushed} leads added`);
                totalPushed += result.pushed;
            } else {
                console.log(`   ❌ Batch ${i + idx + 1}: ${result.error}`);
                totalFailed += result.pushed;
            }
        });

        // Delay before next cycle to avoid rate limits
        if (i + CONFIG.PARALLEL_BATCHES < batchCount) {
            console.log(`⏳ Waiting 5 seconds before next batch group...\n`);
            await new Promise(r => setTimeout(r, CONFIG.DELAY_BETWEEN_CYCLES));
        }
    }

    // Summary
    console.log('\n' + '═'.repeat(80));
    console.log('📊 REPUSH COMPLETE');
    console.log('═'.repeat(80));
    console.log(`  Total Pushed:    ${totalPushed.toLocaleString()}`);
    console.log(`  Total Failed:    ${totalFailed.toLocaleString()}`);
    console.log(`  Success Rate:    ${((totalPushed / (totalPushed + totalFailed)) * 100).toFixed(1)}%`);
    
    if (totalPushed > 0) {
        console.log(`\n✅ LEADS RESTORED! Campaign is now LIVE with ${totalPushed.toLocaleString()} leads`);
        console.log('\n🔄 Campaign should start sending emails within seconds...\n');
    } else {
        console.log(`\n❌ No leads were pushed. Check your API key and campaign ID.`);
    }
    
    console.log('═'.repeat(80) + '\n');
}

repushAllLeads().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});

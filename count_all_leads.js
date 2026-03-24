#!/usr/bin/env node
require('dotenv').config();

const apiKey = process.env.INSTANTLY_API_KEY;
const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchPage(startingAfter, retries = 5) {
    const body = { campaign_id: campaignId, limit: 100 };
    if (startingAfter) body.starting_after = startingAfter;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const res = await fetch('https://api.instantly.ai/api/v2/leads/list', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (res.status === 429) {
                const wait = Math.min(2000 * attempt, 10000);
                process.stdout.write(`  Rate limited, waiting ${wait / 1000}s (attempt ${attempt}/${retries})...\r`);
                await sleep(wait);
                continue;
            }

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`HTTP ${res.status}: ${text}`);
            }

            return await res.json();
        } catch (err) {
            if (attempt === retries) throw err;
            await sleep(2000 * attempt);
        }
    }
}

async function countAll() {
    console.log('\n📊 COUNTING ALL LEADS IN NORTHSTARCLAIM CAMPAIGN...\n');
    console.log(`Campaign ID: ${campaignId}\n`);

    let total = 0;
    let startingAfter = null;
    let startTime = Date.now();

    while (true) {
        const data = await fetchPage(startingAfter);

        if (!data.items || data.items.length === 0) break;

        total += data.items.length;

        if (total % 5000 === 0) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
            const rate = (total / (Date.now() - startTime) * 1000).toFixed(0);
            process.stdout.write(`  📈 ${total.toLocaleString()} leads counted... (${elapsed}s elapsed, ~${rate} leads/sec)\n`);
        }

        if (!data.next_starting_after) break;
        startingAfter = data.next_starting_after;

        // Small delay to avoid rate limits
        await sleep(50);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n${'='.repeat(50)}`);
    console.log(`✅ TOTAL LEADS: ${total.toLocaleString()}`);
    console.log(`⏱️  Completed in ${elapsed} seconds`);
    console.log(`${'='.repeat(50)}\n`);
}

countAll().catch(err => {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
});

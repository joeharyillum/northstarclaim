#!/usr/bin/env node
require('dotenv').config();

const apiKey = process.env.INSTANTLY_API_KEY;
const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchPage(cursor, retries = 20) {
    const body = { campaign_id: campaignId, limit: 100 };
    if (cursor) body.starting_after = cursor;

    for (let i = 1; i <= retries; i++) {
        try {
            const res = await fetch('https://api.instantly.ai/api/v2/leads/list', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (res.status === 429) {
                const wait = Math.min(3000 * i, 30000);
                console.log(`  [Rate limited - waiting ${(wait/1000).toFixed(0)}s, attempt ${i}/${retries}]`);
                await sleep(wait);
                continue;
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (e) {
            if (i === retries) throw e;
            console.log(`  [Error retry ${i}/${retries}: ${e.message}]`);
            await sleep(3000 * i);
        }
    }
}

async function main() {
    console.log(`\n${'='.repeat(60)}`);
    console.log('  COUNTING ALL LEADS IN NORTHSTARCLAIM CAMPAIGN');
    console.log(`  Campaign: ${campaignId}`);
    console.log(`  Started: ${new Date().toISOString()}`);
    console.log(`${'='.repeat(60)}\n`);

    let total = 0;
    let cursor = null;
    const start = Date.now();

    while (true) {
        const data = await fetchPage(cursor);
        if (!data?.items?.length) break;

        total += data.items.length;
        cursor = data.next_starting_after;

        // Log every 5,000 leads
        if (total % 5000 < 100) {
            const elapsed = ((Date.now() - start) / 1000).toFixed(0);
            const rate = total / ((Date.now() - start) / 1000);
            const est = rate > 0 ? ((650000 - total) / rate / 60).toFixed(1) : '?';
            console.log(`  ${total.toLocaleString().padStart(10)} leads | ${elapsed}s elapsed | ${rate.toFixed(0)} leads/s | ~${est}min remaining`);
        }

        if (!cursor) break;
        await sleep(50); // tiny safety delay to avoid hammering
    }

    const elapsed = ((Date.now() - start) / 1000).toFixed(0);
    console.log(`\n${'='.repeat(60)}`);
    console.log(`  FINAL TOTAL: ${total.toLocaleString()} leads`);
    console.log(`  Time: ${elapsed}s (${(elapsed / 60).toFixed(1)} min)`);
    console.log(`  Finished: ${new Date().toISOString()}`);
    console.log(`${'='.repeat(60)}\n`);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });

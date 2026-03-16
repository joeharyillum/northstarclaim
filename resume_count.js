#!/usr/bin/env node
require('dotenv').config();

const apiKey = process.env.INSTANTLY_API_KEY;
const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchPage(cursor, retries = 15) {
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
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
            return await res.json();
        } catch (e) {
            if (i === retries) throw e;
            console.log(`  [Error: ${e.message} - retry ${i}/${retries}]`);
            await sleep(3000 * i);
        }
    }
}

async function main() {
    console.log('RESUMING COUNT FROM 540,000...');
    console.log('First skipping 5,400 pages to get back to cursor position...\n');

    let cursor = null;
    let total = 0;
    const start = Date.now();

    // Skip to 540,000 (5400 pages of 100)
    for (let skip = 0; skip < 5400; skip++) {
        const data = await fetchPage(cursor);
        if (!data?.items?.length) {
            console.log(`\nENDED EARLY at page ${skip} (${skip * 100} leads)`);
            console.log(`FINAL TOTAL: ${(skip * 100).toLocaleString()} leads`);
            return;
        }
        cursor = data.next_starting_after;
        total = (skip + 1) * 100;
        if (!cursor) {
            console.log(`\nNO MORE PAGES at ${total.toLocaleString()} leads`);
            console.log(`FINAL TOTAL: ${total.toLocaleString()} leads`);
            return;
        }
        if (skip % 500 === 0) {
            const elapsed = ((Date.now() - start) / 1000).toFixed(0);
            console.log(`  Skipping... ${total.toLocaleString()} / 540,000 (${elapsed}s)`);
        }
    }

    console.log(`\nResumed at 540,000. Now continuing count...\n`);

    // Continue counting from 540,000
    while (true) {
        const data = await fetchPage(cursor);
        if (!data?.items?.length) break;
        
        total += data.items.length;
        cursor = data.next_starting_after;

        if (total % 5000 < 100) {
            const elapsed = ((Date.now() - start) / 1000).toFixed(0);
            console.log(`  ${total.toLocaleString()} leads (${elapsed}s)`);
        }

        if (!cursor) break;
        await sleep(100); // small safety delay
    }

    const elapsed = ((Date.now() - start) / 1000).toFixed(0);
    console.log(`\n${'='.repeat(60)}`);
    console.log(`  FINAL TOTAL: ${total.toLocaleString()} leads`);
    console.log(`  Time: ${elapsed}s (${(elapsed / 60).toFixed(1)} min)`);
    console.log(`${'='.repeat(60)}\n`);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });

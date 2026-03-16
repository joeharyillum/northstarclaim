#!/usr/bin/env node
require('dotenv').config();

const apiKey = process.env.INSTANTLY_API_KEY;
const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function countFast() {
    let total = 0;
    let cursor = null;
    const start = Date.now();
    
    while (true) {
        const body = { campaign_id: campaignId, limit: 100 };
        if (cursor) body.starting_after = cursor;
        
        let data;
        for (let retry = 0; retry < 5; retry++) {
            const res = await fetch('https://api.instantly.ai/api/v2/leads/list', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            
            if (res.status === 429) {
                await sleep(3000 * (retry + 1));
                continue;
            }
            if (!res.ok) {
                const t = await res.text();
                console.error('Error:', res.status, t);
                return;
            }
            data = await res.json();
            break;
        }
        
        if (!data || !data.items || data.items.length === 0) break;
        
        total += data.items.length;
        cursor = data.next_starting_after;
        
        if (total % 5000 < 1000 || !cursor) {
            const elapsed = ((Date.now() - start) / 1000).toFixed(0);
            console.log('Leads counted: ' + total.toLocaleString() + ' (' + elapsed + 's)');
        }
        
        if (!cursor) break;
        await sleep(200);
    }
    
    console.log('');
    console.log('=== FINAL COUNT ===');
    console.log('Total leads in campaign: ' + total.toLocaleString());
    console.log('Time: ' + ((Date.now() - start) / 1000).toFixed(1) + 's');
}

countFast().catch(e => console.error(e));

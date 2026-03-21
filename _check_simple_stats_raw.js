#!/usr/bin/env node
require('dotenv').config();

const apiKey = process.env.INSTANTLY_API_KEY;
const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;

async function check() {
    try {
        const res1 = await fetch(`https://api.instantly.ai/api/v2/campaigns/${campaignId}`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        const campaign = await res1.json();
        console.log(JSON.stringify(campaign, null, 2));

        const res2 = await fetch(`https://api.instantly.ai/api/v1/campaign/status?campaign_id=${campaignId}`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if(res2.ok) {
            console.log("\nV1 Status:", JSON.stringify(await res2.json(), null, 2));
        }

    } catch(err) {
        console.error("Error fetching instantly stats:", err);
    }
}

check();

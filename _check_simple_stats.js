#!/usr/bin/env node
require('dotenv').config();

const apiKey = process.env.INSTANTLY_API_KEY;
const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;

async function check() {
    try {
        console.log("Fetching campaign info...");
        const res1 = await fetch(`https://api.instantly.ai/api/v2/campaigns/${campaignId}`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        const campaign = await res1.json();
        console.log("Campaign Name:", campaign?.name);
        console.log("Status:", campaign?.status === 1 ? 'Active' : campaign?.status);
        console.log("Total leads:", campaign?.total_leads);

        console.log("\nFetching campaign stats...");
        const res2 = await fetch(`https://api.instantly.ai/api/v2/campaigns/${campaignId}/statistics`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        const stats = await res2.json();
        console.log(JSON.stringify(stats, null, 2));

        console.log("\nFetching campaign summary (v1 fallback)...");
        const res3 = await fetch(`https://api.instantly.ai/api/v1/campaign/summary?campaign_id=${campaignId}`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        const summary = await res3.json();
        console.log(JSON.stringify(summary, null, 2));

    } catch(err) {
        console.error("Error fetching instantly stats:", err);
    }
}

check();

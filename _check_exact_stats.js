#!/usr/bin/env node
require('dotenv').config();

const apiKey = process.env.INSTANTLY_API_KEY;
const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;

async function check() {
    try {
        console.log("Checking leads in Instantly...");
        const resLeads = await fetch('https://api.instantly.ai/api/v2/leads/list', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaign_id: campaignId })
        });
        const leads = await resLeads.json();
        console.log("Total leads:", leads.total_count);

        console.log("\nChecking emails sent...");
        const resEmails = await fetch(`https://api.instantly.ai/api/v2/emails?campaign_id=${campaignId}`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        const emails = await resEmails.json();
        console.log("Emails sent:", emails.items ? emails.items.length : 0);

        console.log("\nCampaign info...");
        const resCamp = await fetch(`https://api.instantly.ai/api/v2/campaigns/${campaignId}`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        const camp = await resCamp.json();
        console.log("Status:", camp.status === 1 ? 'Active' : `Paused (${camp.status})`);

    } catch(err) {
        console.error("Error:", err);
    }
}

check();

require('dotenv').config();

async function checkLeads() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = '937570df-3957-4624-8c3c-dd7e0644c300';

    console.log(`Checking leads for campaign ${campaignId}...`);
    const res = await fetch(`https://api.instantly.ai/api/v2/leads?campaign_id=${campaignId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    const data = await res.json();
    console.log(`Found ${data.items ? data.items.length : 0} leads in this page.`);
    if (data.items && data.items.length > 0) {
        console.log('Sample Lead:', JSON.stringify(data.items[0], null, 2));
    }
}

checkLeads();

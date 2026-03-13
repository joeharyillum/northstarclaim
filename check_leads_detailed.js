require('dotenv').config();

async function checkLeadsDetailed() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;

    console.log(`Checking leads for campaign ${campaignId}...`);
    
    // Test v2 list leads endpoint with campaign filter
    const res = await fetch(`https://api.instantly.ai/api/v2/leads?campaign_id=${campaignId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    const data = await res.json();
    console.log('V2 API Response Summary:', {
        total_count: data.total_count,
        items_length: data.items ? data.items.length : 0
    });

    if (data.items && data.items.length > 0) {
        console.log('Latest Lead:', data.items[0].email);
    }
}

checkLeadsDetailed();

require('dotenv').config();

async function listLeads() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;

    console.log(`Listing leads for campaign ${campaignId} via POST /api/v2/leads/list...`);
    
    const payload = {
        campaign_id: campaignId,
        limit: 10
    };

    const res = await fetch('https://api.instantly.ai/api/v2/leads/list', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response Keys:', Object.keys(data));
    console.log('Total Count:', data.total_count);
    if (data.items) {
        console.log('Items Length:', data.items.length);
        if (data.items.length > 0) {
            console.log('First Lead:', data.items[0].email);
        }
    } else {
         console.log('Response:', JSON.stringify(data, null, 2));
    }
}

listLeads();

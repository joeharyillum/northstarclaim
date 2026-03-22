require('dotenv').config();

async function purgeAllLeads() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;

    console.log('🧹 Purging all leads from campaign:', campaignId);
    
    // Getting current leads to delete them
    const res = await fetch('https://api.instantly.ai/api/v2/leads/list', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ campaign_id: campaignId, limit: 100 })
    });
    
    const data = await res.json();
    if (data.items) {
        console.log(`Found ${data.items.length} leads to remove.`);
        
        for (const item of data.items) {
            console.log(`- Removing ${item.email}...`);
            await fetch('https://api.instantly.ai/api/v2/leads', {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: item.email, campaign_id: campaignId })
            });
            await new Promise(r => setTimeout(r, 100)); // Rate limiting
        }
        console.log('✅ Purge complete.');
    } else {
        console.log('No leads found or error:', data);
    }
}

purgeAllLeads();

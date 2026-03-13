require('dotenv').config();

async function checkLeads() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;

    console.log(`Checking leads for campaign ${campaignId}...`);
    
    // Try different query param names
    const params = [
        `campaign_id=${campaignId}`,
        `campaign=${campaignId}`,
    ];

    for (const p of params) {
        console.log(`\nTrying param: ${p}`);
        const res = await fetch(`https://api.instantly.ai/api/v2/leads?${p}&limit=50`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        const data = await res.json();
        if (data.error) {
            console.log('ERROR:', JSON.stringify(data, null, 2));
        } else {
            console.log('Response Keys:', Object.keys(data));
            console.log('Total Count:', data.total_count);
            console.log('Items Length:', data.items ? data.items.length : 'no items');
            if (data.items && data.items.length > 0) {
                console.log('First Lead Email:', data.items[0].email);
            }
        }
    }
}

checkLeads();

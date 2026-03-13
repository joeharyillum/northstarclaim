require('dotenv').config();

async function checkAllLeads() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    console.log('Fetching all leads from workspace (POST)...');
    
    const res = await fetch('https://api.instantly.ai/api/v2/leads', {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            limit: 10
        })
    });

    const data = await res.json();
    console.log('Workspace Lead Summary:', JSON.stringify(data, null, 2));

    if (data.items && data.items.length > 0) {
        console.log('Sample Lead:', data.items[0].email, 'Campaign:', data.items[0].campaign_id);
    }
}

checkAllLeads();

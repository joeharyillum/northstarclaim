require('dotenv').config();

async function listAll() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    console.log('Using API key:', apiKey.substring(0, 10) + '...');

    const res = await fetch('https://api.instantly.ai/api/v2/campaigns', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    const data = await res.json();
    console.log('All Campaigns:', JSON.stringify(data, null, 2));

    if (data.items && data.items.length > 0) {
        console.log('\n--- Checking Leads for each ---');
        for (const c of data.items) {
            const lRes = await fetch(`https://api.instantly.ai/api/v2/campaigns/analytics/overview?campaign_id=${c.id}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            const lData = await lRes.json();
            console.log(`Campaign ${c.name} (${c.id}):`, JSON.stringify(lData, null, 2));
        }
    }
}

listAll();

require('dotenv').config();

async function listCampaigns() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const res = await fetch('https://api.instantly.ai/api/v2/campaigns', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    const data = await res.json();
    if (data.items) {
        data.items.forEach(c => {
            console.log(`- ${c.name} (ID: ${c.id}, Status: ${c.status})`);
        });
    } else {
        console.log('No campaigns found or error:', data);
    }
}

listCampaigns();

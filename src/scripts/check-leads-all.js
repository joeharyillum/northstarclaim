require('dotenv').config();

async function checkLeads() {
    const apiKey = process.env.INSTANTLY_API_KEY;

    console.log(`Checking ALL leads...`);
    const res = await fetch(`https://api.instantly.ai/api/v2/leads`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    const data = await res.json();
    console.log(`Found ${data.items ? data.items.length : 0} leads in ALL.`);
    if (data.items && data.items.length > 0) {
        console.log('Sample Lead:', JSON.stringify(data.items[0], null, 2));
    }
}

checkLeads();

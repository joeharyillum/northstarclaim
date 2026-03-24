require('dotenv').config();

async function checkV2() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    console.log('Using API key:', apiKey.substring(0, 10) + '...');

    const res = await fetch('https://api.instantly.ai/api/v2/campaigns', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    const data = await res.json();
    console.log('Campaigns Response:', JSON.stringify(data, null, 2));
}

checkV2();

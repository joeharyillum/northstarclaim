require('dotenv').config();

async function checkSpecificLead() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const leadId = '019cbf27-78f4-7ea2-be0f-eb42fae93f01';

    console.log(`Checking lead ${leadId}...`);
    const res = await fetch(`https://api.instantly.ai/api/v2/leads/${leadId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    const data = await res.json();
    console.log('Lead Details:', JSON.stringify(data, null, 2));
}

checkSpecificLead();

require('dotenv').config();

async function checkLeadById() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const leadId = '019ce18c-534b-7dc7-b977-795e170b65d3';

    console.log(`Fetching lead by ID: ${leadId}...`);
    const res = await fetch(`https://api.instantly.ai/api/v2/leads/${leadId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
}

checkLeadById();

require('dotenv').config();

async function searchLead() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const email = 'lisa.wilson@memorialhealthcaresystem.com';
    
    console.log(`Searching for lead: ${email}...`);
    
    // In v2, searching might be via GET /leads with email filter
    const res = await fetch(`https://api.instantly.ai/api/v2/leads?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
}

searchLead();

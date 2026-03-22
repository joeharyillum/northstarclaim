require('dotenv').config();

async function checkInstantlyLeads() {
    const apiKey = process.env.INSTANTLY_API_KEY;

    // Check total leads across ALL campaigns to see if we're hitting a global limit
    const res = await fetch('https://api.instantly.ai/api/v2/leads/list', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 1 })
    });
    
    const data = await res.json();
    console.log(`Instantly Total Leads query status:`, res.status);
    console.log(JSON.stringify(data, null, 2));
}

checkInstantlyLeads();

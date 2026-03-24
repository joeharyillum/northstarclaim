require('dotenv').config();

async function checkSpecific() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const id = '019cbefb-af06-752e-94e9-56f1b2856b66';

    console.log(`Checking SPECIFIC lead ${id}...`);
    const res = await fetch(`https://api.instantly.ai/api/v2/leads/${id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    const text = await res.text();
    console.log(`Result:`, text);
}

checkSpecific();

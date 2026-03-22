require('dotenv').config();

async function checkInstantlyAccounts() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    
    console.log('🔍 Fetching all email accounts from Instantly...');
    const res = await fetch('https://api.instantly.ai/api/v2/accounts', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    const data = await res.json();
    if (data.items) {
        console.log(`Found ${data.items.length} accounts:`);
        data.items.forEach(acc => {
            console.log(`- ${acc.email} (Status: ${acc.status === 1 ? 'Active' : acc.status === -1 ? 'Disconnected' : acc.status})`);
        });
    } else {
        console.log(data);
    }
}

checkInstantlyAccounts();

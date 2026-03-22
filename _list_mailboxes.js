require('dotenv').config();

async function checkMailboxes() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    
    console.log('🔍 Listing all mailboxes in Instantly...');
    const res = await fetch('https://api.instantly.ai/api/v2/mailboxes', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log(JSON.stringify(data, null, 2));
}
checkMailboxes();

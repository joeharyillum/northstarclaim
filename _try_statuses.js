require('dotenv').config();

async function tryStatus() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;
    
    for (const status of [0, 1, 2, 3]) {
        console.log(`Trying status: ${status}...`);
        try {
            const res = await fetch(`https://api.instantly.ai/api/v2/campaigns/${campaignId}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            console.log(`- Response status: ${data.status}`);
        } catch (e) {
            console.error(`- Error for status ${status}:`, e.message);
        }
    }
}
tryStatus();

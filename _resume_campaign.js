require('dotenv').config();

async function resumeCampaign() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;
    
    console.log(`🚀 Resuming campaign: ${campaignId}...`);
    
    try {
        const res = await fetch(`https://api.instantly.ai/api/v2/campaigns/${campaignId}/resume`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({}) // Must not be empty if content-type is json
        });
        
        const data = await res.json();
        console.log('Result:', data);
        if (res.ok) {
            console.log('✅ Campaign is now running!');
        } else {
            console.error('❌ Failed to resume campaign.');
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

resumeCampaign();

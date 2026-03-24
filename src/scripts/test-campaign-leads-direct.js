require('dotenv').config();

async function testCampaignLeads() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;

    const payload = {
        leads: [{
            email: 'campaign-endpoint-test-' + Date.now() + '@example.com',
            first_name: 'Endpoint',
            last_name: 'Test'
        }],
        skip_if_in_workspace: true
    };

    console.log(`--- Testing POST /api/v2/campaigns/${campaignId}/leads ---`);
    try {
        const res = await fetch(`https://api.instantly.ai/api/v2/campaigns/${campaignId}/leads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });
        console.log('Status:', res.status);
        console.log('Response:', await res.text());
    } catch (e) {
        console.error(e);
    }
}

testCampaignLeads();

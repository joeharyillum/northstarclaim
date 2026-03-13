require('dotenv').config();

async function testSingle() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;
    
    const lead = {
        email: 'test' + Date.now() + '@northstarclaim.com',
        first_name: 'Test',
        last_name: 'User',
        campaign_id: campaignId,
        skip_if_in_workspace: false
    };

    const res = await fetch('https://api.instantly.ai/api/v2/leads', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(lead)
    });

    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
}

testSingle();

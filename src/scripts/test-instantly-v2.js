require('dotenv').config();

async function testV2Format() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;

    const lead = {
        email: 'test-success-' + Date.now() + '@example.com',
        first_name: 'Test',
        last_name: 'Lead',
        campaign_id: campaignId // Some APIs put it inside
    };

    console.log('--- Testing single lead POST /api/v2/leads ---');
    try {
        const res = await fetch('https://api.instantly.ai/api/v2/leads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(lead)
        });
        console.log('Status:', res.status);
        console.log('Response:', await res.text());
    } catch (e) {
        console.error(e);
    }

    console.log('\n--- Testing bulk lead POST /api/v2/leads (campaign inside wrapper) ---');
    try {
        const res = await fetch('https://api.instantly.ai/api/v2/leads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                campaign_id: campaignId,
                leads: [lead]
            })
        });
        console.log('Status:', res.status);
        console.log('Response:', await res.text());
    } catch (e) {
        console.error(e);
    }
}

testV2Format();

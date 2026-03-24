require('dotenv').config();

async function testV2Campaign() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;

    const lead = {
        email: 'test-campaign-link-' + Date.now() + '@example.com',
        first_name: 'Link',
        last_name: 'Test',
        campaign: campaignId // Using 'campaign' instead of 'campaign_id'
    };

    console.log(`--- Testing single lead POST /api/v2/leads with campaign: ${campaignId} ---`);
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
        const data = await res.json();
        console.log('Response:', JSON.stringify(data, null, 2));

        if (res.ok) {
            console.log('\n--- Verifying lead in campaign ---');
            const vRes = await fetch(`https://api.instantly.ai/api/v2/leads?campaign_id=${campaignId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            const vData = await vRes.json();
            const found = vData.items.find(i => i.email === lead.email);
            console.log('Found in campaign:', found ? 'YES' : 'NO');
        }
    } catch (e) {
        console.error(e);
    }
}

testV2Campaign();

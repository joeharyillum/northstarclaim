require('dotenv').config();

async function testV2Bulk() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;

    const payload = {
        campaign_id: campaignId,
        skip_if_in_workspace: true,
        leads: [
            { email: 'bulk-test-1-' + Date.now() + '@example.com', first_name: 'Bulk1' },
            { email: 'bulk-test-2-' + Date.now() + '@example.com', first_name: 'Bulk2' }
        ]
    };

    const endpoints = [
        'https://api.instantly.ai/api/v2/leads/bulk',
        'https://api.instantly.ai/api/v2/leads/batch'
    ];

    for (const url of endpoints) {
        console.log(`--- Testing ${url} ---`);
        try {
            const res = await fetch(url, {
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
}

testV2Bulk();

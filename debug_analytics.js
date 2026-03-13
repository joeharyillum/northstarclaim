require('dotenv').config();

async function checkAnalytics() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;

    const urls = [
        `https://api.instantly.ai/api/v2/campaigns/analytics/overview?campaign_id=${campaignId}`,
        `https://api.instantly.ai/api/v2/analytics/campaign/${campaignId}`,
        `https://api.instantly.ai/api/v2/campaigns/${campaignId}/analytics`
    ];

    for (const url of urls) {
        console.log(`\n--- Testing ${url} ---`);
        const res = await fetch(url, {
            headers: { 'Authorization': 'Bearer ' + apiKey }
        });
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Data:', JSON.stringify(data, null, 2));
    }
}

checkAnalytics();

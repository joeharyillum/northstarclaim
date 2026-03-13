require('dotenv').config();

async function getStats() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const campaignId = process.env.INSTANTLY_CAMPAIGN_ID;

    console.log(`\n📊 [INSTANTLY] Fetching stats for campaign: ${campaignId}...`);

    try {
        const res = await fetch(`https://api.instantly.ai/api/v2/campaigns/analytics/overview?campaign_id=${campaignId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        if (!res.ok) {
            throw new Error(`Instantly API error: ${res.status} - ${await res.text()}`);
        }

        const rawData = await res.json();
        const data = Array.isArray(rawData) ? rawData[0] : rawData;

        if (data) {
            console.log('\n═══════════════════════════════════════════════════');
            console.log('  LIVE CAMPAIGN PERFORMANCE (v2)');
            console.log('═══════════════════════════════════════════════════');
            console.log(`  Total Leads:     ${data.total_leads || 0}`);
            console.log(`  Sent:            ${data.sent_count || 0}`);
            console.log(`  Opens:           ${data.open_count || 0}`);
            console.log(`  Replies:         ${data.reply_count || 0}`);
            console.log(`  Bounces:         ${data.bounce_count || 0}`);
            console.log('═══════════════════════════════════════════════════\n');
        } else {
            console.log('⚠️  No data returned from Instantly.');
        }

    } catch (err) {
        console.error('❌ Error fetching stats:', err.message);
    }
}

getStats();
